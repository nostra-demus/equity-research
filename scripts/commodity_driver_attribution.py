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
  • The caller decides whether a specialist was actually dispatched; a module's RERUN status and
    file mtimes do not prove this. The publication pipeline uses --require-report so a missing
    expected report fails. Standalone inspection may report a missing orb as N/A.
  • This checks the declaration's arithmetic only. The specialist and synthesis must still verify
    the multiplication, sensitivity basis, price units and agreement with the report's evidence.
  • Fails CLOSED like its siblings commodity_forecast_contract.py / commodity_pre_mortem_haircut.py:
    exits nonzero with GATE-FAIL on any violation; only a clean tag (or a not-yet-run orb) exits 0.

CLI:
  python3 scripts/commodity_driver_attribution.py <RUN_ROOT> [--require-report]
  python3 scripts/commodity_driver_attribution.py --selftest
"""
from __future__ import annotations

import argparse
import math
import os
import re
import sys

COMM_RECONCILE_TOLERANCE = 1.0  # percentage points — independently-rounded explained/residual slack
DRIVER_ATTRIBUTION_TAG = "RF-COMM-001"

_RECON_RE = re.compile(
    r"driver attribution reconciled\s*[—–\-:]\s*explained\s+(-?\d+(?:\.\d+)?)\s*%\s*,\s*"
    r"residual\s+(-?\d+(?:\.\d+)?)\s*%",
    re.IGNORECASE,
)
_NOT_ATTEMPTED_RE = re.compile(r"driver attribution not attempted\s*[—–\-:]\s*(.*)", re.IGNORECASE)
_NEG_LEADING_STRIP = " \t—–-:"
_HEADING_RE = re.compile(r"^ {0,3}(#{1,6})[ \t]+(.*)$")
_SECTION_RE = re.compile(r"1a\.?(?:\s|$)", re.IGNORECASE)
_FENCE_RE = re.compile(r"^ {0,3}(`{3,}|~{3,})(.*)$")
_THEMATIC_BREAK_RE = re.compile(r" {0,3}(?:(?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})")


def _tag_line_rest(txt, tag):
    """Require one declaration closing one level-two Section 1a, outside code examples."""
    lines = txt.splitlines()
    headings = []
    visible = set()
    fence = None
    for index, raw in enumerate(lines):
        marker = _FENCE_RE.match(raw)
        if fence is not None:
            if marker and marker[1][0] == fence[0] and len(marker[1]) >= len(fence) and not marker[2].strip():
                fence = None
            continue
        if marker:
            fence = marker[1]
            continue
        visible.add(index)
        heading = _HEADING_RE.match(raw)
        if heading:
            headings.append((index, len(heading[1]), heading[2].strip()))
    sections = [index for index, level, title in headings if level == 2 and _SECTION_RE.match(title)]
    if len(sections) != 1:
        raise ValueError(f"{tag} requires exactly one Section 1a attribution heading; found {len(sections)}")
    start = sections[0]
    end = next((index for index, level, _ in headings if index > start and level <= 2), len(lines))
    declarations = []
    for index in range(start + 1, end):
        if index not in visible or lines[index].startswith(("    ", "\t")):
            continue
        # A table cell is not a standalone declaration. Preserve ordinary Markdown emphasis.
        line = lines[index].strip().lstrip("#-*•>` \t").rstrip("*` \t")
        if re.match(re.escape(tag) + r"(?![\w-])", line):
            declarations.append((index, line))
    if len(declarations) != 1:
        raise ValueError(f"{tag} requires exactly one standalone declaration in Section 1a; found {len(declarations)}")
    index, line = declarations[0]
    # Existing commodity reports separate sections with thematic breaks; these add no qualification.
    if any(raw.strip() and not _THEMATIC_BREAK_RE.fullmatch(raw) for raw in lines[index + 1:end]):
        raise ValueError(f"{tag} must close Section 1a; put qualifications before the declaration")
    if not line.startswith(tag + ":"):
        raise ValueError(f"{tag} must be followed by ':' and a sanctioned declaration")
    return line[len(tag) + 1:].strip()


def _validate_text(txt):
    """Return (violations, validated declaration) without changing the report."""
    try:
        rest = _tag_line_rest(txt, DRIVER_ATTRIBUTION_TAG)
    except ValueError as exc:
        return [str(exc)], None
    not_attempted = _NOT_ATTEMPTED_RE.fullmatch(rest)
    if not_attempted:
        reason = not_attempted.group(1).lstrip(_NEG_LEADING_STRIP)
        if not reason.strip():
            return [
                f"{DRIVER_ATTRIBUTION_TAG} declares 'not attempted' with no reason given — "
                f"CLAUDE.md §15 requires stating what's missing, not a bare dodge"], None
        return [], f"{DRIVER_ATTRIBUTION_TAG}: driver attribution not attempted — {reason}"
    match = _RECON_RE.fullmatch(rest)
    if not match:
        return [
            f"{DRIVER_ATTRIBUTION_TAG} does not match either sanctioned form — "
            f"'{DRIVER_ATTRIBUTION_TAG}: driver attribution reconciled — explained {{N}}%, "
            f"residual {{M}}%' or '{DRIVER_ATTRIBUTION_TAG}: driver attribution not attempted — "
            f"{{reason}}' — the residual cannot be verified as stated (CLAUDE.md §15; §11 caps "
            f"must be applied, never silently unverifiable)"], None
    explained, residual = (float(g) for g in match.groups())
    if not all(math.isfinite(value) for value in (explained, residual, explained + residual)):
        return [f"{DRIVER_ATTRIBUTION_TAG} explained and residual percentages must be finite"], None
    if abs((explained + residual) - 100.0) > COMM_RECONCILE_TOLERANCE:
        return [
            f"{DRIVER_ATTRIBUTION_TAG} states explained {explained}% + residual {residual}% = "
            f"{explained + residual}%, which does not reconcile to 100% within "
            f"{COMM_RECONCILE_TOLERANCE}pp (CLAUDE.md §15 driver-attribution arithmetic — 'a "
            f"driver-attribution claim shows its own arithmetic and names its residual')"], None
    return [], (f"{DRIVER_ATTRIBUTION_TAG}: driver attribution reconciled — "
                f"explained {match[1]}%, residual {match[2]}%")


def check_text(txt):
    """Return violations (empty list = valid declaration); pure API for contract tests."""
    return _validate_text(txt)[0]


def check_file(run_root, *, require_report=False):
    """Return (violations, path, declaration); only standalone missing-file inspection is N/A."""
    path = os.path.join(run_root, "macro-positioning", "01_commodity-macro-drivers.md")
    try:
        with open(path, encoding="utf-8") as f:
            violations, declaration = _validate_text(f.read())
        return violations, path, declaration
    except FileNotFoundError:
        return ([f"required macro-drivers report is missing: {path}"] if require_report else None), path, None
    except (OSError, UnicodeError) as exc:
        return [f"cannot read macro-drivers report {path}: {exc}"], path, None


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
        "## 1a\n### **RF-COMM-001: driver attribution reconciled — explained 100%, residual 0%**\n"
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
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("run_root", nargs="?")
    parser.add_argument("--require-report", action="store_true", help="fail if a dispatched report is missing")
    parser.add_argument("--selftest", action="store_true")
    args = parser.parse_args(argv)
    if args.selftest:
        if args.run_root or args.require_report:
            parser.error("--selftest cannot be combined with a run root or --require-report")
        return _selftest()
    if not args.run_root:
        parser.error("a run root is required")
    violations, path, declaration = check_file(args.run_root, require_report=args.require_report)
    if violations is None:
        print(f"RF-COMM-001: N/A — {path} not found (macro-drivers orb has not run)")
        return 0
    if violations:
        print(f"GATE-FAIL: {'; '.join(violations)}", file=sys.stderr)
        return 1
    print(declaration)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
