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


if __name__ == "__main__":
    sys.exit(main(sys.argv))
