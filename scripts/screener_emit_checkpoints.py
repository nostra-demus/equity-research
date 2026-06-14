#!/usr/bin/env python3
"""Derive conviction checkpoints + an initial flat conviction_state from a LOCKED thesis record.

The conviction loop (frameworks/screener/CONVICTION_LOOP.md) tracks the things a thesis already
named when it locked — the M0.5 kill metric + date, the M0.6.5 convergence trigger + date, the
M0.4 expiry. This script reads those fields and emits, per thesis:

  screener/ledger/conviction/checkpoints.ndjson           one row per tracked thing (append-only,
                                                           idempotent on checkpoint_id)
  screener/ledger/conviction/conviction.ndjson            a seed conviction_event (idempotent)
  screener/ledger/conviction/conviction_state/<id>.json   the flat snapshot the board reads

Deterministic and dependency-free: parsing only, no LLM. The validator AGENT (Phase 2) makes the
authoritative kill judgment using the falsification sentence carried on the kill checkpoint — the
operator/direction here are hints. Safe to re-run: checkpoints dedupe, the snapshot is regenerable.

    python3 scripts/screener_emit_checkpoints.py                 # all locked theses (backfill)
    python3 scripts/screener_emit_checkpoints.py THS-SIG-...-v1   # one thesis
"""
from __future__ import annotations

import glob
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEDGER = os.path.join(REPO, "screener", "ledger")
THESES = os.path.join(LEDGER, "theses")
CONV = os.path.join(LEDGER, "conviction")
STATE_DIR = os.path.join(CONV, "conviction_state")
CHECKPOINTS = os.path.join(CONV, "checkpoints.ndjson")
TICKS = os.path.join(CONV, "conviction.ndjson")
APPEND = os.path.join(REPO, "scripts", "append-ndjson.sh")

MONTHS = {m: i for i, m in enumerate(
    ["january", "february", "march", "april", "may", "june", "july", "august",
     "september", "october", "november", "december"], start=1)}

HORIZON_DAYS = {
    "short_days_weeks": 42,
    "medium_weeks_3months": 90,
    "medium_long_3_6months": 180,
    "long_6months_plus": 270,
}

# state (conviction) <- locked meta.status, and the §18 long-side rating per state
STATE_FROM_STATUS = {
    "watchlist_no_edge": "watching", "watchlist_no_source": "watching",
    "watchlist_no_world_change": "watching", "watchlist_manual": "watching",
    "provisional": "provisional", "full_machine": "strong", "active": "provisional",
}
RATING = {
    "watching": "Watchlist", "provisional": "Starter Position Only", "strong": "Buy",
    "confirmed": "Strong Buy", "fading": "Hold", "handed_off": "Buy",
    "falsified_discarded": "Avoid", "expired_unproven": "Insufficient Data — Refuse To Rate",
}
STOPWORDS = {"the", "and", "for", "from", "with", "that", "this", "after", "into", "over",
             "amid", "its", "has", "have", "will", "than", "more", "less", "just", "here",
             "what", "behind", "call", "rare", "double", "shift"}


def now_z() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_due(text: str | None) -> str | None:
    """Return the LATEST date mentioned (ISO or 'Month D, YYYY') as YYYY-MM-DD, else None.

    Takes the max so a date RANGE resolves to its end. 'Month D, YYYY' requires the day and year
    adjacent (a comma between is fine) so citation fragments like 'August 19-21, 2026' don't
    misfire on the bare second day. Good enough for the 3 backfilled theses; the scheduler agent
    can correct an outlier.
    """
    if not text:
        return None
    found: list[str] = []
    for y, m, d in re.findall(r"(\d{4})-(\d{2})-(\d{2})", text):
        found.append(f"{y}-{m}-{d}")
    for mon, day, yr in re.findall(
            r"(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})",
            text, flags=re.IGNORECASE):
        found.append(f"{int(yr):04d}-{MONTHS[mon.lower()]:02d}-{int(day):02d}")
    valid = []
    for s in found:
        try:
            datetime.strptime(s, "%Y-%m-%d")
            valid.append(s)
        except ValueError:
            continue
    return max(valid) if valid else None


def cadence_from(freq: str | None) -> str:
    t = (freq or "").lower()
    if "dail" in t:
        return "daily"
    if "week" in t:
        return "weekly"
    if "quarter" in t:
        return "quarterly"
    if "month" in t:
        return "monthly"
    return "weekly"


def kill_operator(falsification: str) -> tuple[str, str]:
    """(operator, direction) hint for the kill metric — the agent uses the sentence as the real rule."""
    t = (falsification or "").lower()
    if any(w in t for w in ("below", "under", "less than", "fewer than", "drops to", "falls to", "retrace", "re-entry", "back to")):
        return "lt", "bullish_if_above"
    if any(w in t for w in ("above", "exceeds", "more than", "greater than", "rises to")):
        return "gt", "bullish_if_below"
    if "not declined" in t or "has not" in t or "fails to" in t:
        return "na", "binary"
    return "na", "binary"


def keywords(*texts: str) -> list[str]:
    seen, out = set(), []
    for t in texts:
        for w in re.findall(r"[A-Za-z][A-Za-z+&\-]{3,}", t or ""):
            lw = w.lower()
            if lw in STOPWORDS or lw in seen:
                continue
            seen.add(lw)
            out.append(w)
            if len(out) >= 10:
                return out
    return out


def parse_count_threshold(text: str):
    """Pull an embedded count threshold from a secondary-metric description, e.g. 'at least 14 of 48'."""
    m = re.search(r"at least\s+(\d+)\b", text or "", flags=re.IGNORECASE)
    if m:
        return float(m.group(1)), "gte"
    m = re.search(r"(?:>=|at or above)\s*(\d+)", text or "")
    if m:
        return float(m.group(1)), "gte"
    return None, "na"


def append(path: str, obj: dict, key: str, val: str) -> None:
    subprocess.run(["bash", APPEND, path, json.dumps(obj, ensure_ascii=False), key, val],
                   cwd=REPO, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def emit_for(rec: dict) -> str | None:
    meta = rec.get("meta", {})
    tid = meta.get("thesis_id")
    if not tid:
        return None
    mm = re.match(r"^THS-SIG-\d{8}-([a-f0-9]{8})-v\d+$", tid)
    if not mm:
        return None
    short = mm.group(1)
    created = meta.get("created_at") or now_z()
    created_day = parse_due(created) or now_z()[:10]
    headline = rec.get("headline") or meta.get("headline") or ""

    m04 = rec.get("M0_4", {})
    m05 = rec.get("M0_5", {})
    m065 = rec.get("M0_6_5", {})
    edge = int(rec.get("M0_6_6", {}).get("final_score") or 0)
    kill_date = parse_due(m05.get("monitorable_threshold_date"))
    cadence = cadence_from(m04.get("monitoring_frequency"))
    falsification = m05.get("falsification_sentence") or ""
    op, direction = kill_operator(falsification)

    cps: list[dict] = []
    n = 0

    def add(**kw):
        nonlocal n
        n += 1
        row = {
            "checkpoint_id": f"CHK-{short}-{n:02d}",
            "thesis_id": tid,
            "operator": "na", "unit": "", "direction": "na", "threshold": None,
            "due_at": None, "trigger_type": "na", "cadence": "na", "can_kill": False,
            "wire_keywords": [], "predicted_prob": None, "scheduled_task_id": None,
            "status": "scheduled", "created_at": created,
        }
        row.update(kw)
        cps.append(row)

    # M0.5 primary kill metric — the only checkpoint that can kill
    if m05.get("monitorable_metric_1"):
        add(source_field="M0_5.monitorable_metric_1", kind="kill_metric",
            metric_name=m05["monitorable_metric_1"], threshold=m05.get("monitorable_threshold_rate"),
            unit=m05.get("monitorable_threshold_rate_unit") or "", operator=op, direction=direction,
            falsification_text=falsification, due_at=kill_date, cadence=cadence, can_kill=True,
            trigger_type="scheduled" if kill_date else "na",
            wire_keywords=keywords(headline, m05["monitorable_metric_1"]))

    # M0.5 corroborating metric — adjusts conviction, cannot kill
    if m05.get("monitorable_metric_2"):
        thr, cop = parse_count_threshold(m05["monitorable_metric_2"])
        add(source_field="M0_5.monitorable_metric_2", kind="secondary_metric",
            metric_name=m05["monitorable_metric_2"], threshold=thr, operator=cop,
            direction="bullish_if_below" if cop == "na" else "bullish_if_below",
            due_at=kill_date, cadence=cadence, trigger_type="scheduled" if kill_date else "na",
            wire_keywords=keywords(m05["monitorable_metric_2"]))

    # M0.5 secondary falsifiers — the live §8 disconfirmation list
    for sf in (m05.get("secondary_falsifiers") or []):
        add(source_field=f"M0_5.secondary_falsifiers[{sf.get('id', '')}]", kind="secondary_falsifier",
            metric_name=sf.get("monitorable_metric") or sf.get("description") or "",
            due_at=kill_date, cadence=cadence, predicted_prob=sf.get("probability_estimate"),
            wire_keywords=keywords(sf.get("monitorable_metric") or sf.get("description") or ""))

    # M0.6.5 primary convergence trigger — the main upgrade engine
    if m065.get("trigger_name"):
        ttype = m065.get("trigger_type") or "scheduled"
        add(source_field="M0_6_5.trigger_name", kind="convergence_trigger",
            metric_name=m065["trigger_name"], due_at=parse_due(m065.get("trigger_date_range")),
            trigger_type=ttype, predicted_prob=m065.get("probability_if_unscheduled"),
            wire_keywords=keywords(m065["trigger_name"], headline))

    # M0.6.5 secondary triggers
    for st in (m065.get("secondary_triggers") or []):
        add(source_field=f"M0_6_5.secondary_triggers[{st.get('id', '')}]", kind="secondary_trigger",
            metric_name=st.get("trigger_name") or "", due_at=parse_due(st.get("trigger_date_range")),
            trigger_type=st.get("trigger_type") or "unscheduled", predicted_prob=st.get("probability"),
            wire_keywords=keywords(st.get("trigger_name") or ""))

    # M0.4 expiry — the clock and the stop
    due_candidates = [c["due_at"] for c in cps if c["due_at"]]
    try:
        horizon_end = (datetime.strptime(created_day, "%Y-%m-%d")
                       + timedelta(days=HORIZON_DAYS.get(m04.get("horizon"), 90))).strftime("%Y-%m-%d")
    except ValueError:
        horizon_end = None
    expiry_due = max([d for d in (due_candidates + [horizon_end]) if d], default=None)
    add(source_field="M0_4.expiry_condition", kind="expiry",
        metric_name=m04.get("expiry_condition") or "thesis horizon", due_at=expiry_due,
        trigger_type="scheduled", cadence=cadence,
        wire_keywords=keywords(m04.get("expiry_condition") or ""))

    for cp in cps:
        append(CHECKPOINTS, cp, "checkpoint_id", cp["checkpoint_id"])

    # ---- initial flat conviction_state ----
    state = STATE_FROM_STATUS.get(meta.get("status") or "", "watching")
    nxt = sorted([c for c in cps if c["due_at"]], key=lambda c: c["due_at"])
    next_cp = ({"checkpoint_id": nxt[0]["checkpoint_id"], "metric_name": nxt[0]["metric_name"],
                "kind": nxt[0]["kind"], "due_at": nxt[0]["due_at"]} if nxt else None)
    snap = {
        "thesis_id": tid, "state": state, "sell_side_rating": RATING[state],
        "edge_locked": edge, "edge_score_live": edge, "conviction": edge,
        "data_sufficiency_factor": 1.0, "upgrade_velocity": 0.0, "trajectory_enum": "steady",
        "rank_score": round(0.50 * edge + 0.30 * 50 + 0.20 * 0, 1), "proximity_pct": 0.0,
        "progress_confirmed": 0, "progress_total": len(cps), "validated": False,
        "trajectory": [{"at": created, "edge": edge}], "next_checkpoint": next_cp,
        "stale": False, "insufficient": False, "archived": False,
        "plain_note": (f"Locked at edge {edge} ({RATING[state]}). {len(cps)} proof points scheduled"
                       + (f"; first up: {next_cp['metric_name'][:60]} by {next_cp['due_at']}." if next_cp else ".")),
        "history": [], "updated_at": now_z(),
    }
    os.makedirs(STATE_DIR, exist_ok=True)
    with open(os.path.join(STATE_DIR, f"{tid}.json"), "w", encoding="utf-8") as f:
        json.dump(snap, f, indent=2, ensure_ascii=False)
        f.write("\n")

    seed = {
        "row_type": "conviction_event", "thesis_id": tid, "at": created, "kind": "seed",
        "from_state": state, "to_state": state, "edge_locked": edge, "edge_score_live": edge,
        "conviction": edge, "sell_side_rating": RATING[state], "triggering_checkpoint_id": None,
        "evidence_refs": [], "plain_note": snap["plain_note"], "event_key": f"{tid}::seed",
    }
    append(TICKS, seed, "event_key", seed["event_key"])
    return tid


def main(argv: list[str]) -> int:
    os.makedirs(CONV, exist_ok=True)
    if len(argv) >= 2:
        files = [os.path.join(THESES, f"{argv[1]}.json")]
    else:
        files = sorted(glob.glob(os.path.join(THESES, "*.json")))
    done = 0
    for fp in files:
        try:
            with open(fp, encoding="utf-8") as f:
                rec = json.load(f)
        except Exception as e:  # noqa: BLE001
            print(f"skip {os.path.basename(fp)}: {e}", file=sys.stderr)
            continue
        if not rec.get("meta", {}).get("locked"):
            continue  # only locked theses have a stable thing to track
        tid = emit_for(rec)
        if tid:
            done += 1
            print(f"emitted checkpoints + state for {tid}")
    print(f"done — {done} thesis(es)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
