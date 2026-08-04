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
import hashlib
import json
import os
import re
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

IDEA_ORIGIN_TYPES = {"wire", "theme", "mixed"}
IDEA_THEME_ID_RE = re.compile(r"^THM-[a-f0-9]{8}$")
IDEA_EVENT_ID_RE = re.compile(r"^EVT-[a-f0-9]{12}$")
IDEA_TICKER_RE = re.compile(r"^[A-Z0-9][A-Z0-9.&-]{0,14}$")
IDEA_JUNK_TICKERS = {
    "NULL", "NONE", "N/A", "NA", "N.A", "UNKNOWN", "TBD", "PRIVATE", "UNLISTED", "OTC", "IPO",
}
MAX_IDEA_SOURCE_THEMES = 64
MAX_THEME_EVIDENCE_EVENTS = 64


def valid_idea_ticker(value: object) -> bool:
    """Python twin of news/symbology.cleanTicker for persisted Ideas."""
    return (isinstance(value, str)
            and value not in IDEA_JUNK_TICKERS
            and IDEA_TICKER_RE.fullmatch(value) is not None
            and re.fullmatch(r"\d{7,}", value.replace(".", "").replace("-", "")) is None)


def override_supersedes_review(ovr, ir) -> bool:
    """True iff a human override should still mask a TERMINAL thesis-integrity verdict.

    Only an override the human recorded AFTER the verdict counts: an override made BEFORE the gate ran was
    a decision about the pre-kill thesis, so letting it mask a later rejection would show a killed idea as
    provisional/full_machine with no warning. An override with no `moved_at` cannot be shown to post-date
    the review, so it loses (fail toward surfacing the kill)."""
    if not (isinstance(ovr, dict) and ovr.get("to_status")):
        return False
    moved_at = ovr.get("moved_at") or ""
    reviewed_at = (ir or {}).get("reviewed_at") or ""
    return bool(moved_at) and moved_at > reviewed_at


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


def project_idea_lineage(rec: dict) -> dict | None:
    """Return the board-safe lineage projection, or None for malformed new provenance.

    Legacy idea snapshots predate Themes and carry neither field, so they intentionally project no
    lineage keys. New snapshots must carry both fields and obey their origin/cardinality contract. The
    per-theme evidence ids are mandatory on every new theme/mixed snapshot; dropping them would sever
    the exact Theme -> wire-event audit trail in the static board. "Legacy" means both lineage fields
    are absent — an all-unmapped new lineage is malformed, not a compatibility shape.
    """
    has_origin = "origin_type" in rec
    has_themes = "source_themes" in rec
    if not has_origin and not has_themes:
        return {}
    if not has_origin or not has_themes or rec.get("origin_type") not in IDEA_ORIGIN_TYPES:
        return None

    raw_themes = rec.get("source_themes")
    if not isinstance(raw_themes, list) or len(raw_themes) > MAX_IDEA_SOURCE_THEMES:
        return None
    source_event_ids = {
        event_id for event_id in (rec.get("source_event_ids") or [])
        if isinstance(event_id, str)
    } if isinstance(rec.get("source_event_ids"), list) else set()

    source_themes: list[dict] = []
    seen_theme_ids: set[str] = set()
    for raw_theme in raw_themes:
        if not isinstance(raw_theme, dict):
            return None
        theme_id = raw_theme.get("theme_id")
        theme_rev = raw_theme.get("theme_rev")
        if not isinstance(theme_id, str) or not IDEA_THEME_ID_RE.fullmatch(theme_id):
            return None
        if (not isinstance(theme_rev, int) or isinstance(theme_rev, bool) or theme_rev < 1
                or theme_id in seen_theme_ids):
            return None
        seen_theme_ids.add(theme_id)

        theme_ref = {"theme_id": theme_id, "theme_rev": theme_rev}
        if "evidence_event_ids" not in raw_theme:
            return None
        event_ids = raw_theme.get("evidence_event_ids")
        if (not isinstance(event_ids, list) or not event_ids
                or len(event_ids) > MAX_THEME_EVIDENCE_EVENTS
                or any(not isinstance(event_id, str) or not IDEA_EVENT_ID_RE.fullmatch(event_id)
                       for event_id in event_ids)
                or len(set(event_ids)) != len(event_ids)
                or any(event_id not in source_event_ids for event_id in event_ids)):
            return None
        theme_ref["evidence_event_ids"] = list(event_ids)
        source_themes.append(theme_ref)

    origin_type = rec["origin_type"]
    if (origin_type == "wire") != (len(source_themes) == 0):
        return None
    return {"origin_type": origin_type, "source_themes": source_themes}


def idea_version_for_record(rec: dict, lineage: dict, *, bind_pair: bool = True) -> str | None:
    """Recompute the exact TypeScript ideaVersion recipe for a board candidate.

    Static projection is a second trust boundary. Once lineage exists, the version must bind origin,
    Theme revision, every mapped evidence edge, and the normalized nullable pair leg; accepting a
    pre-lineage version beside new fields would let mutable provenance travel under an old outcome identity.
    """
    ticker = rec.get("ticker")
    direction = rec.get("direction")
    thesis_type = rec.get("thesis_type")
    reason = rec.get("reason")
    why_now = rec.get("why_now")
    event_ids = rec.get("source_event_ids")
    if "pair_with" not in rec:
        return None
    pair_with = rec.get("pair_with")
    if (not all(isinstance(v, str) for v in (ticker, direction, thesis_type, reason, why_now))
            or not valid_idea_ticker(ticker)
            or not isinstance(event_ids, list)
            or not event_ids
            or len(event_ids) > 64
            or any(not isinstance(event_id, str) or not IDEA_EVENT_ID_RE.fullmatch(event_id)
                   for event_id in event_ids)
            or len(set(event_ids)) != len(event_ids)):
        return None
    if direction == "pair":
        if not valid_idea_ticker(pair_with):
            return None
    elif pair_with is not None:
        return None

    canonical = [
        ticker.upper(),
        direction,
    ]
    if bind_pair:
        normalized_pair = "null" if pair_with is None else pair_with.strip().upper().replace("-", ".")
        canonical.append(f"pair:{normalized_pair}")
    canonical.extend([
        thesis_type,
        " ".join(reason.strip().lower().split()),
        " ".join(why_now.strip().lower().split()),
        ",".join(sorted(set(event_ids))),
    ])
    if lineage:
        refs = []
        for theme in lineage["source_themes"]:
            evidence = ",".join(sorted(set(theme["evidence_event_ids"])))
            refs.append(f"{theme['theme_id']}@{theme['theme_rev']}[{evidence}]")
        canonical.extend([lineage["origin_type"], ";".join(sorted(refs))])
    digest = hashlib.sha256("|".join(canonical).encode("utf-8")).hexdigest()[:16]
    return f"IDEAV-{digest}"


def valid_idea_version(rec: dict, lineage: dict) -> bool:
    expected = idea_version_for_record(rec, lineage)
    if expected is not None and rec.get("idea_version") == expected:
        return True
    # Only the field-absent pre-lineage shape is distinguishable as an old snapshot. No explicit lineage
    # may use the pair-unbound recipe, even when every other canonical field happens to match.
    if lineage:
        return False
    legacy = idea_version_for_record(rec, {}, bind_pair=False)
    return legacy is not None and rec.get("idea_version") == legacy


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
        if ir and ir.get("routing") in TERMINAL_INTEGRITY:
            # The adversarial gate killed this thesis post-lock — effective_status must say so, or an analyst
            # reading "provisional"/"full_machine" would never learn the engine's own red-team rejected it.
            # A human override still wins, but ONLY if the human moved it AFTER seeing this verdict: an
            # override recorded BEFORE the kill was a decision about the pre-kill thesis, so letting it mask
            # a later rejection shows a killed idea as full_machine with no warning at all. Compare the
            # timestamps; an older override loses AND is flagged stale so the human is told why.
            if not override_supersedes_review(ovr, ir):
                entry["effective_status"] = ir["routing"]
                if ovr and ovr.get("to_status"):
                    # a pre-existing override that the kill has now superseded
                    entry["override_stale"] = True
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
    # idea ages off the fresh lane for free, no paid pass. Sorted best-first by the strict, capped trade
    # score when present (old snapshots fall back to conviction), then materiality. Missing dir = empty.
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
        lineage = project_idea_lineage(rec)
        if lineage is None or not valid_idea_version(rec, lineage):
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
            "trade_score": safe_int(rec.get("trade_score"), safe_int(rec.get("conviction"), 0)),
            "trade_score_basis": rec.get("trade_score_basis") or "pre_edge_proxy_legacy",
            "trade_score_breakdown": rec.get("trade_score_breakdown") if isinstance(rec.get("trade_score_breakdown"), dict) else None,
            "trade_readiness": rec.get("trade_readiness") or "needs_data",
            "missing_checks": rec.get("missing_checks") if isinstance(rec.get("missing_checks"), list) else [],
            "learning": rec.get("learning") if isinstance(rec.get("learning"), dict) else None,
            "priced_in": rec.get("priced_in") or "unknown",
            "thesis_type": rec.get("thesis_type") or "company_specific",
            **lineage,
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
    ideas.sort(key=lambda i: (i["stale"], -i["trade_score"], -i["materiality_max"]))

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
  --selftest fixture-free unit tests of ideas-scorecard grading and Ideas lineage projection.
             Writes NOTHING. Exit 1 on any assertion failure.
  --help     show this help. Writes NOTHING.

Any other argument is rejected — this script mutates the board, so an accidental
flag (e.g. a typo'd --help) must never trigger a rebuild."""


def _selftest() -> int:
    """Fixture-free regressions for ideas scorecard grading and the static lineage projection."""
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
    # Codex: an override recorded BEFORE a later terminal re-review must not mask the kill (it was a
    # decision about the pre-kill thesis); one recorded AFTER it is an informed human call and still wins.
    KILL = {"routing": "watchlist_integrity_broken", "reviewed_at": "2026-07-22T05:00:00Z"}
    older = {"to_status": "full_machine", "from_status": "provisional", "moved_at": "2026-07-20T09:00:00Z"}
    newer = {"to_status": "full_machine", "from_status": "provisional", "moved_at": "2026-07-23T09:00:00Z"}
    check("override older than the kill does NOT supersede it",
          override_supersedes_review(older, KILL) is False)
    check("override newer than the kill DOES supersede it",
          override_supersedes_review(newer, KILL) is True)
    check("no override -> kill stands", override_supersedes_review(None, KILL) is False)
    check("override with no moved_at cannot outrank the kill",
          override_supersedes_review({"to_status": "full_machine"}, KILL) is False)
    # The two integrity kills are in PASS and NOT in CONFIRM.
    check("integrity kills are in MACHINE_PASS", TERMINAL_INTEGRITY <= MACHINE_PASS)
    check("integrity kills are NOT in MACHINE_CONFIRM", not (TERMINAL_INTEGRITY & MACHINE_CONFIRM))

    # Deploy compatibility is explicit: old snapshots have neither key and must not acquire a made-up
    # wire origin. Every new theme/mixed ref maps exact wire evidence, and its version binds that mapping.
    check("legacy idea omits both lineage keys", project_idea_lineage({}) == {})
    expected_lineage = {
        "origin_type": "mixed",
        "source_themes": [
            {
                "theme_id": "THM-a1b2c3d4",
                "theme_rev": 6,
                "evidence_event_ids": ["EVT-0123456789ab"],
            },
            {
                "theme_id": "THM-deadbeef",
                "theme_rev": 2,
                "evidence_event_ids": ["EVT-fedcba987654"],
            },
        ],
    }
    lineage_record = {
        **expected_lineage,
        "source_event_ids": ["EVT-0123456789ab", "EVT-fedcba987654"],
    }
    check("new lineage preserves revision and required evidence edges",
          project_idea_lineage(lineage_record) == expected_lineage)
    unmapped_theme_lineage = {
        "origin_type": "theme",
        "source_themes": [
            {"theme_id": "THM-a1b2c3d4", "theme_rev": 5},
            {"theme_id": "THM-deadbeef", "theme_rev": 1},
        ],
    }
    check("all-unmapped new theme refs fail closed",
          project_idea_lineage(unmapped_theme_lineage) is None)
    check("wire origin requires no source themes",
          project_idea_lineage({"origin_type": "wire", "source_themes": []})
          == {"origin_type": "wire", "source_themes": []})
    check("partial lineage fails closed", project_idea_lineage({"origin_type": "theme"}) is None)
    check("theme origin requires a theme ref",
          project_idea_lineage({"origin_type": "theme", "source_themes": []}) is None)
    check("wire origin rejects a theme ref",
          project_idea_lineage({"origin_type": "wire", "source_themes": expected_lineage["source_themes"]}) is None)
    check("duplicate theme ids fail closed",
          project_idea_lineage({
              "origin_type": "theme",
              "source_event_ids": ["EVT-0123456789ab"],
              "source_themes": [expected_lineage["source_themes"][0], expected_lineage["source_themes"][0]],
          }) is None)
    check("partly mapped theme refs fail closed",
          project_idea_lineage({
              "origin_type": "theme",
              "source_event_ids": ["EVT-0123456789ab"],
              "source_themes": [
                  {"theme_id": "THM-a1b2c3d4", "theme_rev": 1},
                  {
                      "theme_id": "THM-deadbeef", "theme_rev": 2,
                      "evidence_event_ids": ["EVT-0123456789ab"],
                  },
              ],
          }) is None)
    check("bad evidence edge fails closed",
          project_idea_lineage({
              "origin_type": "theme",
              "source_event_ids": ["EVT-0123456789ab"],
              "source_themes": [{
                  "theme_id": "THM-a1b2c3d4", "theme_rev": 1, "evidence_event_ids": ["EVT-not-an-id"],
              }],
          }) is None)

    def versioned(lineage_fields: dict, event_ids: list[str], *, ticker: str = "ACME",
                  direction: str = "long", pair_with: str | None = None) -> tuple[dict, dict]:
        rec = {
            "ticker": ticker,
            "direction": direction,
            "pair_with": pair_with,
            "thesis_type": "company_specific",
            "reason": "  Demand   lifts earnings ",
            "why_now": "Results are due this month",
            "source_event_ids": event_ids,
            **lineage_fields,
        }
        projected = project_idea_lineage(rec)
        if projected is None:
            return rec, {}
        rec["idea_version"] = idea_version_for_record(rec, projected)
        return rec, projected

    legacy_rec, legacy_projected = versioned({}, ["EVT-0123456789ab"])
    legacy_rec["idea_version"] = idea_version_for_record(legacy_rec, {}, bind_pair=False)
    check("distinguishable pre-lineage snapshot retains the pair-unbound recipe",
          legacy_projected == {} and valid_idea_version(legacy_rec, legacy_projected))
    wire_rec, wire_projected = versioned(
        {"origin_type": "wire", "source_themes": []}, ["EVT-0123456789ab"])
    check("new wire version binds its explicit origin",
          wire_projected == {"origin_type": "wire", "source_themes": []}
          and valid_idea_version(wire_rec, wire_projected)
          and wire_rec["idea_version"] != legacy_rec["idea_version"])
    mapped_rec, mapped_projected = versioned(expected_lineage, [
        "EVT-0123456789ab", "EVT-fedcba987654",
    ])
    check("new theme version binds id, revision, and evidence",
          valid_idea_version(mapped_rec, mapped_projected))

    old_hash_with_new_lineage = {
        **mapped_rec,
        "idea_version": idea_version_for_record(mapped_rec, {}, bind_pair=False),
    }
    check("pre-lineage hash cannot claim new lineage",
          not valid_idea_version(old_hash_with_new_lineage, mapped_projected))
    changed_rev = {
        **mapped_rec,
        "source_themes": [
            {**mapped_rec["source_themes"][0], "theme_rev": 7},
            mapped_rec["source_themes"][1],
        ],
    }
    changed_rev_projected = project_idea_lineage(changed_rev)
    check("unchanged version rejects a changed Theme revision",
          changed_rev_projected is not None
          and not valid_idea_version(changed_rev, changed_rev_projected))
    changed_evidence = {
        **mapped_rec,
        "source_themes": [
            {
                **mapped_rec["source_themes"][0],
                "evidence_event_ids": ["EVT-fedcba987654"],
            },
            mapped_rec["source_themes"][1],
        ],
    }
    changed_evidence_projected = project_idea_lineage(changed_evidence)
    check("unchanged version rejects changed Theme evidence",
          changed_evidence_projected is not None
          and not valid_idea_version(changed_evidence, changed_evidence_projected))

    pair_rec, pair_projected = versioned(
        {"origin_type": "wire", "source_themes": []}, ["EVT-0123456789ab"],
        ticker="AMD", direction="pair", pair_with="INTC")
    pair_nvda = {**pair_rec, "pair_with": "NVDA"}
    pair_nvda_version = idea_version_for_record(pair_nvda, pair_projected)
    check("AMD paired with INTC has a different IDEAV from AMD paired with NVDA",
          pair_rec["idea_version"] != pair_nvda_version)
    pair_class_dash = {**pair_rec, "pair_with": "BRK-B"}
    pair_class_dot = {**pair_rec, "pair_with": "BRK.B"}
    check("pair version normalizes share-class separators",
          idea_version_for_record(pair_class_dash, pair_projected)
          == idea_version_for_record(pair_class_dot, pair_projected))
    pair_old = {**pair_rec, "idea_version": idea_version_for_record(pair_rec, {}, bind_pair=False)}
    check("explicit new wire lineage rejects the old pair-unbound hash",
          not valid_idea_version(pair_old, pair_projected))
    global_pair_rec, global_pair_projected = versioned(
        {"origin_type": "wire", "source_themes": []}, ["EVT-0123456789ab"],
        ticker="M&M.NS", direction="pair", pair_with="ABCDEFGHIJKLMNO")
    check("global ampersand and 15-character ticker contracts survive board projection",
          valid_idea_version(global_pair_rec, global_pair_projected))
    parity_rec = {
        "ticker": "AMD", "direction": "pair", "pair_with": "INTC",
        "thesis_type": "company_specific", "reason": "  Demand   shifts share ",
        "why_now": "Results due now", "source_event_ids": ["EVT-0123456789ab"],
        "origin_type": "wire", "source_themes": [],
    }
    check("Python matches the TypeScript canonical pair-version vector",
          idea_version_for_record(parity_rec, project_idea_lineage(parity_rec) or {})
          == "IDEAV-02ebcb0b4c9452ba")
    check("evidence edge outside the idea's source events fails closed",
          project_idea_lineage({
              "origin_type": "theme",
              "source_event_ids": ["EVT-0123456789ab"],
              "source_themes": [{
                  "theme_id": "THM-a1b2c3d4", "theme_rev": 1,
                  "evidence_event_ids": ["EVT-fedcba987654"],
              }],
          }) is None)

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
