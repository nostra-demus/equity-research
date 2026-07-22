#!/usr/bin/env python3
"""Build the screener's track record from the conviction ledger — the proof the loop actually works.

Mirrors /research:calibrate: it aggregates RESOLVED checkpoints into honest performance + calibration
numbers, and REFUSES to quote a Brier (or rate metrics) until there is enough resolved history — false
confidence is worse than an empty state (CLAUDE.md §1, §11, §19). Deterministic; the command commits it.

  python3 scripts/screener_calibrate.py            # write a dated summary
  python3 scripts/screener_calibrate.py --print     # also print the JSON

Metrics (each null until the floor is met):
  hit_rate                  confirmed / (confirmed + against + breached)  — across resolved kill/trigger checks
  brier                     mean((predicted_prob - realized)^2)           — needs >= MIN_RESOLVED with a prob
  median_days_lock_to_confirm   lock date -> first confirming check
  selected_minus_discarded_edge mean live edge - mean archived edge        — edge realization proxy (labelled)
  error_taxonomy_distribution   §20 tags among misses/breaches
  false_discard_rate        discards later restored / total discards

Process tallies (honest at ANY N — never floor-gated, mirrors error_taxonomy_distribution above):
  integrity_gate_distribution   count of thesis-integrity verdicts (Survives / ... / Thesis broken) across
                                 every reviewed thesis in screener/ledger/theses/ (integrity_review, additively
                                 patched by scripts/screener_patch_integrity_review.py). Answers "is the gate
                                 adding signal or just friction" at the ACTIVITY level (Proceed vs killed) —
                                 the named remaining limitation from the PR that introduced thesis-integrity
                                 (a5ce95a / #284). integrity_gate_hit_rate stays null: judging whether a KILL
                                 was the right call needs a later outcome-check against the killed thesis's own
                                 M0_2/M0_5 claims, which no review mechanism provides yet (a separate, larger
                                 gap — a terminal verdict stops the pipeline before any ticker-level checkpoint
                                 could ever be tracked, unlike a live conviction discard).
"""
from __future__ import annotations

import json
import os
import statistics
import sys
from datetime import datetime, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONV = os.path.join(REPO, "screener", "ledger", "conviction")
THESES = os.path.join(REPO, "screener", "ledger", "theses")
TICKS = os.path.join(CONV, "conviction.ndjson")
STATE_DIR = os.path.join(CONV, "conviction_state")

MIN_RESOLVED = 10  # the same small-N floor /research:calibrate uses before it will quote a Brier


def read_ndjson(fp):
    try:
        return [json.loads(l) for l in open(fp, encoding="utf-8", errors="replace") if l.strip()]
    except Exception:
        return []


def integrity_gate_distribution(theses_dir):
    """Tally thesis-integrity verdicts across every ledger thesis carrying an `integrity_review` block
    (additively patched by scripts/screener_patch_integrity_review.py). Takes an explicit directory so
    it is testable against a fixture dir, not just the real ledger. Returns
    (distribution_by_verdict, n_reviewed, n_terminal) — never raises on a malformed/missing file.
    """
    dist, n_reviewed, n_terminal = {}, 0, 0
    for f in (os.listdir(theses_dir) if os.path.isdir(theses_dir) else []):
        if not f.endswith(".json"):
            continue
        try:
            rec = json.load(open(os.path.join(theses_dir, f), encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(rec, dict):
            continue
        ir = rec.get("integrity_review")
        if not isinstance(ir, dict) or not ir.get("verdict"):
            continue
        n_reviewed += 1
        dist[ir["verdict"]] = dist.get(ir["verdict"], 0) + 1
        if ir.get("routing") in ("watchlist_integrity_downgrade", "watchlist_integrity_broken"):
            n_terminal += 1
    return dist, n_reviewed, n_terminal


def to_day(iso):
    if not iso:
        return None
    s = iso.strip()
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(s[:19] if "T" in s else s[:10], fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def build():
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    ticks = read_ndjson(TICKS)
    vrs = [r for r in ticks if r.get("row_type") == "validation_result"]
    events = [r for r in ticks if r.get("row_type") == "conviction_event"]
    resolved = [r for r in vrs if r.get("verdict") not in (None, "unresolved")]

    states = []
    for f in (os.listdir(STATE_DIR) if os.path.isdir(STATE_DIR) else []):
        if f.endswith(".json"):
            try:
                states.append(json.load(open(os.path.join(STATE_DIR, f), encoding="utf-8")))
            except Exception:
                pass

    n_checkpoints = len(read_ndjson(os.path.join(CONV, "checkpoints.ndjson")))
    n_resolved = len(resolved)
    sufficient = n_resolved >= MIN_RESOLVED

    out = {
        "generated_at": now,
        "n_theses": len(states),
        "n_checkpoints": n_checkpoints,
        "n_resolved": n_resolved,
        "min_resolved_for_calibration": MIN_RESOLVED,
        "sufficient": sufficient,
        "hit_rate": None,
        "brier": None,
        "n_resolved_with_prob": 0,
        "median_days_lock_to_confirm": None,
        "selected_minus_discarded_edge": None,
        "error_taxonomy_distribution": {},
        "false_discard_rate": None,
        "by_edge_band": {},
        "n_integrity_reviewed": 0,
        "n_integrity_terminal": 0,
        "integrity_gate_distribution": {},
        "integrity_gate_hit_rate": None,
        "integrity_gate_note": "",
        "verdict": "",
    }

    # error taxonomy is honest even at low N (it's a tally, not a rate)
    for r in resolved:
        if r.get("verdict") in ("against", "breached_kill") and r.get("error_taxonomy_tag"):
            tag = r["error_taxonomy_tag"]
            out["error_taxonomy_distribution"][tag] = out["error_taxonomy_distribution"].get(tag, 0) + 1

    # discards + restores (counts honest at any N)
    discards = sum(1 for e in events if e.get("kind") == "discard")
    restores = sum(1 for e in events if e.get("kind") == "recover" and (e.get("from_state") in ("falsified_discarded", "expired_unproven")))
    out["n_discards"] = discards
    out["n_restored"] = restores

    # thesis-integrity gate distribution — honest at any N, it's a process tally not a hit-rate (see module
    # docstring). Closes the remaining limitation named when the gate shipped (a5ce95a / #284): this is the
    # first thing that ever reads screener/ledger/theses/*.json's integrity_review block.
    idist, n_ireviewed, n_iterminal = integrity_gate_distribution(THESES)
    out["n_integrity_reviewed"] = n_ireviewed
    out["n_integrity_terminal"] = n_iterminal
    out["integrity_gate_distribution"] = idist
    out["integrity_gate_note"] = (
        "No thesis-integrity reviews recorded yet." if n_ireviewed == 0 else
        f"{n_iterminal} of {n_ireviewed} reviewed theses were killed pre-surfacing ({idist}). This is gate "
        "ACTIVITY, not accuracy — integrity_gate_hit_rate stays null because judging whether a kill was the "
        "right call needs a later outcome-check against the killed thesis's own claims, which no review "
        "mechanism provides yet (a terminal verdict stops the pipeline before candidate-surfacing, so unlike "
        "a live conviction discard there is no ticker-level checkpoint to ever resolve)."
    )

    if not sufficient:
        out["verdict"] = (
            f"Insufficient resolved history — {n_resolved} of {MIN_RESOLVED} resolved checks needed before a "
            f"track record means anything. {n_checkpoints} proof points are scheduled across {len(states)} ideas; "
            f"the record fills in as they hit their dates. (Refusing to quote a hit-rate or Brier on thin data, §11.)"
        )
        return out

    # ---- enough history: compute the real numbers ----
    decisive = [r for r in resolved if r.get("verdict") in ("confirmed", "against", "breached_kill")]
    confirmed = sum(1 for r in decisive if r["verdict"] == "confirmed")
    out["hit_rate"] = round(confirmed / len(decisive), 3) if decisive else None

    prob_pairs = [(float(r["predicted_prob"]), int(r["realized"])) for r in resolved
                  if r.get("predicted_prob") is not None and r.get("realized") in (0, 1)]
    out["n_resolved_with_prob"] = len(prob_pairs)
    if len(prob_pairs) >= MIN_RESOLVED:
        out["brier"] = round(sum((p - y) ** 2 for p, y in prob_pairs) / len(prob_pairs), 4)

    # lock -> first confirm, per thesis
    lock_by_thesis = {}
    for f in (os.listdir(THESES) if os.path.isdir(THESES) else []):
        if f.endswith(".json"):
            try:
                rec = json.load(open(os.path.join(THESES, f), encoding="utf-8"))
                lock_by_thesis[rec.get("meta", {}).get("thesis_id")] = to_day(rec.get("meta", {}).get("created_at"))
            except Exception:
                pass
    first_confirm = {}
    for r in sorted([x for x in resolved if x["verdict"] == "confirmed"], key=lambda x: x.get("checked_at") or ""):
        first_confirm.setdefault(r.get("thesis_id"), to_day(r.get("checked_at")))
    spans = []
    for tid, conf_dt in first_confirm.items():
        lk = lock_by_thesis.get(tid)
        if lk and conf_dt:
            spans.append((conf_dt - lk).days)
    out["median_days_lock_to_confirm"] = round(statistics.median(spans), 1) if spans else None

    live = [s for s in states if not s.get("archived")]
    arch = [s for s in states if s.get("archived")]
    if live and arch:
        out["selected_minus_discarded_edge"] = round(
            statistics.mean(s.get("edge_score_live", 0) for s in live) - statistics.mean(s.get("edge_score_live", 0) for s in arch), 1)
    out["false_discard_rate"] = round(restores / discards, 3) if discards else None

    out["verdict"] = (
        f"{n_resolved} resolved checks · hit-rate {out['hit_rate']}"
        + (f" · Brier {out['brier']}" if out["brier"] is not None else " · Brier pending more prob-tagged checks")
        + (f" · median {out['median_days_lock_to_confirm']}d lock→confirm" if out["median_days_lock_to_confirm"] is not None else "")
        + "."
    )
    return out


def main(argv):
    out = build()
    os.makedirs(CONV, exist_ok=True)
    day = out["generated_at"][:10]
    path = os.path.join(CONV, f"{day}_conviction_calibration.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"WROTE {os.path.relpath(path, REPO)} — {out['verdict']}")
    if "--print" in argv:
        print(json.dumps(out, indent=2, ensure_ascii=False))
    return 0


def _selftest():
    """Fixture-free: pins integrity_gate_distribution() against a synthetic ledger dir — the one piece
    of this module that had zero regression protection before it existed (build() itself is exercised
    only against the real, mutable ledger at command-run time)."""
    import tempfile

    bad = 0

    def check(label, cond):
        nonlocal bad
        print(f"  [{'ok' if cond else 'XX'}] {label}")
        if not cond:
            bad += 1

    with tempfile.TemporaryDirectory() as td:
        dist, n, t = integrity_gate_distribution(td)
        check("empty dir -> (({}, 0, 0))", dist == {} and n == 0 and t == 0)

        def write(name, doc):
            json.dump(doc, open(os.path.join(td, name), "w", encoding="utf-8"))

        write("a.json", {"meta": {"thesis_id": "A"}})  # no integrity_review at all -> ignored
        write("b.json", {"meta": {"thesis_id": "B"}, "integrity_review": {"verdict": "Survives", "routing": "Proceed"}})
        write("c.json", {"meta": {"thesis_id": "C"}, "integrity_review": {"verdict": "Thesis broken", "routing": "watchlist_integrity_broken"}})
        write("d.json", {"meta": {"thesis_id": "D"}, "integrity_review": {"verdict": "Does not survive — downgrade", "routing": "watchlist_integrity_downgrade"}})
        write("e.json", {"meta": {"thesis_id": "E"}, "integrity_review": {}})  # empty block, no verdict -> ignored
        write("f.json", ["not", "an", "object"])  # malformed root -> ignored, never raises
        write("g.txt", "not json at all")  # non-.json file -> ignored

        dist, n, t = integrity_gate_distribution(td)
        check("n_reviewed counts only records with a verdict", n == 3)
        check("n_terminal counts only the two terminal routings", t == 2)
        check("distribution tallies each verdict string", dist == {
            "Survives": 1, "Thesis broken": 1, "Does not survive — downgrade": 1,
        })

    print(f"screener_calibrate selftest: {'ALL OK' if bad == 0 else f'{bad} FAILED'}")
    return 1 if bad else 0


if __name__ == "__main__":
    if "--selftest" in sys.argv[1:]:
        sys.exit(_selftest())
    sys.exit(main(sys.argv))
