#!/usr/bin/env python3
"""§24 rejector-filter conviction-cap detectors (Filters 1, 2, 4, 5, 6 — CLAUDE.md §24).

Side-effect-free, importable, doctrine logic — extracted from `scripts/eval.py` (checks
AC/AD/AE/AF) so the SAME detection functions can run in TWO places instead of one:

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
(`eval_ac_turnaround_cap` is the one exception — it predates this convention and returns
the string `'pass' | 'fail' | 'na'`; kept as-is rather than changed at import time.)

No caller may treat a violation as fatal — CLAUDE.md §13 requires caps to be *applied*, not
used to silently kill a run. Both call sites (eval.py, the finish-gate) turn a non-empty
result into a visible flag (a FAIL row, or a PROVISIONAL banner) — never a silent abort.
"""


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
