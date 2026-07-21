#!/usr/bin/env python3
"""commodity_calibrate.py — the commodity swarm's calibration scoreboard (Phase 4 twin).

WHY THIS EXISTS
----------------
`/commodity:review` (frameworks/commodity/decision_review.schema.json) closed the commodity swarm's
Phase 3 — it can judge whether a past `Action:` verdict was vindicated or contradicted. But nothing
ever aggregated those reviews into a track record, and nothing fed that track record back into the
NEXT commodity thesis's confidence — commodity:review.md's own closing line names this as the
deliberate next step ("that is the natural next phase... mirrors how /research:calibrate followed
/research:review-decisions"). This script is that Phase 4, mirroring scripts/calibrate.py (the
research swarm) and scripts/screener_calibrate.py (the screener swarm) — same discipline, right-sized
to the commodity swarm's simpler single-verdict decision_record.json (no forecast_ledger, no basket,
no entry_price — frameworks/commodity/decision_record.schema.json explains why).

CLAUDE.md §1/§11/§19 discipline, enforced in code: below the resolved-history floor, a skill metric
is WITHHELD (null / "insufficient (N=k)"), never estimated. A scoreboard that flatters a four-commodity
universe with a tiny sample is worse than an honest empty one.

WHAT IT COMPUTES (each gated by its own floor; withheld, never faked, below it)
  • hit_rate — vindicated / (vindicated + contradicted) across resolved `action_outcome`s
    ("too_early"/"partial"/"not_applicable" are not decisive; excluded from the rate, tallied
    separately). Gated at MIN_DECISIVE.
  • calibration_by_commodity — per-commodity {hit_rate, n} slice, gated at MIN_SLICE_N. This is the
    slice `99_commodity-thesis-synthesis.md`'s Phase-6 feedback step reads (mirrors
    calibration_by_module in the research swarm).
  • error_taxonomy_distribution / decision_quality_distribution — always-honest tallies (counts, not
    rates — populated at any N, never gated).

CONTRACT
  • Reads every committed commodity/runs/<COMMODITY>/decision_record.json + its
    commodity/runs/<COMMODITY>/reviews/*_decision_review*.json — read-only.
  • Writes ONE derived, regenerable pair under commodity/performance/ (a snapshot, not an immutable
    record): <TODAY>_calibration_summary.json + <TODAY>_calibration_summary.md.
  • Preserves the Phase-6 feedback contract this repo already established for the research swarm
    (frameworks/DECISION_LEDGER.md §18): `verdict` starts with "Pre-data" when below floor (the
    commodity-thesis-synthesis gate keys on that prefix, exactly as the master synthesizer does), and
    `calibration_by_commodity` is keyed by the exact commodity id, each "insufficient (N=k)" below its
    own floor.
  • Pure + importable; the CLI runs only under __main__. Deterministic: identical inputs → identical
    output (modulo the generated_at timestamp).

CLI:
  python3 scripts/commodity_calibrate.py                # write the dated summary pair
  python3 scripts/commodity_calibrate.py --print         # also print the JSON
  python3 scripts/commodity_calibrate.py --selftest      # run the pure-math + assembly selftests
"""
from __future__ import annotations

import glob
import json
import os
import sys
from datetime import datetime, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUNS_GLOB = os.path.join(REPO, "commodity", "runs", "*", "decision_record.json")
PERF_DIR = os.path.join(REPO, "commodity", "performance")

MIN_DECISIVE = 10   # before any overall hit rate is quoted — matches scripts/calibrate.py's
                     # MIN_DIRECTIONAL_HITS; the universe is small, but the floor exists precisely so a
                     # handful of early commodity calls can't manufacture a false skill verdict.
MIN_SLICE_N = 5      # before a single commodity's own calibration_by_commodity slice is ACTIONABLE
                      # (i.e. can flag/haircut a future run on that commodity) — matches the spirit of
                      # scripts/calibrate.py's MIN_SLICE_TICKERS, scaled to this swarm's per-commodity unit.

DECISIVE_OUTCOMES = ("vindicated", "contradicted")
ACTION_OUTCOME_ENUM = ("vindicated", "contradicted", "too_early", "partial", "not_applicable")


def read_json(fp):
    try:
        return json.load(open(fp, encoding="utf-8"))
    except Exception:
        return None


def read_decision_records():
    out = []
    for fp in sorted(glob.glob(RUNS_GLOB)):
        d = read_json(fp)
        if isinstance(d, dict) and d.get("swarm") == "commodity" and d.get("commodity") and d.get("decision_date"):
            d["_path"] = os.path.relpath(fp, REPO)
            out.append(d)
    return out


def read_reviews(commodity):
    out = []
    pattern = os.path.join(REPO, "commodity", "runs", commodity, "reviews", "*_decision_review*.json")
    for fp in sorted(glob.glob(pattern)):
        r = read_json(fp)
        if isinstance(r, dict) and r.get("action_outcome") in ACTION_OUTCOME_ENUM:
            out.append(r)
    return out


def build(today=None):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    today = today or now[:10]

    records = read_decision_records()
    n_commodities = len({d["commodity"] for d in records})
    n_decisions = len(records)

    all_reviews = []
    for d in records:
        all_reviews.extend((d["commodity"], r) for r in read_reviews(d["commodity"]))
    n_reviews = len(all_reviews)

    decisive = [(c, r) for c, r in all_reviews if r["action_outcome"] in DECISIVE_OUTCOMES]
    non_decisive_count = n_reviews - len(decisive)

    out = {
        "generated_at": now,
        "swarm": "commodity",
        "n_commodities_tracked": n_commodities,
        "n_decisions": n_decisions,
        "n_reviews": n_reviews,
        "n_decisive": len(decisive),
        "n_non_decisive": non_decisive_count,
        "min_decisive_for_hit_rate": MIN_DECISIVE,
        "min_n_for_slice": MIN_SLICE_N,
        "hit_rate": None,
        "calibration_by_commodity": {},
        "error_taxonomy_distribution": {},
        "decision_quality_distribution": {},
        "verdict": "",
        "honesty_statement": "",
    }

    # always-honest tallies — counts, never gated by a floor (CLAUDE.md §20/§11)
    for _, r in all_reviews:
        for tag in (r.get("error_taxonomy") or []):
            out["error_taxonomy_distribution"][tag] = out["error_taxonomy_distribution"].get(tag, 0) + 1
        dq = r.get("decision_quality")
        if dq:
            out["decision_quality_distribution"][dq] = out["decision_quality_distribution"].get(dq, 0) + 1

    # per-commodity slice — always computed so callers can see the raw N, but only "actionable"
    # (a real {hit_rate, n} dict rather than the honest "insufficient" string) at/above MIN_SLICE_N.
    # Seed EVERY tracked commodity first, so a commodity with no decisive reviews still has a key. The
    # synthesis agent's Phase-6 step branches on this value being either the "insufficient …" string or a
    # {hit_rate, n} object — a MISSING key is an undefined third case for it, so never emit one.
    by_commodity_reviews = {d["commodity"]: [] for d in records}
    for c, r in decisive:
        by_commodity_reviews.setdefault(c, []).append(r)
    for c in sorted(by_commodity_reviews):
        rs = by_commodity_reviews[c]
        n = len(rs)
        if n >= MIN_SLICE_N:
            hits = sum(1 for r in rs if r["action_outcome"] == "vindicated")
            out["calibration_by_commodity"][c] = {"hit_rate": round(hits / n, 3), "n": n}
        else:
            out["calibration_by_commodity"][c] = f"insufficient (N={n}; floor {MIN_SLICE_N})"

    if len(decisive) >= MIN_DECISIVE:
        hits = sum(1 for _, r in decisive if r["action_outcome"] == "vindicated")
        out["hit_rate"] = round(hits / len(decisive), 3)
        out["verdict"] = (
            f"{len(decisive)} decisive resolved calls across {n_commodities} commodities · "
            f"hit-rate {out['hit_rate']:.0%}."
        )
        out["honesty_statement"] = (
            f"Hit rate is measured on {len(decisive)} decisive outcomes (vindicated/contradicted); "
            f"{non_decisive_count} further reviews resolved to too_early/partial/not_applicable and are "
            f"tallied but excluded from the rate."
        )
    else:
        out["verdict"] = (
            f"Pre-data — {len(decisive)} of {MIN_DECISIVE} decisive resolved calls needed before a hit "
            f"rate means anything. {n_decisions} decisions stand across {n_commodities} commodities; "
            f"{n_reviews} reviews filed so far. (Refusing to quote a hit-rate on thin data, §11.)"
        )
        out["honesty_statement"] = out["verdict"]

    return out


def to_markdown(out):
    lines = [
        f"# Commodity calibration — {out['generated_at'][:10]}",
        "",
        out["verdict"],
        "",
        f"- Commodities tracked: {out['n_commodities_tracked']}",
        f"- Decisions: {out['n_decisions']}",
        f"- Reviews filed: {out['n_reviews']} ({out['n_decisive']} decisive, {out['n_non_decisive']} too_early/partial/not_applicable)",
        "",
        "## Calibration by commodity",
        "",
    ]
    if out["calibration_by_commodity"]:
        for c, v in sorted(out["calibration_by_commodity"].items()):
            if isinstance(v, dict):
                lines.append(f"- **{c}**: hit-rate {v['hit_rate']:.0%} (N={v['n']})")
            else:
                lines.append(f"- **{c}**: {v}")
    else:
        lines.append("- No reviews filed yet for any commodity.")
    lines += ["", "## Error taxonomy", ""]
    if out["error_taxonomy_distribution"]:
        for tag, n in sorted(out["error_taxonomy_distribution"].items(), key=lambda kv: -kv[1]):
            lines.append(f"- {tag}: {n}")
    else:
        lines.append("- None tallied yet.")
    lines += ["", "## Decision quality", ""]
    if out["decision_quality_distribution"]:
        for dq, n in sorted(out["decision_quality_distribution"].items(), key=lambda kv: -kv[1]):
            lines.append(f"- {dq}: {n}")
    else:
        lines.append("- None tallied yet.")
    lines.append("")
    return "\n".join(lines)


def _selftest():
    """Pure-math + assembly selftest — no repo fixtures required (mirrors scripts/calibrate.py
    --selftest and validates the floor/slice logic in isolation)."""
    import tempfile

    failures = []

    def check(name, cond):
        if not cond:
            failures.append(name)

    global REPO, RUNS_GLOB
    old_repo, old_glob = REPO, RUNS_GLOB

    # below every floor: honest Pre-data, no fabricated hit rate — isolated from the real repo's own
    # committed commodity/runs/ (which already has real decisions) via an empty temp dir.
    with tempfile.TemporaryDirectory() as empty_tmp:
        REPO = empty_tmp
        RUNS_GLOB = os.path.join(empty_tmp, "commodity", "runs", "*", "decision_record.json")
        try:
            empty = build(today="2026-01-01")
        finally:
            REPO, RUNS_GLOB = old_repo, old_glob
    check("empty n_decisions==0", empty["n_decisions"] == 0)
    check("empty hit_rate is None", empty["hit_rate"] is None)
    check("empty verdict starts Pre-data", empty["verdict"].startswith("Pre-data"))

    # synthetic fixture: 12 decisive reviews across 2 commodities — crosses MIN_DECISIVE (10) overall,
    # one commodity crosses MIN_SLICE_N (5) and the other does not.
    with tempfile.TemporaryDirectory() as tmp:
        REPO = tmp
        RUNS_GLOB = os.path.join(tmp, "commodity", "runs", "*", "decision_record.json")
        try:
            for commodity, n_vind, n_contra in (("GOLD", 6, 1), ("WHEAT", 3, 2)):
                run_dir = os.path.join(tmp, "commodity", "runs", commodity)
                rev_dir = os.path.join(run_dir, "reviews")
                os.makedirs(rev_dir, exist_ok=True)
                json.dump(
                    {"swarm": "commodity", "commodity": commodity, "decision_date": "2026-01-01", "action": "Hold"},
                    open(os.path.join(run_dir, "decision_record.json"), "w"),
                )
                i = 0
                for outcome, count in (("vindicated", n_vind), ("contradicted", n_contra)):
                    for _ in range(count):
                        i += 1
                        json.dump(
                            {"action_outcome": outcome, "decision_quality": "skill" if outcome == "vindicated" else "genuine miss",
                             "error_taxonomy": [] if outcome == "vindicated" else ["timing error"]},
                            open(os.path.join(rev_dir, f"2026-02-01_30d_decision_review_{i}.json"), "w"),
                        )
            out = build(today="2026-03-01")
            check("fixture n_decisions==2", out["n_decisions"] == 2)
            check("fixture n_decisive==12", out["n_decisive"] == 12)
            check("fixture hit_rate computed (>=floor)", out["hit_rate"] is not None)
            check("fixture hit_rate value", out["hit_rate"] == round(9 / 12, 3))
            check("GOLD slice actionable (N=7>=5)", isinstance(out["calibration_by_commodity"]["GOLD"], dict))
            check("WHEAT slice actionable (N=5>=5, at the floor)",
                  isinstance(out["calibration_by_commodity"]["WHEAT"], dict))
            check("GOLD hit_rate value", out["calibration_by_commodity"]["GOLD"]["hit_rate"] == round(6 / 7, 3))
            # A tracked commodity with NO decisive reviews must still carry a key: the synthesis agent's
            # Phase-6 step branches on the "insufficient …" string vs a {hit_rate, n} object, so a missing
            # key is an undefined third case for it (Gemini review).
            no_rev_dir = os.path.join(tmp, "commodity", "runs", "COPPER")
            os.makedirs(no_rev_dir, exist_ok=True)
            json.dump(
                {"swarm": "commodity", "commodity": "COPPER", "decision_date": "2026-01-01", "action": "Hold"},
                open(os.path.join(no_rev_dir, "decision_record.json"), "w"),
            )
            out_seed = build(today="2026-03-01")
            check("every tracked commodity has a slice key",
                  set(out_seed["calibration_by_commodity"]) == {"GOLD", "WHEAT", "COPPER"})
            check("zero-review commodity is honestly 'insufficient (N=0…)'",
                  out_seed["calibration_by_commodity"]["COPPER"] == f"insufficient (N=0; floor {MIN_SLICE_N})")
            check("error taxonomy tallied", out["error_taxonomy_distribution"].get("timing error") == 3)
            check("decision quality tallied", out["decision_quality_distribution"].get("skill") == 9)
        finally:
            REPO, RUNS_GLOB = old_repo, old_glob

    if failures:
        print("SELFTEST FAIL:", ", ".join(failures))
        return 1
    print(f"SELFTEST OK (all checks passed)")
    return 0


def main(argv):
    if "--selftest" in argv:
        return _selftest()
    out = build()
    os.makedirs(PERF_DIR, exist_ok=True)
    day = out["generated_at"][:10]
    json_path = os.path.join(PERF_DIR, f"{day}_calibration_summary.json")
    md_path = os.path.join(PERF_DIR, f"{day}_calibration_summary.md")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(to_markdown(out))
    print(f"WROTE {os.path.relpath(json_path, REPO)}")
    print(f"WROTE {os.path.relpath(md_path, REPO)}")
    print(out["verdict"])
    if "--print" in argv:
        print(json.dumps(out, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
