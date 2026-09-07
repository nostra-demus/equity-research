#!/usr/bin/env python3
"""commodity_driver_attribution.py — mechanize CLAUDE.md §15 driver-attribution residual rule for
the commodity swarm's macro-drivers orb.

WHY THIS EXISTS
----------------
CLAUDE.md §15 requires any driver-attribution claim to show its own arithmetic and name its
residual: "a large residual is the finding, not a caveat ... never rounded away into a component it
doesn't belong to." .claude/agents/commodity/macro-positioning/01_commodity-macro-drivers.md §1a
(mirrored in MODULE_RULES.md §4a) already implements this in full prose form, and carries the
doctrine's own worked failure — one that is itself a commodity example: the GOLD real-yield/
nominal-yield miss, where a driver explaining ~14% of a -25.1% move was reported as "tracks almost
exactly."

The research (equity) swarm closed the identical gap for its own two driver-attribution specialists
(02_revenue-drivers.md / 03_margin-drivers.md) via the RF-EARN-001/RF-EARN-002 tag + eval check BE
(scripts/rating_caps.py, eval_be_driver_attribution_residual). The PR that shipped check BE named
this exact port — "apply the same tag+eval-check treatment to the commodity module's own
driver-attribution passages ... currently enforced by prose only in that swarm too" — as its own
suggested next step. This script is that port, adapted to the commodity swarm's single-specialist,
percentage-based attribution form (`RF-COMM-001`).

CONTRACT
  • Reads ONE file: <RUN_ROOT>/macro-positioning/01_commodity-macro-drivers.md.
  • Requires a standalone `RF-COMM-001:` tag line inside "## 1a. Attribution of the recent move", in
    exactly one of two forms:
      RF-COMM-001: driver attribution reconciled — explained {N}%, residual {M}%
      RF-COMM-001: driver attribution not attempted — {reason}
  • "reconciled" form: explained + residual must equal 100 within COMM_RECONCILE_TOLERANCE points —
    the same arithmetic-integrity test check BE applies to RF-EARN-001/002 (CLAUDE.md §15).
  • "not attempted" form requires a non-empty reason (a bare dodge fails, matching check BE).
  • Deliberately NOT gated on a rollout date or file mtime. The commodity swarm keeps one persistent
    run folder per commodity with mtime-driven resume/skip (commodity/full.md step 5.1), and full.md
    step 5.1 itself documents that mtimes are "not durable across a fresh clone" — every file lands
    with the checkout time, so mtime cannot prove an orb is stale or fresh. decision_date is no better:
    it can advance (a fresh commodity-thesis synthesis) without macro-drivers itself re-running, since
    module resume decisions are independent per module. The only reliable signal is full.md's own
    step-5.1 resume decision for the macro-positioning module — SKIP vs RERUN — computed fresh on every
    invocation. So this script is invoked ONLY when that decision is RERUN in the CURRENT invocation
    (commodity/full.md step 5.6); a skip-resumed pre-existing run (GOLD/ALUMINIUM/COPPER/WHEAT, none of
    which carry this tag yet) is never blocked by a rule that postdates its last real regeneration.
  • Fails CLOSED like its siblings commodity_forecast_contract.py / commodity_pre_mortem_haircut.py:
    exits nonzero with GATE-FAIL on any violation; only a clean tag (or a not-yet-run orb) exits 0.

CLI:
  python3 scripts/commodity_driver_attribution.py <RUN_ROOT>
  python3 scripts/commodity_driver_attribution.py --selftest
"""
from __future__ import annotations

import os
import re
import sys

COMM_RECONCILE_TOLERANCE = 1.0  # percentage points — independently-rounded explained/residual slack
DRIVER_ATTRIBUTION_TAG = "RF-COMM-001"

_RECON_RE = re.compile(
    r"\breconciled\s*[—–\-:]\s*explained\s+(-?\d+(?:\.\d+)?)\s*%\s*,\s*"
    r"residual\s+(-?\d+(?:\.\d+)?)\s*%",
    re.IGNORECASE,
)
_NOT_ATTEMPTED_RE = re.compile(r"not attempted\b(.*)$", re.IGNORECASE | re.DOTALL)
_NEG_LEADING_STRIP = " \t—–-:"


def _tag_line_rest(txt, tag):
    """Return the cleaned remainder of the FIRST line in `txt` whose leading token (after shedding
    markdown heading/bullet/table/quote/backtick cruft) is `tag`, skipping a first-cell status TABLE
    ROW. Deliberately duplicates scripts/rating_caps.py's `_be_tag_line_rest` (same shape) rather than
    importing/sharing it, so this new commodity-scoped check can never change equity check BE's
    behaviour."""
    if not txt:
        return None
    for raw in txt.splitlines():
        line = raw.strip().lstrip("#-*•>|` \t").rstrip("` \t")
        if not line.startswith(tag):
            continue
        rest = line[len(tag):]
        if rest.lstrip().startswith("|"):
            continue  # first-cell status table row, not a fired standalone tag
        return rest
    return None


def check_text(txt):
    """Validate the RF-COMM-001 tag inside macro-drivers specialist text `txt`. Returns a list of
    violation strings (empty list = pass). Pure, side-effect-free — drives both the CLI and
    --selftest."""
    rest = _tag_line_rest(txt, DRIVER_ATTRIBUTION_TAG)
    if rest is None:
        return [
            f"{DRIVER_ATTRIBUTION_TAG} is absent from 01_commodity-macro-drivers.md — section 1a "
            f"must declare either the reconciled residual or that no decomposition was possible "
            f"(CLAUDE.md §15: 'a large residual is the finding, not a caveat ... never rounded "
            f"away'; MODULE_RULES.md §4a)"]
    not_attempted = _NOT_ATTEMPTED_RE.search(rest)
    if not_attempted:
        reason = not_attempted.group(1).lstrip(_NEG_LEADING_STRIP)
        if not reason.strip():
            return [
                f"{DRIVER_ATTRIBUTION_TAG} declares 'not attempted' with no reason given — "
                f"CLAUDE.md §15 requires stating what's missing, not a bare dodge"]
        return []
    match = _RECON_RE.search(rest)
    if not match:
        return [
            f"{DRIVER_ATTRIBUTION_TAG} does not match either sanctioned form — "
            f"'{DRIVER_ATTRIBUTION_TAG}: driver attribution reconciled — explained {{N}}%, "
            f"residual {{M}}%' or '{DRIVER_ATTRIBUTION_TAG}: driver attribution not attempted — "
            f"{{reason}}' — the residual cannot be verified as stated (CLAUDE.md §15; §11 caps "
            f"must be applied, never silently unverifiable)"]
    explained, residual = (float(g) for g in match.groups())
    if abs((explained + residual) - 100.0) > COMM_RECONCILE_TOLERANCE:
        return [
            f"{DRIVER_ATTRIBUTION_TAG} states explained {explained}% + residual {residual}% = "
            f"{explained + residual}%, which does not reconcile to 100% within "
            f"{COMM_RECONCILE_TOLERANCE}pp (CLAUDE.md §15 driver-attribution arithmetic — 'a "
            f"driver-attribution claim shows its own arithmetic and names its residual')"]
    return []


def check_file(run_root):
    """Read <run_root>/macro-positioning/01_commodity-macro-drivers.md and return check_text()'s
    result. Returns (violations, path): violations is None (not []) when the file itself is missing
    — "orb never ran", nothing to gate — distinct from an empty list (orb ran, tag clean)."""
    path = os.path.join(run_root, "macro-positioning", "01_commodity-macro-drivers.md")
    if not os.path.isfile(path):
        return None, path
    with open(path, encoding="utf-8") as f:
        return check_text(f.read()), path


def _selftest():
    failures = []

    def check(label, cond):
        if not cond:
            failures.append(label)

    check("tag absent -> violation", len(check_text("no tag here")) == 1)
    check("empty text -> violation", len(check_text("")) == 1)

    reconciled = "## 1a\nRF-COMM-001: driver attribution reconciled — explained 14%, residual 86%\n"
    check("clean reconciled -> pass", check_text(reconciled) == [])

    not_attempted = "## 1a\nRF-COMM-001: driver attribution not attempted — no sourced sensitivity\n"
    check("clean not-attempted -> pass", check_text(not_attempted) == [])

    bare_dodge = "## 1a\nRF-COMM-001: driver attribution not attempted —\n"
    v = check_text(bare_dodge)
    check("bare dodge -> violation", len(v) == 1)
    check("bare dodge names the defect", v and "bare dodge" in v[0])

    malformed = "## 1a\nRF-COMM-001: something else entirely\n"
    check("malformed tag -> violation", len(check_text(malformed)) == 1)

    mismatched = "## 1a\nRF-COMM-001: driver attribution reconciled — explained 14%, residual 50%\n"
    v = check_text(mismatched)
    check("arithmetic mismatch -> violation", len(v) == 1)
    check("mismatch names both numbers", v and "14.0%" in v[0] and "50.0%" in v[0])

    edge = "## 1a\nRF-COMM-001: driver attribution reconciled — explained 14.6%, residual 85.9%\n"
    check("within-tolerance rounding -> pass (100.5, 0.5pp slack)", check_text(edge) == [])

    outside = "## 1a\nRF-COMM-001: driver attribution reconciled — explained 14%, residual 84%\n"
    check("outside-tolerance rounding -> violation (98%, 2pp off)", len(check_text(outside)) == 1)

    table_row = "| RF-COMM-001 | some status |\n"
    check("table-cell false positive -> treated as absent", len(check_text(table_row)) == 1)

    heading_cruft = (
        "### **RF-COMM-001: driver attribution reconciled — explained 100%, residual 0%**\n"
    )
    check("heading/bold cruft stripped -> pass", check_text(heading_cruft) == [])

    zero_residual_edge = "## 1a\nRF-COMM-001: driver attribution reconciled — explained 0%, residual 100%\n"
    check("fully-unexplained edge -> pass (still reconciles to 100)", check_text(zero_residual_edge) == [])

    if failures:
        print("SELFTEST FAIL:", ", ".join(failures))
        return 1
    print("SELFTEST OK (all checks passed)")
    return 0


def main(argv):
    if "--selftest" in argv:
        return _selftest()
    if not argv:
        print("usage: commodity_driver_attribution.py <RUN_ROOT> | --selftest", file=sys.stderr)
        return 2
    run_root = argv[0]
    violations, path = check_file(run_root)
    if violations is None:
        print(f"RF-COMM-001: N/A — {path} not found (macro-drivers orb has not run)")
        return 0
    if violations:
        print(f"GATE-FAIL: {'; '.join(violations)}", file=sys.stderr)
        return 1
    print("RF-COMM-001: driver-attribution tag present and reconciled")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
