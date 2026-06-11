#!/usr/bin/env python3
"""Rebuild screener/board/index.json deterministically from the screener's canonical stores.

The board index is the ONE machine-readable state file the cockpit's Pipeline board reads.
It is always REBUILT from the ground truth — the ledger, the thesis/candidate indexes, and
the inbox — never hand-edited, so a crashed or half-finished run can never leave the board
in a fabricated state. Idempotent and safe to run at any time:

    python3 scripts/update_board_index.py

Inputs (all optional — missing stores just yield empty sections):
  screener/inbox/*_sweep.json          sweep inbox files (rows with consumed flags)
  screener/ledger/events.ndjson        one line per processed signal (Phase 0.1 payloads)
  screener/ledger/theses/*.json        locked thesis records (Phase 1)
  screener/ledger/candidates/*.json    candidate shortlists per thesis
  screener/ledger/handoffs.ndjson      append-only handoff log

Output:
  screener/board/index.json            schema: frameworks/screener/board_index.schema.json
"""
from __future__ import annotations

import glob
import json
import os
import sys
from datetime import datetime, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEDGER = os.path.join(REPO, "screener", "ledger")
INBOX = os.path.join(REPO, "screener", "inbox")
BOARD = os.path.join(REPO, "screener", "board", "index.json")

# Thesis statuses count as "watchlist" for the funnel header.
WATCHLIST_STATUSES = {"watchlist_no_source", "watchlist_no_world_change", "watchlist_no_edge"}


def read_json(path: str):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def read_ndjson(path: str) -> list[dict]:
    out: list[dict] = []
    if not os.path.exists(path):
        return out
    with open(path, encoding="utf-8", errors="replace") as f:
        for ln in f:
            ln = ln.strip()
            if not ln:
                continue
            try:
                obj = json.loads(ln)
                if isinstance(obj, dict):
                    out.append(obj)
            except Exception:
                continue  # a corrupt line never breaks the board
    return out


def build() -> dict:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # ---- inbox ----
    inbox_rows: list[dict] = []
    for fp in sorted(glob.glob(os.path.join(INBOX, "*_sweep.json")), reverse=True):
        doc = read_json(fp) or {}
        for row in doc.get("rows", []):
            if not isinstance(row, dict):
                continue
            inbox_rows.append({
                "inbox_id": row.get("inbox_id") or "",
                "headline": row.get("headline") or "",
                "url": row.get("url") or "",
                "source_name": row.get("source_name") or "",
                "input_nature": row.get("input_nature") or "news_headline",
                "found_at": row.get("found_at") or "",
                "sweep_file": os.path.relpath(fp, REPO),
                "prelim_note": row.get("prelim_note") or "",
                "dedup_status": row.get("dedup_status") or "new",
                "consumed": bool(row.get("consumed")),
                "launched_signal_id": row.get("launched_signal_id"),
            })

    # ---- theses (read first so signals can link to them) ----
    theses: list[dict] = []
    thesis_by_signal: dict[str, dict] = {}
    candidates_by_thesis: dict[str, dict] = {}
    for fp in sorted(glob.glob(os.path.join(LEDGER, "candidates", "*.json"))):
        doc = read_json(fp)
        if doc and doc.get("thesis_id"):
            candidates_by_thesis[doc["thesis_id"]] = doc

    handoffs = read_ndjson(os.path.join(LEDGER, "handoffs.ndjson"))
    handed_off_keys = {f"{h.get('thesis_id')}::{h.get('ticker')}" for h in handoffs}

    for fp in sorted(glob.glob(os.path.join(LEDGER, "theses", "*.json")), reverse=True):
        rec = read_json(fp)
        if not rec:
            continue
        meta = rec.get("meta", {})
        m05 = rec.get("M0_5", {})
        m065 = rec.get("M0_6_5", {})
        m066 = rec.get("M0_6_6", {})
        thesis_id = meta.get("thesis_id") or os.path.basename(fp).removesuffix(".json")
        cands_doc = candidates_by_thesis.get(thesis_id) or {}
        cands = []
        for c in cands_doc.get("candidates", []):
            cands.append({
                "candidate_id": c.get("candidate_id") or "",
                "ticker": c.get("ticker") or "",
                "company_name": c.get("company_name") or "",
                "side": c.get("side") or "",
                "exposure_score": int(c.get("exposure_score") or 0),
                "handed_off": f"{thesis_id}::{c.get('ticker')}" in handed_off_keys,
            })
        entry = {
            "thesis_id": thesis_id,
            "signal_id": meta.get("signal_id") or "",
            "headline": rec.get("headline") or meta.get("headline") or "",
            "status": meta.get("status") or "active",
            "status_reason": meta.get("status_reason") or "",
            "routing_reason": (m066.get("routing_reason") or m066.get("routing_logic") or ""),
            "next_action": meta.get("next_action") or "",
            "edge_score": m066.get("final_score"),
            "horizon": rec.get("M0_4", {}).get("horizon"),
            "falsification_sentence": m05.get("falsification_sentence"),
            "convergence_trigger": m065.get("trigger_name"),
            "trigger_date_range": m065.get("trigger_date_range"),
            "locked": bool(meta.get("locked")),
            "run_root": rec.get("run_root") or (f"screener/runs/{meta.get('signal_id')}" if meta.get("signal_id") else ""),
            "candidate_count": len(cands),
            "candidates": cands,
        }
        theses.append(entry)
        if meta.get("signal_id"):
            thesis_by_signal[meta["signal_id"]] = entry

    # ---- signals (events ledger; newest first, dedup by signal_id keeping the LAST line = latest state) ----
    events = read_ndjson(os.path.join(LEDGER, "events.ndjson"))
    by_signal: dict[str, dict] = {}
    for e in events:
        sid = e.get("signal_id")
        if sid:
            by_signal[sid] = e  # later lines win
    signals = []
    for sid, e in by_signal.items():
        linked = thesis_by_signal.get(sid)
        status = (linked or {}).get("status") or e.get("status") or e.get("routing") or "LOG"
        signals.append({
            "signal_id": sid,
            "event_id": e.get("event_id") or "",
            "headline": e.get("headline") or "",
            "source_name": e.get("source_name") or "",
            "source_grade": e.get("source_grade") or "",
            "processed_at": e.get("processed_at") or e.get("ts") or "",
            "run_root": e.get("run_root") or f"screener/runs/{sid}",
            "materiality_score": e.get("materiality_score"),
            "novelty_score": e.get("novelty_score"),
            "pair_label": e.get("pair_label"),
            "action": e.get("action"),
            "status": status,
            "status_reason": e.get("status_reason") or e.get("routing_reason") or "",
            "thesis_id": (linked or {}).get("thesis_id"),
        })
    signals.sort(key=lambda s: s.get("processed_at") or "", reverse=True)

    # ---- handoffs ----
    handoff_rows = [{
        "handoff_id": h.get("handoff_id") or "",
        "thesis_id": h.get("thesis_id") or "",
        "ticker": h.get("ticker") or "",
        "handed_off_at": h.get("handed_off_at") or h.get("ts") or "",
        "seeded_path": h.get("seeded_path") or "",
        "research_run_root": h.get("research_run_root"),
    } for h in handoffs]

    # ---- funnel counts ----
    thesis_statuses = [t["status"] for t in theses]
    counts = {
        "inbox_unconsumed": sum(1 for r in inbox_rows if not r["consumed"]),
        "signals_total": len(signals),
        "parked": sum(1 for s in signals if s["status"] == "PARK"),
        "logged": sum(1 for s in signals if s["status"] in ("LOG", "suppress")),
        "watchlist": sum(1 for st in thesis_statuses if st in WATCHLIST_STATUSES)
        + sum(1 for s in signals if s["status"] == "watchlist_no_source" and not s["thesis_id"]),
        "provisional": sum(1 for st in thesis_statuses if st == "provisional"),
        "full_machine": sum(1 for st in thesis_statuses if st == "full_machine"),
        "handed_off": len(handoff_rows),
    }

    return {
        "generated_at": now,
        "inbox": inbox_rows,
        "signals": signals,
        "theses": theses,
        "handoffs": handoff_rows,
        "counts": counts,
    }


def main() -> int:
    idx = build()
    os.makedirs(os.path.dirname(BOARD), exist_ok=True)
    tmp = BOARD + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(idx, f, indent=2, ensure_ascii=False)
        f.write("\n")
    os.replace(tmp, BOARD)  # atomic swap so a reader never sees a half-written board
    c = idx["counts"]
    print(
        f"WROTE {os.path.relpath(BOARD, REPO)} — {c['signals_total']} signals, "
        f"{len(idx['theses'])} theses, {c['inbox_unconsumed']} inbox, {c['handed_off']} handoffs"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
