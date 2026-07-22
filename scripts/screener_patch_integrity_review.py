#!/usr/bin/env python3
"""Patch a locked thesis's LEDGER record with the thesis-integrity gate's verdict.

`thesis-integrity` red-teams a just-locked thesis_record.json and can route it to a TERMINAL verdict
(watchlist_integrity_downgrade / watchlist_integrity_broken) that stops the screener pipeline before
candidate-surfacing ever names a ticker. Its own output (thesis_integrity_review.json) lives only in
the run root — the copy every downstream reader actually consumes, screener/ledger/theses/<id>.json,
never learns the gate ran at all, because `meta`/`M0_x` are frozen at LOCK time by design (the module
must never edit a locked record). Two consequences were silent until this script: `update_board_index.py`
kept showing a KILLED thesis as "provisional"/"full_machine" forever, and `screener_calibrate.py` had no
data to ever judge whether the gate is catching real breaks or just adding friction — the remaining
limitation named when thesis-integrity shipped (commit a5ce95a / #284): "once a sample of real
thesis-integrity verdicts exists, screener:calibrate could track whether this gate is adding signal."

Mirrors `/research:full` step 10B.2's pre-mortem -> decision_record.json haircut propagation, adapted to
the screener's frozen-record convention (DECISION_LEDGER.md's `post_review_*` / `calibration_feedback`
precedent: additive fields on an otherwise-frozen record). Writes ONLY a new top-level `integrity_review`
key on the LEDGER copy — never touches `meta`, `locked`, `version_history`, or any `M0_x` field, and never
touches `<RUN_ROOT>/thesis_record.json` at all. Deterministic, no LLM, idempotent: re-running when nothing
changed is a no-op; a newer `_vN` review (a re-run of thesis-integrity) overwrites the patch with the
newer verdict.

    python3 scripts/screener_patch_integrity_review.py                  # all locked theses (backfill)
    python3 scripts/screener_patch_integrity_review.py THS-SIG-...-v1   # one thesis
    python3 scripts/screener_patch_integrity_review.py --selftest       # fixture-free self-test

Exit 0 on success (including "nothing to patch yet" — that is the expected, honest state for most
theses); prints one status line per thesis. `--selftest` exits 1 on any assertion failure.
"""
from __future__ import annotations

import glob
import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THESES = os.path.join(REPO, "screener", "ledger", "theses")


def _latest_review(run_root_abs: str) -> str | None:
    """Latest thesis_integrity_review*.json under an absolute run root (base file = v1, _vN = N)."""
    revs = glob.glob(os.path.join(run_root_abs, "thesis_integrity_review*.json"))
    if not revs:
        return None

    def _ver(p: str) -> int:
        m = re.search(r"_v(\d+)\.json$", p)
        return int(m.group(1)) if m else 1

    return sorted(revs, key=_ver)[-1]


def patch_one(ledger_path: str) -> str:
    """Patch one screener/ledger/theses/<id>.json in place. Returns a short status word."""
    try:
        rec = json.load(open(ledger_path, encoding="utf-8"))
    except Exception as e:
        return f"unreadable ({e})"
    if not isinstance(rec, dict):
        return "malformed (not an object)"
    meta = rec.get("meta") or {}
    run_root = rec.get("run_root") or (
        os.path.join("screener", "runs", meta["signal_id"]) if meta.get("signal_id") else None
    )
    if not run_root:
        return "no-run-root"
    review_path = _latest_review(os.path.join(REPO, run_root))
    if not review_path:
        return "no-review-yet"
    try:
        review = json.load(open(review_path, encoding="utf-8"))
    except Exception as e:
        return f"review-unreadable ({e})"
    if not isinstance(review, dict):
        return "review-malformed (not an object)"
    new_block = {
        "verdict": review.get("verdict") or "",
        "routing": review.get("routing") or "",
        "reviewed_at": review.get("reviewed_at") or "",
        "review_file": os.path.relpath(review_path, REPO),
        "edge_score_haircut_note": review.get("edge_score_haircut_note") or "",
    }
    if rec.get("integrity_review") == new_block:
        return "unchanged"
    rec["integrity_review"] = new_block
    with open(ledger_path, "w", encoding="utf-8") as f:
        json.dump(rec, f, indent=2, ensure_ascii=False)
    return "patched"


def main(argv: list[str]) -> int:
    targets = [a for a in argv if not a.startswith("--")]
    if targets:
        paths = [os.path.join(THESES, f"{t}.json") for t in targets]
    else:
        paths = sorted(glob.glob(os.path.join(THESES, "*.json")))
    rc = 0
    for p in paths:
        if not os.path.exists(p):
            print(f"SKIP {os.path.basename(p)} — no ledger record")
            rc = 1
            continue
        status = patch_one(p)
        print(f"{status.upper()} {os.path.basename(p)}")
    return rc


def _selftest() -> int:
    import tempfile

    bad = 0

    def check(label: str, cond: bool):
        nonlocal bad
        print(f"  [{'ok' if cond else 'XX'}] {label}")
        if not cond:
            bad += 1

    with tempfile.TemporaryDirectory() as td:
        run_root_abs = os.path.join(td, "screener", "runs", "SIG-20990101-deadbeef")
        os.makedirs(run_root_abs)
        ledger_path = os.path.join(td, "thesis.json")

        base_rec = {
            "meta": {"thesis_id": "THS-SIG-20990101-deadbeef-v1", "signal_id": "SIG-20990101-deadbeef",
                      "locked": True, "version": 1, "status": "provisional", "status_reason": "x"},
            "run_root": os.path.relpath(run_root_abs, REPO) if run_root_abs.startswith(REPO) else run_root_abs,
            "M0_1": {"event_statement": "unchanged sentinel"},
        }

        # Case 1: no review file yet -> no-review-yet, record untouched.
        json.dump(base_rec, open(ledger_path, "w", encoding="utf-8"))
        status = patch_one(ledger_path)
        check("no review yet -> 'no-review-yet'", status == "no-review-yet")
        rec_after = json.load(open(ledger_path, encoding="utf-8"))
        check("no review yet -> record has no integrity_review key", "integrity_review" not in rec_after)

        # Case 2: a terminal review lands -> patched, meta/M0_1 untouched, integrity_review populated.
        review1 = os.path.join(run_root_abs, "thesis_integrity_review.json")
        json.dump({
            "verdict": "Thesis broken", "routing": "watchlist_integrity_broken",
            "reviewed_at": "2099-01-01T00:00:00Z", "edge_score_haircut_note": "kill-switch is fireproof",
        }, open(review1, "w", encoding="utf-8"))
        status = patch_one(ledger_path)
        check("first review -> 'patched'", status == "patched")
        rec_after = json.load(open(ledger_path, encoding="utf-8"))
        check("meta untouched", rec_after["meta"] == base_rec["meta"])
        check("M0_1 untouched", rec_after["M0_1"] == base_rec["M0_1"])
        check("integrity_review.routing == watchlist_integrity_broken",
              rec_after.get("integrity_review", {}).get("routing") == "watchlist_integrity_broken")
        check("integrity_review.verdict == Thesis broken",
              rec_after.get("integrity_review", {}).get("verdict") == "Thesis broken")

        # Case 3: re-run with the SAME review -> idempotent, 'unchanged', no rewrite needed.
        status = patch_one(ledger_path)
        check("re-run same review -> 'unchanged'", status == "unchanged")

        # Case 4: a re-reviewed thesis (_v2) with a DIFFERENT verdict -> patched again, latest wins.
        review2 = os.path.join(run_root_abs, "thesis_integrity_review_v2.json")
        json.dump({
            "verdict": "Survives", "routing": "Proceed",
            "reviewed_at": "2099-01-02T00:00:00Z", "edge_score_haircut_note": "",
        }, open(review2, "w", encoding="utf-8"))
        status = patch_one(ledger_path)
        check("_v2 review -> 'patched' again", status == "patched")
        rec_after = json.load(open(ledger_path, encoding="utf-8"))
        check("_v2 wins over v1 (routing now Proceed)",
              rec_after.get("integrity_review", {}).get("routing") == "Proceed")

        # Case 5: no run_root derivable at all -> 'no-run-root', never crashes.
        no_root_path = os.path.join(td, "no_root.json")
        json.dump({"meta": {"thesis_id": "THS-x"}}, open(no_root_path, "w", encoding="utf-8"))
        check("no run_root/signal_id -> 'no-run-root'", patch_one(no_root_path) == "no-run-root")

        # Case 6: malformed ledger record (a JSON list, not an object) -> reported, never crashes.
        bad_shape_path = os.path.join(td, "bad_shape.json")
        json.dump([1, 2, 3], open(bad_shape_path, "w", encoding="utf-8"))
        check("non-object ledger record -> reported, not a crash",
              patch_one(bad_shape_path).startswith("malformed"))

    print(f"screener_patch_integrity_review selftest: {'ALL OK' if bad == 0 else f'{bad} FAILED'}")
    return 1 if bad else 0


if __name__ == "__main__":
    if "--selftest" in sys.argv[1:]:
        sys.exit(_selftest())
    sys.exit(main(sys.argv[1:]))
