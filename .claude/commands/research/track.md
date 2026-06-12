---
description: Calls tracker dashboard — every investment call the engine has made and what has happened since (price / thesis / forecasts), with due/overdue review checkpoints. Read-only aggregator; writes a dated markdown + JSON dashboard. Phase 5 viewing layer.
argument-hint: [SCOPE]
allowed-tools: Read, Glob, Bash, Write
---

You build the **calls-tracker dashboard** — the place to see, in one view, every call the engine has made (`decision_record.json`, Phase 2) and **what has happened to the company since** (the append-only outcome reviews under `reviews/`, Phase 3), as time moves forward. It implements `frameworks/DECISION_LEDGER.md` **Phase 5** (a read-only viewing/aggregation layer), and it is the offline/downloadable twin of the cockpit's live "Calls" view (`GET /api/calls`).

**Hard discipline.** You are **READ-ONLY** on every `decision_record.json`, `final_thesis.md`, and review file. You never edit, re-emit, or repair any record or review. You write only a *derived, regenerable* dated dashboard under `analyses/tracking/` (like Phase 4's `analyses/performance/` outputs). You compute **no new price or outcome** — you only assemble what reviews already filed; the live "update since now" is Phase 3's job (`/research:review-decisions <ticker> ad-hoc`), which is why this command has **no Web tools**. The due/overdue rule here is the **same rule as `.claude/hooks/review_due.py` and `review-decisions.md` Step 3** (local date, lexical ISO compare, review-file glob `*_<window>_decision_review*.json`) — keep them identical so the hook, the command, and `/api/calls` never disagree. Arguments: `$ARGUMENTS`.

---

## 1. Resolve scope & today

`$ARGUMENTS` is an optional `SCOPE`: empty/`all` → every decision record; a ticker → that ticker's records only (best-effort; default to `all`). Resolve `<TODAY>` via `date +%F`.

## 2. Aggregate the ledger + reviews (deterministic, no Web)

Run the embedded script below via Bash. It discovers every `analyses/*/decision_record.json`, gathers each run's `reviews/*_decision_review*.json`, builds one `call` row per record (the **exact shape `GET /api/calls` returns**, so the dashboard and the cockpit agree), and writes both the JSON and the human-readable markdown dashboard. It is read-only on all records/reviews and writes only inside `analyses/tracking/`.

```bash
SCOPE="${ARGUMENTS:-all}" python3 - <<'PY'
import json, glob, os, subprocess, re
SCOPE = (os.environ.get("SCOPE") or "all").strip() or "all"
today = subprocess.check_output(["date", "+%F"]).decode().strip()

def isdate(s):  # strict zero-padded YYYY-MM-DD — only then is lexical compare valid (mirrors review_due.py)
    return isinstance(s, str) and bool(re.match(r"^\d{4}-\d{2}-\d{2}$", s))

def load(f):
    try: return json.load(open(f, encoding="utf-8"))
    except Exception: return None

def reviews_for(run_root):
    out = []
    for rf in sorted(glob.glob(os.path.join(run_root, "reviews", "*_decision_review*.json"))):
        j = load(rf)
        if not isinstance(j, dict): continue
        fr = j.get("forecast_results") or []
        conf = sum(1 for r in fr if str((r or {}).get("status", "")).lower() == "confirmed")
        fals = sum(1 for r in fr if str((r or {}).get("status", "")).lower() == "falsified")
        md = j.get("memo_delta") if isinstance(j.get("memo_delta"), dict) else {}
        out.append({"file": rf, "basename": os.path.basename(rf),
                    "review_window": j.get("review_window") or "", "review_date": j.get("review_date") or "",
                    "review_price": j.get("review_price"), "absolute_return_pct": j.get("absolute_return_pct"),
                    "thesis_status": j.get("thesis_status") or None,
                    "forecasts_confirmed": conf, "forecasts_falsified": fals,
                    "memo_delta_file": (md.get("memo_delta_file") or None),
                    "stage_one_comment": (md.get("stage_one_comment") or None)})
    return out

def winner(files):  # latest review_date, tie-break lexically-newest basename
    return sorted(files, key=lambda r: (r["review_date"], r["basename"]), reverse=True)[0] if files else None

def build_timeline(schedule, reviews):
    out, keys = [], list((schedule or {}).keys())
    for w in keys:
        dt = schedule[w]
        if not isdate(dt): continue
        matches = [r for r in reviews if ("_%s_decision_review" % w) in r["basename"]]
        win = winner(matches)
        if win:
            e = {"window": w, "due_date": dt, "status": "done", "review_date": win["review_date"],
                 "review_price": win["review_price"], "absolute_return_pct": win["absolute_return_pct"],
                 "thesis_status": win["thesis_status"], "forecasts_confirmed": win["forecasts_confirmed"],
                 "forecasts_falsified": win["forecasts_falsified"], "review_file": win["file"], "review_count": len(matches)}
            if win.get("memo_delta_file"): e["memo_delta_file"] = win["memo_delta_file"]      # keys present only when set,
            if win.get("stage_one_comment"): e["stage_one_comment"] = win["stage_one_comment"]  # matching /api/calls exactly
            out.append(e)
        else:
            out.append({"window": w, "due_date": dt,
                        "status": ("overdue" if dt < today else ("due" if dt == today else "upcoming"))})
    for r in reviews:  # ad-hoc / non-scheduled reviews: each a distinct point in time
        if any(("_%s_decision_review" % w) in r["basename"] for w in keys): continue
        e = {"window": r["review_window"] or "ad-hoc", "due_date": r["review_date"] or None, "status": "done",
             "review_date": r["review_date"], "review_price": r["review_price"], "absolute_return_pct": r["absolute_return_pct"],
             "thesis_status": r["thesis_status"], "forecasts_confirmed": r["forecasts_confirmed"],
             "forecasts_falsified": r["forecasts_falsified"], "review_file": r["file"]}
        if r.get("memo_delta_file"): e["memo_delta_file"] = r["memo_delta_file"]
        if r.get("stage_one_comment"): e["stage_one_comment"] = r["stage_one_comment"]
        out.append(e)
    out.sort(key=lambda t: t["due_date"] or "9999-99-99")
    return out

calls = []
for drp in sorted(glob.glob("analyses/*/decision_record.json")):
    d = load(drp)
    if not isinstance(d, dict): continue
    if not (d.get("ticker") and d.get("decision") and d.get("decision_date")):
        continue
    if SCOPE not in ("all", "") and d.get("ticker") != SCOPE:
        continue
    run_root = d.get("run_root") or os.path.dirname(drp)
    reviews = reviews_for(run_root)
    timeline = build_timeline(d.get("review_schedule") or {}, reviews)
    lat = winner(reviews)
    entry, exp = d.get("entry_price"), d.get("expected_return_pct")
    fc = {"open": 0, "confirmed": 0, "falsified": 0, "expired": 0, "other": 0}
    for f in (d.get("forecast_ledger") or []):
        s = str((f or {}).get("status", "open")).lower()
        if s in fc: fc[s] += 1
        else: fc["other"] += 1
    pending = (next((t for t in timeline if t["status"] == "overdue"), None)
               or next((t for t in timeline if t["status"] == "due"), None)
               or next((t for t in timeline if t["status"] == "upcoming"), None))
    implied = round(entry * (1 + exp / 100.0), 2) if isinstance(entry, (int, float)) and isinstance(exp, (int, float)) else None
    calls.append({
        "ticker": d.get("ticker"), "company": d.get("company_name"), "decision_date": d.get("decision_date"),
        "decision": d.get("decision"), "basket": d.get("basket"),
        # prefer post_review_confidence_score (post-red-team) over the raw synthesizer number when present (fix F28)
        "confidence": d.get("post_review_confidence_score") if d.get("post_review_confidence_score") is not None else d.get("confidence_score"),
        "confidence_is_post_review": d.get("post_review_confidence_score") is not None,
        "time_horizon": d.get("time_horizon"), "entry_price": entry, "currency": d.get("currency"),
        "expected_return_pct": exp, "implied_target": implied, "downside_risk_pct": d.get("downside_risk_pct"),
        "kill_criteria_count": len(d.get("kill_criteria") or []), "forecasts": fc,
        "run_root": run_root, "final_thesis_path": d.get("final_thesis_path") or os.path.join(run_root, "final_thesis.md"),
        "latest_thesis_status": (lat or {}).get("thesis_status"),
        "next_checkpoint": ({"window": pending["window"], "due_date": pending["due_date"], "status": pending["status"]} if pending else None),
        "review_count": len(reviews), "timeline": timeline,
    })
calls.sort(key=lambda c: c.get("decision_date") or "", reverse=True)

os.makedirs("analyses/tracking", exist_ok=True)
base = f"analyses/tracking/{today}_calls_tracker"
jf, k = base + ".json", 2
while os.path.exists(jf): jf = f"{base}_v{k}.json"; k += 1
mf = jf[:-5] + ".md"
json.dump({"schema_version": "1.0", "generated_at": today, "scope": SCOPE, "n_calls": len(calls), "calls": calls},
          open(jf, "w", encoding="utf-8"), indent=2, ensure_ascii=False)

def cell(v, suf=""):
    return ("—" if v is None or v == "" else f"{v}{suf}")
def ret(v):
    return "—" if not isinstance(v, (int, float)) else (f"+{v:.1f}%" if v >= 0 else f"{v:.1f}%")

H = [f"# Calls Tracker — {today}\n",
     "> Every call the engine has made and what has happened since (price / thesis / forecasts), with "
     "due/overdue review checkpoints. Read-only, regenerated by `/research:track`; the decision of record "
     "stays in each run's `decision_record.json` and `final_thesis.md`. Live updates: "
     "`/research:review-decisions <ticker> ad-hoc`.\n",
     f"- Generated: {today}  ·  Scope: {SCOPE}  ·  Calls: {len(calls)}\n"
     f"- `*` on a confidence score = post-red-team (pre-mortem haircut applied; fix F28)\n",
     "## All calls\n",
     "| Company | Ticker | Called | Verdict | Horizon | Latest status | Next checkpoint |",
     "| --- | --- | --- | --- | --- | --- | --- |"]
for c in calls:
    nc = c["next_checkpoint"]
    nxt = "—" if not nc else f'{nc["window"]} ({nc["status"]} {cell(nc["due_date"])})'
    H.append(f'| {cell(c["company"])} | {c["ticker"]} | {cell(c["decision_date"])} | {cell(c["decision"])} | '
             f'{cell(c["time_horizon"])} | {cell(c["latest_thesis_status"])} | {nxt} |')
parts = ["\n".join(H)]
for c in calls:
    cur = (c.get("currency") or "").strip()
    tgt = "—" if c["implied_target"] is None else f'{cur} {c["implied_target"]}'
    parts.append(
        f'\n\n---\n\n## {cell(c["company"])} ({c["ticker"]}) — {cell(c["decision"])}\n\n'
        f'- Called **{cell(c["decision_date"])}**  ·  basket {cell(c["basket"])}  ·  '
        f'confidence {cell(c["confidence"])}/100{"*" if c.get("confidence_is_post_review") else ""}  ·  horizon {cell(c["time_horizon"])}\n'
        f'- The call as given: entry {cur} {cell(c["entry_price"])}  ·  expected return {ret(c["expected_return_pct"])} '
        f'(implied target {tgt})  ·  downside {ret(c["downside_risk_pct"])}  ·  {c["kill_criteria_count"]} kill criteria  ·  '
        f'forecasts {c["forecasts"]["confirmed"]}✓/{c["forecasts"]["falsified"]}✗ of {sum(c["forecasts"].values())}\n'
        f'- Thesis: `{c["final_thesis_path"]}`\n\n'
        '### Since the call\n\n'
        '| Window | Due | Status | Reviewed | Price | Return | Thesis | Forecasts ✓/✗ |\n'
        '| --- | --- | --- | --- | --- | --- | --- | --- |')
    rows = []
    for t in c["timeline"]:
        rows.append(f'| {t["window"]} | {cell(t.get("due_date"))} | {t["status"]} | {cell(t.get("review_date"))} | '
                    f'{cell(t.get("review_price"))} | {ret(t.get("absolute_return_pct"))} | {cell(t.get("thesis_status"))} | '
                    f'{cell(t.get("forecasts_confirmed"))}/{cell(t.get("forecasts_falsified"))} |')
    parts.append("\n".join(rows) if rows else "_(no review schedule on this call)_")
    delta_lines = []  # the human-readable "what changed since the memo" tier, when a review filed one (§8 memo_delta)
    for t in c["timeline"]:
        if not (t.get("memo_delta_file") or t.get("stage_one_comment")): continue
        delta_lines.append(f'- **{t["window"]} memo delta:** `{cell(t.get("memo_delta_file"))}`')
        if t.get("stage_one_comment"):
            delta_lines.append("  > " + " ".join(str(t["stage_one_comment"]).split()))
    if delta_lines:
        parts.append("\n### Memo deltas (what changed since the memo)\n\n" + "\n".join(delta_lines))
open(mf, "w", encoding="utf-8").write("\n".join(parts) + "\n")
print(f"WROTE {jf}")
print(f"WROTE {mf}")
print(f"calls={len(calls)} scope={SCOPE} today={today}")
PY
```

## 3. Validate the JSON

```bash
ls -1t analyses/tracking/*_calls_tracker.json | head -n 1 | xargs -I{} python3 -m json.tool {} >/dev/null && echo "OK valid JSON" || echo "FAIL invalid JSON"
```

If invalid, fix and rewrite before committing.

## 4. Human-readable summary

Print: the dashboard paths written, the number of calls, and a one-line-per-call roll-up (ticker, decision, latest thesis status, next checkpoint due/overdue). If there are zero decision records, say so plainly and skip the commit.

## 5. Commit and push to main

Per repo `CLAUDE.md` git policy: commit straight to `main`. No branches. No PRs. Only `git add` the dated dashboard files you created:

```bash
bash scripts/commit-run.sh "Calls tracker: <N> calls (<TODAY>)" -- "analyses/tracking/<TODAY>_calls_tracker*"
```

Capture and report the commit SHA from `git rev-parse HEAD`. If no dashboard was written, skip the commit.

---

## Hard rules

- **Read-only** on every `decision_record.json`, `final_thesis.md`, and review file; writes only dated `analyses/tracking/<DATE>_calls_tracker.{md,json}` (a derived, regenerable aggregate).
- **No Web, no new outcomes.** This command aggregates already-filed reviews. The live "update since now" is `/research:review-decisions <ticker> ad-hoc` (Phase 3) — do not fetch prices here.
- The due/overdue rule is the **same** as `.claude/hooks/review_due.py` and `review-decisions.md` Step 3 (local date, lexical ISO compare, `*_<window>_decision_review*.json` glob). Do not re-derive it differently.
- The `calls[]` JSON shape **matches `GET /api/calls`** so the dashboard and the cockpit Calls Tracker never disagree — including the per-checkpoint `memo_delta_file` / `stage_one_comment` lifted from each review's §8 `memo_delta` block (keys present only when the review carries them).
- Append-only / non-destructive: a same-day re-run gets a `_v2`, `_v3`, … suffix; it never overwrites a prior dashboard.
- Spawns no subagents. Grounded in `frameworks/DECISION_LEDGER.md` §5/§7/§8 (Phase 5).
