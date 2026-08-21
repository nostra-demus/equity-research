#!/usr/bin/env python3
"""SessionStart hook: surface decision reviews that are due.

Phase 3 of the decision-ledger feedback loop (frameworks/DECISION_LEDGER.md) is the
review command `/research:review-decisions`. This hook is the *scheduler* for it: at
the start of every session it scans every committed `decision_record.json` for a
review window (30d/90d/180d/365d) whose target date has passed and that has no
append-only review file yet — and, if any are due, injects a one-line reminder into
the session context. It is silent when nothing is due (no noise on normal sessions).

Deterministic and read-only: it reads only `analyses/*/decision_record.json` and the
existing `reviews/` files; it writes nothing and edits nothing. It mirrors the
due/duplicate logic in `.claude/commands/research/review-decisions.md` Step 3 exactly,
so the hook and the command never disagree about what is "due".
"""
import json, glob, os, datetime, sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def isdate(s):
    try:
        datetime.date.fromisoformat(s)
        return True
    except Exception:
        return False


def main():
    # Cockpit-launched provider processes already have a frozen, user-requested
    # job.  Do not inject an unrelated review reminder into their prompt.
    if os.environ.get("NOSTRA_COCKPIT_RUN") == "1":
        return

    today = datetime.date.today().isoformat()
    due = []
    pattern = str(REPO_ROOT / "analyses" / "*" / "decision_record.json")
    for f in sorted(glob.glob(pattern)):
        try:
            with open(f, encoding="utf-8") as handle:
                d = json.load(handle)
        except Exception:
            continue
        configured_root = d.get("run_root")
        if configured_root:
            run_path = Path(configured_root)
            if not run_path.is_absolute():
                run_path = REPO_ROOT / run_path
        else:
            run_path = Path(f).parent
        run_root = configured_root or str(run_path.relative_to(REPO_ROOT))
        ticker = d.get("ticker") or run_path.name
        for window, dt in (d.get("review_schedule") or {}).items():
            if not isdate(dt):
                continue
            already = glob.glob(str(run_path / "reviews" / ("*_%s_decision_review*.json" % window)))
            if dt <= today and not already:
                due.append((ticker, window, dt, run_root))

    if not due:
        return  # nothing due -> stay silent

    lines = [f"- {tk} {w} (due {dt}) -> {rr}" for tk, w, dt, rr in sorted(due)]
    msg = (
        "Decision review(s) due as of %s (%d):\n%s\n\n"
        "Run `/research:review-decisions due` to file the append-only outcome reviews "
        "(Phase 3 of the decision-ledger loop). It never edits any decision_record.json "
        "or final_thesis.md; it only writes new review files and commits them."
        % (today, len(due), "\n".join(lines))
    )
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": msg,
        }
    }))
    return


if __name__ == "__main__":
    try:
        main()
    except Exception:
        # A scheduler must never break a session start. Fail silent.
        sys.exit(0)
