#!/usr/bin/env python3
"""Restore an archived (killed/expired) thesis to the live book — the cockpit's one-click un-discard.

A discard is a SOFT discard (CLAUDE.md §24 + the owner's decision): the idea stays visible in the
Archived tray and a human can re-open it. This flips conviction_state.archived off, sets the rung from
the current live edge band, clears the terminal flags, and appends a `recover` conviction_event so the
move is on the record. Deterministic; the caller rebuilds the board.

    python3 scripts/screener_restore_conviction.py <thesis_id> [<user>]
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
from datetime import datetime, timezone

from repo_mutation import append_ndjson, atomic_write_json, repository_mutation

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONV = os.path.join(REPO, "screener", "ledger", "conviction")
STATE_DIR = os.path.join(CONV, "conviction_state")
TICKS = os.path.join(CONV, "conviction.ndjson")
APPEND = os.path.join(REPO, "scripts", "append-ndjson.sh")

RATING = {"watching": "Watchlist", "provisional": "Starter Position Only", "strong": "Buy", "fading": "Hold"}


def read_ndjson(path: str) -> list[dict]:
    rows = []
    try:
        handle = open(path, encoding="utf-8", errors="replace")
    except FileNotFoundError:
        return rows
    with handle:
        for line in handle:
            try:
                row = json.loads(line)
                if isinstance(row, dict):
                    rows.append(row)
            except (TypeError, ValueError):
                continue
    return rows


def journal_projection(event: dict, thesis_id: str) -> dict | None:
    """Validate the complete state image carried by a committed conviction event."""
    projection = event.get("state_projection")
    if not isinstance(projection, dict) or event.get("thesis_id") != thesis_id:
        return None
    if (projection.get("thesis_id") != thesis_id or projection.get("state") != event.get("to_state")
            or projection.get("edge_score_live") != event.get("edge_score_live")
            or projection.get("sell_side_rating") != event.get("sell_side_rating")
            or event.get("event_key") not in (projection.get("history") or [])):
        return None
    return projection


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: screener_restore_conviction.py <thesis_id> [<user>]", file=sys.stderr)
        return 2
    tid = sys.argv[1]
    user = sys.argv[2] if len(sys.argv) > 2 else "cockpit"
    with repository_mutation(REPO) as mutation:
        return restore_locked(tid, user, mutation)


def restore_locked(tid: str, user: str, mutation) -> int:
    sp = os.path.join(STATE_DIR, f"{tid}.json")
    disk_state = None
    if os.path.exists(sp):
        try:
            candidate = json.load(open(sp, encoding="utf-8"))
            if isinstance(candidate, dict) and candidate.get("thesis_id") == tid:
                disk_state = candidate
        except (OSError, TypeError, ValueError):
            pass

    rows = read_ndjson(TICKS)
    events = [r for r in rows if r.get("row_type") == "conviction_event" and r.get("thesis_id") == tid]
    latest_transaction = next((event for event in reversed(events) if event.get("kind") != "seed"), None)
    if latest_transaction is not None:
        authoritative = journal_projection(latest_transaction, tid)
        if authoritative is None:
            print(f"latest conviction event {latest_transaction.get('event_key')} has no valid recovery projection — refusing guess",
                  file=sys.stderr)
            return 3
    else:
        authoritative = disk_state
    if authoritative is None:
        print(f"no recoverable conviction_state for {tid}", file=sys.stderr)
        return 2

    # The journal commits before the mutable projection. If the process died between those writes,
    # disk can say live while the latest event says archived (or vice versa). Always heal/derive from
    # the last committed projection; the cache file never gets to overrule the transaction journal.
    s = dict(authoritative)
    if not s.get("archived"):
        if disk_state != s:
            atomic_write_json(sp, s)
        print(f"{tid} is already live (not archived) — nothing to restore")
        return 0
    restore_basis = hashlib.sha256(json.dumps(s, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()
    event_key = f"{tid}::restore::{restore_basis[:24]}"
    matches = [r for r in events if r.get("event_key") == event_key]
    if matches and any(row != matches[0] for row in matches[1:]):
        print(f"conflicting restore events already exist for {event_key} — refusing projection", file=sys.stderr)
        return 3
    prior_event = matches[0] if matches else None
    if prior_event is not None:
        projection = prior_event.get("state_projection")
        if (prior_event.get("restore_basis_sha256") != restore_basis
                or prior_event.get("restored_by") != user
                or not isinstance(projection, dict)
                or projection.get("thesis_id") != tid
                or projection.get("archived") is not False
                or event_key not in (projection.get("history") or [])):
            print(f"restore {event_key} has no valid matching recovery projection — refusing guess", file=sys.stderr)
            return 3
        atomic_write_json(sp, projection)
        print(f"restored {tid} idempotently from {event_key}")
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
        "evidence_refs": [], "plain_note": s["plain_note"], "restore_basis_sha256": restore_basis,
        "restored_by": user,
        "event_key": event_key,
    }
    s["history"] = list(dict.fromkeys([*(s.get("history") or []), event["event_key"]]))
    event["state_projection"] = s
    append_ndjson(mutation, APPEND, TICKS, event, "event_key", event["event_key"])
    atomic_write_json(sp, s)
    print(f"restored {tid}: {prev} → {state} [{s['sell_side_rating']}]")
    return 0


if __name__ == "__main__":
    sys.exit(main())
