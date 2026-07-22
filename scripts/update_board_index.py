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
CONV_CHECKPOINTS = os.path.join(LEDGER, "conviction", "checkpoints.ndjson")
CONV_TICKS = os.path.join(LEDGER, "conviction", "conviction.ndjson")
# The PM skim's surfaced ideas (news/ideas). One snapshot per idea; the board projects them as a pure,
# read-only feed, deriving `stale` at build time from decay_at (no paid pass). Missing dir = empty.
IDEAS = os.path.join(LEDGER, "ideas")

# Thesis statuses count as "watchlist" for the funnel header. watchlist_manual is a HUMAN move
# (an overrides.ndjson record), distinct from the engine's three watchlist reasons.
# watchlist_integrity_downgrade / watchlist_integrity_broken are thesis-integrity's own post-lock
# terminal verdicts (folded into effective_status above from the additive integrity_review block) —
# without them here a gate-killed thesis vanished from the funnel instead of counting as watchlist.
WATCHLIST_STATUSES = {
    "watchlist_no_source", "watchlist_no_world_change", "watchlist_no_edge", "watchlist_manual",
    "watchlist_integrity_downgrade", "watchlist_integrity_broken",
}

# thesis-integrity's two post-lock TERMINAL routings (the adversarial gate rejected the thesis).
TERMINAL_INTEGRITY = {"watchlist_integrity_downgrade", "watchlist_integrity_broken"}

# ideas-scorecard buckets. A locked thesis at provisional/full_machine means the deep machine BACKED the
# idea; the watchlist_* verdicts (incl. the two integrity kills) mean the machine reviewed it and did NOT
# back it. The integrity kills sit in PASS, not CONFIRM: a thesis the engine's own final gate rejected
# must never be scored as machine-confirmed.
MACHINE_CONFIRM = {"provisional", "full_machine"}
MACHINE_PASS = {
    "watchlist_no_edge", "watchlist_no_world_change", "watchlist_no_source",
    "watchlist_integrity_downgrade", "watchlist_integrity_broken",
    "LOG", "PARK", "suppress",
}


def machine_grade_status(sig_status_val, integrity_routing):
    """The status the ideas-scorecard should grade a promoted idea's thesis by. If the engine's own
    adversarial gate returned a TERMINAL verdict, that verdict wins over the frozen locked status —
    independently of any human display override — so a thesis the gate KILLED is scored machine_passed,
    never machine_confirmed (the machine did not, in the end, back it). Otherwise the linked signal's
    frozen status stands."""
    if integrity_routing in TERMINAL_INTEGRITY:
        return integrity_routing
    return sig_status_val or ""


def read_json(path: str):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def safe_int(v, default: int = 0) -> int:
    """int() that never raises — a malformed value (a non-numeric string, a list) degrades to the default
    instead of aborting the whole board rebuild. Used for numeric fields read from external snapshots."""
    try:
        return int(v)
    except (TypeError, ValueError):
        return default


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


def firehose_translations(max_files: int = 5) -> dict[str, str]:
    """event_id -> English translation (headline_en), read from the recent firehose item lines.

    The wire stores headline_en on every triaged non-English item (ui/server/src/news); a promoted
    signal/thesis links back by event_id, so we surface the SAME translation on the board without
    re-translating. Bounded to the most recent firehose files (active signals/theses are recent); an
    aged-out event simply has no entry and the UI falls back to the original headline. Newest file
    wins (reverse-sorted + setdefault)."""
    xlate: dict[str, str] = {}
    files = sorted(glob.glob(os.path.join(INBOX, "*_firehose.ndjson")), reverse=True)[:max_files]
    for fp in files:
        for o in read_ndjson(fp):
            if o.get("kind") != "item":
                continue
            eid, en = o.get("event_id"), o.get("headline_en")
            if eid and isinstance(en, str) and en.strip():
                xlate.setdefault(eid, en.strip())
    return xlate


def conviction_resolved_ids() -> set[str]:
    """Checkpoints with a recorded result — used to DERIVE staleness at every build, so a missed check
    (a by-date that passed with no validation) can never leave a thesis showing a live rating."""
    out: set[str] = set()
    for r in read_ndjson(CONV_TICKS):
        if r.get("row_type") == "validation_result" and r.get("verdict") not in (None, "unresolved") and r.get("checkpoint_id"):
            out.add(r["checkpoint_id"])
    for c in read_ndjson(CONV_CHECKPOINTS):
        if c.get("status") == "resolved" and c.get("checkpoint_id"):
            out.add(c["checkpoint_id"])
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
                "headline_en": row.get("headline_en"),  # English translation of a non-English headline (ui news/lang.ts); null when English
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
    # ---- human signal HIDES (soft-delete from the live book; append-only, LAST line per signal wins) ----
    # A `signal_hide` removes an idea from the board; a later `signal_restore` un-hides it. The engine's
    # ledger/run are never touched — this is purely a view state (like the inbox dismiss), so it's reversible.
    hidden_signals: dict[str, bool] = {}
    for line in read_ndjson(os.path.join(LEDGER, "overrides.ndjson")):
        kind = line.get("kind")
        if kind == "thesis_status" and line.get("thesis_id"):
            latest_override[line["thesis_id"]] = line
        elif kind in ("signal_hide", "signal_restore") and line.get("signal_id"):
            hidden_signals[line["signal_id"]] = kind == "signal_hide"

    # event_id -> English headline, sourced from the wire's own translation (never re-translated here);
    # attached to any non-Latin signal/thesis below so the board reads in English like the events rail.
    xlate = firehose_translations()

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

    # conviction: derive staleness from the calendar at every build (robust to a missed dispatch)
    conv_resolved = conviction_resolved_ids()
    conv_cps_by_thesis: dict[str, list] = {}
    for c in read_ndjson(CONV_CHECKPOINTS):
        conv_cps_by_thesis.setdefault(c.get("thesis_id"), []).append(c)
    today_day = now[:10]

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
            ni = c.get("news_impact") or {}
            cands.append({
                "candidate_id": c.get("candidate_id") or "",
                "ticker": c.get("ticker") or "",
                "company_name": c.get("company_name") or "",
                "side": c.get("side") or "",
                "exposure_score": int(c.get("exposure_score") or 0),
                "handed_off": f"{thesis_id}::{c.get('ticker')}" in handed_off_keys,
                # news-impact sizing gap (NEWS_IMPACT.md) so the live book can sort by mispricing. None when the
                # candidate carries no sizing (a diffuse macro/policy/commodity signal) — keeps the schema honest.
                "gap_read": ni.get("gap_read") or None,
                "implied_move_pct": ni.get("implied_move_pct"),
                "observed_move_pct": ni.get("observed_move_pct"),
            })
        entry = {
            "thesis_id": thesis_id,
            "signal_id": meta.get("signal_id") or "",
            "headline": rec.get("headline") or meta.get("headline") or "",
            # English translation (from the wire) for a non-Latin headline; set via the linked signal's
            # event_id in the signals pass below, so the board reader matches the events rail.
            "headline_en": None,
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
        # thesis-integrity's verdict, additively patched onto this ledger copy by
        # scripts/screener_patch_integrity_review.py (meta/status/M0_x above stay frozen at lock time —
        # see frameworks/screener/SCREENER_PIPELINE.md). None until the gate has reviewed this thesis.
        ir = rec.get("integrity_review") if isinstance(rec.get("integrity_review"), dict) else None
        entry["integrity_review"] = ir
        if ir and ir.get("routing") in TERMINAL_INTEGRITY and not (ovr and ovr.get("to_status")):
            # The adversarial gate killed this thesis post-lock and no human has since overridden it —
            # effective_status must say so, or an analyst reading "provisional"/"full_machine" here would
            # never learn the engine's own red-team already rejected it. A human override (above) still wins.
            entry["effective_status"] = ir["routing"]
        # Phase 3: fold in the engine-owned conviction snapshot (rung, live edge, momentum,
        # sparkline points) — the board reads it; the locked thesis JSON is never touched.
        cs = read_json(os.path.join(CONV_STATE, f"{thesis_id}.json"))
        if isinstance(cs, dict):
            if not cs.get("archived"):
                cs["stale"] = bool(cs.get("stale")) or any(
                    cp.get("due_at") and cp["due_at"] < today_day
                    and cp.get("status") != "resolved" and cp.get("checkpoint_id") not in conv_resolved
                    for cp in conv_cps_by_thesis.get(thesis_id, [])
                )
            entry["conviction"] = cs
        else:
            entry["conviction"] = None
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
        # surface the wire's English translation — already gated server-side by news/lang.ts (a real
        # non-English headline only, Latin-script included), so trust the firehose value directly; also lift
        # it onto the linked thesis (same event carried forward) so both read in English.
        ev_headline = e.get("headline") or ""
        headline_en = xlate.get(e.get("event_id"))
        if headline_en and linked is not None and not linked.get("headline_en"):
            linked["headline_en"] = headline_en
        signals.append({
            "signal_id": sid,
            "event_id": e.get("event_id") or "",
            "headline": ev_headline,
            "headline_en": headline_en,
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
            # additive human view-state: soft-hidden from the live book (a `signal_hide` override); a
            # `signal_restore` clears it. The UI filters these into a "Hidden" tray, restorable one-click.
            "hidden": hidden_signals.get(sid, False),
            # carry the scanner's theme tags + named issuers through so the live book can filter by
            # theme/company (already on the event ledger row; the UI's theme chips self-activate once present).
            "event_types": e.get("event_types") if isinstance(e.get("event_types"), list) else [],
            "issuers": e.get("issuers") if isinstance(e.get("issuers"), list) else [],
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
    # funnel counts run on the EFFECTIVE status (engine verdict unless a human moved the idea), and EXCLUDE
    # ideas the human soft-hid from the book, so every funnel number matches the cards actually shown.
    hidden_sig_ids = {s["signal_id"] for s in signals if s["hidden"]}
    # a hidden signal's thesis (if any) carries the hide through to anything keyed on thesis_id — handoffs
    # included — so the "Sent" funnel count matches the cards actually shown, not the ledger's raw count.
    hidden_thesis_ids = {t["thesis_id"] for t in theses if t.get("signal_id") in hidden_sig_ids}
    visible_signals = [s for s in signals if not s["hidden"]]
    visible_handoff_rows = [h for h in handoff_rows if h["thesis_id"] not in hidden_thesis_ids]
    thesis_statuses = [t.get("effective_status") or t["status"] for t in theses if t.get("signal_id") not in hidden_sig_ids]
    news_seen, news_picked, news_dropped = firehose_counts(now[:10])
    counts = {
        "inbox_unconsumed": sum(1 for r in inbox_rows if not r["consumed"] and not r.get("dismissed")),
        "signals_total": len(visible_signals),
        "hidden": len(hidden_sig_ids),
        "parked": sum(1 for s in visible_signals if s["status"] == "PARK"),
        "logged": sum(1 for s in visible_signals if s["status"] in ("LOG", "suppress")),
        "watchlist": sum(1 for st in thesis_statuses if st in WATCHLIST_STATUSES)
        + sum(1 for s in visible_signals if s["status"] == "watchlist_no_source" and not s["thesis_id"]),
        "provisional": sum(1 for st in thesis_statuses if st == "provisional"),
        "full_machine": sum(1 for st in thesis_statuses if st == "full_machine"),
        "handed_off": len(visible_handoff_rows),
        # autonomous news ingester — today's firehose throughput (0 when nothing has run today)
        "news_seen_today": news_seen,
        "news_picked_today": news_picked,
        "news_dropped_today": news_dropped,
    }

    # ---- book momentum (Phase 3 live book) ----
    # The single number the desk watches: are live ideas, on balance, upgrading? Computed from the
    # conviction snapshots. Archived (terminal) theses leave the live book but stay counted.
    conv = [
        t["conviction"] for t in theses
        if isinstance(t.get("conviction"), dict) and t.get("signal_id") not in hidden_sig_ids
    ]
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

    # ---- PM skim: surfaced ideas (news/ideas) + self-grading scorecard ----
    # A pure, read-only projection of the idea snapshots. `stale` is derived at build time from decay_at
    # (an ISO-Z string, so a lexicographic compare against `now` is a correct time compare) — a surfaced
    # idea ages off the fresh lane for free, no paid pass. Sorted best-first (conviction, then the wire's
    # own materiality) so the UI can slice the top 1-2 without re-ranking. Missing dir = empty.
    #
    # The scorecard is the skim's HONEST track record: how many ideas it surfaced, how many the human ran,
    # how the DEEP machine graded the ones that were run (confirmed vs passed), and the 👍/👎 tally — no
    # price, no fake P&L. The UI refuses to quote a confirmation rate until enough runs have resolved.
    idea_fb: dict[str, str] = {}  # per-idea latest human vote (last line per idea_id wins; 'clear' un-votes)
    for r in read_ndjson(os.path.join(LEDGER, "ideas_feedback.ndjson")):
        iid, pol = r.get("idea_id"), r.get("polarity")
        if iid and pol in ("up", "down", "clear"):
            idea_fb[iid] = pol
    # a promoted idea links to its signal; the signal's status IS the deep machine's grade of the skim's call
    sig_status = {s["signal_id"]: (s.get("status") or "") for s in signals}

    ideas: list[dict] = []
    sc = {"surfaced_total": 0, "live_count": 0, "promoted_total": 0,
          "machine_confirmed": 0, "machine_passed": 0, "machine_pending": 0,
          "up_votes": 0, "down_votes": 0}
    for fp in sorted(glob.glob(os.path.join(IDEAS, "*.json"))):
        rec = read_json(fp)
        if not isinstance(rec, dict) or not rec.get("idea_id") or not rec.get("ticker"):
            continue
        decay_at = rec.get("decay_at") or ""
        pc = rec.get("prior_coverage") if isinstance(rec.get("prior_coverage"), dict) else None
        fb = idea_fb.get(rec.get("idea_id"))
        fb = fb if fb in ("up", "down") else None  # 'clear'/absent -> no live vote
        stale = bool(decay_at) and decay_at < now
        status = rec.get("status") or "live"
        ideas.append({
            "idea_id": rec.get("idea_id"),
            "ticker": rec.get("ticker") or "",
            "company": rec.get("company"),
            "exchange": rec.get("exchange"),
            "direction": rec.get("direction") or "long",
            "pair_with": rec.get("pair_with"),
            "reason": rec.get("reason") or "",
            "why_now": rec.get("why_now") or "",
            "conviction": safe_int(rec.get("conviction"), 0),
            "conviction_basis": rec.get("conviction_basis") or "pre_edge_proxy",
            "priced_in": rec.get("priced_in") or "unknown",
            "thesis_type": rec.get("thesis_type") or "company_specific",
            "source_event_ids": rec.get("source_event_ids") if isinstance(rec.get("source_event_ids"), list) else [],
            "source_headlines": rec.get("source_headlines") if isinstance(rec.get("source_headlines"), list) else [],
            "source_url": rec.get("source_url"),
            "source_name": rec.get("source_name"),
            "materiality_max": safe_int(rec.get("materiality_max"), 0),
            "newest_source_at": rec.get("newest_source_at") or "",
            "prior_coverage": pc,
            "surfaced_at": rec.get("surfaced_at") or "",
            "updated_at": rec.get("updated_at") or "",
            "decay_at": decay_at,
            "status": status,
            "promoted_signal_id": rec.get("promoted_signal_id"),
            "feedback": fb,
            "stale": stale,
        })
        sc["surfaced_total"] += 1
        if not stale:
            sc["live_count"] += 1
        if fb == "up":
            sc["up_votes"] += 1
        elif fb == "down":
            sc["down_votes"] += 1
        if status == "promoted":
            sc["promoted_total"] += 1
            psid = rec.get("promoted_signal_id") or ""
            # A thesis-integrity kill wins over the frozen locked status: the linked thesis's own
            # effective_status already reflects this on the board, but the scorecard reads sig_status
            # (frozen), so without this an integrity-killed thesis would still count as machine_confirmed —
            # the user-facing "it backed" track record would claim the machine agreed with an idea its own
            # final adversarial gate rejected. Read the integrity routing directly (independent of any
            # human display override) so the grade is the machine's, not the human's.
            lt = thesis_by_signal.get(psid) or {}
            ir_lt = lt.get("integrity_review") if isinstance(lt.get("integrity_review"), dict) else None
            st = machine_grade_status(sig_status.get(psid, ""), (ir_lt or {}).get("routing"))
            if st in MACHINE_CONFIRM:
                sc["machine_confirmed"] += 1
            elif st in MACHINE_PASS:
                sc["machine_passed"] += 1
            else:
                sc["machine_pending"] += 1
    sc["resolved"] = sc["machine_confirmed"] + sc["machine_passed"]
    ideas.sort(key=lambda i: (i["stale"], -i["conviction"], -i["materiality_max"]))

    return {
        "generated_at": now,
        "inbox": inbox_rows,
        "signals": signals,
        "theses": theses,
        "handoffs": handoff_rows,
        "ideas": ideas,
        "ideas_scorecard": sc,
        "counts": counts,
        "book_momentum": book_momentum,
    }


USAGE = """usage: update_board_index.py [--check | --selftest]

  (no args)  rebuild screener/board/index.json from the canonical stores
  --check    build in memory and compare against the existing board (generated_at
             ignored); exit 0 if up to date, 1 if stale/missing. Writes NOTHING.
  --selftest fixture-free unit test of the ideas-scorecard machine-grade classifier.
             Writes NOTHING. Exit 1 on any assertion failure.
  --help     show this help. Writes NOTHING.

Any other argument is rejected — this script mutates the board, so an accidental
flag (e.g. a typo'd --help) must never trigger a rebuild."""


def _selftest() -> int:
    """Fixture-free: pins machine_grade_status() + the CONFIRM/PASS buckets — the ideas-scorecard
    classification that had zero regression protection (build() runs only against the real, mutable
    stores at command-run time). Expected values pinned to the rule that the deep machine's own terminal
    adversarial verdict (a thesis-integrity kill) must never be scored as machine_confirmed."""
    bad = 0

    def check(label, cond):
        nonlocal bad
        print(f"  [{'ok' if cond else 'XX'}] {label}")
        if not cond:
            bad += 1

    def bucket(st):
        return ("confirmed" if st in MACHINE_CONFIRM else
                "passed" if st in MACHINE_PASS else "pending")

    # A thesis the gate KILLED (terminal integrity routing) must grade PASSED, not CONFIRMED — even though
    # its frozen locked status is still provisional/full_machine.
    for frozen in ("provisional", "full_machine"):
        for kill in TERMINAL_INTEGRITY:
            st = machine_grade_status(frozen, kill)
            check(f"frozen={frozen} + gate kill {kill} -> not confirmed",
                  bucket(st) == "passed" and st != frozen)
    # No integrity verdict (Proceed or gate never ran) -> frozen status stands: a backed thesis confirms.
    check("provisional + no integrity verdict -> confirmed",
          bucket(machine_grade_status("provisional", None)) == "confirmed")
    check("full_machine + Proceed -> confirmed",
          bucket(machine_grade_status("full_machine", "Proceed")) == "confirmed")
    # A non-terminal integrity routing (Proceed) never overrides the frozen status.
    check("provisional + Proceed -> stays provisional (confirmed)",
          machine_grade_status("provisional", "Proceed") == "provisional")
    # Engine watchlist verdicts (no live idea) grade PASSED, not confirmed/pending.
    check("watchlist_no_edge -> passed", bucket(machine_grade_status("watchlist_no_edge", None)) == "passed")
    # The two integrity kills are in PASS and NOT in CONFIRM.
    check("integrity kills are in MACHINE_PASS", TERMINAL_INTEGRITY <= MACHINE_PASS)
    check("integrity kills are NOT in MACHINE_CONFIRM", not (TERMINAL_INTEGRITY & MACHINE_CONFIRM))

    print(f"update_board_index selftest: {'ALL OK' if bad == 0 else f'{bad} FAILED'}")
    return 1 if bad else 0


def main(argv: list | None = None) -> int:
    args = sys.argv[1:] if argv is None else argv
    if any(a in ("-h", "--help") for a in args):
        print(USAGE)
        return 0
    if "--selftest" in args:
        return _selftest()
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
