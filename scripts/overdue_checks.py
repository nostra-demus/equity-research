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

def eval_as_forecast_overdue(forecast_ledger, today):
    """Check AS. Returns None (undateable / empty ledger) or a list of overdue descriptions (empty =
    none due). Pure — `today` is injected so the result is deterministic and callers need no clock."""
    if forecast_ledger is not None and not isinstance(forecast_ledger, list):
        return None
    fl = forecast_ledger or []
    if not fl or not isdate(today):
        return None
    out = []
    for i, e in enumerate(fl):
        if not isinstance(e, dict):
            continue
        status = str(e.get("status") or e.get("outcome") or "").strip().lower()
        # EXACT membership, not substring — see scripts/eval.py's AS check for why a substring test
        # (e.g. 'unresolved' contains 'resolved') would silently settle a still-open forecast.
        if status in AS_RESOLVED:
            continue
        due = _as_due_date(e)
        if not due or due >= today:
            continue
        pred = str(e.get("prediction") or "")[:110]
        out.append({"due_date": due,
                    "description": f"forecast_ledger[{i}] came due {due} and is still unresolved (status {status or 'unset'}): {pred}"})
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
