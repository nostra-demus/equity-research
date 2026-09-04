#!/usr/bin/env python3
"""Conviction/score-cap detectors: the §24 rejector filters (Filters 1, 2, 4, 5, 6 — CLAUDE.md §24),
the §13 cross-module forensic-mosaic cap (CLAUDE.md §13 / synthesizer.md Pre-Write Gate step 4B),
and the §16 Sector Cycle Reality Test compounding cap (CLAUDE.md §16 / valuation/MODULE_RULES.md).

Side-effect-free, importable, doctrine logic — extracted from `scripts/eval.py` (checks
AC/AD/AE/AF, and now AQ/BB) so the SAME detection functions can run in TWO places instead of one:

1. **Retrospective** — `scripts/eval.py` imports these to grade already-committed runs
   (checks AC/AD/AE/AF), as it always has.
2. **Live, pre-publish** — `/research:full` Step 10B.1 (the deterministic finish-gate that
   also runs on every `/research:rerun`, per fix F-RRGATE) imports these to check a thesis
   BEFORE it ships, stamping `final_thesis.md` PROVISIONAL on a violation instead of letting
   it commit clean. Before this module existed, the §24 rejector-filter caps were enforced
   only by prose instruction to the synthesizer LLM (synthesizer.md Pre-Write Gate 4A) plus
   this post-hoc eval check — nothing stopped a violation from shipping to `main` in real
   time. `EMAAR_2026-07-03` is a live, currently-committed proof this happened: its
   management-governance synthesis fired RF-OWN-004 (§24 Filter 6, unaligned controlling
   owner) and the published decision was "Starter Position Only," one notch above the
   "maximum Watchlist" cap synthesizer.md's own Rating Cap Rules require — caught only when
   `eval.py` was run against it after the fact, and not gating (the run lacks
   `RUN_METADATA.md`, so `eval.py`'s `gate_eligible` check downgrades its failures to
   advisory). Importing this module into the live finish-gate closes that hole for every
   future run: the exact same tag-detection logic that flags a violation on `/research:eval`
   now flags it before the thesis is committed, no bypass clause, no reliance on a human
   remembering to run `eval.py` afterward.

Each `eval_*_cap` function is pure: given the decision, its date, and the relevant module
synthesis/specialist text (or None if the module didn't run), it returns:
  - `None`  — not applicable (pre-gate date, or the source module never ran)
  - `[]`    — applicable and satisfied (checked, no violation)
  - `[...]` — one or more violation strings (the cap fired and the decision exceeds it)
(`eval_ac_turnaround_cap` is one exception — it predates this convention and returns the
string `'pass' | 'fail' | 'na'`; kept as-is rather than changed at import time. `eval_bb_
sector_cycle_compounding_cap` is the other — it caps a NUMERIC score, not the decision
enum, so it takes no `decision` argument; its None/[]/[...] return convention is otherwise
identical.)

No caller may treat a violation as fatal — CLAUDE.md §13 requires caps to be *applied*, not
used to silently kill a run. Both call sites (eval.py, the finish-gate) turn a non-empty
result into a visible flag (a FAIL row, or a PROVISIONAL banner) — never a silent abort.
"""

import re


def isdate(s):
    try:
        import datetime
        datetime.date.fromisoformat(s)
        return True
    except Exception:
        return False


def isnum(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)  # bool is an int subclass — exclude it


# Conviction decisions (Selected longs + Short) — mirrors eval.py's HIGH_CONVICTION_DECISIONS
# (scripts/eval.py, used there by checks O/U/X/Y too). Duplicated rather than imported: eval.py
# is a top-level CLI script (executes on import), not a library, so this module cannot import
# FROM it — eval.py imports FROM this module instead (see the module docstring). Both lists are
# CLAUDE.md §18's four conviction-decision strings and must stay in sync if that set ever changes.
HIGH_CONVICTION_DECISIONS = {"Strong Buy", "Buy", "Starter Position Only", "Short Candidate"}

# ── Check AC (§24 Filter 2 turnaround conviction cap) ────────────────────────────────────
# The synthesizer's Rating Cap Rules document that a "Governance turnaround" thesis_type is
# capped at "Starter Position Only" or below (CLAUDE.md §24 Filter 2: "the base rate of
# turnaround success is low ... a turnaround thesis without [≥2–3 yrs delivered improvement]
# carries a base-rate penalty and a conviction cap, and is classified honestly as a governance-
# turnaround thesis"). That cap lived only in the synthesizer's prompt — this check closes the
# mechanical enforcement gap by reading thesis_type from the committed decision_record.json.
#
# No edge exception: unlike the external-variable cap (Z), the turnaround cap has no edge-score
# bypass. If delivered improvement was proven, the thesis reclassifies away from "Governance
# turnaround" — so the type is self-declaring the inflection unproven. "Short Candidate" is
# intentionally excluded from ABOVE_STARTER_AC: shorting a failing turnaround is a distinct,
# valid high-conviction thesis.
#
# Landing date: 2026-06-27 (forward-looking; all three golden fixtures predate → N/A → suite green).
AC_DATE = "2026-06-27"
TURNAROUND_TYPE = "Governance turnaround"
ABOVE_STARTER_AC = {"Strong Buy", "Buy"}  # decisions that exceed the turnaround cap ceiling

def eval_ac_turnaround_cap(decision, decision_date, thesis_type):
    """Core of check AC. Returns 'pass' | 'fail' | 'na'.
    Side-effect-free + module-level so the selftest exercises the logic without run fixtures."""
    if not (isdate(decision_date) and decision_date >= AC_DATE):
        return "na"   # forward-looking; pre-gate runs N/A
    if not isinstance(thesis_type, list):
        return "na"   # type mismatch → check B handles it
    if TURNAROUND_TYPE not in thesis_type:
        return "pass"  # no governance-turnaround type → cap not triggered
    return "fail" if decision in ABOVE_STARTER_AC else "pass"

# ── Check AD (§24 Filters 4 + 6 conviction cap) ─────────────────────────────────────────────
# §24 Filter 4 (serial acquirers) and Filter 6 (unaligned owners) both carry a conviction cap
# that the synthesizer's Rating Cap Rules make explicit: "serial-acquirer pattern (RF-CAP-004)
# or unaligned controlling owner (RF-OWN-004) → maximum 'Watchlist'." That cap lived only in
# the synthesizer's prompt — this check closes the mechanical enforcement gap.
#
# Detection: agents embed standardised red-flag tags in their synthesis outputs per MODULE_RULES.
#   RF-CAP-004 (serial acquirer, §24 Filter 4) is emitted by the management-governance module's
#     02_capital-allocation-scorecard agent and surfaces in management-governance/99_*-synthesis.md.
#     The business-model module caps the Filter-4 score via its 11_capital-allocation-governance
#     agent but emits NO RF-CAP-004 tag string — so the tag is read primarily from the MG
#     synthesis, and the BM synthesis is also scanned defensively in case a future BM agent ever
#     surfaces it. (Reading RF-CAP-004 from the BM synthesis ALONE was a bug: the tag never lands
#     there, so the Filter-4 cap could never fire — see the TMCV_2026-06-07 fixture, which fired
#     RF-CAP-004 in its MG synthesis only.)
#   RF-OWN-004 (unaligned owner, §24 Filter 6) is emitted by the management-governance module's
#     04_ownership-and-insider-behavior agent and surfaces in management-governance/99_*-synthesis.md.
# Either tag present in a module synthesis + a conviction decision = a doctrine violation
# (synthesizer.md Rating Cap Rules; CLAUDE.md §24 Filters 4 and 6).
#
# No bypass clause: unlike the BSS "Distress risk" cap (which the "Balance-sheet survival"
# thesis type can bypass for a distressed-play run), both Filter 4 and Filter 6 caps fire
# regardless of thesis type — a serial acquirer or misaligned-owner thesis cannot receive a
# conviction long regardless of classification. "Short Candidate" IS intentionally included:
# HIGH_CONVICTION_DECISIONS covers shorts, and the cap doctrine does not carve out an exception
# for shorting these companies — a value-trap short is a market-neutral thesis (Pair Trade /
# Hedge Required); a conviction short against an unaligned owner or serial acquirer still
# requires overriding the standard "max Watchlist" cap.
#
# Filter 4 (RF-CAP-004) is scanned in BOTH the BM and MG synthesis; Filter 6 (RF-OWN-004) in the
# MG synthesis only. When the MG module is absent, RF-OWN-004 cannot be detected (Filter 6 N/A)
# and RF-CAP-004 falls back to the BM synthesis. When BOTH module syntheses are absent: full N/A.
# Landing date: 2026-06-28 (forward-looking; all golden fixtures predate → N/A → suite green).
AD_DATE = "2026-06-28"
CAP4_TAG = "RF-CAP-004"  # serial acquirer (§24 Filter 4)
CAP6_TAG = "RF-OWN-004"  # unaligned owner (§24 Filter 6)

def eval_ad_filter_4_6_cap(decision, decision_date, bm_txt, mg_txt):
    """Check AD: §24 Filters 4 (RF-CAP-004 serial acquirer) + 6 (RF-OWN-004 unaligned owner).
    Returns None (N/A — pre-gate or both module syntheses absent), or a list of violation strings
    (empty list = pass). Side-effect-free + module-level so eval.py selftest can drive it.
    RF-CAP-004 and RF-OWN-004 are both management-governance synthesis tags; RF-CAP-004 is also
    scanned in the business-model synthesis defensively (the BM module emits no such tag today)."""
    if not (isdate(decision_date) and decision_date >= AD_DATE):
        return None  # forward-looking; pre-gate runs N/A
    # If both module synthesis texts are absent the check is N/A — modules didn't run
    if bm_txt is None and mg_txt is None:
        return None
    conviction = decision in HIGH_CONVICTION_DECISIONS
    violations = []
    # RF-CAP-004 (serial acquirer) is surfaced in the management-governance synthesis; scan the BM
    # synthesis too so the Filter-4 cap fires wherever the tag is surfaced. Detection requires a FIRED
    # standalone tag line (_tag_fired_standalone), NOT a bare substring: every MG synthesis carries the
    # standing §24 cap-application rows (e.g. `| Serial-acquirer pattern (… RF-CAP-004) | N |`) regardless
    # of whether the cap fired, so a bare `in` match false-FAILs a clean conviction run (verified on the
    # real TMCV_2026-06-14 / BG_2026-06-07 fixtures, where the tags appear only as "N — not fired" rows).
    # Mirrors check AE's detection.
    cap4_fired = _tag_fired_standalone(bm_txt, CAP4_TAG) or _tag_fired_standalone(mg_txt, CAP4_TAG)
    if cap4_fired and conviction:
        violations.append(
            f"§24 Filter 4 (RF-CAP-004 serial-acquirer) fired in module synthesis "
            f"but decision={decision!r} exceeds the Watchlist cap "
            f"(synthesizer.md Rating Cap Rules: max Watchlist for serial-acquirer pattern; "
            f"CLAUDE.md §24 Filter 4)")
    if mg_txt is not None and _tag_fired_standalone(mg_txt, CAP6_TAG) and conviction:
        violations.append(
            f"§24 Filter 6 (RF-OWN-004 unaligned owner) fired in MG synthesis "
            f"but decision={decision!r} exceeds the Watchlist cap "
            f"(synthesizer.md Rating Cap Rules: max Watchlist for unaligned controlling owner; "
            f"CLAUDE.md §24 Filter 6)")
    return violations  # empty list = all caps satisfied

# ── Check AE (§24 Filter 5 fast-changing-industry conviction cap) ─────────────────────────────────
# §24 Filter 5: "In industries that change fast, the winners are rarely knowable in advance, and
# value destruction from disruption is large … High rate-of-change / disruption risk lowers the
# business-quality score and caps conviction, and such a thesis is flagged as a sector /
# technology-cycle bet rather than a durable compounder." The synthesizer's Rating Cap Rules
# document this, but unlike Filters 2/4/6 (checks AC/AD), no eval check enforced it mechanically.
# This closes the last gap in the §24 mechanical enforcement family.
#
# Detection: the business-quality agent (07_business-quality.md) emits RF-BQ-005 when the industry
# rate-of-change / disruption row scores ≤40; the BM synthesis (99_business-model-synthesis.md)
# propagates it. When RF-BQ-005 appears in the BM synthesis AND no proven edge (edge_score ≥ 50)
# exists, the decision must not be "Strong Buy" or "Buy" — cap is "Starter Position Only" or lower.
#
# Edge bypass: if edge_score ≥ 50 (proven durable winner per §7), the cap lifts; a company that
# demonstrably dominates a fast-changing space despite disruption risk has earned the higher rating.
# Short Candidate is intentionally NOT in ABOVE_STARTER_AE: shorting a fast-changing-industry loser
# is a distinct, valid thesis with a different risk profile from owning — cap logic for shorts lives
# in checks Y (weak data) and Z (external-variable, no-edge macro/commodity/policy bets).
#
# Landing date: 2026-06-29 (forward-looking; all golden fixtures predate → N/A → suite green).
AE_DATE = "2026-06-29"
CAP5_TAG = "RF-BQ-005"  # fast-changing industry (§24 Filter 5)
ABOVE_STARTER_AE = {"Strong Buy", "Buy"}  # decisions exceeding the "Starter Position Only" cap
# Negative/status phrasings that, at the START of a leading-tag line's remainder, mean the cap did
# NOT fire (the tag is being reported as cleared). Keeps the detector from false-positiving on a
# "RF-BQ-005 not triggered" status line (Codex review, P2). The match is STATUS-SHAPED — anchored to
# the start of the remainder, NEVER matched anywhere inside it — so a genuinely-fired line whose
# rationale merely contains a broad word ("RF-BQ-005 (… ≤40) — durable-winner proof absent", or
# "… mitigants none") still counts as fired (Codex review, P2 — negations must be anchored).
_CAP_TAG_NEGATIONS = ("not triggered", "not applicable", "n/a", "not fired", "did not fire",
                      "none", "absent", "cleared", "no cap")
# Leading separators that can sit between the tag and a status word, so the negation check anchors to
# the status position regardless of an em/en dash, colon, or wrapping parens ("RF-BQ-005 (not triggered)").
_NEG_LEADING_STRIP = " \t:.–—-()"

def _tag_fired_standalone(txt, tag):
    """True iff `tag` appears as a FIRED standalone tag line in `txt` — a line whose first non-markup
    token is `tag` and whose remainder is neither a status table row nor a negation. Deliberately does
    NOT match:
      • a parenthetical / table-row mention where the tag is not the leading token (e.g. the MG-style
        cap-application rows `| Serial-acquirer pattern (… RF-CAP-004) | N | … |`, which carry the tag
        string in EVERY synthesis regardless of whether the cap fired — bare substring matching there
        is a false positive, the defect Codex flagged for AE);
      • a FIRST-CELL status table row (`RF-BQ-005 | N | … |`), where the tag IS the leading cell but the
        row is a cap-application status grid, not a fired standalone tag — the remainder begins with a
        column separator `|` (Codex review, P2 — leading-tag table rows must not fire);
      • a negation/status line whose remainder STARTS with a cleared phrasing (`RF-BQ-005 not triggered`,
        `RF-BQ-005 (n/a)`). The negation is anchored to the start, so "absent"/"none" buried later in a
        fired tag's rationale no longer suppresses a real fire (Codex review, P2).
    A standalone tag emitted as a Markdown heading (`### RF-BQ-005 (…)`) still counts as fired — the `#`
    markers are shed alongside the bullet/quote/table cruft so a heading-styled fire is not missed (a
    false negative would silently bypass the cap, CLAUDE.md §11; Codex review, P2).
    Matches the agent convention exactly: the business-quality specialist and the BM synthesis emit the
    tag `as a standalone line` ONLY when the cap fires (07_business-quality.md / 99 synthesis)."""
    if not txt:
        return False
    for raw in txt.splitlines():
        line = raw.strip().lstrip("#-*•>|` \t").rstrip("` \t")  # shed md heading/bullet/table/quote/backtick cruft
        if not line.startswith(tag):
            continue
        rest = line[len(tag):]
        if rest.lstrip().startswith("|"):
            continue  # first-cell status TABLE ROW (`RF-BQ-005 | N | …`), not a fired standalone tag
        status = rest.lstrip(_NEG_LEADING_STRIP).lower()  # anchor the negation to the status position
        if any(status.startswith(neg) for neg in _CAP_TAG_NEGATIONS):
            continue  # cleared/negation status line, not a fired tag
        return True
    return False

def eval_ae_filter5_cap(decision, decision_date, bm_txt, edge_score, bq_txt=None):
    """Check AE: §24 Filter 5 fast-changing-industry conviction cap.
    Returns None (N/A — pre-gate, or BOTH the BM synthesis and the business-quality source absent),
    or a list of violation strings (empty list = pass). Side-effect-free + module-level so the
    selftest can drive it.
    bm_txt: BM 99_*-synthesis.md text, or None.
    bq_txt: 07_business-quality.md specialist text, or None. Scanned in ADDITION to the synthesis so a
            synthesis that forgets to propagate the tag still fires the cap — RF-BQ-005's SOURCE emitter
            is the specialist, and reading the roll-up alone lets a missed propagation silently bypass
            the cap (CLAUDE.md §11: caps are applied, never silently overridden). This mirrors the AD
            fix that reads RF-CAP-004 from its MG source, not the roll-up alone (Codex review, P2).
    edge_score: decision_record edge_score field, or None (absent → no proven edge).
    Detection requires a FIRED standalone tag line (see _tag_fired_standalone), not a bare substring,
    so a cleared/cap-table mention of the tag does not false-positive (Codex review, P2)."""
    if not (isdate(decision_date) and decision_date >= AE_DATE):
        return None  # forward-looking; pre-gate runs N/A
    if bm_txt is None and bq_txt is None:
        return None  # BM module did not run (no synthesis AND no specialist); cap cannot fire — N/A
    # Edge bypass: proven durable winner lifts the fast-changing-industry cap
    proven_edge = isnum(edge_score) and edge_score >= 50
    if proven_edge:
        return []  # edge_score ≥ 50 → cap exception; any rating allowed
    violations = []
    cap5_fired = _tag_fired_standalone(bm_txt, CAP5_TAG) or _tag_fired_standalone(bq_txt, CAP5_TAG)
    if cap5_fired and decision in ABOVE_STARTER_AE:
        violations.append(
            f"§24 Filter 5 (RF-BQ-005 fast-changing industry) fired in BM synthesis or "
            f"business-quality specialist but decision={decision!r} exceeds the 'Starter Position Only' cap "
            f"(synthesizer.md Rating Cap Rules: fast-changing-industry thesis with no "
            f"proven durable winner → cap conviction; CLAUDE.md §24 Filter 5; "
            f"edge_score={edge_score!r} < 50 — no edge bypass)")
    return violations  # empty list = pass

# ── Check AF (§24 Filter 1 crooks/integrity conviction cap) ────────────────────────────────────────
# §24 Filter 1: "A controller or senior manager who has defrauded customers, suppliers, employees, or
# shareholders is a reason to walk away … Soft, unverified adverse signal ('buzz') about integrity
# must be investigated and must lower confidence — it is not discarded because a clean report
# exists." Proven fraud is a hard disqualifier already mechanically enforced by check AB (the BM
# disqualifier verdict-lock, since disqualifier-scan routes a proven fact to its own lock). The SOFT,
# unresolved-"buzz" endpoint is different: business-model/01_disqualifier-scan routes it, unlocked,
# to management-governance/01_management-and-track-record, which is instructed to record it and cap
# conviction — but until now no standardised tag or eval check enforced that cap, unlike Filters
# 2/4/5/6 (checks AC/AD/AE). (AE's own comment overclaimed this filter was already covered by
# "AA/AB" — true only for the hard-fraud endpoint, not this conviction-cap-only middle case CLAUDE.md
# §24 explicitly says must not be discarded.) This closes the last gap in the §24 family.
#
# Detection: 01_management-and-track-record.md emits RF-MGT-005 as a standalone line when a routed,
# unresolved integrity signal is present and not cleared; the MG synthesis (99) propagates it.
#
# Ceiling: "Watchlist" — stricter than Filters 2/5's "Starter Position Only" ceiling, matching
# Filters 4/6. CLAUDE.md §24 frames integrity as the FIRST and most severe of the six filters
# ("Cheapness does not compensate for a dishonest operator"), so the conservative default (CLAUDE.md
# §4) sets this cap at least as strict as the other structural-owner/capital-allocation caps.
#
# No edge-score bypass (unlike AE): a proven business edge does not cure an unresolved integrity
# concern — the two are orthogonal. Short Candidate is intentionally NOT in ABOVE_WATCHLIST_AF:
# shorting a company on credible-but-unproven integrity concerns is a distinct, valid forensic-short
# thesis (the Chanos-style short), not the risk the cap guards against — mirrors how AC/AE exclude
# Short Candidate for the same reason.
#
# Landing date: 2026-07-02 (forward-looking; all golden fixtures predate → N/A → suite green).
AF_DATE = "2026-07-02"
CAP1_TAG = "RF-MGT-005"  # unresolved adverse integrity signal, unproven (§24 Filter 1)
ABOVE_WATCHLIST_AF = {"Strong Buy", "Buy", "Starter Position Only"}  # decisions exceeding the "Watchlist" cap

def eval_af_filter1_integrity_cap(decision, decision_date, mg_txt, track_txt=None):
    """Check AF: §24 Filter 1 crooks/integrity conviction cap (the unresolved-"buzz" case; proven
    fraud is a hard disqualifier already covered by check AB). Returns None (N/A — pre-gate, or BOTH
    the MG synthesis and the 01_management-and-track-record source specialist absent), or a list of
    violation strings (empty list = pass). Side-effect-free + module-level so eval.py selftest can
    drive it.
    mg_txt: management-governance 99_*-synthesis.md text, or None.
    track_txt: 01_management-and-track-record.md specialist text, or None. Scanned in ADDITION to
    the synthesis so a synthesis that forgets to propagate the tag still fires the cap — RF-MGT-005's
    SOURCE emitter is the specialist, and reading the roll-up alone lets a missed propagation silently
    bypass the cap (CLAUDE.md §11: caps are applied, never silently overridden). This mirrors how AD
    reads RF-CAP-004 from its MG source and AE reads RF-BQ-005 from its 07 source.
    Detection requires a FIRED standalone tag line (see _tag_fired_standalone), not a bare substring,
    so a cleared/cap-table mention of the tag does not false-positive."""
    if not (isdate(decision_date) and decision_date >= AF_DATE):
        return None  # forward-looking; pre-gate runs N/A
    if mg_txt is None and track_txt is None:
        return None  # management-governance module did not run; cap cannot fire — N/A
    violations = []
    cap1_fired = _tag_fired_standalone(mg_txt, CAP1_TAG) or _tag_fired_standalone(track_txt, CAP1_TAG)
    if cap1_fired and decision in ABOVE_WATCHLIST_AF:
        violations.append(
            f"§24 Filter 1 (RF-MGT-005 unresolved integrity signal) fired in MG synthesis or "
            f"management-and-track-record specialist but decision={decision!r} exceeds the "
            f"'Watchlist' cap (synthesizer.md Rating Cap Rules: unresolved adverse integrity signal, "
            f"not yet proven → maximum Watchlist; CLAUDE.md §24 Filter 1; no edge-score bypass — a "
            f"proven business edge does not cure an unresolved integrity concern)")
    return violations  # empty list = pass

# ── Check AQ (§13 cross-module forensic-mosaic conviction cap) ────────────────────────────────────
# CLAUDE.md §13: "a critical governance, solvency, accounting, fraud, or going-concern red flag must
# cap the final rating ... Red flags are captured through a standardized trigger mechanism (auditor
# or CFO resignation, promoter pledge, related-party transactions above threshold, cash-conversion
# breakdown, contingent-liability spikes, regulatory action, insider selling ahead of bad results, and
# similar). When a governance red flag surfaces in any module, it is escalated, not absorbed."
# synthesizer.md Pre-Write Gate step 4B operationalizes this as the "cross-module forensic roll-up":
# tabulate every forensic/accounting-integrity finding across ALL modules — INCLUDING the Medium/Low
# ones each module's own synthesis is otherwise allowed to summarise or omit — and if three or more
# INDEPENDENT, distinctly-sourced signals point the same way, treat the compound as a single High
# accounting-integrity flag. Until now that step was pure prose ("a look, not a mechanical auto-cap")
# with zero mechanical enforcement, unlike its five §24 sibling caps (AC/AD/AE/AF above) — flagged as
# the next-highest-leverage gap when AG shipped (PR #321): "Mechanizing it requires first giving the
# upstream agents that feed it a stable finding-ID tagging convention ... before eval.py can count
# distinct fired tags." This check is that mechanization's first slice.
#
# Detection: eight standalone-line tags, each the SOURCE emitter for one distinct §13 trigger, spanning
# four modules (mirrors the AD/AE/AF pattern of scanning both the specialist source AND the module
# synthesis so a missed propagation still fires the cap):
#   RF-EQ-001   — rising accruals divergent from cash earnings     (earnings/06_earnings-quality.md)
#   RF-EQ-002   — cash-conversion breakdown                        (earnings/06_earnings-quality.md)
#   RF-OBS-001  — contingent-liability spike                       (balance-sheet-survival/05_off-balance-sheet-and-contingencies.md)
#   RF-DISC-001 — commentary contradicting the numbers              (management-governance/06_candor-and-disclosure-quality.md)
#   RF-DISC-002 — recurring "one-off" / aggressive non-GAAP add-backs (management-governance/06_candor-and-disclosure-quality.md)
#   RF-REG-002  — delayed results / material-disclosure timeliness (management-governance/06_candor-and-disclosure-quality.md)
#   RF-DISQ-001 — multiple sub-threshold disqualifier near-misses  (business-model/01_disqualifier-scan.md)
#   RF-RFS-001  — aggressive accounting practice pattern           (business-model/12_red-flags-sweep.md)
# Each module synthesis (earnings/99, balance-sheet-survival/99, management-governance/99,
# business-model/99) propagates whatever its specialists fired. RF-DISQ-001 and RF-RFS-001 were added
# after the check first shipped — until then business-model/01 and /12 were an explicitly-documented
# gap: real forensic-relevant findings from those two specialists (disqualifier near-misses, aggressive
# accounting patterns) existed only as prose the mosaic LOOK could see, never as a tag the mechanical
# scan could count. Each of the two new tags is itself already a compounding signal at its source
# (RF-DISQ-001 requires ≥2 near-misses; RF-RFS-001 requires severity ≥50), so it counts as ONE distinct
# forensic signal here, same as any other module's tag — this does not lower the bar, it closes the
# blind spot in the module coverage.
#
# Threshold (deliberately narrower than a bare "3 tags anywhere"): fires only when BOTH (a) three or
# more DISTINCT tags are fired, AND (b) those tags span two or more DISTINCT modules. A single module
# firing several of its own tags is that module's own known weakness — its own score already reflects
# it (e.g. candor's Disclosure Candor Score is built from these same components) — not the cross-
# module "mosaic" §13/4B describes ("rising accruals AND a contingent-liability spike AND recurring
# non-GAAP add-backs", each from a DIFFERENT source). Requiring both conditions keeps this check a
# genuine cross-module compounder, not a duplicate of a cap the owning module's synthesis already
# applies.
#
# Ceiling and bypass: the compound is explicitly a "High" (not Critical) flag per 4B's own text, so it
# does not reach the Critical-flag hard lock ("Avoid"/"Watchlist") — it caps conviction at "Starter
# Position Only," the same ceiling as the other non-hard-lock §24 "High"-tier caps (AC turnaround, AE
# fast-changing industry). No edge-score bypass: unlike AE (where a proven durable winner genuinely
# mitigates disruption risk), a business edge does not cure numbers that look cooked — this mirrors
# AC/AD/AF's conservative default (CLAUDE.md §4), not AE's exception. "Short Candidate" is intentionally
# excluded from the ceiling: a forensic short built on a credible accounting mosaic is exactly the
# Chanos-style short thesis this cap protects, not the risk it guards against (same rationale as
# AC/AE/AF excluding Short Candidate).
#
# Landing date: 2026-07-24 (forward-looking; every committed golden fixture predates it → N/A → suite green).
AQ_DATE = "2026-07-24"
FORENSIC_TAGS = {
    # tag: (owning module dir, source specialist filename prefix, one-line description)
    "RF-EQ-001":   ("earnings", "06_", "rising accruals divergent from cash earnings"),
    "RF-EQ-002":   ("earnings", "06_", "cash-conversion breakdown"),
    "RF-OBS-001":  ("balance-sheet-survival", "05_", "contingent-liability spike"),
    "RF-DISC-001": ("management-governance", "06_", "commentary contradicting the numbers"),
    "RF-DISC-002": ("management-governance", "06_", "recurring \"one-off\" / aggressive non-GAAP add-backs"),
    "RF-REG-002":  ("management-governance", "06_", "delayed results / material-disclosure timeliness"),
    "RF-DISQ-001": ("business-model", "01_", "multiple sub-threshold disqualifier near-misses"),
    "RF-RFS-001":  ("business-model", "12_", "aggressive accounting practice pattern"),
}
ABOVE_STARTER_AQ = {"Strong Buy", "Buy"}  # decisions that exceed the "Starter Position Only" cap
MOSAIC_MIN_DISTINCT_TAGS = 3     # CLAUDE.md §13 / synthesizer.md 4B: "three or more independent ... signals"
MOSAIC_MIN_DISTINCT_MODULES = 2  # a cross-MODULE mosaic, not one module's own several weaknesses

def eval_aq_forensic_mosaic_cap(decision, decision_date, module_synth_txt, module_specialist_txt):
    """Check AQ: §13 cross-module forensic-mosaic conviction cap (synthesizer.md Pre-Write Gate 4B).
    Returns None (N/A — pre-gate, or none of the four source modules/specialists are present), or a
    list of violation strings (empty list = pass). Side-effect-free + module-level so eval.py selftest
    can drive it.
    module_synth_txt / module_specialist_txt: dicts keyed by the four owning module dirs
    ('earnings', 'balance-sheet-survival', 'management-governance', 'business-model') mapping to that
    module's 99_*-synthesis.md text / the relevant specialist text (each value may be None if that
    module or specialist did not run). Business-model owns two tags from two different specialists
    (RF-DISQ-001 from 01_, RF-RFS-001 from 12_) — its 'business-model' entry in module_specialist_txt
    is the concatenation of both specialist texts (the caller's job; this function only keys by
    module, same as every other module here). Every FORENSIC_TAGS tag is scanned in BOTH its synthesis
    and its specialist source (see module docstring) so a synthesis that forgets to propagate a fired
    tag still counts toward the mosaic — mirrors how AD/AE/AF read their tags from the specialist
    source, not the roll-up alone (CLAUDE.md §11: caps are applied, never silently overridden)."""
    if not (isdate(decision_date) and decision_date >= AQ_DATE):
        return None  # forward-looking; pre-gate runs N/A
    if not any((module_synth_txt or {}).values()) and not any((module_specialist_txt or {}).values()):
        return None  # none of the four owning modules ran at all — N/A
    fired_by_module = {}
    for tag, (mod, _prefix, _desc) in FORENSIC_TAGS.items():
        synth = (module_synth_txt or {}).get(mod)
        spec = (module_specialist_txt or {}).get(mod)
        if _tag_fired_standalone(synth, tag) or _tag_fired_standalone(spec, tag):
            fired_by_module.setdefault(mod, set()).add(tag)
    distinct_tags = sorted({t for tags in fired_by_module.values() for t in tags})
    distinct_modules = len(fired_by_module)
    if len(distinct_tags) < MOSAIC_MIN_DISTINCT_TAGS or distinct_modules < MOSAIC_MIN_DISTINCT_MODULES:
        return []  # mosaic threshold not met — no compound flag, nothing to cap
    if decision in ABOVE_STARTER_AQ:
        return [
            f"§13 cross-module forensic mosaic: {len(distinct_tags)} distinct forensic tags fired "
            f"across {distinct_modules} modules ({', '.join(distinct_tags)}) but decision={decision!r} "
            f"exceeds the 'Starter Position Only' cap (synthesizer.md Pre-Write Gate step 4B: three or "
            f"more independent, distinctly-sourced forensic signals compound into a single High "
            f"accounting-integrity flag; CLAUDE.md §13 — do not average a red flag away; no edge-score "
            f"bypass)"]
    return []  # empty list = pass (mosaic fired but decision is at/below the ceiling, or Short Candidate)

# ── Check BB (§16 Sector Cycle Reality Test compounding cap, valuation module) ────────────────────
# CLAUDE.md §16: "a reversion target or a peer median is only a stable anchor if it isn't itself
# cycle-distorted ... a peer-median read and an own-history reversion that both sit inside the same
# shared sector cycle are not two independent corroborating reads — they are one distorted read
# counted twice." valuation/MODULE_RULES.md's Sector Cycle Reality Test (§3, added by the PR that
# introduced the doctrine) requires `02_multiples-own-history` and `03_relative-valuation-peers` to
# each flag their reference point cycle-elevated/depressed when the sector materially re-rated over
# the reference window, and requires `99_valuation-synthesis` to cap the COMBINED base-case
# "Valuation confidence" score at 55 (not 60 — the single-method cap) when BOTH specialists flag the
# SAME direction, because their agreement is one shared sector cycle counted twice, not independent
# corroboration. Until now that compounding cap existed only as prose in three files (02, 03, 99) —
# unlike its five sibling §13/§24 caps (checks AC/AD/AE/AF/AQ above), nothing verified a run that
# actually tripped the compounding condition (both specialists flagging the same direction) actually
# held its stated confidence score to the cap. `02`/`03` are also the module's OWN default
# majority-weighted methods (Method-Weighting Policy §1), so an unenforced cap here sits at the
# load-bearing center of the base case for most runs, not an edge case.
#
# Detection: `02`/`03` each emit a standalone tag line where they flag the reference point —
# `RF-VAL-001` (cycle-elevated) or `RF-VAL-002` (cycle-depressed) — mirroring the RF-* convention
# checks AD/AE/AF/AQ already read (see _tag_fired_standalone). The SAME two tags are used in both
# files; which specialist fired a given tag is known from which file is being read, so no separate
# per-specialist tag pair is needed. The compounding trigger is BOTH files firing the SAME tag
# (both RF-VAL-001, or both RF-VAL-002) — one flagged elevated and the other depressed is not a
# shared distortion and does not trigger this cap.
#
# What gets checked: NOT the decision enum (unlike AC/AD/AE/AF/AQ) — this caps a NUMERIC score,
# "Valuation confidence /100", which `99_valuation-synthesis.md` states in its own Verdict block
# (§1). Reading that number directly out of `99`'s own text, rather than decision_record.json's
# `module_scores.valuation.score` (a loosely-specified field — synthesizer.md documents it only as
# "module-level scores from module syntheses," with no guarantee it carries this SPECIFIC one of the
# module's six §12 scores), keeps the check pinned to the exact figure the doctrine names and avoids
# a whole class of false-positive/false-negative risk from an ambiguous downstream field.
#
# Landing date: 2026-08-28 (forward-looking; the RF-VAL-00x tags did not exist in any agent file
# before this check shipped, so no run before this date could possibly emit them — every committed
# golden fixture predates it → N/A → suite green).
BB_DATE = "2026-08-28"
CYCLE_ELEV_TAG = "RF-VAL-001"  # Sector Cycle Reality Test: reference point cycle-elevated
CYCLE_DEPR_TAG = "RF-VAL-002"  # Sector Cycle Reality Test: reference point cycle-depressed
BB_COMPOUND_CAP = 55  # combined base-case Valuation confidence ceiling when 02 AND 03 agree

# The captured score must be a COMPLETE whole-number token: the trailing negative lookahead rejects a
# match that is really the leading part of a decimal (`55.9`) or a range (`55–60`, `55 to 60`,
# `55%–60%`) — otherwise
# `\d{1,3}` would truncate `55.9`/`55–60` to `55`, silently PASSING a stated confidence that actually
# exceeds the cap (Codex review P2). A malformed token no longer matches → the score reads unparseable →
# the caller fails closed with a "could not be parsed" violation (CLAUDE.md §11: caps must be applied,
# never silently unverifiable; §12/§15: the score is a whole number out of 100).
_BB_CONF_RE = re.compile(
    r"^\s*(?:[-+*]\s+)?\*{0,2}Valuation confidence\s*/?\s*100\s*"
    r"\*{0,2}\s*:\s*\*{0,2}\s*\*{0,2}(\d{1,3})\*{0,2}"
    r"(?![\d.,eE_]|\s*(?:(?:%|percent\b)\s*)?(?:[-–—/]|to\b|through\b|or\b)\s*\d)",
    re.IGNORECASE,
)
_BB_VERDICT_HEADING_RE = re.compile(
    r"^(#{1,6})\s+1\.\s+Valuation Verdict\s*#*\s*$", re.IGNORECASE,
)
_BB_HEADING_RE = re.compile(r"^(#{1,6})\s+\S")

def _bb_parse_valuation_confidence(synth_txt):
    """Extract the numeric 'Valuation confidence /100' figure from 99_valuation-synthesis.md's own
    §1 Verdict block text. Returns an int 0-100, or None if the block or its one score line is
    absent/unparseable. The block boundary prevents a later Score Cap Application explanation from
    substituting for a missing Verdict score; requiring exactly one confidence line also fails closed
    on conflicting values. The integer must occupy the value position immediately after the label's
    colon (apart from Markdown emphasis), so `N/A (max 55)` and signed values cannot be truncated into
    passing scores. A non-whole or ranged score (`55.9`, `55,9`, `55e0`, `55–60`, `55 to 60`, `55%–60%`)
    is treated as unparseable → None → the caller fails closed rather than truncating it to a value
    that spuriously respects the cap (Codex review P2)."""
    if not synth_txt:
        return None
    lines = synth_txt.splitlines()
    block = None
    for index, line in enumerate(lines):
        heading = _BB_VERDICT_HEADING_RE.match(line.strip())
        if not heading:
            continue
        level = len(heading.group(1))
        end = len(lines)
        for candidate in range(index + 1, len(lines)):
            next_heading = _BB_HEADING_RE.match(lines[candidate].strip())
            if next_heading and len(next_heading.group(1)) <= level:
                end = candidate
                break
        block = lines[index + 1:end]
        break
    if block is None:
        return None
    score_lines = [line for line in block if "valuation confidence" in line.lower()]
    if len(score_lines) != 1:
        return None
    match = _BB_CONF_RE.search(score_lines[0])
    if match:
        value = int(match.group(1))
        if 0 <= value <= 100:
            return value
    return None

def eval_bb_sector_cycle_compounding_cap(decision_date, mult_txt, peer_txt, synth_txt):
    """Check BB: §16 Sector Cycle Reality Test compounding cap. Returns None (N/A — pre-gate, or
    BOTH 02 and 03 source texts absent), or a list of violation strings (empty list = pass or the
    compounding trigger did not fire). Side-effect-free + module-level so eval.py selftest can drive
    it.
    mult_txt: 02_multiples-own-history.md specialist text, or None.
    peer_txt: 03_relative-valuation-peers.md specialist text, or None.
    synth_txt: 99_valuation-synthesis.md text, or None — if the compounding trigger fires but this
    is absent, the cap cannot be verified as applied, which is itself a violation (CLAUDE.md §11:
    caps must be applied, never silently unverifiable)."""
    if not (isdate(decision_date) and decision_date >= BB_DATE):
        return None  # forward-looking; pre-gate runs N/A
    if mult_txt is None and peer_txt is None:
        return None  # neither specialist ran — N/A
    elev02 = _tag_fired_standalone(mult_txt, CYCLE_ELEV_TAG)
    depr02 = _tag_fired_standalone(mult_txt, CYCLE_DEPR_TAG)
    elev03 = _tag_fired_standalone(peer_txt, CYCLE_ELEV_TAG)
    depr03 = _tag_fired_standalone(peer_txt, CYCLE_DEPR_TAG)
    same_direction = (elev02 and elev03) or (depr02 and depr03)
    if not same_direction:
        return []  # no compounding trigger — nothing to cap (includes the case where only one, or
                   # neither, specialist flagged, or they flagged opposite directions)
    direction = "cycle-elevated" if (elev02 and elev03) else "cycle-depressed"
    if synth_txt is None:
        return [
            f"§16 Sector Cycle Reality Test compounding trigger fired ({CYCLE_ELEV_TAG if direction=='cycle-elevated' else CYCLE_DEPR_TAG} "
            f"in BOTH 02_multiples-own-history and 03_relative-valuation-peers, same direction: {direction}) "
            f"but 99_valuation-synthesis.md is absent — the combined base-case Valuation confidence "
            f"cap (max {BB_COMPOUND_CAP}, MODULE_RULES.md Scenario Construction §3 compounding rule) "
            f"cannot be verified as applied"]
    score = _bb_parse_valuation_confidence(synth_txt)
    if score is None:
        return [
            f"§16 Sector Cycle Reality Test compounding trigger fired (both 02 and 03 flagged {direction}) "
            f"but 99_valuation-synthesis.md's Valuation confidence /100 figure could not be parsed from "
            f"its §1 Verdict block — the max {BB_COMPOUND_CAP} compounding cap cannot be verified as "
            f"applied (CLAUDE.md §11: caps must be applied, never silently unverifiable)"]
    if score > BB_COMPOUND_CAP:
        return [
            f"§16 Sector Cycle Reality Test compounding trigger fired (both 02 and 03 flagged {direction}, "
            f"one shared sector cycle counted twice, not independent corroboration) but 99's stated "
            f"Valuation confidence is {score}/100, exceeding the max {BB_COMPOUND_CAP} combined cap "
            f"(MODULE_RULES.md Scenario Construction & Method-Weighting Policy §3 compounding rule; "
            f"CLAUDE.md §16)"]
    return []  # empty list = pass — compounding trigger fired and the stated score respects the cap

# ── Check BE (§15 driver-attribution residual — earnings decomposition/bridge) ─────────────────────
# CLAUDE.md §15 requires any driver-attribution claim — a move explained by a driver and a quoted
# sensitivity/ratio — to print its own arithmetic, carry that sensitivity's own basis, and state the
# unexplained residual: "A large residual is the finding, not a caveat ... it belongs in the table ...
# never rounded away." earnings/MODULE_RULES.md's "Driver Attribution — Show the Arithmetic, Name the
# Residual" section already implements this in full prose form, and 02_revenue-drivers.md §6a /
# 03_margin-drivers.md §7a already prescribe the exact reconciliation line ("{N}pp/bps reconciled,
# {M}pp/bps residual"). But unlike its sibling §16 rules — the Sector Cycle Reality Test (RF-VAL-001/
# 002 → check BB above) — this §15 rule had no standalone tag and no eval check: a future prompt edit
# to §6a/§7a could silently drop the residual requirement and nothing would catch it, and a live run
# could silently omit or fabricate the residual (the exact failure the GOLD real-yield/nominal-yield
# miss names in CLAUDE.md §15 itself) with the finish-gate never noticing.
#
# Detection: 02_revenue-drivers.md §6a emits RF-EARN-001, and 03_margin-drivers.md §7a emits
# RF-EARN-002, each as a standalone tag line in ONE of two sanctioned forms:
#   "RF-EARN-00N: {label} reconciled — explained {N}{unit}, residual {M}{unit}, total {T}{unit}"
#   "RF-EARN-00N: {label} not attempted — {reason}"
# Unlike BB (which gates on a conditional TRIGGER firing), Section 6/6a and 7/7a are standard,
# always-attempted parts of every earnings run's REPORT STRUCTURE — so here, unlike BB, tag ABSENCE
# itself is a violation whenever the specialist ran at all (mirrors check T's always-required
# forecast-ledger fields, not BB's conditional-trigger pattern). The "not attempted" form is the
# doctrine's own sanctioned escape ("If this decomposition/bridge is not possible from disclosure,
# state what's missing") — it satisfies the tag requirement as long as it names a real reason, and is
# never re-derived (this check does not judge whether a decomposition genuinely was impossible, only
# that the specialist declared it and said why — the same restraint the Cost-of-Capital Reality Test's
# own escalation check applies to whether ITS trigger should have fired at all).
#
# The reconciled form's three numbers are self-contained on ONE tag line, so — unlike a tag-presence-only
# check — this check can also verify the arithmetic itself: explained + residual must equal the stated
# total within a rounding tolerance (independently-rounded components can each be off by a few tenths).
# This directly targets the failure mode CLAUDE.md §15 names: a residual quietly rounded away rather
# than stated.
#
# Landing date: 2026-09-04 (forward-looking; RF-EARN-001/002 did not exist in any agent file before
# this check shipped, so no committed golden fixture could possibly emit them → every fixture is N/A →
# the suite stays green).
BE_DATE = "2026-09-04"
REV_DECOMP_TAG = "RF-EARN-001"     # revenue-drivers §6a: decomposition reconciled / not attempted
MARGIN_BRIDGE_TAG = "RF-EARN-002"  # margin-drivers §7a: bridge reconciled / not attempted
BE_RECONCILE_TOLERANCE = 1.0       # units (pp or bps) — independently-rounded components' slack

_BE_RECON_RE = re.compile(
    r"reconciled\s*[—\-:]\s*explained\s+(-?\d+(?:\.\d+)?)\s*(?:pp|bps)\s*,\s*"
    r"residual\s+(-?\d+(?:\.\d+)?)\s*(?:pp|bps)\s*,\s*"
    r"total\s+(-?\d+(?:\.\d+)?)\s*(?:pp|bps)",
    re.IGNORECASE,
)
_BE_NOT_ATTEMPTED_RE = re.compile(r"not attempted\b(.*)$", re.IGNORECASE | re.DOTALL)


def _be_tag_line_rest(txt, tag):
    """Return the cleaned remainder of the FIRST line in `txt` whose leading token (after shedding
    markdown heading/bullet/table/quote/backtick cruft) is `tag`, skipping a first-cell status TABLE
    ROW the same way `_tag_fired_standalone` does. Unlike `_tag_fired_standalone`, does NOT apply the
    `_CAP_TAG_NEGATIONS` filter — check BE's own two sanctioned forms ("reconciled — ..." /
    "not attempted — ...") are distinguished by this function's caller, not by that generic
    cap-cleared vocabulary (a negation word like "none" can legitimately appear inside a real
    "not attempted — no segment-level pricing is disclosed, none of the components are separable"
    reason). Deliberately duplicates the line-cleaning logic in `_tag_fired_standalone`/`_bd_tag_rest`
    rather than refactoring either, so this new check cannot change their behaviour."""
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


def _be_check_one(txt, filename, tag, unit, label):
    """Check one specialist file's RF-EARN-00N tag. Returns a list of violation strings (empty =
    pass)."""
    rest = _be_tag_line_rest(txt, tag)
    if rest is None:
        return [
            f"{tag} is absent from {filename} — every {label} the specialist attempts must declare "
            f"either the reconciled residual or that no decomposition was possible (CLAUDE.md §15: "
            f"'a large residual is the finding, not a caveat ... never rounded away'; MODULE_RULES.md "
            f"Driver Attribution)"]
    not_attempted = _BE_NOT_ATTEMPTED_RE.search(rest)
    if not_attempted:
        reason = not_attempted.group(1).lstrip(_NEG_LEADING_STRIP)
        if not reason.strip():
            return [
                f"{tag} in {filename} declares 'not attempted' with no reason given — CLAUDE.md §15 "
                f"requires stating what's missing, not a bare dodge"]
        return []
    match = _BE_RECON_RE.search(rest)
    if not match:
        return [
            f"{tag} in {filename} does not match either sanctioned form — "
            f"'{tag}: {label} reconciled — explained {{N}}{unit}, residual {{M}}{unit}, total {{T}}{unit}' "
            f"or '{tag}: {label} not attempted — {{reason}}' — the residual cannot be verified as stated "
            f"(CLAUDE.md §15; §11: caps must be applied, never silently unverifiable)"]
    explained, residual, total = (float(g) for g in match.groups())
    if abs((explained + residual) - total) > BE_RECONCILE_TOLERANCE:
        return [
            f"{tag} in {filename} states explained {explained}{unit} + residual {residual}{unit} = "
            f"{explained + residual}{unit}, which does not reconcile to the stated total {total}{unit} "
            f"within {BE_RECONCILE_TOLERANCE}{unit} (CLAUDE.md §15 driver-attribution arithmetic — "
            f"'a driver-attribution claim shows its own arithmetic and names its residual')"]
    return []


def eval_be_driver_attribution_residual(decision_date, rev_txt, marg_txt):
    """Check BE: §15 driver-attribution residual (earnings revenue decomposition + margin bridge).
    Returns None (N/A — pre-gate, or BOTH 02_revenue-drivers.md and 03_margin-drivers.md absent), or a
    list of violation strings (empty list = pass). Side-effect-free + module-level so eval.py selftest
    can drive it.
    rev_txt: 02_revenue-drivers.md specialist text, or None.
    marg_txt: 03_margin-drivers.md specialist text, or None."""
    if not (isdate(decision_date) and decision_date >= BE_DATE):
        return None  # forward-looking; pre-gate runs N/A
    if rev_txt is None and marg_txt is None:
        return None  # neither specialist ran — N/A
    violations = []
    if rev_txt is not None:
        violations += _be_check_one(rev_txt, "02_revenue-drivers.md", REV_DECOMP_TAG, "pp",
                                     "revenue decomposition")
    if marg_txt is not None:
        violations += _be_check_one(marg_txt, "03_margin-drivers.md", MARGIN_BRIDGE_TAG, "bps",
                                     "margin bridge")
    return violations
