#!/usr/bin/env python3
"""Deterministically re-score a thesis's conviction from a validation result, and move its rung.

This is the engine of upgrade/downgrade — kept as deterministic code (not LLM arithmetic) so every
move is explainable from evidence rows, never vibes (CLAUDE.md §12). The validator AGENT supplies the
judgment (the real number, the verdict, the cited sources, the source count); THIS applies the locked
math from frameworks/screener/CONVICTION_LOOP.md §6:

  edge_score_live = clamp(0,100, 0.40·variant + 0.30·mispricing + 0.30·trigger_clarity)

replayed from the FROZEN locked M0.6.6 sub-scores plus the cited per-checkpoint deltas (each pre-sized
under the ±20/±15 cap), then maps to the conviction state machine + §18 rating, enforcing the two hard
gates: a kill needs TWO approved sources (else it parks, never discards), and no confirmed/handoff while
a kill checkpoint due within the horizon is unresolved.

Writes: appends a validation_result + a conviction_event to conviction.ndjson; rewrites the
conviction_state snapshot; marks the checkpoint resolved. Idempotent on (checkpoint_id, verdict, day).

  python3 scripts/screener_rescore.py <thesis_id> <checkpoint_id> <verdict> \
      [--observed V] [--source-count N] [--prob P] [--at ISO] [--note "..."] \
      [--evidence-json '[{...}]'] [--dry-run]

  verdict ∈ confirmed | partial | against | breached_kill | unresolved
"""
from __future__ import annotations

import argparse
import json
import os
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

HORIZON_DAYS = {"short_days_weeks": 42, "medium_weeks_3months": 90, "medium_long_3_6months": 180, "long_6months_plus": 270}
# §18 long-side ratings per state (the rescorer flips to Short Candidate / Pair when the thesis side warrants)
RATING = {
    "watching": "Watchlist", "provisional": "Starter Position Only", "strong": "Buy",
    "confirmed": "Strong Buy", "fading": "Hold", "handed_off": "Buy",
    "falsified_discarded": "Avoid", "expired_unproven": "Insufficient Data — Refuse To Rate",
}
CP_WEIGHT = {"kill_metric": 3, "convergence_trigger": 3, "secondary_metric": 1,
             "secondary_falsifier": 1, "secondary_trigger": 1, "expiry": 1}


def now_z() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def read_ndjson(path: str) -> list[dict]:
    out = []
    if not os.path.exists(path):
        return out
    for ln in open(path, encoding="utf-8", errors="replace"):
        ln = ln.strip()
        if ln:
            try:
                out.append(json.loads(ln))
            except Exception:
                pass
    return out


def to_day(iso: str | None) -> datetime | None:
    if not iso:
        return None
    s = iso.strip()
    # tolerate trailing Z and fractional seconds by slicing to the second (or to the date)
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(s[:19] if "T" in s else s[:10], fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def append(path: str, obj: dict, key: str, val: str) -> None:
    subprocess.run(["bash", APPEND, path, json.dumps(obj, ensure_ascii=False), key, val],
                   cwd=REPO, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def subscore_delta(kind: str, verdict: str, prob: float | None):
    """Return (dV, dM, dC) — the locked, evidence-derived sub-score move (§6). Pre-sized under the cap."""
    p = prob if isinstance(prob, (int, float)) else 0.2
    half = verdict == "partial"
    s = 0.5 if half else 1.0
    if kind == "convergence_trigger":
        if verdict in ("confirmed", "partial"):
            return (0, 0, round(30 * s))
        if verdict == "against":
            return (0, 0, -12)
        return (0, 0, 0)
    if kind == "kill_metric":
        if verdict == "confirmed":
            return (round(20 * s), round(20 * s), 0)
        if verdict == "against":
            return (-15, -15, 0)
        return (0, 0, 0)  # breached_kill handled by state; unresolved = no move
    if kind == "secondary_metric":
        return (10, 0, 0) if verdict == "confirmed" else ((-8, 0, 0) if verdict == "against" else (0, 0, 0))
    if kind == "secondary_trigger":
        return (0, 0, 10) if verdict == "confirmed" else ((0, 0, -6) if verdict == "against" else (0, 0, 0))
    if kind == "secondary_falsifier":
        if verdict == "against":  # the falsifier FIRED — haircut proportional to its locked probability
            return (-round(40 * p), 0, 0)
        if verdict == "confirmed":  # ruled out
            return (5, 0, 0)
        return (0, 0, 0)
    return (0, 0, 0)


def data_sufficiency(verdict: str, source_count: int) -> float:
    if verdict == "partial":
        return 0.6
    if source_count >= 2:
        return 1.0
    if source_count == 1:
        return 0.85
    return 0.7


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("thesis_id")
    ap.add_argument("checkpoint_id")
    ap.add_argument("verdict", choices=["confirmed", "partial", "against", "breached_kill", "unresolved"])
    ap.add_argument("--observed", default=None)
    ap.add_argument("--source-count", type=int, default=1)
    ap.add_argument("--prob", type=float, default=None)
    ap.add_argument("--at", default=None, help="checked_at ISO (defaults to now)")
    ap.add_argument("--note", default="")
    ap.add_argument("--evidence-json", default=None)
    ap.add_argument("--error-tag", default="")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    tid, cid = a.thesis_id, a.checkpoint_id
    checked_at = a.at or now_z()
    rec_path = os.path.join(THESES, f"{tid}.json")
    state_path = os.path.join(STATE_DIR, f"{tid}.json")
    if not os.path.exists(rec_path):
        print(f"no thesis record {tid}", file=sys.stderr)
        return 2
    rec = json.load(open(rec_path, encoding="utf-8"))
    if not os.path.exists(state_path):
        print(f"no conviction_state for {tid} — run screener_emit_checkpoints.py first", file=sys.stderr)
        return 2
    state = json.load(open(state_path, encoding="utf-8"))

    cps = [c for c in read_ndjson(CHECKPOINTS) if c.get("thesis_id") == tid]
    cp = next((c for c in cps if c.get("checkpoint_id") == cid), None)
    if not cp:
        print(f"no checkpoint {cid} for {tid}", file=sys.stderr)
        return 2

    m066 = rec.get("M0_6_6", {}).get("scoring_criteria", {})
    base = {
        "variant_perception_quality": int((m066.get("variant_perception_quality") or {}).get("sub_score") or 0),
        "mispricing_reason_strength": int((m066.get("mispricing_reason_strength") or {}).get("sub_score") or 0),
        "convergence_trigger_clarity": int((m066.get("convergence_trigger_clarity") or {}).get("sub_score") or 0),
    }
    edge_locked = int(rec.get("M0_6_6", {}).get("final_score") or 0)
    horizon_end = None
    created = to_day(rec.get("meta", {}).get("created_at"))
    if created:
        horizon_end = created + timedelta(days=HORIZON_DAYS.get(rec.get("M0_4", {}).get("horizon"), 90))

    # ---- the new validation_result ----
    prob = a.prob if a.prob is not None else cp.get("predicted_prob")
    realized = None
    if cp.get("predicted_prob") is not None:
        realized = 1 if a.verdict in ("confirmed", "breached_kill") else (0 if a.verdict == "against" else None)
    vr = {
        "row_type": "validation_result", "checkpoint_id": cid, "thesis_id": tid,
        "run_id": checked_at, "source_field": cp.get("source_field", ""),
        "observed_value": a.observed, "threshold": cp.get("threshold"), "unit": cp.get("unit", ""),
        "verdict": a.verdict, "distance_to_threshold": None,
        "cited_evidence": json.loads(a.evidence_json) if a.evidence_json else [],
        "source_count": a.source_count, "predicted_prob": prob, "realized": realized,
        "error_taxonomy_tag": a.error_tag, "narrative": a.note, "checked_at": checked_at,
        "vr_key": f"{cid}::{a.verdict}::{checked_at[:10]}",
    }

    # ---- replay all resolved validations (this one included) from the frozen baseline ----
    prior = [r for r in read_ndjson(TICKS) if r.get("row_type") == "validation_result" and r.get("thesis_id") == tid]
    prior = [r for r in prior if r.get("vr_key") != vr["vr_key"]]  # avoid double-count on re-run
    history = prior + [vr]
    history.sort(key=lambda r: r.get("checked_at") or "")
    cp_by_id = {c["checkpoint_id"]: c for c in cps}
    V, M, C = base["variant_perception_quality"], base["mispricing_reason_strength"], base["convergence_trigger_clarity"]
    breached_two_src = breached_one_src = False
    trigger_worked = expiry_true = False
    confirmed_cp_ids: set[str] = set()
    for r in history:
        c = cp_by_id.get(r.get("checkpoint_id"), {})
        kind, verd = c.get("kind", ""), r.get("verdict")
        dV, dM, dC = subscore_delta(kind, verd, r.get("predicted_prob"))
        V, M, C = max(0, min(100, V + dV)), max(0, min(100, M + dM)), max(0, min(100, C + dC))
        if verd in ("confirmed",):
            confirmed_cp_ids.add(r.get("checkpoint_id"))
        if kind == "kill_metric" and verd == "breached_kill":
            if int(r.get("source_count") or 0) >= 2:
                breached_two_src = True
            else:
                breached_one_src = True
        if kind == "convergence_trigger" and verd == "confirmed":
            trigger_worked = True
        if kind == "expiry" and verd in ("confirmed", "against"):
            expiry_true = True
    edge_live = max(0, min(100, round(0.40 * V + 0.30 * M + 0.30 * C)))

    # ---- a kill checkpoint due within the horizon, not yet resolved (the graduation gate) ----
    resolved_ids = {r.get("checkpoint_id") for r in history if r.get("verdict") != "unresolved"}
    kill_pending = any(
        c.get("kind") == "kill_metric" and c.get("checkpoint_id") not in resolved_ids
        and (to_day(c.get("due_at")) is None or horizon_end is None or to_day(c.get("due_at")) <= horizon_end)
        for c in cps
    )

    # ---- state machine ----
    insufficient = False
    archived = False
    prev_state = state.get("state", "provisional")
    prev_edge = int(state.get("edge_score_live") or edge_locked)
    if breached_two_src:
        new_state, archived = "falsified_discarded", True
    elif breached_one_src:
        new_state, insufficient = prev_state, True  # park for a second source — never discard on one
    elif expiry_true and not trigger_worked:
        new_state, archived = "expired_unproven", True
    elif edge_live >= 60:
        if edge_live > 80 and trigger_worked and not kill_pending:
            new_state = "confirmed"
        elif edge_live > 80:
            new_state = "strong"
        else:
            new_state = "provisional"
        # a confirm that LOWERED edge into a lower band reads as fading, not a clean rung
        if edge_live < prev_edge and a.verdict in ("against", "partial") and new_state == "provisional":
            new_state = "fading"
    else:
        new_state = "fading" if (a.verdict in ("against", "partial") and edge_live >= 50) else "watching"

    validated = bool(confirmed_cp_ids) or a.verdict in ("confirmed", "against", "breached_kill", "partial")
    dsf = data_sufficiency(a.verdict, a.source_count)
    if insufficient:  # frozen — never silently upgrade on an unconfirmed kill
        new_state = prev_state
    conviction = round(edge_live * dsf)

    # ---- proximity (weighted confirmed / weighted total) ----
    wt_total = sum(CP_WEIGHT.get(c.get("kind"), 1) for c in cps)
    wt_conf = sum(CP_WEIGHT.get(cp_by_id.get(i, {}).get("kind"), 1) for i in confirmed_cp_ids)
    proximity = round(100 * wt_conf / wt_total, 1) if wt_total else 0.0
    progress_confirmed = len({i for i in resolved_ids})

    # ---- trajectory + velocity ----
    traj = list(state.get("trajectory") or [])
    traj.append({"at": checked_at, "edge": edge_live})
    # dedupe identical trailing points
    seen, dedup = set(), []
    for p in traj:
        k = (p["at"], p["edge"])
        if k not in seen:
            seen.add(k)
            dedup.append(p)
    traj = dedup[-24:]
    now_dt = to_day(checked_at)
    ref_edge = traj[0]["edge"]
    ref_dt = to_day(traj[0]["at"])
    for p in traj:
        d = to_day(p["at"])
        if d and now_dt and d <= now_dt - timedelta(days=30):
            ref_edge, ref_dt = p["edge"], d
    elapsed = max(1.0, (now_dt - ref_dt).days) if (now_dt and ref_dt) else 1.0
    velocity = round((edge_live - ref_edge) / elapsed * 30, 1)
    edges = [p["edge"] for p in traj]
    if len(edges) >= 2:
        d1 = edges[-1] - edges[-2]
        traj_enum = "accelerating" if d1 >= 8 else ("decaying" if d1 < 0 else ("stalling" if d1 == 0 and validated else "steady"))
    else:
        traj_enum = "steady"

    # ---- rating (flip to short side if the thesis is harm-led — heuristic: candidates side) ----
    rating = RATING[new_state]

    nxt = sorted([c for c in cps if c.get("due_at") and c.get("checkpoint_id") not in resolved_ids],
                 key=lambda c: c["due_at"])
    next_cp = ({"checkpoint_id": nxt[0]["checkpoint_id"], "metric_name": nxt[0]["metric_name"],
                "kind": nxt[0]["kind"], "due_at": nxt[0]["due_at"]} if nxt else None)

    move_kind = ("discard" if archived and new_state == "falsified_discarded"
                 else "expire" if new_state == "expired_unproven"
                 else "recover" if (prev_state == "fading" and edge_live > prev_edge)
                 else "upgrade" if edge_live > prev_edge
                 else "downgrade" if edge_live < prev_edge else "hold")
    plain = (a.note or "").strip() or f"{move_kind.title()} → {rating}: {cp.get('metric_name','')[:60]} {a.verdict}."

    event = {
        "row_type": "conviction_event", "thesis_id": tid, "at": checked_at, "kind": move_kind,
        "from_state": prev_state, "to_state": new_state, "edge_locked": edge_locked,
        "edge_score_live": edge_live, "subscores_before": base,
        "subscores_after": {"variant_perception_quality": V, "mispricing_reason_strength": M, "convergence_trigger_clarity": C},
        "conviction": conviction, "sell_side_rating": rating, "triggering_checkpoint_id": cid,
        "evidence_refs": [vr["vr_key"]], "plain_note": plain, "event_key": f"{tid}::{checked_at}::{cid}",
    }

    snap = dict(state)
    snap.update({
        "state": new_state, "sell_side_rating": rating, "edge_locked": edge_locked,
        "edge_score_live": edge_live, "conviction": conviction, "data_sufficiency_factor": dsf,
        "upgrade_velocity": velocity, "trajectory_enum": traj_enum,
        "rank_score": round(0.50 * edge_live + 0.30 * max(0, min(100, 50 + 2.5 * velocity)) + 0.20 * proximity, 1),
        "proximity_pct": proximity, "progress_confirmed": progress_confirmed, "progress_total": len(cps),
        "validated": validated, "trajectory": traj, "next_checkpoint": next_cp,
        "stale": False, "insufficient": insufficient, "archived": archived,
        "plain_note": plain, "history": (state.get("history") or []) + [event["event_key"]],
        "updated_at": now_z(),
    })
    if archived and new_state == "falsified_discarded":
        snap["kill_reason"] = a.note or cp.get("falsification_text", "")
        snap["error_taxonomy_tag"] = a.error_tag

    print(f"  {tid}  {prev_state}({prev_edge}) → {new_state}({edge_live})  [{rating}]  conv={conviction} vel={velocity}/30d "
          f"prox={proximity}% verdict={a.verdict} src={a.source_count}"
          + ("  GATE: kill pending → held below confirmed" if (kill_pending and edge_live > 80 and trigger_worked and new_state != 'confirmed') else "")
          + ("  TWO-SOURCE KILL → discarded" if breached_two_src else "")
          + ("  single-source breach → PARKED (needs 2nd source)" if breached_one_src else ""))
    if a.dry_run:
        print("  (dry run — nothing written)")
        return 0

    append(TICKS, vr, "vr_key", vr["vr_key"])
    append(TICKS, event, "event_key", event["event_key"])
    with open(state_path, "w", encoding="utf-8") as f:
        json.dump(snap, f, indent=2, ensure_ascii=False)
        f.write("\n")
    # mark the checkpoint resolved (rewrite the calendar line's status in place)
    if a.verdict != "unresolved":
        rows = read_ndjson(CHECKPOINTS)
        for r in rows:
            if r.get("checkpoint_id") == cid:
                r["status"] = "resolved"
        with open(CHECKPOINTS, "w", encoding="utf-8") as f:
            for r in rows:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
