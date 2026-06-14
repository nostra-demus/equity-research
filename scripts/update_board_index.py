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
# Phase 3 conviction loop: the engine-owned live-book snapshots (separate from the human
# override path). Folded into each thesis entry as `conviction`; missing dir = empty (the
# loop is additive and the board never depends on it existing).
CONV_STATE = os.path.join(LEDGER, "conviction", "conviction_state")

# Thesis statuses count as "watchlist" for the funnel header. watchlist_manual is a HUMAN move
# (an overrides.ndjson record), distinct from the engine's three watchlist reasons.
WATCHLIST_STATUSES = {"watchlist_no_source", "watchlist_no_world_change", "watchlist_no_edge", "watchlist_manual"}


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


def firehose_counts(today: str) -> tuple[int, int, int]:
    """Sum today's autonomous-ingester cycle summaries → (seen, picked-into-inbox, dropped).

    The ingester logs one compact `cycle_summary` line per run to <DATE>_firehose.ndjson (per-item
    `kind:"item"` lines are filtered out here); dropped items are counted but never written to the
    inbox. NOTE: seen can exceed picked + dropped — a cycle that hits the daily Groq budget or a
    transient Groq failure defers the unscored tail to the next cycle.
    """
    seen = picked = dropped = 0
    for o in read_ndjson(os.path.join(INBOX, f"{today}_firehose.ndjson")):
        if o.get("kind") != "cycle_summary":
            continue
        seen += int(o.get("candidates") or 0)
        picked += int(o.get("picked") or 0) + int(o.get("watched") or 0)
        dropped += int(o.get("dropped") or 0)
    return seen, picked, dropped


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
                # additive: the autonomous ingester's cheap pre-triage (absent on manual-sweep rows)
                "triage_score": row.get("triage_score"),  # composite PRIORITY (materiality + source-tier/scope/recency)
                "triage_reason": row.get("triage_reason") or "",
                "region": row.get("region") or "",
                "relevance": row.get("relevance") or "",
                "materiality_pre_score": row.get("materiality_pre_score"),  # the raw Groq title read
                "rank_factors": row.get("rank_factors") if isinstance(row.get("rank_factors"), dict) else None,
                "event_types": row.get("event_types") if isinstance(row.get("event_types"), list) else [],
                "issuer_linkage": row.get("issuer_linkage") or "",
                "companies": row.get("companies") if isinstance(row.get("companies"), list) else [],
                "size_bucket": row.get("size_bucket") or "",
                # additive: human state (cockpit dismiss/restore)
                "dismissed": bool(row.get("dismissed")),
                "dismissed_at": row.get("dismissed_at") or "",
                "dismissed_by": row.get("dismissed_by") or "",
            })

    # ---- human thesis overrides (append-only; the LAST line per thesis wins) ----
    # The engine's own `status` is never altered: the board carries BOTH — `status` (the checks'
    # verdict) and `effective_status` (where the human put it) — plus `override_stale` when the
    # engine re-ran and changed its mind AFTER the move (surfaced, never silently resolved).
    latest_override: dict[str, dict] = {}
    for line in read_ndjson(os.path.join(LEDGER, "overrides.ndjson")):
        if line.get("kind") == "thesis_status" and line.get("thesis_id"):
            latest_override[line["thesis_id"]] = line

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
        ovr = latest_override.get(thesis_id)
        engine_status = entry["status"]
        if ovr and ovr.get("to_status"):
            entry["effective_status"] = ovr["to_status"]
            entry["override"] = {
                "from_status": ovr.get("from_status") or "",
                "to_status": ovr.get("to_status"),
                "reason": ovr.get("reason") or "",
                "moved_by": ovr.get("moved_by") or "",
                "moved_at": ovr.get("moved_at") or "",
            }
            entry["override_stale"] = (ovr.get("from_status") or "") != engine_status
        else:
            entry["effective_status"] = engine_status
            entry["override"] = None
            entry["override_stale"] = False
        # Phase 3: fold in the engine-owned conviction snapshot (rung, live edge, momentum,
        # sparkline points) — the board reads it; the locked thesis JSON is never touched.
        cs = read_json(os.path.join(CONV_STATE, f"{thesis_id}.json"))
        entry["conviction"] = cs if isinstance(cs, dict) else None
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
    # funnel counts run on the EFFECTIVE status (engine verdict unless a human moved the idea)
    thesis_statuses = [t.get("effective_status") or t["status"] for t in theses]
    news_seen, news_picked, news_dropped = firehose_counts(now[:10])
    counts = {
        "inbox_unconsumed": sum(1 for r in inbox_rows if not r["consumed"] and not r.get("dismissed")),
        "signals_total": len(signals),
        "parked": sum(1 for s in signals if s["status"] == "PARK"),
        "logged": sum(1 for s in signals if s["status"] in ("LOG", "suppress")),
        "watchlist": sum(1 for st in thesis_statuses if st in WATCHLIST_STATUSES)
        + sum(1 for s in signals if s["status"] == "watchlist_no_source" and not s["thesis_id"]),
        "provisional": sum(1 for st in thesis_statuses if st == "provisional"),
        "full_machine": sum(1 for st in thesis_statuses if st == "full_machine"),
        "handed_off": len(handoff_rows),
        # autonomous news ingester — today's firehose throughput (0 when nothing has run today)
        "news_seen_today": news_seen,
        "news_picked_today": news_picked,
        "news_dropped_today": news_dropped,
    }

    # ---- book momentum (Phase 3 live book) ----
    # The single number the desk watches: are live ideas, on balance, upgrading? Computed from the
    # conviction snapshots. Archived (terminal) theses leave the live book but stay counted.
    conv = [t["conviction"] for t in theses if isinstance(t.get("conviction"), dict)]
    live = [c for c in conv if not c.get("archived")]
    vels = [float(c.get("upgrade_velocity") or 0) for c in live]
    book_momentum = {
        "live_count": len(live),
        "upgrading_count": sum(1 for v in vels if v > 0),
        "decaying_count": sum(1 for v in vels if v < 0),
        "mean_upgrade_velocity": round(sum(vels) / len(vels), 1) if vels else 0.0,
        "confirmed_count": sum(1 for c in live if c.get("state") == "confirmed"),
        "fading_count": sum(1 for c in live if c.get("state") == "fading"),
        "stale_count": sum(1 for c in live if c.get("stale")),
        "archived_count": sum(1 for c in conv if c.get("archived")),
    }

    return {
        "generated_at": now,
        "inbox": inbox_rows,
        "signals": signals,
        "theses": theses,
        "handoffs": handoff_rows,
        "counts": counts,
        "book_momentum": book_momentum,
    }


USAGE = """usage: update_board_index.py [--check]

  (no args)  rebuild screener/board/index.json from the canonical stores
  --check    build in memory and compare against the existing board (generated_at
             ignored); exit 0 if up to date, 1 if stale/missing. Writes NOTHING.
  --help     show this help. Writes NOTHING.

Any other argument is rejected — this script mutates the board, so an accidental
flag (e.g. a typo'd --help) must never trigger a rebuild."""


def main(argv: list | None = None) -> int:
    args = sys.argv[1:] if argv is None else argv
    if any(a in ("-h", "--help") for a in args):
        print(USAGE)
        return 0
    unknown = [a for a in args if a != "--check"]
    if unknown:
        print(f"update_board_index.py: unknown argument(s): {' '.join(unknown)}", file=sys.stderr)
        print(USAGE, file=sys.stderr)
        return 2
    idx = build()
    if "--check" in args:
        try:
            with open(BOARD, encoding="utf-8") as f:
                current = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            print(f"STALE {os.path.relpath(BOARD, REPO)} — missing or unreadable; rerun without --check to rebuild")
            return 1
        if not isinstance(current, dict):
            print(f"STALE {os.path.relpath(BOARD, REPO)} — not a JSON object; rerun without --check to rebuild")
            return 1
        strip = lambda d: {k: v for k, v in d.items() if k != "generated_at"}  # noqa: E731
        if strip(current) == strip(idx):
            print(f"OK {os.path.relpath(BOARD, REPO)} — up to date")
            return 0
        print(f"STALE {os.path.relpath(BOARD, REPO)} — rerun without --check to rebuild")
        return 1
    os.makedirs(os.path.dirname(BOARD), exist_ok=True)
    # per-process temp file: concurrent rebuilds (a sweep + a handoff each refresh the board) must
    # never interleave writes into one shared .tmp and rename a corrupt board into place. Each
    # rebuild is deterministic from the stores, so last-rename-wins converges to the truth.
    tmp = f"{BOARD}.tmp.{os.getpid()}"
    try:
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(idx, f, indent=2, ensure_ascii=False)
            f.write("\n")
        os.replace(tmp, BOARD)  # atomic swap so a reader never sees a half-written board
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)  # never leave a stray temp file on failure
    c = idx["counts"]
    print(
        f"WROTE {os.path.relpath(BOARD, REPO)} — {c['signals_total']} signals, "
        f"{len(idx['theses'])} theses, {c['inbox_unconsumed']} inbox, {c['handed_off']} handoffs"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
