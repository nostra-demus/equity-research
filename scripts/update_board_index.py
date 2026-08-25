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
import stat
import sys
from datetime import datetime, timezone
from pathlib import Path

from canonical_json import canonical_sha256
from recover_idea_board_history import (
    ARCHIVE_FILE_RE as IDEA_ARCHIVE_FILE_RE,
    IDEA_ARCHIVE_MAX_DIRECTORY_ENTRIES_READ,
    IDEA_ARCHIVE_MAX_FILES_READ,
    RECOVERY_SCHEMA as IDEA_BOARD_RECOVERY_SCHEMA,
    bounded_managed_archive_names,
    occurrence_filename,
    occurrence_filename_key,
    occurrence_filename_parts,
    validate_recovery_record,
)

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
IDEAS_ARCHIVE = os.path.join(LEDGER, "ideas_archive")
IDEAS_ARCHIVE_RETENTION = os.path.join(IDEAS_ARCHIVE, "retention.json")
IDEAS_BOARD_HISTORY_RECOVERY_MANIFEST = os.path.join(
    IDEAS_ARCHIVE, "board-history-recovery-manifest.json",
)
IDEAS_ARCHIVE_MAX_PER_SIDE = 250
IDEAS_BOARD_HISTORY_RECOVERY_MANIFEST_MAX_BYTES = 1_000_000
IDEAS_BOARD_HISTORY_RECOVERY_MAX_OCCURRENCES = IDEAS_ARCHIVE_MAX_PER_SIDE * 2 + 100
IDEAS_BOARD_HISTORY_RECOVERY_SCHEMA = "idea-board-recovery-manifest/v1"
IDEAS_BOARD_HISTORY_RECOVERY_SOURCE = "screener/board/index.json"
IDEAS_BOARD_HISTORY_RECOVERY_DECISIONS = {"imported", "skipped", "suppressed", "active"}
IDEA_ARCHIVE_RETENTION_SCHEMA = "idea-archive-retention/v1"
IDEA_ARCHIVE_RETENTION_REQUIRED = os.path.join(IDEAS_ARCHIVE, ".retention-required")
IDEA_ARCHIVE_SCHEMA = "idea-archive/v1"
IDEA_ARCHIVE_SUPPRESSION_SCHEMA = "idea-archive-suppression/v1"
IDEA_ID_RE = re.compile(r"^IDEA-[a-f0-9]{12}$")
IDEA_VERSION_RE = re.compile(r"^IDEAV-[a-f0-9]{16}$")

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
IDEA_VERSION_SCHEMA = "surfaced-idea-version/v2"


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
    origin_type = rec["origin_type"]

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
        if "why_now_event_id" in raw_theme:
            why_now_event_id = raw_theme.get("why_now_event_id")
            if (not isinstance(why_now_event_id, str)
                    or not IDEA_EVENT_ID_RE.fullmatch(why_now_event_id)
                    or why_now_event_id not in source_event_ids
                    or why_now_event_id not in event_ids):
                return None
            theme_ref["why_now_event_id"] = why_now_event_id
        if "primary_source_event_id" in rec and origin_type != "wire":
            why_now_event_id = theme_ref.get("why_now_event_id")
            if (not isinstance(why_now_event_id, str) or len(event_ids) < 2
                    or not any(event_id != why_now_event_id for event_id in event_ids)):
                return None
        source_themes.append(theme_ref)

    if (origin_type == "wire") != (len(source_themes) == 0):
        return None
    if "primary_source_event_id" in rec and origin_type != "wire":
        if any("why_now_event_id" not in theme for theme in source_themes):
            return None
    elif "primary_source_event_id" not in rec and origin_type != "wire":
        # No exact launch source means historical Theme ancestry cannot be independently audited.
        return None
    return {"origin_type": origin_type, "source_themes": source_themes}


def _event_id_for(headline: str, url: str) -> str:
    normalized = f"{' '.join(headline.lower().split())}|{url}"
    return "EVT-" + hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:12]


def primary_source_for_record(rec: dict) -> dict | None:
    event_id = rec.get("primary_source_event_id")
    headline = rec.get("source_headline")
    url = rec.get("source_url")
    name = rec.get("source_name")
    source_event_ids = rec.get("source_event_ids")
    if (not isinstance(event_id, str) or not IDEA_EVENT_ID_RE.fullmatch(event_id)
            or not isinstance(headline, str) or not headline or headline != headline.strip()
            or not isinstance(url, str) or not url or url != url.strip()
            or not isinstance(name, str) or not name or name != name.strip()
            or not isinstance(source_event_ids, list) or event_id not in source_event_ids
            or _event_id_for(headline, url) != event_id):
        return None
    return {"event_id": event_id, "headline": headline, "url": url, "name": name}


def _legacy_idea_version_for_record(rec: dict, lineage: dict, *, bind_pair: bool) -> str | None:
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
            why_now = (f"{{why:{theme['why_now_event_id']}}}"
                       if theme.get("why_now_event_id") else "")
            refs.append(f"{theme['theme_id']}@{theme['theme_rev']}[{evidence}]{why_now}")
        canonical.extend([lineage["origin_type"], ";".join(sorted(refs))])
    digest = hashlib.sha256("|".join(canonical).encode("utf-8")).hexdigest()[:16]
    return f"IDEAV-{digest}"


def idea_version_for_record(rec: dict, lineage: dict) -> str | None:
    """Hash the exact TypeScript v2 canonical structured payload for a board candidate."""
    ticker = rec.get("ticker")
    direction = rec.get("direction")
    # v2 deliberately binds `pair_with` for every direction: a pair carries its verified second symbol;
    # long/short carry an explicit null. Field absence is a legacy shape and must not hash as v2.
    if "pair_with" not in rec:
        return None
    pair_with = rec.get("pair_with")
    thesis_type = rec.get("thesis_type")
    reason = rec.get("reason")
    why_now = rec.get("why_now")
    event_ids = rec.get("source_event_ids")
    primary = primary_source_for_record(rec)
    if (not all(isinstance(value, str) for value in (ticker, direction, thesis_type, reason, why_now))
            or not valid_idea_ticker(ticker)
            or not isinstance(event_ids, list) or not event_ids or len(event_ids) > 64
            or any(not isinstance(event_id, str) or not IDEA_EVENT_ID_RE.fullmatch(event_id)
                   for event_id in event_ids)
            or len(set(event_ids)) != len(event_ids)
            or primary is None or not lineage):
        return None
    if direction == "pair":
        if not valid_idea_ticker(pair_with):
            return None
    elif pair_with is not None:
        return None
    source_themes = [{
        "theme_id": theme["theme_id"],
        "theme_rev": theme["theme_rev"],
        "evidence_event_ids": sorted(set(theme["evidence_event_ids"])),
        "why_now_event_id": theme.get("why_now_event_id"),
    } for theme in lineage["source_themes"]]
    source_themes.sort(key=lambda theme: (theme["theme_id"], theme["theme_rev"]))
    payload = {
        "schema_version": IDEA_VERSION_SCHEMA,
        "thesis": {
            "ticker": ticker.upper(),
            "direction": direction,
            "pair_with": None if pair_with is None else pair_with.strip().upper().replace("-", "."),
            "thesis_type": thesis_type,
            "reason": " ".join(reason.strip().lower().split()),
            "why_now": " ".join(why_now.strip().lower().split()),
        },
        "sources": {
            "event_ids": sorted(set(event_ids)),
            "origin_type": lineage["origin_type"],
            "source_themes": source_themes,
            "primary": primary,
        },
    }
    return "IDEAV-" + canonical_sha256(payload)[:16]


def valid_idea_version(rec: dict, lineage: dict) -> bool:
    if "primary_source_event_id" in rec:
        expected = idea_version_for_record(rec, lineage)
        return expected is not None and rec.get("idea_version") == expected
    # Conservatively preserve only old wire snapshots. Theme-derived records without a bound launch event
    # were rejected above; field-absent pre-lineage uses the original pair-unbound migration recipe.
    legacy = _legacy_idea_version_for_record(rec, lineage, bind_pair=bool(lineage))
    return legacy is not None and rec.get("idea_version") == legacy


def parse_rfc3339(value: object) -> datetime | None:
    """Strict timezone-aware clock parser. Invalid shelf-life data fails closed at projection."""
    if not isinstance(value, str) or not value or value != value.strip():
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo is not None else None


def idea_occurrence_key(rec: dict) -> tuple[str, str, str] | None:
    idea_id, version, started = (rec.get("idea_id"), rec.get("idea_version"),
                                 rec.get("idea_version_started_at"))
    if (not isinstance(idea_id, str) or IDEA_ID_RE.fullmatch(idea_id) is None
            or not isinstance(version, str) or IDEA_VERSION_RE.fullmatch(version) is None
            or parse_rfc3339(started) is None):
        return None
    return idea_id, version, started


def project_board_idea(rec: dict, idea_fb: dict[str, str], now: str,
                       *, validate_version: bool = True) -> dict | None:
    """Project one strict/live snapshot (or an already validated historical board row)."""
    if (not isinstance(rec, dict) or idea_occurrence_key(rec) is None
            or not rec.get("ticker") or rec.get("direction") not in ("long", "short", "pair")
            or parse_rfc3339(rec.get("decay_at")) is None or parse_rfc3339(now) is None):
        return None
    lineage = project_idea_lineage(rec)
    if lineage is None or (validate_version and not valid_idea_version(rec, lineage)):
        return None
    pair_with = rec.get("pair_with")
    if rec.get("direction") == "pair":
        if not valid_idea_ticker(pair_with):
            return None
    elif pair_with is not None:
        return None
    decay_at = rec["decay_at"]
    pc = rec.get("prior_coverage") if isinstance(rec.get("prior_coverage"), dict) else None
    fb = idea_fb.get(rec.get("idea_id"))
    fb = fb if fb in ("up", "down") else None
    status = rec.get("status") or "live"
    if status not in ("live", "promoted"):
        return None
    trade_basis = rec.get("trade_score_basis") or "pre_edge_proxy_legacy"
    trade_score = safe_int(rec.get("trade_score"), safe_int(rec.get("conviction"), 0))
    trade_readiness = rec.get("trade_readiness") or "needs_data"
    missing_checks = rec.get("missing_checks") if isinstance(rec.get("missing_checks"), list) else []
    # Exact twin of the live projection's evidence_gate_v1 safety demotion. V1 did not bind verified
    # live market inputs, so a cached 62 can never survive as current research readiness.
    if trade_basis == "evidence_gate_v1":
        trade_score = min(trade_score, 44)
        trade_readiness = "watch_only"
        missing_checks = list(dict.fromkeys([
            "live price, liquidity, and consensus",
            *missing_checks,
        ]))
    return {
        "idea_id": rec["idea_id"],
        "idea_version": rec["idea_version"],
        "idea_version_started_at": rec["idea_version_started_at"],
        "ticker": rec.get("ticker") or "",
        "company": rec.get("company"),
        "exchange": rec.get("exchange"),
        "direction": rec.get("direction"),
        "pair_with": pair_with,
        "reason": rec.get("reason") or "",
        "why_now": rec.get("why_now") or "",
        "conviction": safe_int(rec.get("conviction"), 0),
        "conviction_basis": rec.get("conviction_basis") or "pre_edge_proxy",
        "trade_score": trade_score,
        "trade_score_basis": trade_basis,
        "trade_score_breakdown": (rec.get("trade_score_breakdown")
                                  if isinstance(rec.get("trade_score_breakdown"), dict) else None),
        "trade_readiness": trade_readiness,
        "missing_checks": missing_checks,
        "learning": rec.get("learning") if isinstance(rec.get("learning"), dict) else None,
        "priced_in": rec.get("priced_in") or "unknown",
        "thesis_type": rec.get("thesis_type") or "company_specific",
        **lineage,
        "source_event_ids": rec.get("source_event_ids") if isinstance(rec.get("source_event_ids"), list) else [],
        "primary_source_event_id": rec.get("primary_source_event_id"),
        "source_headlines": rec.get("source_headlines") if isinstance(rec.get("source_headlines"), list) else [],
        "source_headline": rec.get("source_headline"),
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
        "stale": parse_rfc3339(decay_at) <= parse_rfc3339(now),
    }


def archive_sides(row: dict) -> tuple[str, ...]:
    if row.get("direction") == "long":
        return ("long",)
    if row.get("direction") == "short":
        return ("short",)
    return ("long", "short") if valid_idea_ticker(row.get("pair_with")) else ()


def idea_sort_key(row: dict) -> tuple:
    updated = parse_rfc3339(row.get("updated_at"))
    return (bool(row.get("stale")), -safe_int(row.get("trade_score")),
            -safe_int(row.get("materiality_max")),
            -updated.timestamp() if updated is not None else 0,
            row.get("idea_id") or "")


def idea_blocked_by_withdrawal(rec: dict, archive_dir: str = IDEAS_ARCHIVE) -> bool:
    """A tombstone wins before unlink, and malformed exact tombstone bytes fail closed.

    The filename is already bound to the exact three-part occurrence and side. If that exact withdrawn
    path exists, the static board must not resurrect the raw live snapshot even when the tombstone body
    is corrupt; archive health separately exposes the invalid/corrupt store.
    """
    key = idea_occurrence_key(rec)
    if key is None or rec.get("direction") not in ("long", "short", "pair"):
        return False
    full_key = (*key, rec["direction"])
    path = os.path.join(archive_dir, occurrence_filename(full_key, "withdrawn"))
    try:
        os.lstat(path)
        return True
    except FileNotFoundError:
        return False
    except OSError:
        # An exact path that cannot be resolved must never be interpreted as proof of absence.
        return True


def filename_blocks_row(parts: tuple[str, str, str, str, str], rec: dict) -> bool:
    key = idea_occurrence_key(rec)
    return (key is not None and parts[4] == "withdrawn"
            and (key[0], key[1], rec.get("direction")) == (parts[0], parts[1], parts[3])
            and hashlib.sha256(key[2].encode("utf-8")).hexdigest() == parts[2])


def recovery_current_shadowed(rec: dict, recovery_reason: str, expired_now: bool,
                              current_ids: set[str],
                              lifecycle_barriers: dict[str, list[str | None]] | None = None) -> bool:
    """A refreshed canonical stable ID owns the current lane; older occurrences remain audit history."""
    if recovery_reason != "latest_board_current" or expired_now:
        return False
    idea_id = rec.get("idea_id")
    if idea_id in current_ids:
        return True
    started = parse_rfc3339(rec.get("idea_version_started_at"))
    if started is None:
        return True
    for barrier in (lifecycle_barriers or {}).get(idea_id, []):
        barrier_at = parse_rfc3339(barrier)
        # A malformed withdrawal supplies a stable-ID terminal barrier without a trusted epoch.
        if barrier is None or (barrier_at is not None and barrier_at > started):
            return True
    return False


def recovery_projection_lane(recovery_reason: str, expired_now: bool,
                             shadowed_current: bool) -> str:
    if recovery_reason == "latest_board_current" and not expired_now:
        return "hidden" if shadowed_current else "current"
    return "archive"


def empty_archive_retention() -> dict:
    return {
        "truncated": False, "evicted_count": 0, "oldest_retained_at": None,
        "side_counts": {
            "long": {"evicted_count": 0, "oldest_retained_at": None},
            "short": {"evicted_count": 0, "oldest_retained_at": None},
        },
    }


def valid_archive_retention_value(value: object) -> bool:
    return (isinstance(value, dict) and value.get("schema_version") == IDEA_ARCHIVE_RETENTION_SCHEMA
            and isinstance(value.get("evicted_count"), int) and value["evicted_count"] >= 0
            and isinstance(value.get("side_counts"), dict)
            and all(isinstance(value["side_counts"].get(side), dict)
                    and isinstance(value["side_counts"][side].get("evicted_count"), int)
                    and value["side_counts"][side]["evicted_count"] >= 0
                    for side in ("long", "short"))
            and isinstance(value.get("pending_evictions"), list)
            and len(value["pending_evictions"]) <= IDEA_ARCHIVE_MAX_FILES_READ
            and all(isinstance(name, str)
                    and (parts := occurrence_filename_parts(name)) is not None
                    and parts[4] != "withdrawn"
                    for name in value["pending_evictions"]))


def read_archive_retention() -> dict:
    value = read_json(IDEAS_ARCHIVE_RETENTION)
    if not valid_archive_retention_value(value):
        return empty_archive_retention()
    side_counts = value["side_counts"]
    return {
        "truncated": value["evicted_count"] > 0,
        "evicted_count": value["evicted_count"],
        "oldest_retained_at": None,
        "side_counts": {
            side: {"evicted_count": side_counts[side]["evicted_count"], "oldest_retained_at": None}
            for side in ("long", "short")
        },
    }


def archive_retention_invalid(managed_files_present: bool = False) -> bool:
    value = read_json(IDEAS_ARCHIVE_RETENTION)
    if value is None:
        return managed_files_present or os.path.exists(IDEA_ARCHIVE_RETENTION_REQUIRED)
    return not valid_archive_retention_value(value)


def names_after_pending_evictions(names: list[str], retention: object) -> tuple[list[str], set[str]]:
    pending = set(retention["pending_evictions"]) if valid_archive_retention_value(retention) else set()
    return [name for name in names if name not in pending], pending


def read_unconfirmed_history_counts(path: str | None = None) -> dict[str, int] | None:
    """Count history rows that were seen but could not be proved expired.

    Missing, oversized, symlinked, or malformed manifests return ``None``.  That distinction is
    deliberate: callers may omit the optional field, but must never turn unknown history into zero.
    """
    manifest_path = path or IDEAS_BOARD_HISTORY_RECOVERY_MANIFEST
    try:
        file_stat = os.lstat(manifest_path)
        if (not stat.S_ISREG(file_stat.st_mode) or file_stat.st_size <= 0
                or file_stat.st_size > IDEAS_BOARD_HISTORY_RECOVERY_MANIFEST_MAX_BYTES):
            return None
        with open(manifest_path, encoding="utf-8") as handle:
            value = json.load(handle)
    except (OSError, UnicodeError, json.JSONDecodeError):
        return None
    if (not isinstance(value, dict)
            or value.get("schema_version") != IDEAS_BOARD_HISTORY_RECOVERY_SCHEMA
            or value.get("source_path") != IDEAS_BOARD_HISTORY_RECOVERY_SOURCE
            or not isinstance(value.get("occurrences"), list)
            or len(value["occurrences"]) > IDEAS_BOARD_HISTORY_RECOVERY_MAX_OCCURRENCES):
        return None
    counts = {"long": 0, "short": 0}
    seen: set[tuple[str, str, str, str]] = set()
    for occurrence in value["occurrences"]:
        occurrence_base = (idea_occurrence_key(occurrence)
                           if isinstance(occurrence, dict) else None)
        occurrence_identity = ((*occurrence_base, occurrence.get("direction"))
                               if occurrence_base is not None else None)
        if (not isinstance(occurrence, dict) or occurrence_identity is None
                or occurrence.get("direction") not in ("long", "short", "pair")
                or occurrence.get("decision") not in IDEAS_BOARD_HISTORY_RECOVERY_DECISIONS
                or not isinstance(occurrence.get("reason"), str)
                or occurrence_identity in seen):
            return None
        seen.add(occurrence_identity)
        if (occurrence["decision"] != "skipped"
                or occurrence["reason"] != "no_committed_expiry_evidence"):
            continue
        if occurrence["direction"] in ("long", "pair"):
            counts["long"] += 1
        if occurrence["direction"] in ("short", "pair"):
            counts["short"] += 1
    return counts


def build_ideas_archive(ideas: list[dict], idea_fb: dict[str, str], now: str) -> tuple[dict, list[dict], set[tuple[str, str, str]]]:
    """Static twin of the API archive projection, including read-only board recovery rows."""
    rows: list[dict] = []
    unconfirmed_counts = read_unconfirmed_history_counts()
    recovered_current: list[dict] = []
    current_keys = {idea_occurrence_key(row) for row in ideas}
    current_ids = {row.get("idea_id") for row in ideas if isinstance(row.get("idea_id"), str)}
    for idea in ideas:
        if idea.get("status") == "live" and idea.get("stale"):
            rows.append({**idea, "status": "expired", "promoted_signal_id": None, "stale": True,
                         "archived_at": idea["decay_at"], "archive_reason": "expired",
                         "audit_only": True})

    health = {"status": "missing", "file_count": 0, "suppression_count": 0,
              "corrupt_count": 0, "invalid_count": 0, "error": None}
    try:
        names, archive_overflow, archive_missing = bounded_managed_archive_names(
            Path(IDEAS_ARCHIVE), IDEA_ARCHIVE_MAX_FILES_READ,
            IDEA_ARCHIVE_MAX_DIRECTORY_ENTRIES_READ,
        )
        health["status"] = "missing" if archive_missing else "ok"
        health["file_count"] = len(names)
    except FileNotFoundError:
        names = []
        archive_overflow = False
    except OSError:
        names = []
        archive_overflow = False
        health.update(status="unreadable", error="archive_store_unreadable")

    # Stop after the first over-bound managed sibling.  Reading even one evidence row would be unsafe:
    # a later, unseen sibling may be the withdrawal tombstone for that exact occurrence.  Canonical
    # current snapshots remain independently protected by their directly-addressed tombstone lstat.
    if archive_overflow:
        health.update(status="degraded", invalid_count=1, error="archive_store_overflow")
        retention = read_archive_retention()
        empty_counts = {side: {"total_count": 0, "shown_count": 0, "hidden_count": 0}
                        for side in ("long", "short")}
        return {
            "schema_version": "ideas-archive/v1", "health": health,
            "total_count": 0, "shown_count": 0, "hidden_count": 0,
            "side_counts": empty_counts,
            **({"unconfirmed_counts": unconfirmed_counts} if unconfirmed_counts is not None else {}),
            "retention": retention, "rows": [],
        }, [], set()

    retention_value = read_json(IDEAS_ARCHIVE_RETENTION)
    valid_retention = not archive_retention_invalid(bool(names))
    process_names, pending_evictions = names_after_pending_evictions(names, retention_value)
    if not valid_retention:
        process_names, pending_evictions = names, set()
    health["invalid_count"] += len(pending_evictions)

    archive_values = {name: read_json(os.path.join(IDEAS_ARCHIVE, name)) for name in process_names}
    suppressed_keys: set[tuple[str, str, str]] = set()
    # Withdrawal filenames are terminal evidence even if damaged retention metadata lists one as
    # pending. The writer never intentionally evicts a tombstone; hiding it from parsing must not
    # resurrect the raw/imported/expired occurrence it suppresses.
    withdrawal_parts = [parts for name in names
                        if (parts := occurrence_filename_parts(name)) is not None and parts[4] == "withdrawn"]
    withdrawal_barriers: dict[str, tuple[str, str | None]] = {
        name: (parts[0], None) for name in names
        if (parts := occurrence_filename_parts(name)) is not None and parts[4] == "withdrawn"
    }
    # Derive the block from the managed filename before parsing bytes. A crash/corruption in the exact
    # tombstone body can degrade health, but must never resurrect its raw/imported/expired occurrence.
    for idea in ideas:
        if any(filename_blocks_row(parts, idea) for parts in withdrawal_parts):
            key = idea_occurrence_key(idea)
            if key is not None:
                suppressed_keys.add(key)
    for name in process_names:
        value = archive_values[name]
        if not isinstance(value, dict):
            health["corrupt_count"] += 1
            continue
        schema = value.get("schema_version")
        if schema == IDEA_ARCHIVE_SUPPRESSION_SCHEMA:
            expected = occurrence_filename_key(name, value, "withdrawn")
            if (expected is None or value.get("suppression_reason") != "withdrawn_unadmitted"
                    or parse_rfc3339(value.get("suppressed_at")) is None):
                health["invalid_count"] += 1
            else:
                health["suppression_count"] += 1
                suppressed_keys.add(expected[:3])
                withdrawal_barriers[name] = (expected[0], expected[2])
            continue
    lifecycle_barriers: dict[str, list[str | None]] = {}
    for idea_id, started in withdrawal_barriers.values():
        lifecycle_barriers.setdefault(idea_id, []).append(started)
    pending_recoveries: list[tuple[dict, dict]] = []
    for name in process_names:
        value = archive_values[name]
        if not isinstance(value, dict) or value.get("schema_version") == IDEA_ARCHIVE_SUPPRESSION_SCHEMA:
            continue
        schema = value.get("schema_version")
        if schema == IDEA_ARCHIVE_SCHEMA:
            snapshot = value.get("snapshot")
            projected = (project_board_idea(snapshot, idea_fb, now)
                         if isinstance(snapshot, dict) else None)
            expected = (occurrence_filename_key(name, snapshot, "expired")
                        if isinstance(snapshot, dict) else None)
            if (projected is None or expected is None or value.get("archive_reason") != "expired_pruned"
                    or parse_rfc3339(value.get("archived_at")) is None
                    or projected.get("status") != "live" or projected.get("promoted_signal_id") is not None
                    or parse_rfc3339(projected["decay_at"]) > parse_rfc3339(value["archived_at"])):
                health["invalid_count"] += 1
                continue
            lifecycle_barriers.setdefault(projected["idea_id"], []).append(
                projected["idea_version_started_at"])
            if (idea_occurrence_key(projected) in current_keys
                    or idea_occurrence_key(projected) in suppressed_keys
                    or any(filename_blocks_row(parts, projected) for parts in withdrawal_parts)):
                continue
            rows.append({**projected, "status": "expired", "promoted_signal_id": None, "stale": True,
                         "archived_at": value["archived_at"], "archive_reason": "expired_pruned",
                         "audit_only": True})
            continue
        if schema == IDEA_BOARD_RECOVERY_SCHEMA:
            if not validate_recovery_record(value, name):
                health["invalid_count"] += 1
                continue
            board_row = value["board_row"]
            projected = project_board_idea(board_row, idea_fb, now, validate_version=False)
            if projected is None:
                health["invalid_count"] += 1
                continue
            if (idea_occurrence_key(projected) in current_keys
                    or idea_occurrence_key(projected) in suppressed_keys
                    or any(filename_blocks_row(parts, projected) for parts in withdrawal_parts)):
                continue
            pending_recoveries.append((projected, value))
            continue
        if schema not in (IDEA_ARCHIVE_SCHEMA, IDEA_BOARD_RECOVERY_SCHEMA):
            health["invalid_count"] += 1

    # Resolve latest-board current imports only after every strict/tombstone lifecycle barrier has
    # been inspected; filename ordering must never decide whether an older occurrence resurfaces.
    for projected, value in pending_recoveries:
        expired_now = parse_rfc3339(projected["decay_at"]) <= parse_rfc3339(now)
        shadowed_current = recovery_current_shadowed(
            projected, value["recovery_reason"], expired_now, current_ids,
            lifecycle_barriers,
        )
        recovery_lane = recovery_projection_lane(
            value["recovery_reason"], expired_now, shadowed_current,
        )
        if recovery_lane == "current":
            # A canonical refresh owns the stable ID's live lane. Keep the older recovery bytes,
            # but do not mislabel a still-within-shelf-life occurrence as expired audit history.
            recovered_current.append({**projected, "status": "live", "stale": False,
                                      "recovery_only": True, "promotion_available": False})
        elif recovery_lane == "archive":
            rows.append({**projected, "status": "expired", "promoted_signal_id": None,
                         "stale": True, "archived_at": value["recovered_at"],
                         "archive_reason": value["recovery_reason"], "audit_only": True,
                         "recovery_only": True, "promotion_available": False})

    retained_lifecycle: dict[tuple[str, str, str], tuple[str, tuple[str, ...]]] = {}
    for name in process_names:
        value = archive_values[name]
        if (isinstance(value, dict) and value.get("schema_version") == IDEA_BOARD_RECOVERY_SCHEMA
                and validate_recovery_record(value, name)):
            key = idea_occurrence_key(value["board_row"])
            if (key is not None and key not in suppressed_keys
                    and not any(filename_blocks_row(parts, value["board_row"])
                                for parts in withdrawal_parts)):
                retained_lifecycle[key] = (value["board_row"]["decay_at"],
                                           archive_sides(value["board_row"]))
        elif isinstance(value, dict) and value.get("schema_version") == IDEA_ARCHIVE_SCHEMA:
            snapshot = value.get("snapshot")
            key = idea_occurrence_key(snapshot) if isinstance(snapshot, dict) else None
            if (key is not None and key not in suppressed_keys
                    and parse_rfc3339(snapshot.get("decay_at")) is not None
                    and not any(filename_blocks_row(parts, snapshot) for parts in withdrawal_parts)):
                retained_lifecycle[key] = (snapshot["decay_at"], archive_sides(snapshot))

    rows = [row for row in rows if idea_occurrence_key(row) not in suppressed_keys
            and not any(filename_blocks_row(parts, row) for parts in withdrawal_parts)]
    recovered_current = [row for row in recovered_current if idea_occurrence_key(row) not in suppressed_keys
                         and not any(filename_blocks_row(parts, row) for parts in withdrawal_parts)]

    if health["status"] == "ok" and (health["corrupt_count"] or health["invalid_count"]):
        health["status"] = "degraded"
    if health["status"] == "ok" and not valid_retention:
        health["status"] = "degraded"
        health["invalid_count"] += 1
    # Exact-occurrence de-duplication. A repeated thesis hash with a new epoch remains a distinct audit row.
    deduped: dict[tuple[str, str, str], dict] = {}
    for row in rows:
        key = idea_occurrence_key(row)
        if key is not None and key not in deduped:
            deduped[key] = row
    rows = list(deduped.values())
    rows.sort(key=lambda row: (tuple(-ord(char) for char in (row.get("decay_at") or "")),
                               tuple(-ord(char) for char in (row.get("archived_at") or "")),
                               -safe_int(row.get("trade_score")), row.get("idea_id") or ""))
    shown_keys: set[tuple[str, str, str]] = set()
    shown_by_side = {"long": 0, "short": 0}
    for row in rows:
        sides = archive_sides(row)
        if not sides or any(shown_by_side[side] >= IDEAS_ARCHIVE_MAX_PER_SIDE for side in sides):
            continue
        key = idea_occurrence_key(row)
        if key is None:
            continue
        shown_keys.add(key)
        for side in sides:
            shown_by_side[side] += 1
    shown_rows = [row for row in rows if idea_occurrence_key(row) in shown_keys]
    side_counts = {}
    for side in ("long", "short"):
        eligible = [row for row in rows if side in archive_sides(row)]
        shown = [row for row in eligible if idea_occurrence_key(row) in shown_keys]
        side_counts[side] = {"total_count": len(eligible), "shown_count": len(shown),
                             "hidden_count": len(eligible) - len(shown)}
    retention = read_archive_retention()
    for side in ("long", "short"):
        retention["side_counts"][side]["oldest_retained_at"] = min(
            (decay for decay, sides in retained_lifecycle.values() if side in sides), default=None)
    retention["oldest_retained_at"] = min(
        (decay for decay, _sides in retained_lifecycle.values()), default=None)
    wrapper = {
        "schema_version": "ideas-archive/v1", "health": health,
        "total_count": len(rows), "shown_count": len(shown_rows),
        "hidden_count": len(rows) - len(shown_rows), "side_counts": side_counts,
        **({"unconfirmed_counts": unconfirmed_counts} if unconfirmed_counts is not None else {}),
        "retention": retention, "rows": shown_rows,
    }
    recovered_current.sort(key=lambda row: (-safe_int(row.get("trade_score")),
                                             -safe_int(row.get("materiality_max"))))
    return wrapper, recovered_current, set(deduped)


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
    def firehose_key(fp: str) -> tuple[str, int]:
        match = re.match(r"^(\d{4}-\d{2}-\d{2})_firehose(?:\.(\d{6}))?\.ndjson$", os.path.basename(fp))
        return (match.group(1), int(match.group(2) or 0)) if match else ("", -1)

    files = sorted(
        (fp for fp in glob.glob(os.path.join(INBOX, "*_firehose*.ndjson")) if firehose_key(fp)[1] >= 0),
        key=firehose_key,
        reverse=True,
    )[:max_files]
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

    The ingester logs one compact `cycle_summary` line per run to the date's firehose shards (per-item
    `kind:"item"` lines are filtered out here); dropped items are counted but never written to the
    inbox. NOTE: seen can exceed picked + dropped — a cycle that hits the daily Groq budget or a
    transient Groq failure defers the unscored tail to the next cycle.
    """
    seen = picked = dropped = 0
    files = [os.path.join(INBOX, f"{today}_firehose.ndjson")]
    files.extend(sorted(glob.glob(os.path.join(INBOX, f"{today}_firehose.[0-9]*.ndjson"))))
    for fp in files:
        for o in read_ndjson(fp):
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
        if isinstance(rec, dict) and idea_blocked_by_withdrawal(rec):
            continue
        projected = project_board_idea(rec, idea_fb, now) if isinstance(rec, dict) else None
        if projected is None:
            continue
        ideas.append(projected)
        fb = projected["feedback"]
        stale = projected["stale"]
        status = projected["status"]
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
    ideas.sort(key=idea_sort_key)
    ideas_archive, recovered_current, archive_occurrences = build_ideas_archive(ideas, idea_fb, now)
    ideas.extend(recovered_current)
    ideas.sort(key=idea_sort_key)
    current_occurrences = {idea_occurrence_key(idea) for idea in ideas}
    sc["live_count"] = sum(not idea["stale"] for idea in ideas)
    sc["surfaced_total"] = (len({key for key in current_occurrences | archive_occurrences if key is not None})
                             + ideas_archive["health"]["suppression_count"]
                             + ideas_archive["retention"]["evicted_count"])

    return {
        "generated_at": now,
        "inbox": inbox_rows,
        "signals": signals,
        "theses": theses,
        "handoffs": handoff_rows,
        "ideas": ideas,
        "ideas_archive": ideas_archive,
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


def write_board_index(idx: dict, board_path: str = BOARD) -> None:
    """Crash-durably publish the generated board without exposing partial JSON to readers."""
    directory = os.path.dirname(board_path)
    os.makedirs(directory, exist_ok=True)
    # Per-process temp file: concurrent rebuilds (a sweep + a handoff each refresh the board) must
    # never interleave writes into one shared temp. Last durable rename wins from canonical stores.
    tmp = f"{board_path}.tmp.{os.getpid()}"
    try:
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(idx, f, indent=2, ensure_ascii=False)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, board_path)
        # Directory fsync is POSIX-only durability: Windows has no directory file descriptors, and
        # os.open() on a directory there raises PermissionError. Skip it rather than crash the publish.
        if os.name != "nt":
            directory_fd = os.open(directory, os.O_RDONLY)
            try:
                os.fsync(directory_fd)
            finally:
                os.close(directory_fd)
    finally:
        try:
            os.unlink(tmp)
        except FileNotFoundError:
            pass


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

    # Ideas v2: exact primary source, revision lineage, and canonical structured JSON all travel together.
    check("legacy idea omits both lineage keys", project_idea_lineage({}) == {})
    headline = "Acme files a material capacity update"
    url = "https://exchange.test/acme-capacity"
    why_event = _event_id_for(headline, url)
    proof_headline = "Acme filing proves the listed issuer exposure"
    proof_url = "https://filings.test/acme-proof"
    proof_event = _event_id_for(proof_headline, proof_url)

    def versioned(origin: str, themes: list[dict], *, ticker: str = "ACME",
                  direction: str = "long", pair_with: str | None = None) -> tuple[dict, dict]:
        rec = {
            "ticker": ticker, "direction": direction, "pair_with": pair_with,
            "thesis_type": "company_specific", "reason": "  Demand   lifts earnings ",
            "why_now": "Results are due this month", "source_event_ids": [why_event, proof_event],
            "primary_source_event_id": why_event, "source_headline": headline,
            "source_url": url, "source_name": "Exchange", "origin_type": origin,
            "source_themes": themes,
        }
        projected = project_idea_lineage(rec)
        if projected is None:
            return rec, {}
        rec["idea_version"] = idea_version_for_record(rec, projected)
        return rec, projected

    theme_ref = {"theme_id": "THM-a1b2c3d4", "theme_rev": 6,
                 "evidence_event_ids": [why_event, proof_event], "why_now_event_id": why_event}
    theme_rec, theme_lineage = versioned("theme", [theme_ref])
    check("new Theme lineage binds exact why-now membership",
          theme_lineage == {"origin_type": "theme", "source_themes": [theme_ref]}
          and valid_idea_version(theme_rec, theme_lineage))
    check("new v2 requires explicit null pair_with on a non-pair",
          idea_version_for_record({key: value for key, value in theme_rec.items()
                                   if key != "pair_with"}, theme_lineage) is None)
    check("Theme why-now outside its exact evidence ref fails closed",
          project_idea_lineage({**theme_rec, "source_themes": [{**theme_ref,
              "evidence_event_ids": [proof_event]}]}) is None)
    check("conflicting revisions for one theme id fail closed",
          project_idea_lineage({**theme_rec, "source_themes": [theme_ref,
              {**theme_ref, "theme_rev": 7}]}) is None)
    changed_rev = {**theme_rec, "source_themes": [{**theme_ref, "theme_rev": 7}]}
    changed_lineage = project_idea_lineage(changed_rev)
    check("unchanged v2 hash rejects a changed Theme revision",
          changed_lineage is not None and not valid_idea_version(changed_rev, changed_lineage))
    check("changed launch publisher changes the immutable v2 hash",
          idea_version_for_record({**theme_rec, "source_name": "Other Exchange"}, theme_lineage)
          != theme_rec["idea_version"])
    check("primary event id is recomputed from headline and URL",
          primary_source_for_record({**theme_rec, "source_url": url + "?rewritten=1"}) is None)

    wire_rec, wire_lineage = versioned("wire", [], ticker="AMD", direction="pair", pair_with="INTC")
    check("new wire v2 is valid and binds the independently verified pair leg",
          valid_idea_version(wire_rec, wire_lineage)
          and idea_version_for_record({**wire_rec, "pair_with": "NVDA"}, wire_lineage)
          != wire_rec["idea_version"])
    check("structured JSON prevents delimiter-bearing source fields from aliasing",
          idea_version_for_record({**wire_rec, "source_name": "A|B;[C]"}, wire_lineage)
          != idea_version_for_record({**wire_rec, "source_name": "A", "source_headline": "B;[C]"}, wire_lineage))
    check("Python matches the TypeScript canonical v2 vector",
          wire_rec["idea_version"] == "IDEAV-f7194ed98c4f8fc9")

    legacy = {key: value for key, value in wire_rec.items()
              if key not in {"origin_type", "source_themes", "primary_source_event_id",
                             "source_headline", "source_url", "source_name", "idea_version"}}
    legacy["idea_version"] = _legacy_idea_version_for_record(legacy, {}, bind_pair=False)
    check("field-absent pre-lineage wire snapshot remains conservatively readable",
          valid_idea_version(legacy, {}))
    legacy_theme = {key: value for key, value in theme_rec.items()
                    if key not in {"primary_source_event_id", "idea_version"}}
    check("legacy Theme lineage without exact launch identity fails closed",
          project_idea_lineage(legacy_theme) is None)

    # A withdrawal published before the raw snapshot unlink must already block the static board. The
    # exact filename is sufficient to fail closed even if a crash left malformed tombstone bytes.
    import tempfile
    from unittest import mock
    with tempfile.TemporaryDirectory() as manifest_dir:
        manifest_path = os.path.join(manifest_dir, "board-history-recovery-manifest.json")
        occurrence = {
            "idea_id": "IDEA-123456789abc", "idea_version": "IDEAV-1234567890abcdef",
            "idea_version_started_at": "2026-08-01T00:00:00Z", "direction": "pair",
            "decision": "skipped", "reason": "no_committed_expiry_evidence",
        }
        with open(manifest_path, "w", encoding="utf-8") as handle:
            json.dump({
                "schema_version": IDEAS_BOARD_HISTORY_RECOVERY_SCHEMA,
                "source_path": IDEAS_BOARD_HISTORY_RECOVERY_SOURCE,
                "occurrences": [occurrence, {
                    **occurrence, "idea_id": "IDEA-abcdef123456", "direction": "short",
                }, {
                    **occurrence, "idea_id": "IDEA-fedcba654321", "direction": "long",
                    "decision": "imported", "reason": "historical_board_expired",
                }],
            }, handle)
        check("history audit counts only skipped unproven expiry, with pairs in both tabs",
              read_unconfirmed_history_counts(manifest_path) == {"long": 1, "short": 2})
        with open(manifest_path, "w", encoding="utf-8") as handle:
            handle.write("{")
        check("malformed history audit stays unknown instead of becoming zero",
              read_unconfirmed_history_counts(manifest_path) is None)

    with tempfile.TemporaryDirectory() as archive_dir:
        withdrawal_key = ("IDEA-123456789abc", "IDEAV-1234567890abcdef",
                          "2026-08-01T00:00:00Z", "long")
        withdrawal = {"idea_id": withdrawal_key[0], "idea_version": withdrawal_key[1],
                      "idea_version_started_at": withdrawal_key[2], "direction": withdrawal_key[3]}
        check("no exact withdrawal path leaves the current occurrence visible",
              not idea_blocked_by_withdrawal(withdrawal, archive_dir))
        open(os.path.join(archive_dir, occurrence_filename(withdrawal_key, "withdrawn")), "w").close()
        check("an exact even-malformed withdrawal path fails closed before raw unlink",
              idea_blocked_by_withdrawal(withdrawal, archive_dir))
        parts = occurrence_filename_parts(occurrence_filename(withdrawal_key, "withdrawn"))
        check("managed withdrawal filename alone blocks the exact occurrence across archive lanes",
              parts is not None and filename_blocks_row(parts, withdrawal))
        check("managed withdrawal filename does not block a different occurrence epoch",
              parts is not None and not filename_blocks_row(parts, {
                  **withdrawal, "idea_version_started_at": "2026-08-01T00:00:01Z",
              }))
        with mock.patch("os.lstat", side_effect=PermissionError("unreadable")):
            check("an unreadable exact withdrawal lookup fails closed",
                  idea_blocked_by_withdrawal(withdrawal, archive_dir))

    check("a canonical refresh shadows recovered-current by stable id across versions",
          recovery_current_shadowed(
              {"idea_id": "IDEA-123456789abc", "idea_version_started_at": "2026-08-01T00:00:00Z"},
              "latest_board_current", False,
              {"IDEA-123456789abc"},
          ))
    check("stable-id shadow does not erase historical recovery audit rows",
          not recovery_current_shadowed(
              {"idea_id": "IDEA-123456789abc"}, "historical_board_expired", True,
              {"IDEA-123456789abc"},
          ))
    check("a newer strict/archive lifecycle barrier shadows older recovered-current bytes",
          recovery_current_shadowed(
              {"idea_id": "IDEA-123456789abc", "idea_version_started_at": "2026-08-01T00:00:00Z"},
              "latest_board_current", False, set(),
              {"IDEA-123456789abc": ["2026-08-02T00:00:00Z"]},
          ))
    check("an older lifecycle barrier cannot shadow a newer recovered occurrence",
          not recovery_current_shadowed(
              {"idea_id": "IDEA-123456789abc", "idea_version_started_at": "2026-08-02T00:00:00Z"},
              "latest_board_current", False, set(),
              {"IDEA-123456789abc": ["2026-08-01T00:00:00Z"]},
          ))
    check("a malformed terminal withdrawal blocks stable-ID recovery without inventing an epoch",
          recovery_current_shadowed(
              {"idea_id": "IDEA-123456789abc", "idea_version_started_at": "2026-08-02T00:00:00Z"},
              "latest_board_current", False, set(), {"IDEA-123456789abc": [None]},
          ))
    check("shadowed recovery stays hidden until its own shelf life ends",
          recovery_projection_lane("latest_board_current", False, True) == "hidden")
    check("shadowed recovery enters audit only after its own decay",
          recovery_projection_lane("latest_board_current", True, True) == "archive")
    pending_name = occurrence_filename(withdrawal_key, "imported")
    pending_retention = {
        "schema_version": IDEA_ARCHIVE_RETENTION_SCHEMA,
        "evicted_count": 1,
        "side_counts": {"long": {"evicted_count": 1}, "short": {"evicted_count": 0}},
        "pending_evictions": [pending_name],
    }
    kept_names, pending_names = names_after_pending_evictions(
        [pending_name, occurrence_filename(withdrawal_key, "withdrawn")], pending_retention,
    )
    check("pending evictions are excluded from retained archive parsing",
          pending_names == {pending_name} and kept_names == [occurrence_filename(withdrawal_key, "withdrawn")])
    pending_withdrawal = occurrence_filename(withdrawal_key, "withdrawn")
    invalid_pending_withdrawal = {
        **pending_retention, "pending_evictions": [pending_withdrawal],
    }
    check("retention rejects a pending terminal withdrawal tombstone",
          not valid_archive_retention_value(invalid_pending_withdrawal))
    rejected_names, rejected_pending = names_after_pending_evictions(
        [pending_name, pending_withdrawal], invalid_pending_withdrawal,
    )
    check("invalid pending-withdrawal retention filters no archive names",
          rejected_names == [pending_name, pending_withdrawal] and rejected_pending == set())
    pending_only = [parts for name in [pending_withdrawal]
                    if (parts := occurrence_filename_parts(name)) is not None and parts[4] == "withdrawn"]
    check("a pending withdrawal filename remains terminal suppression evidence",
          len(pending_only) == 1 and filename_blocks_row(pending_only[0], withdrawal))

    with tempfile.TemporaryDirectory() as archive_dir:
        for index in range(3):
            epoch = f"2026-08-01T00:00:0{index}Z"
            key = ("IDEA-123456789abc", "IDEAV-1234567890abcdef", epoch, "long")
            open(os.path.join(archive_dir, occurrence_filename(key, "imported")), "w").close()
        bounded_names, overflow, missing = bounded_managed_archive_names(
            Path(archive_dir), 2, 10,
        )
        check("managed archive enumeration stops at the bound plus one sentinel",
              overflow and not missing and len(bounded_names) == 3)
        absent_names, absent_overflow, absent_missing = bounded_managed_archive_names(
            Path(archive_dir) / "absent", 2,
        )
        check("a missing archive directory stays missing rather than healthy",
              absent_names == [] and not absent_overflow and absent_missing)
        clutter_dir = Path(archive_dir) / "clutter"
        clutter_dir.mkdir()
        for index in range(3):
            (clutter_dir / f"unmanaged-{index}").touch()
        clutter_names, clutter_overflow, clutter_missing = bounded_managed_archive_names(
            clutter_dir, 10, 2,
        )
        check("unmanaged sibling flooding is bounded by total directory entries",
              clutter_names == [] and clutter_overflow and not clutter_missing)
        with (mock.patch.object(sys.modules[__name__], "IDEA_ARCHIVE_MAX_FILES_READ", 2),
              mock.patch.object(sys.modules[__name__], "IDEAS_ARCHIVE", archive_dir),
              mock.patch.object(sys.modules[__name__], "IDEAS_ARCHIVE_RETENTION",
                                os.path.join(archive_dir, "retention.json")),
              mock.patch.object(sys.modules[__name__], "IDEA_ARCHIVE_RETENTION_REQUIRED",
                                os.path.join(archive_dir, ".retention-required"))):
            overflow_archive, overflow_current, overflow_occurrences = build_ideas_archive(
                [{**withdrawal, "status": "live", "stale": True,
                  "decay_at": "2026-08-01T00:00:00Z"}], {}, "2026-08-02T00:00:00Z",
            )
        check("overflow fails closed with no archive or recovered-current projection",
              overflow_archive["health"]["status"] == "degraded"
              and overflow_archive["health"]["error"] == "archive_store_overflow"
              and overflow_archive["rows"] == [] and overflow_current == []
              and overflow_occurrences == set())

    v1_row = {
        **wire_rec, "idea_id": "IDEA-123456789abc", "idea_version_started_at": "2026-08-01T00:00:00Z",
        "decay_at": "2026-08-03T00:00:00Z", "status": "live", "promoted_signal_id": None,
        "trade_score": 62, "trade_score_basis": "evidence_gate_v1", "trade_readiness": "check_now",
        "missing_checks": ["dated catalyst"],
    }
    v1_projection = project_board_idea(v1_row, {}, "2026-08-02T00:00:00Z")
    check("legacy V1 recovery is demoted to 44/watch-only with missing market checks",
          v1_projection is not None and v1_projection["trade_score"] == 44
          and v1_projection["trade_readiness"] == "watch_only"
          and v1_projection["missing_checks"][0] == "live price, liquidity, and consensus")

    with tempfile.TemporaryDirectory() as board_dir:
        board_path = os.path.join(board_dir, "index.json")
        with (mock.patch("os.fsync", wraps=os.fsync) as fsync,
              mock.patch("os.replace", wraps=os.replace) as replace):
            write_board_index({"generated_at": "2026-08-02T00:00:00Z"}, board_path)
        check("board publication fsyncs bytes, atomically replaces, then fsyncs its directory",
              read_json(board_path)["generated_at"] == "2026-08-02T00:00:00Z"
              and fsync.call_count == 2 and replace.call_count == 1)

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
    write_board_index(idx)
    c = idx["counts"]
    print(
        f"WROTE {os.path.relpath(BOARD, REPO)} — {c['signals_total']} signals, "
        f"{len(idx['theses'])} theses, {c['inbox_unconsumed']} inbox, {c['handed_off']} handoffs"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
