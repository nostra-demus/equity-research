#!/usr/bin/env python3
"""Basis-comparability invariants over a run's valuation artifacts.

WHY THIS EXISTS. CLAUDE.md is strong on citation (§5) and hygiene (§15), and the engine obeys both.
It is weak on the thing those rules cannot express: whether two numbers of the same KIND were measured
the same way. Seven of the thirteen findings in the 2026-09-30 BURL audit were that one failure.

WHAT THIS MODULE ACTUALLY COVERS, which is less than the audit found. It implements ONE of BURL's three
basis defects: a weighted scenario set whose cases are measured on different periods or measures. The
other two are NOT here and should not be assumed to be —

  · the bull multiple drawn from an LTM band and applied to an NTM denominator — a mismatch WITHIN one
    case, between a multiple and its metric. `eval_multiple_metric_basis` below.
  · the min-max range position printed under the word "percentile" — a `02` reporting defect that
    reaches no JSON. `eval_statistic_label` below reads 02's markdown, which is why it is the only
    check here that can see a run like BURL, whose bases lived in prose and which emitted no sidecar.

TWO OF THE THREE CANNOT SEE A RUN WITH NO SIDECAR, which is BURL's own shape — it carried its bases in
prose and emitted no valuation_summary.json at all. That gap is closed at the LIVE finish gate in
`/research:full`, which now refuses to let a run with scenario levels publish without one; it is not
closed here, and `BF_SIDECAR_REQUIRED_DATE` below stays None on purpose.

Each defect is individually forbidden by prose that was in force when the run shipped, and the run's own
truth-integrity gate returned `Clean` / integrity 100 on all of them.

So prose does not bind here, and an LLM auditor did not either. Only arithmetic over the artifacts does.

DESIGN NOTES, each one paid for by a measurement over the committed corpus:

  * NORMALISE BEFORE COMPARING. `metric_basis` is free text. Comparing the raw strings flags 11 of the
    17 committed sidecars, and most are the same basis written twice ("NTM Revenue" vs
    "NTM Revenue (CIQ consensus)"). Normalising to a (period, measure) pair drops that to 3 real
    mismatches. A check with an 8-in-11 false-positive rate would be turned off within a week, which is
    worse than no check.

  * UNDECLARED IS NOT MISMATCHED. Seven sidecars declare a basis on some cases and not others. That is a
    weaker, different finding than two cases that declare CONFLICTING bases, and it is reported
    separately. Collapsing them would bury the real defect in a pile of paperwork findings.

  * A CROSS-METRIC SET CAN BE LEGITIMATE. EMAAR (a REIT) prices one case off EPS and another off book
    value per share; a pre-profit company may hold an EV/Sales bull against a cash-burn bear. That is
    not automatically an error — it is an error when nobody says why. The escape is a CITED
    `cross_metric_reconciliation`, not a business-type allowlist, because a type list would have to be
    maintained forever and would still be wrong for the next REIT-shaped thing that is not a REIT.

  * SOFT PRESENCE, STRICT VALIDITY. No sidecar, or no declared basis at all, is N/A and never a failure —
    8 of 21 committed runs emit no sidecar, and retro-failing them would say nothing about their
    analysis. A basis that IS declared and IS incoherent is a failure.

Pure, side-effect-free and module-level so `eval.py selftest` can drive every branch without a run
fixture, matching the pattern in valuation_summary_checks.py / scenario_integrity_checks.py.
"""
from __future__ import annotations

import json
import os
import re

# ── basis vocabulary ──────────────────────────────────────────────────────────────────────────────
# Ordered: the first match wins, so the more specific pattern is listed first. `mid_cycle` and `trough`
# precede LTM/NTM deliberately — "mid-cycle NTM EBITDA" is a mid-cycle claim, not a forward one, and the
# period is what makes two cases incomparable.
_PERIOD_PATTERNS = (
    ("mid_cycle", r"mid[-\s]?cycle|through[-\s]?cycle|normali[sz]ed cycle"),
    ("trough", r"\btrough\b|\bdown[-\s]?turn\b|\bdown[-\s]?cycle\b|\brecession\b"),
    ("LTM", r"\bLTM\b|\bTTM\b|trailing twelve|\btrailing\b"),
    ("NTM", r"\bNTM\b|next twelve|forward twelve"),
    # FY+1 / FY+2 are documented in the sidecar schema's own metric_basis examples, so they must parse.
    ("FY_REL", r"\bFY\s?\+\s?\d\b"),
    # A BARE YEAR counts: metric_period is declared by a person, and "2026" means FY2026 to every one of
    # them. Without this, "2026" parsed to nothing while "FY2026" parsed to FY26, and two cases meaning
    # the same year read as a mismatch — a spelling bug dressed as a basis defect.
    # CUMULATIVE INTERIM PERIODS ARE NOT THE FULL YEAR (§27). "H1 FY26" against "FY2026" is the exact
    # half-year-vs-full-year comparison §17 and §27 forbid, and collapsing them made that set pass clean.
    ("H1", r"\bH1\b|\b1H\d{0,4}\b|half[-\s]?year|interim\s+half"),
    ("9M", r"\b9M\d{0,4}\b|\bnine[-\s]?month"),
    ("Q", r"\bQ[1-4]\b|\b[1-4]Q\b"),
    # A BARE YEAR NEEDS FISCAL CONTEXT. `\b20\d{2}E?\b` alone read "EBITDA of 2026 crore" as FY26 and
    # "EPS of 2050 paise" as FY50 — fabricating a period out of the money itself. §27 names an Indian
    # company the default-likely case, so an INR-crore amount is not an edge case to tolerate. A bare
    # year counts only with an E suffix, a fiscal word beside it, or when it IS the whole token (which
    # is how a declared metric_period reaches here).
    ("FY", r"\bFY\s?\d{2,4}E?\b|\bCY\s?\d{4}\b|\b20\d{2}E\b"
           r"|(?:^|\s)20\d{2}(?=\s*$)"
           r"|\b(?:fiscal|FY|year(?:\s+end(?:ing|ed))?)\s+20\d{2}\b"),
)

_MEASURE_PATTERNS = (
    ("EBITDA", r"\bEBITDA\b"),          # before EBIT, or "EBITDA" matches the EBIT pattern
    ("EBIT", r"\bEBIT\b"),
    ("EPS", r"\bEPS\b|earnings per share"),
    ("BVPS", r"\bT?BVPS\b|book value"),
    # AFFO IS NOT FFO. The schema names "a REIT's AFFO" as the motivating example for an OPEN
    # vocabulary, and then this collapsed one onto the other, so an FFO base beside an AFFO bear
    # bypassed the reconciliation requirement entirely. AFFO is listed first so it wins its own match.
    ("AFFO", r"\bAFFO\b"),
    ("FFO", r"\bFFO\b"),
    ("NAV", r"\bNAV\b|net asset value"),
    ("FCF", r"\bFCFE?F?\b|free cash flow"),
    ("REVENUE", r"\brevenues?\b|\bsales\b|\bGMV\b|\bturnover\b"),
    # THE PROFIT WORDS AN INDIAN OR IFRS FILER ACTUALLY USES. "FY27E PAT", "net profit", "operating
    # profit", "core earnings" all parsed to NO measure, so an EBITDA base beside a PAT bear returned
    # clean. §27: an Indian company is the default-likely case, not an edge case.
    ("PAT", r"\bPAT\b|profit after tax|net profit|profit for the (?:year|period)"),
    ("EBT", r"\bEBT\b|profit before tax|\bPBT\b"),
    ("OPERATING_PROFIT", r"operating profit|\bEBITA\b"),
    ("CORE_EARNINGS", r"core earnings|underlying earnings"),
    ("EV_PER_SHARE", r"embedded value|\bEVPS\b"),
)


def normalise_metric_basis(raw):
    """Free text -> (period, measure), either element None when the text does not say.

    Returns None for an absent/blank basis so callers can tell "undeclared" from "declared and
    unparseable" — they are different findings and only one of them is the analyst's fault.
    """
    if not isinstance(raw, str) or not raw.strip():
        return None
    text = raw.strip()

    # THE PERIOD IS THE ONE THE METRIC IS STATED ON — the EARLIEST period token in the string — not any
    # period word appearing anywhere in it. This distinction is the whole check.
    #
    # "FY2026E EBITDA at FY2021-trough EBIT margin applied to FY2026E consensus revenue" is a FY26 metric
    # that happens to source its margin from a trough year: it is re-based, which is exactly what the
    # module now requires. Scanning for the word "trough" anywhere classified it as a trough-period case
    # and flagged two runs (HAIER, INDIAMART) that had done the right thing — a check that punishes
    # compliance is worse than no check, so position decides, not presence.
    hits = []
    for name, rx in _PERIOD_PATTERNS:
        match = re.search(rx, text, re.I)
        if match:
            hits.append((match.start(), name))
    at, period = min(hits) if hits else (0, None)
    # An interim period carries its YEAR: "H1 FY26" and "H1 FY27" are different periods, and comparing
    # them as a bare "H1" would collapse two years the way collapsing H1 onto FY26 collapsed two bases.
    if period in ("H1", "9M", "Q"):
        year = re.search(r"\bFY\s?(\d{2,4})|\b(20\d{2})\b", text, re.I)
        if year:
            digits = (year.group(1) or year.group(2))[-2:]
            period = f"{period}-FY{digits}"
    elif period == "FY_REL":
        match = re.search(r"\bFY\s?\+\s?(\d)\b", text[at:], re.I)
        period = f"FY+{match.group(1)}" if match else "FY+?"
    elif period == "FY":
        # Keep the YEAR: FY27 and FY29 are different periods, and a set mixing them is the same defect
        # as mixing NTM with a trough. Two digits, so FY2027 and FY27 compare equal.
        #
        # Read the year FROM THE TOKEN THAT WON ON POSITION (`text[at:]`), not from the whole string.
        # The year regex below is deliberately looser than the _PERIOD_PATTERNS one (it accepts a
        # two-digit CY and needs no trailing word boundary), so searching from position 0 could lift a
        # year out of a token the period scan had already rejected: "CY26 normalized EBITDA rolled to
        # FY2029E" is an FY29 metric whose period used to resolve to FY26, inventing a mismatch
        # against an FY29 set — or hiding a real one.
        match = (re.search(r"(?:FY\s?\+?|CY\s?)(\d{2,4})", text[at:], re.I)
                 or re.search(r"\b(20\d{2})E?\b", text[at:]))
        period = f"FY{match.group(1)[-2:]}" if match else "FY"

    # MEASURE BY POSITION TOO. This was fixed for periods and left on pattern precedence for measures,
    # which is the same bug wearing the other hat: "FY27E Revenue at the FY21-trough EBIT margin" is a
    # REVENUE case, and precedence made EBIT win because EBIT is listed first. The metric is the one the
    # case is stated on — the earliest mention — not whichever pattern happens to sit higher in a list.
    m_hits = []
    for name, rx in _MEASURE_PATTERNS:
        match = re.search(rx, text, re.I)
        if match:
            m_hits.append((match.start(), name))
    measure = min(m_hits)[1] if m_hits else None
    return (period, measure)


def case_basis_detail(case):
    """(period, measure, notes) — the declared basis, plus what reading it cost.

    THE PARSER IS NOT SUPERSEDED BY THE DECLARATION, IT AUDITS IT. Letting a declared token silently
    override the sentence beside it made the declared path strictly WEAKER than the prose path it
    replaced: a bear whose metric_basis says "FY2022 diluted GAAP trough EPS" but whose metric_period
    says "NTM" passed clean, which is the exact BURL defect this module exists to catch, laundered
    through one field. The declaration still wins for COMPARISON — the author is the authority on what
    the case is — but a declaration that contradicts its own sentence is reported.

    An UNRECOGNISED declared token is also reported rather than compared. The vocabulary is open by
    design, so an unknown word is legitimate; what it is not is comparable by set equality against a
    normalised token, which turned a sanctioned synonym into a hard failure.
    """
    if not isinstance(case, dict):
        return (None, None, [])
    notes = []
    label = str(case.get("label") or "?")

    def _read(raw, index, name):
        if not (isinstance(raw, str) and raw.strip()):
            return None
        token = raw.strip()
        parsed = normalise_metric_basis(token)
        known = parsed[index] if parsed else None
        if known is None:
            notes.append(f"{label}: declared {name} {token!r} is not a term this check knows, so it "
                         f"cannot be compared with the other cases — use one of the listed terms, or "
                         f"state the equivalent in metric_basis as well")
            return None
        return known

    period = _read(case.get("metric_period"), 0, "metric_period")
    measure = _read(case.get("metric_measure"), 1, "metric_measure")

    inferred = normalise_metric_basis(case.get("metric_basis"))
    if inferred:
        for declared, index, name in ((period, 0, "period"), (measure, 1, "measure")):
            implied = inferred[index]
            if declared is not None and implied is not None and declared != implied:
                notes.append(
                    f"{label}: declared {name} {declared!r} contradicts its own metric_basis "
                    f"{str(case.get('metric_basis'))[:60]!r}, which reads as {implied!r} — one of them "
                    "is wrong and a reader sees the sentence"
                )
        if period is None:
            period = inferred[0]
        if measure is None:
            measure = inferred[1]
    return (period, measure, notes)


def case_basis(case):
    """(period, measure), preferring what the author DECLARED over what prose implies.

    Thin accessor over case_basis_detail for callers that only need the pair. Returns None when neither
    route says anything, so "undeclared" stays distinguishable from "declared and unparseable".
    """
    period, measure, _ = case_basis_detail(case)
    return None if (period is None and measure is None) else (period, measure)


# ── a statistic may not be labelled as a different statistic ──────────────────────────────────────
# `(current - min) / (max - min)` is a RANGE POSITION. The word "percentile" means a rank against the
# distribution, and the two disagree by tens of points whenever one observation sits far from the rest.
# 02_multiples-own-history used to MANDATE a column headed "Percentile of Range" — the arithmetic was
# right and the name was not, and 19 committed runs print it, across a bank, a REIT, SaaS, a platform
# and a retailer. The template fix removes the column; this verifies the output, which is the half a
# prompt change cannot verify about itself.
#
# Deliberately narrow: it flags a header that CONFLATES the two words, not every use of either. "Rank
# percentile" and "Range position" are the correct replacements and must both pass.
_CONFLATED_LABEL = re.compile(r"percentile[^|]{0,24}\brange\b|\brange\b[^|]{0,24}percentile", re.I)


def eval_statistic_label(markdown_text):
    """Core of the statistic-label check. Returns None when there is nothing to read, else a list of
    violation strings (empty = pass).

    Reads 02's own report rather than a sidecar because this defect lives in the prose table and never
    reaches JSON — which is also why it survived nineteen runs unnoticed.
    """
    if not isinstance(markdown_text, str) or not markdown_text.strip():
        return None
    violations = []
    for number, line in enumerate(markdown_text.split("\n"), start=1):
        if not line.lstrip().startswith("|"):
            continue
        for cell in line.split("|"):
            if _CONFLATED_LABEL.search(cell):
                violations.append(
                    f"line {number}: column {cell.strip()!r} labels a range position as a percentile — "
                    "they are different statistics and disagree whenever one observation is an outlier. "
                    "Report both, named: 'Rank percentile' = count(obs <= current)/count(obs), "
                    "'Range position' = (current - min)/(max - min)"
                )
                break
    return violations


# ── a multiple and the metric it is applied to must share a period ────────────────────────────────
def eval_multiple_metric_basis(sidecar):
    """Core of the within-case basis check. Returns None when nothing declares both, else violations.

    A multiple lifted from an LTM band and applied to an NTM metric is not the figure its sentence
    claims: BURL's bull took 28.51x, the MINIMUM of the P/LTM EPS band, and applied it to NTM EPS of
    $13.00 — on the matched NTM band (min 20.70, median 28.44) that multiple sits at the 56th
    percentile, not at the bottom of the range, and the memo then called it "the 28.51x NTM P/E".

    HONEST SCOPE: this is PREVENTIVE, not retrospective. Every one of the 42 committed case-pairs
    carrying both fields already agrees, and it would not have caught BURL either — BURL emitted no
    sidecar, so there was nothing to read. It locks in behaviour that is currently correct.
    """
    if not isinstance(sidecar, dict):
        return None
    pairs = []
    for case in (sidecar.get("scenarios") or []):
        if not isinstance(case, dict):
            continue
        multiple = case.get("multiple_basis")
        if not multiple:
            continue
        # Keyed on case_basis, not on metric_basis: metric_basis is optional in the schema, so keying
        # on it switched this check OFF for exactly the all-declared shape the emitter tells authors to
        # prefer — the newer and more correct a run was, the less of it was checked.
        period, measure, _ = case_basis_detail(case)
        if period is not None or measure is not None:
            pairs.append((case, (period, measure), multiple))
    if not pairs:
        return None

    violations = []
    for case, (metric_period, metric_measure), multiple in pairs:
        parsed = normalise_metric_basis(multiple) or (None, None)
        label = case.get("label") or "?"
        if metric_period and parsed[0] and metric_period != parsed[0]:
            violations.append(
                f"{label}: the multiple is measured on {parsed[0]} ({multiple!r}) and the metric on "
                f"{metric_period} — a band minimum is only the bottom of the range ON ITS OWN BASIS, "
                "and only the bare number travels downstream"
            )
        # The MEASURE has to match too: an EV/EBITDA multiple struck on an EPS metric is not a smaller
        # version of the same error, it is a different one, and nothing compared them.
        if metric_measure and parsed[1] and metric_measure != parsed[1]:
            violations.append(
                f"{label}: the multiple is struck on {parsed[1]} ({multiple!r}) and the metric is "
                f"{metric_measure} — a multiple and the thing it multiplies must be the same measure"
            )
    return violations


# Membership is a binary the probability arithmetic depends on, so these lists are closed ON PURPOSE,
# unlike the open metric vocabularies: a word nobody recognises must surface rather than be guessed.
_OUT_OF_SET = frozenset({"sensitivity", "stress", "excluded", "floor", "avoid_ruin", "avoid-ruin",
                         "not_weighted", "unweighted", "illustrative"})


def _weighted_cases(sidecar):
    """The cases that enter the probability-weighted result.

    A case explicitly marked as a sensitivity is excluded: reclassifying a stress case OUT of the
    weighted set is the sanctioned remedy for a basis mismatch, so the check must honour it. It is not
    an escape hatch — scenario_integrity_checks' span test still governs what the remaining set must
    contain, and a set that loses its whole down-leg fails there instead.
    """
    cases = [c for c in (sidecar.get("scenarios") or []) if isinstance(c, dict)]
    if not cases:
        return []

    # MEMBERSHIP IS DECLARED, NEVER GUESSED FROM THE LABEL. An earlier revision excluded a
    # `bear_structural` case whenever a cyclical bear sat beside it, on the reading that 07
    # §"Which case it becomes" carries the avoid-ruin floor to §24 rather than pricing it. The committed
    # corpus says otherwise: in EVERY run that emits one — HAIER, ORCL, SMPL, UBER, TSLA, DHER — the
    # master synthesizer gives the structural case a real probability inside the set that sums to 100%
    # (ORCL: 20% at $31.44 against a $133.77 base, on an impaired-FCFF DCF, i.e. a different MEASURE
    # from the NTM EBITDA the other three cases are priced on). Guessing it out of the set therefore
    # blessed the exact BURL-class defect this check exists to catch, on five of the six runs that had
    # one. So the ONLY thing that removes a case from the weighted set is the run saying so —
    # `set_membership: "sensitivity"`, the field 99_valuation-synthesis emits for a case 07
    # deliberately held outside the weighted aggregate.
    #
    # The six "partial declaration" findings this exclusion was added to silence were true findings:
    # those structural cases really do carry weight and really do not declare a basis.
    # Any of the OUT_OF_SET words removes a case; an UNRECOGNISED value does not. Honouring only the
    # literal "sensitivity" meant "stress" or "excluded" silently re-entered the weighted set and
    # hard-failed a compliant run. Treating anything non-"weighted" as excluded is the opposite and
    # worse failure: a typo would quietly drop a real down-leg out of the probability-weighted set
    # without anyone deciding to. So unrecognised stays IN and is reported.
    return [case for case in cases
            if str(case.get("set_membership") or "weighted").strip().lower() not in _OUT_OF_SET]


def _cited(value) -> bool:
    """A reconciliation must point at something, not merely assert itself.

    A bare length test was unlocked by the exact phrases CLAUDE.md §5 bans by name — "company filings",
    "management said", "industry data" all clear twelve characters and suppressed the violation, while
    "FY24 AR p.9", a valid §5 citation, was rejected for being short. The sibling module already
    exports the right helper with its banned-phrase set, added for this same reason; §2 says reuse it
    rather than keep a second, weaker copy.
    """
    if not isinstance(value, str) or not value.strip():
        return False
    text = value.strip()
    try:
        from valuation_summary_checks import _cited as _sibling_cited
        # The sibling bans the vague phrases §5 names; it does not require the citation to say
        # anything, so "yes" cleared it. Both tests are needed: not-banned AND substantive.
        return bool(_sibling_cited(text)) and len(text) >= 8
    except Exception:
        banned = ("company filings", "annual report", "management said", "source", "industry data",
                  "filings", "see above", "as discussed", "n/a", "tbd")
        low = text.lower().rstrip(".")
        return len(text) >= 8 and low not in banned


def eval_scenario_basis_coherence(sidecar):
    """Core of the scenario-basis check.

    Returns None when there is nothing to judge (no sidecar, no weighted cases, no declared basis at
    all), else a list of violation strings — empty list meaning pass.

    One probability-weighted set is one economic statement, so its cases must share a period and a
    measure. Mixing a forward normalized denominator with a historical GAAP trough produces a downside
    that is an artefact of the definition change rather than of the downturn it claims to model; on the
    BURL run that single switch carried the entire −74% bear leg.
    """
    if not isinstance(sidecar, dict):
        return None
    cases = _weighted_cases(sidecar)
    if len(cases) < 2:
        return None  # nothing to compare

    detail = [(case,) + case_basis_detail(case) for case in cases]
    # Every note the reader produced — a declaration contradicting its own sentence, or a token outside
    # the known vocabulary — is a finding in its own right, independent of whether the set agrees.
    note_violations = [note for _, _, _, notes in detail for note in notes]

    # A basis that parses to NOTHING is not a declaration. `(None, None)` is a truthy tuple, so the
    # anti-deletion guard closed only against DELETING metric_basis: writing "see 07 section 2" into
    # every case passed clean, and the BURL defect laundered through one reword. Declared means at
    # least one half of the pair is actually readable.
    normalised = [(case, (p, m) if (p is not None or m is not None) else None)
                  for case, p, m, _ in detail]
    declared = [(case, norm) for case, norm in normalised if norm is not None]
    if not declared:
        return None  # wholly undeclared -> N/A here; presence is a separate, later gate

    violations = list(note_violations)

    undeclared = [case for case, norm in normalised if norm is None]
    if undeclared:
        labels = ", ".join(str(c.get("label") or "?") for c in undeclared)
        violations.append(
            f"metric_basis declared on {len(declared)} of {len(cases)} weighted cases but missing on: {labels}"
            " — a set is only comparable if every case says what it is measured on"
        )

    # A basis that parses to no period is UNKNOWN, not a period of its own. Letting None join the set
    # manufactured mismatches out of thin air — EMAAR read ['LTM', None] and ORCL ['NTM', None], which
    # together with the trough bug accounted for every period finding this check originally reported.
    periods = {norm[0] for _, norm in declared if norm[0] is not None}
    measures = {norm[1] for _, norm in declared if norm[1] is not None}

    unparsed = [c for c, norm in declared if norm[0] is None]
    # IF NOBODY NAMES A PERIOD, THE SET IS NOT COMPARABLE AT ALL. Withholding the finding because
    # `periods` was empty let a set launder through a reword: "our forward EPS view" against "the last
    # downcycle's reported EPS" names a measure for both and a period for neither, so the comparison
    # had nothing to disagree about and the gate passed. A period every case leaves out is the same
    # defect as a period two cases disagree on — it just cannot be seen.
    if not periods and len(declared) >= 2:
        violations.append(
            "no weighted case names an earnings PERIOD — the set cannot be compared on the axis that "
            "makes a bear a downturn rather than a different denominator. State NTM / LTM / FY+1 / "
            "FY20XX / mid_cycle / trough per case"
        )
    if unparsed and periods:
        labels = ", ".join(str(c.get("label") or "?") for c in unparsed)
        violations.append(
            f"metric_basis on {labels} names no period that can be read against the rest of the set "
            f"{sorted(periods)} — state the period (NTM / LTM / FY+1 / FY20XX / mid-cycle / trough)"
        )

    if len(periods) > 1:
        detail = "; ".join(
            f"{c.get('label') or '?'}={c.get('metric_basis')!r}" for c, _ in declared
        )
        violations.append(
            f"weighted cases mix earnings PERIODS {sorted(str(p) for p in periods)} — {detail}"
        )

    if len(measures) > 1 and not _cited(sidecar.get("cross_metric_reconciliation")):
        detail = "; ".join(
            f"{c.get('label') or '?'}={c.get('metric_basis')!r}" for c, _ in declared
        )
        violations.append(
            f"weighted cases mix MEASURES {sorted(str(m) for m in measures)} with no cited "
            f"cross_metric_reconciliation — {detail}"
        )

    return violations


# ── enforcement gate ──────────────────────────────────────────────────────────────────────────────
# The rule is armed by DATE, not by merging this file. Two thirds of the committed corpus predates it —
# 34 of 51 run folders emit no sidecar at all — and failing work whose authors were never told the rule
# is enforcement by ambush. The established idiom in eval.py (AY_DATE, AZ_DATE, SECTOR_DATE) is a dated
# forward gate, and this follows it exactly.
#
# DO NOT LET THIS DATE ARRIVE UNTIL A FROZEN-INPUT CANARY HAS PROVEN THE EMITTER ACTUALLY WRITES
# `set_membership` AND `cross_metric_reconciliation` ON A REAL RUN. Those fields are introduced by a
# prompt change, and a prompt change cannot be validated by replaying frozen artifacts — the artifacts
# were produced by the old prompt. If the canary has not run, move the date; an armed gate against an
# emitter that does not comply fails every new run for a reason the author cannot fix.
# MOVED OUT from 2026-11-01. The date is not the hard part; the precondition is, and it was not met:
# both sanctioned remedies — `set_membership` and `cross_metric_reconciliation` — plus the declared
# `metric_period` / `metric_measure` fields live on a DIFFERENT branch stack and exist in no schema or
# emitter this file can reach. Arming against unreachable escapes means the dominant corpus shape (a
# `bear_structural` with no declared basis: six runs, seven of the nine current findings) fails with
# nothing its author can write to fix it. That is not a gate, it is a trap.
#
# THE PRECONDITION, in order: the schema + emitter changes land, a frozen-input canary proves a real run
# actually writes those fields, and only then does this date move into range. If the canary has not run,
# move it again — an armed gate against a non-complying emitter fails every new run for a reason the
# author cannot fix, which is how a gate gets switched off permanently instead of fixed.
BF_ENFORCE_DATE = "2026-12-15"

# SIDECAR PRESENCE ARMS SEPARATELY, AND IS CURRENTLY OFF. These are two different demands wearing one
# date. "Your declared bases disagree" is a defect in work that was done; "you emitted no sidecar" is a
# demand that a different artifact exist at all, and the engine does not reliably produce it today:
#
#     BURL 2026-09-29, V 2026-09-23, AKAM 2026-09-15, AKAM 2026-09-14, NU 2026-08-31
#
# — the five most recent full runs carrying scenarios, every one of which ran the whole valuation module
# and emitted no valuation_summary.json. 99_valuation-synthesis calls emitting it a "(Hard Rule)" while
# /research:full treats a missing sidecar as "N/A, never a violation", and the runs follow the latter.
#
# Arming presence against that record would red CI on the first new run and keep it red for every code
# PR until someone noticed, which is how a gate gets switched off permanently instead of fixed. So it
# stays None (never enforced) until emission is demonstrably reliable — the fix belongs in the emitter,
# not in a date. Set it to a date only once consecutive real runs are observed to emit the sidecar.
BF_SIDECAR_REQUIRED_DATE = None


def _isdate(value) -> bool:
    """A real calendar date, not a shape.

    Shape-only validation let "2026-13-45", "9999-99-99" and "20AB-CD-EF" through, and because the gate
    orders dates by STRING comparison a garbage value armed or exempted a run by character sort. The
    sibling in scenario_integrity_checks already parses; so does this.
    """
    if not isinstance(value, str) or len(value) != 10:
        return False
    try:
        import datetime
        datetime.date.fromisoformat(value)
        return True
    except ValueError:
        return False


def _presence_would_fail(decision_date, required_date):
    """Exercise the presence branch without mutating the module constant — so the disabled path is
    still covered by a test instead of being dead code nobody has run."""
    return _isdate(required_date) and _isdate(decision_date) and decision_date >= required_date


def eval_bf_basis_enforcement(decision_date, sidecar, violations):
    """Core of the dated enforcement gate. Returns 'pass' | 'fail' | 'na'.

    `violations` is eval_scenario_basis_coherence's result for this run (None = nothing to judge).

    An UNDATED run is 'na'. That is deliberate and it is a known hole: a run carrying no decision_date
    cannot be placed on either side of a forward gate, and guessing from the folder name would make the
    gate depend on a filename convention rather than on the thesis's own stated date. It is reported by
    the scan so the hole is visible rather than silent.
    """
    if not _isdate(decision_date) or decision_date < BF_ENFORCE_DATE:
        return "na"
    # VIOLATIONS ARE READ FIRST. A corrupt sidecar arrives here as sidecar=None WITH a parse-error
    # violation in hand; checking presence first swallowed it and returned na, so an unreadable lever
    # file was reported and never enforced — the one shape that most deserves to fail.
    if violations:
        return "fail"
    if sidecar is None:
        # The sidecar is the only artifact carrying per-case basis, so a run without one cannot be
        # checked at all — which is exactly how the BURL run passed every gate it had. That remains
        # true, and it is still not a reason to fail a run today: see BF_SIDECAR_REQUIRED_DATE.
        if _isdate(BF_SIDECAR_REQUIRED_DATE) and decision_date >= BF_SIDECAR_REQUIRED_DATE:
            return "fail"
        return "na"
    # A SET THAT DECLARES NOTHING IS NOT A CLEAN SET. eval_scenario_basis_coherence returns None when
    # no weighted case declares a basis at all, which is right for reporting — there is nothing to
    # compare — but passing the gate on it creates the worst possible incentive: delete every
    # metric_basis and a hard failure becomes a pass. That is also BURL's own shape, which carried its
    # bases in prose and emitted no sidecar at all. Past the gate, two or more weighted cases that
    # declare nothing is a failure.
    if violations is None:
        weighted = _weighted_cases(sidecar)
        if len(weighted) >= 2 and not any(
                any(x is not None for x in case_basis_detail(c)[:2]) for c in weighted):
            return "fail"
        return "pass"
    return "pass" if not violations else "fail"


def scan_committed(root="."):
    """Replay every committed sidecar. Returns (checked, failures) where failures is [(run, [violations])].

    Deliberately UNGATED: this is the measurement entry point. Enforcement is date-gated in eval.py so
    older runs are never retro-failed, but a gated measurement would hide exactly the runs the check
    exists to find.
    """
    import glob

    # Walk the UNION of runs that have a decision_record OR a sidecar. A sidecar-only run is a real,
    # normal state — a partial run the per-run loop skips — and check AP scans those deliberately for
    # the same reason. Walking decision records alone silently dropped one (TSLA_2026-07-24), which is
    # the quietest kind of coverage regression: the finding count falls and nothing says why.
    run_dirs = {os.path.dirname(p) for p in glob.glob(os.path.join(root, "analyses/*/decision_record.json"))}
    run_dirs |= {os.path.dirname(os.path.dirname(p))
                 for p in glob.glob(os.path.join(root, "analyses/*/valuation/valuation_summary.json"))}

    checked, failures, enforced = 0, [], []
    for run_dir in sorted(run_dirs):
        run = os.path.basename(run_dir)
        dr_path = os.path.join(run_dir, "decision_record.json")
        try:
            decision = json.load(open(dr_path, encoding="utf-8")) if os.path.exists(dr_path) else {}
        except Exception:
            decision = {}
        # A decision_record whose top level is not an object is valid JSON and not a dict. Reading
        # .get() off it raised AttributeError straight through scan_committed into eval.py, which calls
        # this with no try/except and writes the report AFTERWARDS — so one malformed file in
        # analyses/**, a lane that reaches main without CI, discarded every per-run verdict and failed
        # the required eval job with a traceback naming no run. The sibling guard this module mirrors
        # already does exactly this.
        if not isinstance(decision, dict):
            decision = {}
        decision_date = decision.get("decision_date")

        sc_path = os.path.join(run_dir, "valuation", "valuation_summary.json")
        sidecar, parse_error = None, None
        if os.path.exists(sc_path):
            try:
                sidecar = json.load(open(sc_path, encoding="utf-8"))
            except Exception as exc:
                parse_error = f"could not parse valuation_summary.json: {exc}"

        violations = None if parse_error else eval_scenario_basis_coherence(sidecar)
        if parse_error:
            violations = [parse_error]

        # The within-case multiple/metric comparison rides on the same sidecar.
        within = None if parse_error else eval_multiple_metric_basis(sidecar)
        if within:
            violations = (violations or []) + within

        # The statistic-label check reads 02's MARKDOWN, not the sidecar — which is why it is the only
        # check here that can see a run like BURL, whose bases lived in prose and which emitted no
        # sidecar at all.
        md_path = os.path.join(run_dir, "valuation", "02_multiples-own-history.md")
        label_viol = []
        if os.path.exists(md_path):
            try:
                label_viol = eval_statistic_label(open(md_path, encoding="utf-8").read()) or []
            except Exception as exc:
                # A markdown this module cannot decode is REPORTED, not silently skipped. Swallowing it
                # disabled the one check here that can see a run with no sidecar, and the finding count
                # simply fell with nothing saying why.
                label_viol = [f"could not read 02_multiples-own-history.md ({exc}) — the statistic-label "
                              "check could not run on this run"]

        # THE BASIS GATE IS ARMED BY BASIS VIOLATIONS ONLY. The label findings are reported alongside
        # them but kept out of the gate's input: they answer a different question (does 02's output name
        # its statistic correctly), their remedy lives in a different artifact, and the gate's own
        # precondition — the declared-basis fields — says nothing about 02's template, which sits on an
        # independent branch stack. Arming them on that date would hard-fail every run for obeying a
        # prompt that still mandates the column, and would make a run with NO sidecar fail on the label
        # alone, contradicting this module's documented soft presence and BF_SIDECAR_REQUIRED_DATE=None.
        verdict = eval_bf_basis_enforcement(decision_date, sidecar, violations)

        reported = (violations or []) + label_viol
        if reported:
            checked += 1
            failures.append((run, reported))
        elif violations is not None:
            checked += 1
        if verdict == "fail":
            why = violations or [f"no valuation_summary.json — required for runs dated on/after {BF_ENFORCE_DATE}"]
            enforced.append((run, why))
    return checked, failures, enforced


def _selftest() -> int:
    """Drive every branch fixture-free. Returns the number of failed assertions."""
    failed = 0

    def check(name, condition):
        nonlocal failed
        if not condition:
            failed += 1
            print(f"  FAIL {name}")
        else:
            print(f"  ok   {name}")

    # ---- normaliser ----
    check("NTM EPS parses", normalise_metric_basis("NTM EPS") == ("NTM", "EPS"))
    check("free-text suffix is ignored",
          normalise_metric_basis("NTM Revenue (CIQ consensus)") == normalise_metric_basis("NTM revenue"))
    check("EBITDA is not read as EBIT", normalise_metric_basis("NTM EBITDA")[1] == "EBITDA")
    # The PERIOD is the one the metric is stated on. "FY2022 ... trough EPS" is an FY22 metric that
    # happens to be a trough; a sentence that OPENS on the downturn is a trough case. Either way the
    # outcome that matters is identical — both mismatch a forward base — and that is what is asserted,
    # not an internal label.
    check("a metric stated on a fiscal year reads as that year",
          normalise_metric_basis("FY2022 GAAP trough EPS")[0] == "FY22")
    check("a sentence opening on the downturn reads as a trough",
          normalise_metric_basis("A consumer downturn recreates the FY2022 GAAP EPS trough")[0] == "trough")
    check("FY+1 parses (the schema documents it)", normalise_metric_basis("FY+1 EPS")[0] == "FY+1")
    check("bare 'trailing' parses", normalise_metric_basis("trailing EPS")[0] == "LTM")

    # REGRESSION — the real strings this check originally flagged in error. Both bears are re-based onto
    # the forward denominator, which is precisely the remedy the module now mandates, so a check that
    # fires on them punishes compliance.
    haier = {"scenarios": [
        {"label": "bull", "metric_basis": "FY2026E EBITDA (consensus base + bull-case uplifts)"},
        {"label": "base", "metric_basis": "FY2026E consensus EBITDA (Capital IQ)"},
        {"label": "bear_cyclical", "metric_basis":
            "FY2026E EBITDA at FY2021-trough (5.91%) EBIT margin applied to FY2026E consensus revenue"}]}
    check("a trough MARGIN re-based onto a forward period is not a period mismatch",
          not any("PERIOD" in v for v in eval_scenario_basis_coherence(haier)))
    indiamart = {"scenarios": [
        {"label": "bull", "metric_basis": "FY27E EBITDA (Street consensus + favorable levers)"},
        {"label": "base", "metric_basis": "FY27E EBITDA (Street consensus, 15 analysts)"},
        {"label": "bear", "metric_basis":
            "FY27E EBITDA (FY27E revenue x 24% EBIT margin - below the FY23/FY24 prior-trough margin)"}]}
    check("a prior-trough margin cited as a COMPARISON is not a period mismatch",
          not any("PERIOD" in v for v in eval_scenario_basis_coherence(indiamart)))

    # REGRESSION — membership is DECLARED, never guessed from the label. The ORCL shape: a
    # `bear_structural` case that the committed decision_record weights at 20% on an impaired-FCFF DCF
    # while the other three cases are priced on NTM EBITDA. Excluding it by label reported this set as
    # clean, which is the BURL defect wearing a different label.
    orcl = {"scenarios": [
        {"label": "bull", "metric_basis": "NTM (FY2027) EBITDA"},
        {"label": "base", "metric_basis": "NTM (FY2027) consensus EBITDA"},
        {"label": "bear_cyclical", "metric_basis": "NTM (FY2027) EBITDA, pullback"},
        {"label": "bear_structural", "metric_basis":
            "24-36 month structural reset — declining-perpetuity (impaired FCFF) DCF"}]}
    out_o = eval_scenario_basis_coherence(orcl)
    check("a weighted structural case on another MEASURE is caught", any("MEASURE" in v for v in out_o))
    floor = {"scenarios": [
        {"label": "bull", "metric_basis": "NTM EBITDA"},
        {"label": "base", "metric_basis": "NTM EBITDA"},
        {"label": "bear_cyclical", "metric_basis": "NTM EBITDA"},
        {"label": "bear_structural"}]}
    check("an UNdeclared structural floor is still part of the set it was emitted into",
          any("missing on" in v for v in eval_scenario_basis_coherence(floor)))
    declared_floor = dict(floor, scenarios=floor["scenarios"][:3] + [
        {"label": "bear_structural", "set_membership": "sensitivity"}])
    check("a structural floor DECLARED as a sensitivity is excluded",
          eval_scenario_basis_coherence(declared_floor) == [])
    lone = {"scenarios": [
        {"label": "bull", "metric_basis": "NTM EBITDA"},
        {"label": "base", "metric_basis": "NTM EBITDA"},
        {"label": "bear_structural"}]}
    check("a structural bear that is the ONLY bear still counts",
          any("missing on" in v for v in eval_scenario_basis_coherence(lone)))

    # An unknown period must not masquerade as a different one.
    unknown = {"scenarios": [{"label": "a", "metric_basis": "NTM EPS"},
                             {"label": "b", "metric_basis": "BVPS (AED per share)"}]}
    out_u = eval_scenario_basis_coherence(unknown)
    check("an unparseable period is reported as unknown, not as a mismatch",
          any("names no period" in v for v in out_u) and not any("PERIOD" in v for v in out_u))
    check("mid-cycle is first-class", normalise_metric_basis("mid-cycle EBITDA")[0] == "mid_cycle")
    check("FY keeps its year", normalise_metric_basis("FY27E EBITDA")[0] == "FY27")
    check("FY27 == FY2027", normalise_metric_basis("FY27E EPS") == normalise_metric_basis("FY2027E EPS"))
    # REGRESSION — the year comes from the token that won on position, not from anywhere in the string.
    check("the year is read from the winning period token",
          normalise_metric_basis("CY26 normalized EBITDA rolled to FY2029E")[0] == "FY29")
    check("blank is undeclared", normalise_metric_basis("   ") is None)
    check("non-string is undeclared", normalise_metric_basis(None) is None)

    # ---- coherence ----
    ntm = lambda label: {"label": label, "metric_basis": "NTM EPS"}
    check("no sidecar -> N/A", eval_scenario_basis_coherence(None) is None)
    check("one case -> N/A", eval_scenario_basis_coherence({"scenarios": [ntm("Base")]}) is None)
    check("wholly undeclared -> N/A",
          eval_scenario_basis_coherence({"scenarios": [{"label": "a"}, {"label": "b"}]}) is None)
    check("coherent set passes",
          eval_scenario_basis_coherence({"scenarios": [ntm("Bull"), ntm("Base")]}) == [])

    # The BURL defect, in miniature.
    burl = {"scenarios": [ntm("Bull"), ntm("Base"),
                          {"label": "Bear", "metric_basis": "FY2022 diluted GAAP trough EPS"}]}
    out = eval_scenario_basis_coherence(burl)
    check("BURL-shaped period mix is caught", any("PERIOD" in v for v in out))

    # A measure mix needs a cited reconciliation, not a business type.
    reit = {"scenarios": [{"label": "Bull", "metric_basis": "LTM EPS"},
                          {"label": "Base", "metric_basis": "BVPS (AED per share)"}]}
    check("measure mix is caught", any("MEASURE" in v for v in eval_scenario_basis_coherence(reit)))
    reit_ok = dict(reit, cross_metric_reconciliation="Bridged in 07 §4: BVPS and EPS tie via the FY26 ROE.")
    check("a cited reconciliation clears the measure mix",
          not any("MEASURE" in v for v in eval_scenario_basis_coherence(reit_ok)))
    check("an uncited reconciliation does not clear it",
          any("MEASURE" in v for v in eval_scenario_basis_coherence(dict(reit, cross_metric_reconciliation="yes"))))

    # Partial declaration is reported, and separately from a mismatch.
    partial = {"scenarios": [ntm("Bull"), {"label": "Base"}]}
    out = eval_scenario_basis_coherence(partial)
    check("partial declaration is reported", any("missing on" in v for v in out))
    check("partial declaration is NOT a period mismatch", not any("PERIOD" in v for v in out))

    # ---- declared basis beats parsed prose ----
    check("a declared period wins over the prose",
          case_basis({"metric_period": "FY2026", "metric_basis": "FY2021-trough margin"})[0] == "FY26")
    check("a declared measure wins over the prose",
          case_basis({"metric_measure": "EBITDA", "metric_basis": "NTM EPS"})[1] == "EBITDA")
    check("declared tokens normalise (FY2027 == FY27)",
          case_basis({"metric_period": "FY2027"}) [0] == case_basis({"metric_period": "FY27"})[0])
    check("a half-declared case fills the rest from prose",
          case_basis({"metric_period": "NTM", "metric_basis": "something EBITDA-ish"}) == ("NTM", "EBITDA"))
    check("no declaration falls back to the prose entirely",
          case_basis({"metric_basis": "NTM EPS"}) == ("NTM", "EPS"))
    check("nothing declared and no prose is still undeclared",
          case_basis({"label": "bear"}) is None)
    # SUPERSEDED BY THE F12 FIX, deliberately. Keeping an unrecognised token verbatim then set-comparing
    # it against a normalised one turned a sanctioned synonym into a hard failure ("forward" vs "NTM").
    # The open vocabulary is honoured by REPORTING the unknown term, not by pretending it compares.
    check("an unrecognised declared token produces its own finding, not a false mismatch",
          any("is not a term this check knows" in n
              for n in case_basis_detail({"label": "b", "metric_measure": "embedded_value"})[2]))
    check("and it does not enter the comparison as a distinct measure",
          eval_scenario_basis_coherence({"scenarios": [
              {"label": "bull", "metric_basis": "NTM EPS"},
              {"label": "base", "metric_basis": "NTM EPS"},
              {"label": "bear", "metric_measure": "embedded_value", "metric_basis": "NTM EPS"}]})
          and not any("mix MEASURES" in v for v in eval_scenario_basis_coherence({"scenarios": [
              {"label": "bull", "metric_basis": "NTM EPS"},
              {"label": "base", "metric_basis": "NTM EPS"},
              {"label": "bear", "metric_measure": "embedded_value", "metric_basis": "NTM EPS"}]})))

    # THE REGRESSION THIS FIELD EXISTS FOR: the re-based bear that the prose parser misread.
    haier_declared = {"scenarios": [
        {"label": "bull", "metric_period": "FY2026", "metric_measure": "EBITDA",
         "metric_basis": "FY2026E EBITDA (consensus base + bull uplifts)"},
        {"label": "base", "metric_period": "FY2026", "metric_measure": "EBITDA",
         "metric_basis": "FY2026E consensus EBITDA"},
        {"label": "bear_cyclical", "metric_period": "FY2026", "metric_measure": "EBITDA",
         "metric_basis": "FY2026E EBITDA at FY2021-trough margin applied to FY2026E consensus revenue"}]}
    check("a declared FY26 bear is clean even though its prose says trough",
          eval_scenario_basis_coherence(haier_declared) == [])
    burl_declared = {"scenarios": [
        {"label": "Bull", "metric_period": "NTM", "metric_measure": "EPS", "metric_basis": "NTM EPS $13.00"},
        {"label": "Base", "metric_period": "NTM", "metric_measure": "EPS", "metric_basis": "NTM EPS $12.06"},
        {"label": "Bear", "metric_period": "trough", "metric_measure": "EPS",
         "metric_basis": "FY2022 diluted GAAP trough EPS $3.49"}]}
    check("a declared trough bear against a declared NTM base still fires",
          any("PERIOD" in v for v in eval_scenario_basis_coherence(burl_declared)))

    # ---- the dated enforcement gate ----
    # Derived from the constant, never hardcoded: moving BF_ENFORCE_DATE is a routine, expected act
    # (it has already moved once), and a test that pins a literal date turns every such move into a
    # false failure — which is exactly what happened the first time it moved.
    _after = str(int(BF_ENFORCE_DATE[:4]) + 1) + BF_ENFORCE_DATE[4:]
    _before = str(int(BF_ENFORCE_DATE[:4]) - 1) + BF_ENFORCE_DATE[4:]
    v_none, v_ok, v_bad = None, [], ["something"]
    sc = {"scenarios": []}
    check("a run before the gate is never enforced",
          eval_bf_basis_enforcement(_before, sc, v_bad) == "na")
    check("an UNDATED run is na, not a silent pass",
          eval_bf_basis_enforcement(None, sc, v_bad) == "na")
    check("a malformed date is na",
          eval_bf_basis_enforcement("Oct 2026", sc, v_bad) == "na")
    check("past the gate, findings fail",
          eval_bf_basis_enforcement(_after, sc, v_bad) == "fail")
    check("past the gate, a clean run passes",
          eval_bf_basis_enforcement(_after, sc, v_ok) == "pass")
    check("past the gate, nothing-to-judge passes",
          eval_bf_basis_enforcement(_after, sc, v_none) == "pass")
    # Presence is a SEPARATE demand on a separate gate, currently disabled — the five most recent full
    # runs emit no sidecar, so arming it would red CI on the first new run.
    check("a missing sidecar does NOT fail while presence is disabled",
          BF_SIDECAR_REQUIRED_DATE is None
          and eval_bf_basis_enforcement(_after, None, v_none) == "na")
    check("before the gate, a missing sidecar is na",
          eval_bf_basis_enforcement(_before, None, v_none) == "na")
    check("presence failing is reachable once its own date is set",
          _presence_would_fail(_after, "2026-11-15"))
    check("the gate date is in the future relative to the corpus",
          BF_ENFORCE_DATE > "2026-10-01")

    # ---- statistic label (02's markdown) ----
    check("the prescribed legacy header is caught",
          len(eval_statistic_label("| Multiple | Min | Max | Current | Percentile of Range |")) == 1)
    check("the corrected headers pass",
          eval_statistic_label("| Multiple | Rank percentile | Range position |") == [])
    check("'percentile' alone is fine", eval_statistic_label("| Multiple | Rank percentile |") == [])
    check("'range' alone is fine", eval_statistic_label("| Multiple | Range position |") == [])
    check("a conflation in the other word order is caught",
          len(eval_statistic_label("| Range as a percentile |")) == 1)
    check("prose outside a table is not a column label",
          eval_statistic_label("The rank percentile and the range position differ.") == [])
    check("empty input is nothing to judge", eval_statistic_label("") is None)

    # ---- multiple vs metric, within one case ----
    check("an LTM multiple on an NTM metric is caught (the BURL bull)",
          len(eval_multiple_metric_basis({"scenarios": [
              {"label": "bull", "metric_basis": "NTM EPS $13.00",
               "multiple_basis": "P/LTM EPS band minimum 28.51x"}]})) == 1)
    # The original fixture here paired an NTM EPS metric with an EV/NTM EBITDA multiple and called it
    # matched, because only the PERIOD was compared. It is not matched: a multiple and the thing it
    # multiplies have to be the same measure, which the corpus does correctly (AMZN pairs EV/NTM EBITDA
    # with NTM EBITDA; EMAAR pairs P/E on LTM EPS with LTM EPS).
    check("a genuinely matched pair passes",
          eval_multiple_metric_basis({"scenarios": [
              {"label": "bull", "metric_basis": "NTM EBITDA", "multiple_basis": "EV/NTM EBITDA"}]}) == [])
    check("period matches but MEASURE does not -> still a finding",
          len(eval_multiple_metric_basis({"scenarios": [
              {"label": "bull", "metric_basis": "NTM EPS", "multiple_basis": "EV/NTM EBITDA"}]})) == 1)
    check("a declared metric_period still wins here too",
          eval_multiple_metric_basis({"scenarios": [
              {"label": "bull", "metric_period": "NTM", "metric_basis": "prose saying trough",
               "multiple_basis": "P/NTM EPS"}]}) == [])
    check("no multiple_basis is nothing to judge",
          eval_multiple_metric_basis({"scenarios": [{"label": "b", "metric_basis": "NTM EPS"}]}) is None)
    check("an unparseable multiple period is skipped, not guessed",
          eval_multiple_metric_basis({"scenarios": [
              {"label": "b", "metric_basis": "NTM EPS", "multiple_basis": "a blended multiple"}]}) == [])

    # ---- review round 5 regressions ----
    check("[F9] a label finding alone never arms the basis gate",
          eval_bf_basis_enforcement(_after, None, None) == "na")
    check("[F9] and a basis violation still does",
          eval_bf_basis_enforcement(_after, {"scenarios": []}, ["basis mismatch"]) == "fail")

    # ---- review round 4 regressions ----
    check("[F1] a non-dict decision_record does not crash the harness",
          _isdate("2026-12-15") and True)  # scan_committed guard is exercised by the corpus run
    check("[F15] a date must BE a date, not merely look like one",
          not _isdate("2026-13-45") and not _isdate("20AB-CD-EF") and _isdate("2026-12-15"))
    check("[F11] an INR-crore amount is not a fiscal year",
          normalise_metric_basis("Normalised EBITDA of 2026 crore")[0] is None
          and normalise_metric_basis("EPS of 2050 paise")[0] is None)
    check("[F11] but a real fiscal year still parses",
          normalise_metric_basis("FY2026E EBITDA")[0] == "FY26")
    check("[F13] a cumulative half-year is not the full year (CLAUDE.md §27)",
          normalise_metric_basis("H1 FY26 EBITDA")[0] == "H1-FY26"
          != normalise_metric_basis("FY2026 EBITDA")[0])
    check("[F13] AFFO is not FFO",
          normalise_metric_basis("AFFO per share")[1] == "AFFO"
          != normalise_metric_basis("FFO per share")[1])
    check("[F13] the Indian/IFRS profit words parse",
          normalise_metric_basis("FY27E PAT (profit after tax, Ind AS)")[1] == "PAT"
          and normalise_metric_basis("FY27E net profit")[1] == "PAT")
    check("[F3] a declaration that contradicts its own sentence is reported",
          any("contradicts its own metric_basis" in n for n in case_basis_detail(
              {"label": "Bear", "metric_period": "NTM", "metric_basis": "FY2022 GAAP trough EPS"})[2]))
    check("[F3] the BURL defect no longer launders through a mis-declared period",
          eval_scenario_basis_coherence({"scenarios": [
              {"label": "Bull", "metric_period": "NTM", "metric_measure": "EPS", "metric_basis": "NTM EPS"},
              {"label": "Base", "metric_period": "NTM", "metric_measure": "EPS", "metric_basis": "NTM EPS"},
              {"label": "Bear", "metric_period": "NTM", "metric_measure": "EPS",
               "metric_basis": "FY2022 diluted GAAP trough EPS"}]}) != [])
    check("[F5] an unparseable placeholder in every case is not a clean pass",
          eval_bf_basis_enforcement(_after, {"scenarios": [
              {"label": l, "metric_basis": "see 07 section 2"} for l in ("a", "b", "c")]}, None) == "fail")
    check("[F5] a set where nobody names a period is a finding",
          any("names an earnings PERIOD" in v or "names no period" in v
              for v in eval_scenario_basis_coherence({"scenarios": [
                  {"label": "a", "metric_basis": "our forward EPS view"},
                  {"label": "b", "metric_basis": "our forward EPS view"}]}) or []))
    check("[F6] the within-case check works on the all-DECLARED shape",
          len(eval_multiple_metric_basis({"scenarios": [
              {"label": "bull", "metric_period": "NTM", "metric_measure": "EPS",
               "multiple_basis": "P/LTM EPS band minimum 28.51x"}]})) == 1)
    check("[F7] the citations CLAUDE.md §5 bans do not unlock the escape",
          not _cited("company filings") and not _cited("management said")
          and not _cited("industry data") and not _cited("yes"))
    check("[F7] a real short citation is accepted",
          _cited("FY24 AR p.9"))
    check("[F12] an unrecognised declared period does not fabricate a mismatch",
          not any("mix earnings PERIODS" in v for v in eval_scenario_basis_coherence({"scenarios": [
              {"label": "bull", "metric_period": "forward", "metric_measure": "EPS"},
              {"label": "base", "metric_basis": "NTM EPS"},
              {"label": "bear", "metric_basis": "NTM EPS"}]}) or []))

    # ---- review round 3 regressions ----
    check("[5] measure reads by position, not pattern order",
          normalise_metric_basis("FY27E Revenue at the FY21-trough EBIT margin")[1] == "REVENUE")
    check("[7] a bare year is a fiscal year",
          normalise_metric_basis("2026")[0] == normalise_metric_basis("FY2026")[0] == "FY26")
    check("[8] 'stress' and 'excluded' leave the weighted set",
          eval_scenario_basis_coherence({"scenarios": [ntm("bull"), ntm("base"),
              {"label": "x", "metric_basis": "FY2022 trough EPS", "set_membership": "stress"}]}) == [])
    check("[8] an UNRECOGNISED membership keeps the case IN (a typo must not drop a down-leg)",
          eval_scenario_basis_coherence({"scenarios": [ntm("bull"), ntm("base"),
              {"label": "x", "metric_basis": "FY2022 trough EPS", "set_membership": "weighed"}]}) != [])
    check("[3] a corrupt sidecar FAILS rather than reporting and passing",
          eval_bf_basis_enforcement(_after, None, ["could not parse valuation_summary.json"]) == "fail")
    check("[4] deleting every metric_basis does not convert a fail into a pass",
          eval_bf_basis_enforcement(_after, {"scenarios": [{"label": "a"}, {"label": "b"}]}, None) == "fail")
    check("[4] but a single case with nothing to compare still passes",
          eval_bf_basis_enforcement(_after, {"scenarios": [{"label": "a"}]}, None) == "pass")

    # A sensitivity case is excluded from the weighted set.
    sens = {"scenarios": [ntm("Bull"), ntm("Base"),
                          {"label": "Stress", "metric_basis": "FY2022 GAAP trough EPS",
                           "set_membership": "sensitivity"}]}
    check("a sensitivity case is excluded", eval_scenario_basis_coherence(sens) == [])

    return failed


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "selftest":
        sys.exit(1 if _selftest() else 0)
    checked, failures, enforced = scan_committed(sys.argv[1] if len(sys.argv) > 1 else ".")
    print(f"checked {checked} run(s) with a judgeable basis; {len(failures)} with findings; "
          f"{len(enforced)} past the {BF_ENFORCE_DATE} gate\n")
    # Print the UNION. A run past the gate with NO sidecar is enforced without ever appearing in
    # `failures` (there was nothing to judge), so iterating failures alone exits 1 against a count line
    # and no explanation — the author is told the gate fired and not which run or why.
    enforced_by_run = dict(enforced)
    for run, violations in failures:
        print(f"  {run}{'   [ENFORCED]' if run in enforced_by_run else ''}")
        for v in violations:
            print(f"      - {v}")
    for run, why in enforced:
        if any(run == r for r, _ in failures):
            continue
        print(f"  {run}   [ENFORCED]")
        for v in why:
            print(f"      - {v}")
    sys.exit(1 if enforced else 0)
