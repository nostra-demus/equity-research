#!/usr/bin/env python3
"""Build the screener's track record from the conviction ledger — the proof the loop actually works.

Mirrors /research:calibrate: it aggregates RESOLVED checkpoints into honest performance + calibration
numbers, and REFUSES to quote a Brier (or rate metrics) until there is enough resolved history — false
confidence is worse than an empty state (CLAUDE.md §1, §11, §19). Deterministic; the command commits it.

  python3 scripts/screener_calibrate.py            # write a dated summary
  python3 scripts/screener_calibrate.py --print     # also print the JSON

Metrics (each null until the floor is met):
  hit_rate                  confirmed / (confirmed + against + breached)  — across resolved kill/trigger checks
  brier                     mean((predicted_prob - realized)^2)           — needs >= MIN_RESOLVED with a prob
  median_days_lock_to_confirm   lock date -> first confirming check
  selected_minus_discarded_edge mean live edge - mean archived edge        — edge realization proxy (labelled)
  error_taxonomy_distribution   §20 tags among misses/breaches
  false_discard_rate        discards later restored / total discards

Process tallies (honest at ANY N — never floor-gated, mirrors error_taxonomy_distribution above):
  integrity_gate_distribution   count of thesis-integrity verdicts (Survives / ... / Thesis broken) across
                                 every reviewed thesis in screener/ledger/theses/ (integrity_review, additively
                                 patched by scripts/screener_patch_integrity_review.py). Answers "is the gate
                                 adding signal or just friction" at the ACTIVITY level (Proceed vs killed) —
                                 the named remaining limitation from the PR that introduced thesis-integrity
                                 (a5ce95a / #284). integrity_gate_hit_rate stays null: judging whether a KILL
                                 was the right call needs a later outcome-check against the killed thesis's own
                                 M0_2/M0_5 claims, which no review mechanism provides yet (a separate, larger
                                 gap — a terminal verdict stops the pipeline before any ticker-level checkpoint
                                 could ever be tracked, unlike a live conviction discard).

Provider diagnostics extend this existing summary without changing its fields. Forecast/Brier rows join
to the immutable thesis record by thesis_id and follow its decision_author. Validation hit outcomes and
selected/discarded edge-proxy cohorts follow the whole-pipeline provider/profile. Every provider/profile
slice independently enforces N>=10 plus five distinct theses for Brier, N>=10 for directional hit rate,
and N>=5 at the exact basket horizon. Mixed, partial, invalid and legacy identities stay separate.
"""
from __future__ import annotations

import json
import math
import os
import statistics
import sys
from datetime import datetime, timezone
from provider_calibration import (
    SCHEMA_VERSION as PROVIDER_CALIBRATION_SCHEMA_VERSION,
    execution_identity,
    execution_slices,
    legacy_sensitivity,
    provider_comparison,
)

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONV = os.path.join(REPO, "screener", "ledger", "conviction")
THESES = os.path.join(REPO, "screener", "ledger", "theses")
TICKS = os.path.join(CONV, "conviction.ndjson")
STATE_DIR = os.path.join(CONV, "conviction_state")

MIN_RESOLVED = 10  # the same small-N floor /research:calibrate uses before it will quote a Brier


def read_ndjson(fp):
    try:
        return [json.loads(l) for l in open(fp, encoding="utf-8", errors="replace") if l.strip()]
    except Exception:
        return []


def read_thesis_records(theses_dir=None):
    """Read immutable terminal thesis records keyed by their exact thesis_id."""
    theses_dir = THESES if theses_dir is None else theses_dir
    records = {}
    for name in sorted(os.listdir(theses_dir) if os.path.isdir(theses_dir) else []):
        if not name.endswith(".json"):
            continue
        try:
            record = json.load(open(os.path.join(theses_dir, name), encoding="utf-8"))
        except Exception:
            continue
        thesis_id = record.get("meta", {}).get("thesis_id") if isinstance(record, dict) else None
        if isinstance(thesis_id, str) and thesis_id:
            records[thesis_id] = record
    return records


def integrity_gate_distribution(theses_dir):
    """Tally thesis-integrity verdicts across every ledger thesis carrying an `integrity_review` block
    (additively patched by scripts/screener_patch_integrity_review.py). Takes an explicit directory so
    it is testable against a fixture dir, not just the real ledger. Returns
    (distribution_by_verdict, n_reviewed, n_terminal) — never raises on a malformed/missing file.
    """
    dist, n_reviewed, n_terminal = {}, 0, 0
    for f in (os.listdir(theses_dir) if os.path.isdir(theses_dir) else []):
        if not f.endswith(".json"):
            continue
        try:
            rec = json.load(open(os.path.join(theses_dir, f), encoding="utf-8"))
        except Exception:
            continue
        if not isinstance(rec, dict):
            continue
        ir = rec.get("integrity_review")
        if not isinstance(ir, dict) or not ir.get("verdict"):
            continue
        n_reviewed += 1
        dist[ir["verdict"]] = dist.get(ir["verdict"], 0) + 1
        if ir.get("routing") in ("watchlist_integrity_downgrade", "watchlist_integrity_broken"):
            n_terminal += 1
    return dist, n_reviewed, n_terminal


def integrity_gate_note(n_terminal, n_reviewed, dist):
    """Human-readable summary of the thesis-integrity tally. Describes n_terminal only as 'a terminal
    LATEST integrity verdict', never as 'killed pre-surfacing': a thesis first routed Proceed, surfaced
    candidates, then re-reviewed into a terminal `_vN` verdict already HAS candidates, so 'pre-surfacing'
    would be a claim the data does not support (§5 — no claim without support). Accuracy over a tidier
    phrase. Never quotes an accuracy/hit-rate — this is gate ACTIVITY, not correctness."""
    if n_reviewed == 0:
        return "No thesis-integrity reviews recorded yet."
    return (
        f"{n_terminal} of {n_reviewed} reviewed theses have a terminal latest integrity verdict "
        f"(watchlist_integrity_downgrade / _broken); the rest routed Proceed ({dist}). This is gate "
        "ACTIVITY, not accuracy — integrity_gate_hit_rate stays null because judging whether a terminal "
        "verdict was the right call needs a later outcome-check against the thesis's own claims, which no "
        "review mechanism provides yet (a terminal verdict stops the pipeline before candidate-surfacing, "
        "so unlike a live conviction discard there is no ticker-level checkpoint to ever resolve)."
    )


def to_day(iso):
    if not iso:
        return None
    s = iso.strip()
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(s[:19] if "T" in s else s[:10], fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def build(legacy_provider_evidence=None):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    ticks = read_ndjson(TICKS)
    vrs = [r for r in ticks if isinstance(r, dict) and r.get("row_type") == "validation_result"]
    events = [r for r in ticks if isinstance(r, dict) and r.get("row_type") == "conviction_event"]
    resolved = [r for r in vrs if r.get("verdict") not in (None, "unresolved")]
    decisive = [r for r in resolved if r.get("verdict") in ("confirmed", "against", "breached_kill")]
    legacy_provider_evidence = legacy_provider_evidence or {}
    thesis_records = read_thesis_records()

    states = []
    for f in (os.listdir(STATE_DIR) if os.path.isdir(STATE_DIR) else []):
        if f.endswith(".json"):
            try:
                state = json.load(open(os.path.join(STATE_DIR, f), encoding="utf-8"))
                if isinstance(state, dict):
                    states.append(state)
            except Exception:
                pass

    all_thesis_ids = (
        set(thesis_records)
        | {row.get("thesis_id") for row in resolved if isinstance(row.get("thesis_id"), str)}
        | {row.get("thesis_id") for row in states if isinstance(row.get("thesis_id"), str)}
    )
    execution_by_thesis = {}
    for thesis_id in sorted(all_thesis_ids):
        record = thesis_records.get(thesis_id)
        # An explicit pre-rollout proof can classify an immutable legacy thesis. A validation row with
        # no terminal thesis to join remains unknown_legacy even if a caller supplies unrelated evidence.
        evidence = legacy_provider_evidence.get(thesis_id) if record is not None else None
        execution_by_thesis[thesis_id] = execution_identity(record or {}, evidence)

    def identity_for(row):
        thesis_id = row.get("thesis_id") if isinstance(row, dict) else None
        return execution_by_thesis.get(thesis_id) or execution_identity({})

    forecast_rows = []
    for row in resolved:
        probability, realized = row.get("predicted_prob"), row.get("realized")
        if not (
            isinstance(probability, (int, float)) and not isinstance(probability, bool)
            and 0 <= float(probability) <= 1
            and realized in (0, 1) and not isinstance(realized, bool)
        ):
            continue
        execution = identity_for(row)
        forecast_rows.append({
            "subject": row.get("thesis_id"),
            "probability": float(probability),
            "realized": int(realized),
            "score_type": "binary_brier",
            "execution_author_provider": execution["author_provider"],
            "execution_author_profile": execution["author_profile"],
        })

    directional_rows = []
    for row in decisive:
        execution = identity_for(row)
        directional_rows.append({
            "subject": row.get("thesis_id"),
            "hit": row.get("verdict") == "confirmed",
            "pipeline_provider": execution["pipeline_provider"],
            "pipeline_profile": execution["pipeline_profile"],
        })

    # This preserves the screener's existing selected-minus-discarded EDGE proxy; it is labelled as an
    # edge-score cohort, not represented as an investment return. The fixed N>=5 basket floor is applied
    # independently to each provider/profile and exact current-state horizon.
    basket_rows = []
    for state in states:
        value = state.get("edge_score_live")
        if (
            not isinstance(value, (int, float))
            or isinstance(value, bool)
            or not math.isfinite(float(value))
        ):
            continue
        execution = identity_for(state)
        basket_rows.append({
            "subject": state.get("thesis_id"),
            "basket": "discarded" if state.get("archived") else "selected",
            "horizon": "current_state",
            "value": float(value),
            "value_metric": "edge_score_live_proxy_not_realized_return",
            "pipeline_provider": execution["pipeline_provider"],
            "pipeline_profile": execution["pipeline_profile"],
        })

    n_checkpoints = len(read_ndjson(os.path.join(CONV, "checkpoints.ndjson")))
    n_resolved = len(resolved)
    sufficient = n_resolved >= MIN_RESOLVED

    out = {
        "generated_at": now,
        "provider_calibration_schema_version": PROVIDER_CALIBRATION_SCHEMA_VERSION,
        "n_theses": len(states),
        "n_checkpoints": n_checkpoints,
        "n_resolved": n_resolved,
        "min_resolved_for_calibration": MIN_RESOLVED,
        "sufficient": sufficient,
        "hit_rate": None,
        "brier": None,
        "n_resolved_with_prob": len(forecast_rows),
        "median_days_lock_to_confirm": None,
        "selected_minus_discarded_edge": None,
        "error_taxonomy_distribution": {},
        "false_discard_rate": None,
        "by_edge_band": {},
        "n_integrity_reviewed": 0,
        "n_integrity_terminal": 0,
        "integrity_gate_distribution": {},
        "integrity_gate_hit_rate": None,
        "integrity_gate_note": "",
        "calibration_by_provider": {},
        "calibration_by_execution_profile": {},
        "provider_comparison": {},
        "operational_aggregate_label": (
            "Global production-system aggregate across all execution cohorts. It preserves historical "
            "continuity but cannot establish that Claude or Codex is calibrated or better."
        ),
        "verdict": "",
    }

    # error taxonomy is honest even at low N (it's a tally, not a rate)
    provider_error_taxonomy = {}
    profile_error_taxonomy = {}
    for r in resolved:
        if (
            r.get("verdict") in ("against", "breached_kill")
            and isinstance(r.get("error_taxonomy_tag"), str)
            and r["error_taxonomy_tag"].strip()
        ):
            tag = r["error_taxonomy_tag"]
            out["error_taxonomy_distribution"][tag] = out["error_taxonomy_distribution"].get(tag, 0) + 1
            execution = identity_for(r)
            provider_counts = provider_error_taxonomy.setdefault(execution["pipeline_provider"], {})
            provider_counts[tag] = provider_counts.get(tag, 0) + 1
            profile_counts = profile_error_taxonomy.setdefault(execution["pipeline_profile"], {})
            profile_counts[tag] = profile_counts.get(tag, 0) + 1

    out["calibration_by_provider"] = execution_slices(
        forecast_rows,
        directional_rows,
        basket_rows,
        provider_error_taxonomy,
        forecast_key="execution_author_provider",
        pipeline_key="pipeline_provider",
    )
    out["calibration_by_execution_profile"] = execution_slices(
        forecast_rows,
        directional_rows,
        basket_rows,
        profile_error_taxonomy,
        forecast_key="execution_author_profile",
        pipeline_key="pipeline_profile",
    )
    out["provider_comparison"] = provider_comparison(out["calibration_by_provider"])
    out["legacy_provider_sensitivity"] = legacy_sensitivity(execution_by_thesis.values())

    # discards + restores (counts honest at any N)
    discards = sum(1 for e in events if e.get("kind") == "discard")
    restores = sum(1 for e in events if e.get("kind") == "recover" and (e.get("from_state") in ("falsified_discarded", "expired_unproven")))
    out["n_discards"] = discards
    out["n_restored"] = restores

    # thesis-integrity gate distribution — honest at any N, it's a process tally not a hit-rate (see module
    # docstring). Closes the remaining limitation named when the gate shipped (a5ce95a / #284): this is the
    # first thing that ever reads screener/ledger/theses/*.json's integrity_review block.
    idist, n_ireviewed, n_iterminal = integrity_gate_distribution(THESES)
    out["n_integrity_reviewed"] = n_ireviewed
    out["n_integrity_terminal"] = n_iterminal
    out["integrity_gate_distribution"] = idist
    out["integrity_gate_note"] = integrity_gate_note(n_iterminal, n_ireviewed, idist)

    if not sufficient:
        out["verdict"] = (
            f"Insufficient resolved history — {n_resolved} of {MIN_RESOLVED} resolved checks needed before a "
            f"track record means anything. {n_checkpoints} proof points are scheduled across {len(states)} ideas; "
            f"the record fills in as they hit their dates. (Refusing to quote a hit-rate or Brier on thin data, §11.)"
        )
        return out

    # ---- enough history: compute the real numbers ----
    confirmed = sum(1 for r in decisive if r["verdict"] == "confirmed")
    out["hit_rate"] = round(confirmed / len(decisive), 3) if decisive else None

    prob_pairs = [(row["probability"], row["realized"]) for row in forecast_rows]
    out["n_resolved_with_prob"] = len(prob_pairs)
    if len(prob_pairs) >= MIN_RESOLVED:
        out["brier"] = round(sum((p - y) ** 2 for p, y in prob_pairs) / len(prob_pairs), 4)

    # lock -> first confirm, per thesis
    lock_by_thesis = {}
    for thesis_id, record in thesis_records.items():
        try:
            lock_by_thesis[thesis_id] = to_day(record.get("meta", {}).get("created_at"))
        except (AttributeError, TypeError):
            # Preserve the old per-file fail-soft behavior: malformed legacy dates cannot stop the
            # deterministic scoreboard or cause a provider cohort to disappear.
            continue
    first_confirm = {}
    for r in sorted([x for x in resolved if x["verdict"] == "confirmed"], key=lambda x: x.get("checked_at") or ""):
        first_confirm.setdefault(r.get("thesis_id"), to_day(r.get("checked_at")))
    spans = []
    for tid, conf_dt in first_confirm.items():
        lk = lock_by_thesis.get(tid)
        if lk and conf_dt:
            spans.append((conf_dt - lk).days)
    out["median_days_lock_to_confirm"] = round(statistics.median(spans), 1) if spans else None

    live = [s for s in states if not s.get("archived")]
    arch = [s for s in states if s.get("archived")]
    if live and arch:
        out["selected_minus_discarded_edge"] = round(
            statistics.mean(s.get("edge_score_live", 0) for s in live) - statistics.mean(s.get("edge_score_live", 0) for s in arch), 1)
    out["false_discard_rate"] = round(restores / discards, 3) if discards else None

    out["verdict"] = (
        f"{n_resolved} resolved checks · hit-rate {out['hit_rate']}"
        + (f" · Brier {out['brier']}" if out["brier"] is not None else " · Brier pending more prob-tagged checks")
        + (f" · median {out['median_days_lock_to_confirm']}d lock→confirm" if out["median_days_lock_to_confirm"] is not None else "")
        + ". Global figures are operational aggregates only; provider comparisons never blend cohorts."
    )
    return out


def main(argv):
    out = build()
    os.makedirs(CONV, exist_ok=True)
    day = out["generated_at"][:10]
    path = os.path.join(CONV, f"{day}_conviction_calibration.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")
    # Keep this line exact for deterministic wrappers; human prose is a separate record.
    print(f"WROTE {os.path.relpath(path, REPO)}")
    print(out["verdict"])
    if "--print" in argv:
        print(json.dumps(out, indent=2, ensure_ascii=False))
    return 0


def _selftest():
    """Fixture-free: pins integrity_gate_distribution() against a synthetic ledger dir — the one piece
    of this module that had zero regression protection before it existed (build() itself is exercised
    only against the real, mutable ledger at command-run time)."""
    import contextlib
    import io
    import tempfile

    global REPO, CONV, THESES, TICKS, STATE_DIR

    bad = 0

    def check(label, cond):
        nonlocal bad
        print(f"  [{'ok' if cond else 'XX'}] {label}")
        if not cond:
            bad += 1

    with tempfile.TemporaryDirectory() as td:
        dist, n, t = integrity_gate_distribution(td)
        check("empty dir -> (({}, 0, 0))", dist == {} and n == 0 and t == 0)

        def write(name, doc):
            json.dump(doc, open(os.path.join(td, name), "w", encoding="utf-8"))

        write("a.json", {"meta": {"thesis_id": "A"}})  # no integrity_review at all -> ignored
        write("b.json", {"meta": {"thesis_id": "B"}, "integrity_review": {"verdict": "Survives", "routing": "Proceed"}})
        write("c.json", {"meta": {"thesis_id": "C"}, "integrity_review": {"verdict": "Thesis broken", "routing": "watchlist_integrity_broken"}})
        write("d.json", {"meta": {"thesis_id": "D"}, "integrity_review": {"verdict": "Does not survive — downgrade", "routing": "watchlist_integrity_downgrade"}})
        write("e.json", {"meta": {"thesis_id": "E"}, "integrity_review": {}})  # empty block, no verdict -> ignored
        write("f.json", ["not", "an", "object"])  # malformed root -> ignored, never raises
        write("g.txt", "not json at all")  # non-.json file -> ignored

        dist, n, t = integrity_gate_distribution(td)
        check("n_reviewed counts only records with a verdict", n == 3)
        check("n_terminal counts only the two terminal routings", t == 2)
        check("distribution tallies each verdict string", dist == {
            "Survives": 1, "Thesis broken": 1, "Does not survive — downgrade": 1,
        })

    # integrity_gate_note must be accurate for the re-review flow: a thesis re-reviewed terminal after
    # surfacing candidates is NOT 'killed pre-surfacing'. Expected phrasing pinned to §5 (no unsupported
    # claim), NOT to the pre-fix string (which asserted 'killed pre-surfacing' — the bug this guards).
    check("note: n=0 -> honest 'nothing recorded yet'",
          integrity_gate_note(0, 0, {}) == "No thesis-integrity reviews recorded yet.")
    note = integrity_gate_note(1, 3, {"Survives": 2, "Thesis broken": 1})
    check("note: never claims 'pre-surfacing' (unverifiable for re-reviews)", "pre-surfacing" not in note)
    check("note: states the terminal/reviewed counts", "1 of 3" in note)
    check("note: never presents a hit-rate as measured", "hit_rate stays null" in note)
    inferred = execution_identity({}, {
        "provider": "claude", "basis": "pre_rollout_cockpit_history", "verified": True,
    })
    guessed = execution_identity({}, {
        "provider": "claude", "basis": "record_age_only", "verified": True,
    })
    check("sole-Claude legacy needs an explicit audited cockpit-history proof",
          inferred["pipeline_provider"] == "legacy_inferred_claude"
          and guessed["pipeline_provider"] == "unknown_legacy")

    original_paths = (REPO, CONV, THESES, TICKS, STATE_DIR)
    with tempfile.TemporaryDirectory() as td:
        CONV = os.path.join(td, "conviction")
        THESES = os.path.join(td, "theses")
        TICKS = os.path.join(CONV, "conviction.ndjson")
        STATE_DIR = os.path.join(CONV, "conviction_state")
        os.makedirs(THESES)
        os.makedirs(STATE_DIR)

        def provenance(provider, *, mode="single_provider", attribution="recorded"):
            contributors = [{
                "provider": provider, "model": f"{provider}-parent", "reasoning_level": "max",
                "attribution": attribution, "scopes": ["terminal_adjudication"],
            }, {
                "provider": provider, "model": f"{provider}-specialist", "reasoning_level": "xhigh",
                "attribution": "configured", "scopes": ["specialists"],
            }]
            profile = f"{provider}|{provider}-parent:max|{provider}-specialist:xhigh"
            if mode == "mixed_provider":
                contributors.append({
                    "provider": "claude", "model": "claude-parent", "reasoning_level": "high",
                    "attribution": "recorded", "scopes": ["prior_modules"],
                })
                profile = "mixed|claude|claude-parent:high+codex|codex-parent:max"
            elif mode == "partially_observed":
                contributors.append({
                    "provider": provider, "model": None, "reasoning_level": None,
                    "attribution": "configured", "scopes": ["prior_unobserved"],
                })
            contributors = sorted(contributors, key=lambda item: (
                item["provider"], item.get("model") or "", item.get("reasoning_level") or "",
                item["attribution"],
            ))
            return {
                "schema_version": "1.0", "source": "cockpit_runtime",
                "coverage": "cockpit_top_level_processes", "provider_mode": mode,
                "profile_key": profile,
                "decision_author": {
                    "attempt_id": "00000000-0000-4000-8000-000000000001",
                    "provider": provider, "model": f"{provider}-parent",
                    "reasoning_level": "max", "attribution": attribution,
                },
                "contributors": contributors, "cli_versions": {provider: "synthetic"},
            }

        rows = []

        def add_thesis(thesis_id, provider=None, *, mode="single_provider", attribution="recorded",
                       verdict="confirmed", error=None, archived=False, edge=60):
            record = {"meta": {"thesis_id": thesis_id, "created_at": "2026-01-01T00:00:00Z"}}
            if provider:
                record["execution_provenance"] = provenance(
                    provider, mode=mode, attribution=attribution)
            with open(os.path.join(THESES, f"{thesis_id}.json"), "w", encoding="utf-8") as handle:
                json.dump(record, handle)
            realized = 1 if verdict == "confirmed" else 0
            row = {
                "row_type": "validation_result", "checkpoint_id": f"CHK-{thesis_id}",
                "thesis_id": thesis_id, "verdict": verdict, "checked_at": "2026-02-01T00:00:00Z",
                "predicted_prob": 0.8, "realized": realized,
                # Deliberately misleading telemetry proves calibration joins the immutable thesis instead.
                "provider": "claude" if provider == "codex" else "codex",
            }
            if error:
                row["error_taxonomy_tag"] = error
            rows.append(row)
            with open(os.path.join(STATE_DIR, f"{thesis_id}.json"), "w", encoding="utf-8") as handle:
                json.dump({
                    "thesis_id": thesis_id, "archived": archived, "edge_score_live": edge,
                    "provider": row["provider"],
                }, handle)

        for provider in ("claude", "codex"):
            for index in range(10):
                verdict = "against" if provider == "codex" and index >= 8 else "confirmed"
                add_thesis(
                    f"THS-{provider}-{index}", provider, verdict=verdict,
                    error="bad causal inference" if provider == "codex" and index == 8 else None,
                    archived=index >= 5, edge=70 - index,
                )
        add_thesis("THS-mixed", "codex", mode="mixed_provider", verdict="against", error="bad math")
        add_thesis("THS-partial", "codex", mode="partially_observed", verdict="against", error="missing data")
        add_thesis("THS-configured", "codex", attribution="configured", verdict="against", error="missing data")
        add_thesis("THS-legacy", None, verdict="against", error="stale data")
        os.makedirs(CONV, exist_ok=True)
        with open(TICKS, "w", encoding="utf-8") as handle:
            for row in rows:
                handle.write(json.dumps(row) + "\n")

        try:
            provider_out = build()
            by_provider = provider_out["calibration_by_provider"]
            check("provider schema extension is separately versioned",
                  provider_out["provider_calibration_schema_version"] == "1.0")
            check("Claude independently clears Brier subject and raw-N floors",
                  by_provider["claude"]["forecast_author_calibration"]["status"] == "available"
                  and by_provider["claude"]["forecast_author_calibration"]["n_subjects"] == 10)
            check("mixed forecast follows its recorded Codex terminal author",
                  by_provider["codex"]["forecast_author_calibration"]["n"] == 12
                  and by_provider["mixed"]["forecast_author_calibration"]["n"] == 0)
            check("exact author and whole-pipeline profiles are stratified independently",
                  provider_out["calibration_by_execution_profile"]
                  ["codex|codex-parent:max"]["forecast_author_calibration"]["n"] == 12
                  and provider_out["calibration_by_execution_profile"]
                  ["codex|codex-parent:max|codex-specialist:xhigh"]
                  ["pipeline_directional"]["n"] == 10)
            check("mixed/partial/configured-invalid/legacy outcomes remain separate pipeline cohorts",
                  by_provider["mixed"]["pipeline_directional"]["n"] == 1
                  and by_provider["partially_observed"]["pipeline_directional"]["n"] == 1
                  and by_provider["unknown"]["pipeline_directional"]["n"] == 1
                  and by_provider["unknown_legacy"]["pipeline_directional"]["n"] == 1)
            check("basket proxy applies its N=5 floor per provider and exact horizon",
                  by_provider["claude"]["pipeline_basket_outcomes"]["selected"]["current_state"]["status"] == "available"
                  and by_provider["codex"]["pipeline_basket_outcomes"]["discarded"]["current_state"]["status"] == "available")
            check("error taxonomy is a provider count even below metric floors",
                  by_provider["mixed"]["error_taxonomy_distribution"] == {"bad math": 1}
                  and by_provider["unknown_legacy"]["error_taxonomy_distribution"] == {"stale data": 1})
            check("provider comparison refuses blending, ranking, and haircuts",
                  provider_out["provider_comparison"]["status"] == "ready_for_side_by_side"
                  and provider_out["provider_comparison"]["ranking"] is None
                  and "No blended provider hit rate" in provider_out["provider_comparison"]["policy"])
            check("missing provenance remains labelled unknown legacy",
                  provider_out["legacy_provider_sensitivity"]["unknown_legacy"] == 1)
        finally:
            REPO, CONV, THESES, TICKS, STATE_DIR = original_paths

    with tempfile.TemporaryDirectory() as td:
        REPO = td
        CONV = os.path.join(td, "screener", "ledger", "conviction")
        THESES = os.path.join(td, "screener", "ledger", "theses")
        TICKS = os.path.join(CONV, "conviction.ndjson")
        STATE_DIR = os.path.join(CONV, "conviction_state")
        capture = io.StringIO()
        try:
            with contextlib.redirect_stdout(capture):
                main([])
            first, second = capture.getvalue().splitlines()[:2]
            check("machine WROTE line contains only its repo-relative path",
                  first.startswith("WROTE screener/ledger/conviction/")
                  and " — " not in first and second.startswith("Insufficient resolved history"))
        finally:
            REPO, CONV, THESES, TICKS, STATE_DIR = original_paths

    print(f"screener_calibrate selftest: {'ALL OK' if bad == 0 else f'{bad} FAILED'}")
    return 1 if bad else 0


if __name__ == "__main__":
    if "--selftest" in sys.argv[1:]:
        sys.exit(_selftest())
    sys.exit(main(sys.argv))
