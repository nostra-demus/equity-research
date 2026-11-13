#!/usr/bin/env python3
"""Checks AS (forecast-ledger overdue) and AW (kill-criteria overdue): CLAUDE.md §19 — "a forecast
that cannot be checked later is not a forecast" — and §8, which holds a kill criterion to the same
discipline ("a required test the thesis must survive," not a closing caveat).

Side-effect-free, importable, doctrine logic — extracted from `scripts/eval.py` so the SAME
detection functions can run in more than one place, the same closure already done for the §10
scenario-integrity detectors (`scripts/scenario_integrity_checks.py`):

1. **Retrospective** — `scripts/eval.py` imports these to grade already-committed runs (checks AS
   and AW), as it always has.
2. **Live** — `.claude/commands/research/track.md`'s aggregator imports these directly (no
   duplicated date-parsing logic) so the calls-tracker dashboard and `GET /api/calls` (see the
   byte-identical TypeScript port in `ui/server/src/outputs.ts`) surface overdue forecasts and
   kill criteria without anyone having to remember to run `/research:eval` first (PR #435's
   "suggested next improvement").

`eval.py` cannot be imported directly for this: it runs its whole suite and calls `sys.exit()` at
module scope with no `if __name__ == "__main__":` guard, so importing it executes the CLI. This
module has no such side effect — importing it only defines functions.

Each `eval_*` function is pure: given the ledger/criteria list and `today` (an injected ISO date,
never read from the clock internally), it returns `None` when the input is absent/malformed/
inapplicable, or a list of overdue description strings (empty = nothing due).
"""
import re
import os
import glob
import json
import datetime

def isdate(s):
    try:
        datetime.date.fromisoformat(s)
        return True
    except Exception:
        return False

_MONTHS = {m: i + 1 for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"])}

def due_date_from_text(text):
    """The date a window CLOSES, read out of free text (the ledger's own convention, e.g. 'Q2 2026
    earnings July 31, 2026' / 'FY2026 results release (~March 2027)'). ISO date, 'Month DD, YYYY',
    or bare 'Month YYYY' (closes on the 28th, the only day every month has). None if undateable."""
    tw = str(text or "")
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", tw)
    if m and isdate(m.group(0)):
        return m.group(0)
    m = re.search(r"([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})", tw)
    if m and m.group(1)[:3].lower() in _MONTHS:
        cand = f"{m.group(3)}-{_MONTHS[m.group(1)[:3].lower()]:02d}-{int(m.group(2)):02d}"
        # validate the constructed date: 'Feb 30, 2026' matches the regex but is not a real
        # calendar date — an unvalidated invalid date must not be returned as a due date.
        if isdate(cand):
            return cand
    m = re.search(r"([A-Za-z]{3,9})\s+(\d{4})", tw)
    if m and m.group(1)[:3].lower() in _MONTHS:
        return f"{m.group(2)}-{_MONTHS[m.group(1)[:3].lower()]:02d}-28"
    return None

def _as_due_date(entry):
    """forecast_ledger's own due date: prefers an explicit resolve/due field, else free-text
    time_window."""
    for k in ("resolves_on", "due_date", "resolve_by"):
        v = entry.get(k)
        if isdate(v):
            return v
    return due_date_from_text(entry.get("time_window"))

AS_RESOLVED = ("confirmed", "falsified", "expired", "resolved", "closed", "superseded", "void", "withdrawn")

# ---- review linkage (the learning loop's read-back) -------------------------------------------------
# decision_record.json is immutable after publication (frameworks/DECISION_LEDGER.md), so its
# forecast_ledger[].status stays `open` forever. The RESOLUTION of a forecast lives in the append-only
# outcome reviews (`reviews/*_decision_review*.json`, `forecast_results[]`, written by
# /research:review-decisions). A ledger-only AS can therefore never clear: on 2026-11-12 it reported 44
# "unresolved" forecasts of which 12 had already been confirmed/falsified/expired by a filed review —
# false alarms that bury the genuinely unchecked ones in the cockpit's "needs attention" list.
#
# The link is deliberately CONSERVATIVE (§24 — prefer omission to a mis-attributed resolution): a review
# row resolves ledger entry i only through (a) an explicit 1-based `forecast_index`, (b) a deliberate
# 'forecast #N' / 'prediction #N' token, or (c) prediction text identical (trimmed, case-folded) to
# exactly ONE ledger row. No positional guess (forecast_results is routinely a re-ordered subset) and no
# fuzzy text match. After those existing routes, one terminal ASCII full stop may differ only when
# the sentence key is unique across EVERY ledger row. The pure fallback below is also reused by
# scripts/calibrate.py; caller normalization and reference precedence remain reader-specific. This
# module stays dependency-free (commit-run.sh's prewrite workspace copies just eval.py +
# data_need_contract.py + this file).
#
# The LATEST review that mentions an entry speaks for it (a later review supersedes an earlier read,
# as in calibrate). If that latest read is unresolved but an EARLIER review had resolved it, the entry
# stays flagged and the description names the contradiction — a resolution silently walked back is a
# learning-loop defect a human must adjudicate (§3: do not average away contradictions), not a clear.

def _review_norm(s):
    return " ".join(s.split()).lower() if isinstance(s, str) else ""

def forecast_sentence_key(normalized_prediction):
    """Fallback key for an already caller-normalized prediction. Remove only one terminal ASCII
    full stop; never trim again, normalize other punctuation, or accept a punctuation-only claim."""
    if not isinstance(normalized_prediction, str):
        return ""
    sentence = normalized_prediction.removesuffix(".")
    return sentence if sentence and any(ch.isalnum() for ch in sentence) else ""


def unique_forecast_sentence_targets(normalized_predictions):
    """Map each unique sentence key to its original ledger index. Include EVERY original row;
    callers must not pre-filter rows by probability, status, or scoring eligibility."""
    counts, targets = {}, {}
    for i, prediction in enumerate(normalized_predictions):
        key = forecast_sentence_key(prediction)
        if key:
            counts[key] = counts.get(key, 0) + 1
            targets[key] = i
    return {key: i for key, i in targets.items() if counts[key] == 1}


_REF_RE = re.compile(r"(?:forecast|prediction|fc)\s*#\s*(\d+)|^#\s*(\d+)$")

def _review_version(name):
    m = re.search(r"_v(\d+)\.json$", str(name or ""), re.I)
    return int(m.group(1)) if m else 1

def review_forecast_links(forecast_ledger, reviews):
    """{ledger index: {"status", "review_date", "earlier_resolution": (status, date) | None}} for every
    ledger entry some review row deliberately refers to. `reviews` is a list of parsed review dicts; an
    optional `_basename` key orders same-day append-only corrections (`_v2`). Pure; never raises on
    malformed input (a malformed row is simply unlinked)."""
    if not isinstance(forecast_ledger, list) or not isinstance(reviews, list):
        return {}
    n = len(forecast_ledger)
    counts = {}
    for e in forecast_ledger:
        k = _review_norm(e.get("prediction")) if isinstance(e, dict) else ""
        if k:
            counts[k] = counts.get(k, 0) + 1
    by_sentence = unique_forecast_sentence_targets(
        [_review_norm(e.get("prediction")) if isinstance(e, dict) else "" for e in forecast_ledger])
    by_text = {}
    for i, e in enumerate(forecast_ledger):
        k = _review_norm(e.get("prediction")) if isinstance(e, dict) else ""
        if k and counts[k] == 1:
            by_text[k] = i

    def _target(row):
        idx = row.get("forecast_index")
        # integral float accepted for parity with the TS port (JSON `2.0` is the number 2 in JS)
        if isinstance(idx, float) and idx.is_integer():
            idx = int(idx)
        if isinstance(idx, int) and not isinstance(idx, bool) and 1 <= idx <= n:
            return idx - 1
        k = _review_norm(row.get("prediction"))
        if k in by_text:
            return by_text[k]
        m = _REF_RE.search(k)
        if m:
            j = int(m.group(1) or m.group(2))
            if 1 <= j <= n:
                return j - 1
        return by_sentence.get(forecast_sentence_key(k))

    revs = [r for r in reviews if isinstance(r, dict)]
    revs.sort(key=lambda r: (str(r.get("review_date") or ""), _review_version(r.get("_basename")),
                             str(r.get("_basename") or "")))
    out = {}
    for r in revs:
        date = str(r.get("review_date") or "")
        rows = r.get("forecast_results")
        if not isinstance(rows, list):
            continue
        for row in rows:
            if not isinstance(row, dict):
                continue
            i = _target(row)
            if i is None:
                continue
            st = _review_norm(row.get("status")) or "unset"
            prev = out.get(i)
            earlier = prev["earlier_resolution"] if prev else None
            if prev and prev["status"] in AS_RESOLVED:
                earlier = (prev["status"], prev["review_date"])
            if st in AS_RESOLVED:
                earlier = None
            out[i] = {"status": st, "review_date": date, "earlier_resolution": earlier}
    return out

def load_run_reviews(run_root):
    """Parsed `reviews/*_decision_review*.json` dicts for one run folder, each tagged with its
    `_basename` (orders same-day `_vN` corrections). Unreadable / non-object files are skipped — a
    malformed file is not a completed review. Reads only; never writes."""
    out = []
    for f in sorted(glob.glob(os.path.join(str(run_root or ""), "reviews", "*_decision_review*.json"))):
        try:
            with open(f, encoding="utf-8") as fh:
                j = json.load(fh)
        except Exception:
            continue
        if isinstance(j, dict):
            out.append(dict(j, _basename=os.path.basename(f)))
    return out

def eval_as_forecast_overdue(forecast_ledger, today, reviews=None):
    """Check AS. Returns None (undateable / empty ledger) or a list of overdue descriptions (empty =
    none due). Pure — `today` is injected so the result is deterministic and callers need no clock.
    `reviews` (optional list of parsed review dicts) lets a filed outcome review settle an entry —
    see the review-linkage block above. Omitted → ledger-only behaviour, unchanged."""
    if forecast_ledger is not None and not isinstance(forecast_ledger, list):
        return None
    fl = forecast_ledger or []
    if not fl or not isdate(today):
        return None
    links = review_forecast_links(fl, reviews) if reviews else {}
    out = []
    for i, e in enumerate(fl):
        if not isinstance(e, dict):
            continue
        status = str(e.get("status") or e.get("outcome") or "").strip().lower()
        # EXACT membership, not substring — see scripts/eval.py's AS check for why a substring test
        # (e.g. 'unresolved' contains 'resolved') would silently settle a still-open forecast.
        if status in AS_RESOLVED:
            continue
        link = links.get(i)
        if link and link["status"] in AS_RESOLVED:
            continue  # resolved by a filed outcome review
        due = _as_due_date(e)
        if not due or due >= today:
            continue
        pred = str(e.get("prediction") or "")[:110]
        desc = f"forecast_ledger[{i}] came due {due} and is still unresolved (status {status or 'unset'}): {pred}"
        if link:
            desc += f" [last reviewed {link['review_date'] or 'undated'}: {link['status']}"
            if link["earlier_resolution"]:
                es, ed = link["earlier_resolution"]
                desc += (f"; CONTRADICTION — the {ed or 'undated'} review recorded '{es}', "
                         f"walked back by the later review; adjudicate")
            desc += "]"
        item = {"due_date": due, "description": desc}
        if link:
            item["last_review"] = {"date": link["review_date"] or None, "status": link["status"]}
            if link["earlier_resolution"]:
                item["contradicted_resolution"] = {"status": link["earlier_resolution"][0],
                                                   "date": link["earlier_resolution"][1] or None}
        out.append(item)
    return out

def _kc_monitor_text(entry):
    if isinstance(entry, dict):
        for f in ("monitor", "monitor_via"):
            v = entry.get(f)
            if isinstance(v, str) and v.strip():
                return v.strip()
    return ""

def _kc_criterion_text(entry):
    if isinstance(entry, str):
        return entry.strip()
    if isinstance(entry, dict):
        for f in ("criterion", "condition", "trigger", "what_invalidates", "kill_criterion", "description", "text"):
            v = entry.get(f)
            if isinstance(v, str) and v.strip():
                return v.strip()
    return ""

def eval_aw_kill_criteria_overdue(kill_criteria, today):
    """Check AW. Reuses eval_as_forecast_overdue's date-extraction against each kill_criteria
    entry's free-text `monitor` field (kill_criteria carries no structured due-date field of its
    own). Returns None (undateable / empty / malformed) or a list of overdue descriptions."""
    if kill_criteria is not None and not isinstance(kill_criteria, list):
        return None
    kc = kill_criteria or []
    if not kc or not isdate(today):
        return None
    out = []
    for i, e in enumerate(kc):
        mon = _kc_monitor_text(e)
        if not mon:
            continue  # no monitor text (e.g. a legacy plain-string entry) — undateable, never flagged
        due = due_date_from_text(mon)
        if not due or due >= today:
            continue
        crit = _kc_criterion_text(e)[:110] or "<empty criterion>"
        out.append({"due_date": due,
                    "description": f"kill_criteria[{i}] monitor event ({due}) has passed and was never checked: {crit}"})
    return out
