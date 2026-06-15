#!/usr/bin/env python3
"""Restore an archived (killed/expired) thesis to the live book — the cockpit's one-click un-discard.

A discard is a SOFT discard (CLAUDE.md §24 + the owner's decision): the idea stays visible in the
Archived tray and a human can re-open it. This flips conviction_state.archived off, sets the rung from
the current live edge band, clears the terminal flags, and appends a `recover` conviction_event so the
move is on the record. Deterministic; the caller rebuilds the board.

    python3 scripts/screener_restore_conviction.py <thesis_id> [<user>]
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONV = os.path.join(REPO, "screener", "ledger", "conviction")
STATE_DIR = os.path.join(CONV, "conviction_state")
TICKS = os.path.join(CONV, "conviction.ndjson")
APPEND = os.path.join(REPO, "scripts", "append-ndjson.sh")

RATING = {"watching": "Watchlist", "provisional": "Starter Position Only", "strong": "Buy", "fading": "Hold"}


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: screener_restore_conviction.py <thesis_id> [<user>]", file=sys.stderr)
        return 2
    tid = sys.argv[1]
    user = sys.argv[2] if len(sys.argv) > 2 else "cockpit"
    sp = os.path.join(STATE_DIR, f"{tid}.json")
    if not os.path.exists(sp):
        print(f"no conviction_state for {tid}", file=sys.stderr)
        return 2
    s = json.load(open(sp, encoding="utf-8"))
    if not s.get("archived"):
        print(f"{tid} is already live (not archived) — nothing to restore")
        return 0
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    edge = int(s.get("edge_score_live") or s.get("edge_locked") or 0)
    state = "strong" if edge > 80 else "provisional" if edge >= 60 else "fading" if edge >= 50 else "watching"
    prev = s.get("state")
    s.update({
        "state": state, "sell_side_rating": RATING.get(state, "Watchlist"), "archived": False,
        "stale": False, "insufficient": False,
        "plain_note": f"Restored to the live book by {user} — re-opened for monitoring.",
        "updated_at": now,
    })
    s.pop("kill_reason", None)
    event = {
        "row_type": "conviction_event", "thesis_id": tid, "at": now, "kind": "recover",
        "from_state": prev, "to_state": state, "edge_locked": int(s.get("edge_locked") or 0),
        "edge_score_live": edge, "conviction": int(s.get("conviction") or edge),
        "sell_side_rating": s["sell_side_rating"], "triggering_checkpoint_id": None,
        "evidence_refs": [], "plain_note": s["plain_note"], "event_key": f"{tid}::{now}::restore",
    }
    subprocess.run(["bash", APPEND, TICKS, json.dumps(event, ensure_ascii=False), "event_key", event["event_key"]],
                   cwd=REPO, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    s["history"] = (s.get("history") or []) + [event["event_key"]]
    with open(sp, "w", encoding="utf-8") as f:
        json.dump(s, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"restored {tid}: {prev} → {state} [{s['sell_side_rating']}]")
    return 0


if __name__ == "__main__":
    sys.exit(main())
