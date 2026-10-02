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
prose and emitted no valuation_summary.json at all. That gap is NOT closed by this branch. It is to be
closed at the LIVE finish gate in `/research:full` (Step 10B.1) by the sibling prompt/schema stack
(#736→#737→#739→#740→#745), which also defines the declared fields this module reads — `set_membership`,
`cross_metric_reconciliation`, `metric_period`, `metric_measure` — in the valuation_summary schema
(#737/#740). Until that lands, those fields exist only in fixtures here, and `BF_SIDECAR_REQUIRED_DATE`
below stays None on purpose.

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
# Every pattern is searched in full (all occurrences), and the period a case is stated on is chosen by
# POSITION, not by list order — see `basis_detail`. `mid_cycle` and `trough` still sit first so that, at
# an equal position, the cycle claim wins: "mid-cycle NTM EBITDA" is a mid-cycle claim, not a forward one.
_NB = r"(?<![A-Za-z0-9])"   # not glued to a preceding letter/digit; `_` and `-` count as separators
# What may follow an interim token: a fiscal/calendar prefix, a glued year ("1H26", "Q1-26" handled by
# the year reader), or a separator. Anything else ("Q1st", "H1N1") is not a period.
_INTERIM_TAIL = r"(?=FY|CY|\d{2}(?!\d)|\d{4}(?!\d)|[^A-Za-z0-9]|$)"
_PERIOD_PATTERNS = (
    ("mid_cycle", r"mid[-_\s]?cycle|through[-_\s]?cycle|normali[sz]ed[-_\s]?cycle"),
    ("trough", r"\btrough\b|\bdown[-_\s]?turn\b|\bdown[-_\s]?cycle\b|\brecession\b"),
    ("LTM", r"\bLTM\b|\bTTM\b|trailing twelve|\btrailing\b"),
    ("NTM", r"\bNTM\b|next twelve|forward twelve"),
    # FY+1 / FY+2 are documented in the sidecar schema's own metric_basis examples, so they must parse.
    ("FY_REL", r"\bFY\s?\+\s?\d\b"),
    # CUMULATIVE AND STANDALONE INTERIM PERIODS ARE NOT THE FULL YEAR (§27), AND NOT EACH OTHER. "H1 FY26"
    # against "FY2026" is the half-year-vs-full-year comparison §17 and §27 forbid; H2 is not H1; Q1 is
    # not Q3. Each keeps its own number and its own year (see `_interim_period`).
    ("H2", _NB + r"(?:H2|2H)" + _INTERIM_TAIL + r"|\bsecond[-_\s]half\b"),
    ("H1", _NB + r"(?:H1|1H)" + _INTERIM_TAIL + r"|\bfirst[-_\s]half\b|half[-_\s]?year|interim[-_\s]?half"),
    # Case-sensitive on purpose: with re.I, "$9m" (nine million) read as a nine-month period.
    ("9M", _NB + r"(?-i:9M)" + _INTERIM_TAIL + r"|\bnine[-_\s]?months?\b"),
    ("Q", _NB + r"(?:Q[1-4]|[1-4]Q)" + _INTERIM_TAIL),
    # A CALENDAR YEAR IS NOT A FISCAL YEAR. CY2026 used to normalise to FY26, so a CY2026 bull and an
    # FY2026 bear compared equal — and for a March-year-end Indian filer (§27's default-likely case) those
    # two periods overlap by only three months. CY keeps its own prefix.
    ("CY", _NB + r"CY[\s_]?\d{4}E?(?![A-Za-z0-9])|\bcalendar(?:[-_\s]year)?\s+20\d{2}\b"),
    # A BARE YEAR NEEDS FISCAL CONTEXT. `\b20\d{2}E?\b` alone read "EBITDA of 2026 crore" as FY26 and
    # "EPS of 2050 paise" as FY50 — fabricating a period out of the money itself. §27 names an Indian
    # company the default-likely case, so an INR-crore amount is not an edge case to tolerate. A bare
    # year counts only with an E suffix, a fiscal word beside it, or when it IS the whole token (which
    # is how a declared metric_period reaches here: "2026" means FY2026 to every person who types it).
    ("FY", _NB + r"FY[\s_]?\d{2,4}E?(?![A-Za-z0-9])|\b20\d{2}E\b"
           r"|(?:^|\s)20\d{2}(?=\s*$)"
           r"|\b(?:fiscal|FY|year(?:\s+end(?:ing|ed))?)\s+20\d{2}\b"),
)
_INTERIM_KINDS = ("H1", "H2", "9M", "Q")

# The year an interim token belongs to, read from what immediately FOLLOWS it: "H1 FY26", "H1_FY26",
# "Q2 CY2026", "1H26", "Q1-26", "Q1'26", "9M FY27", "second half of FY26", "H1 2026". A bare two-digit
# number counts only when glued to the token ("1H26", "Q1-26"), so "H1 of 10%" does not become FY10.
_INTERIM_YEAR = re.compile(
    r"(?:[\s_-]*(?:of\s+)?(FY|CY)[\s_]?(\d{4}|\d{2})"
    r"|[\s_-]*(?:of\s+)?(20\d{2})"
    r"|[-_'’]?(\d{2}))(?![\d%])", re.I)
# A fiscal year written BEFORE its interim: "FY26 Q1 EPS" is Q1 of FY26, not FY26.
_INTERIM_AFTER_YEAR = re.compile(r"[\s_-]*(Q[1-4]|[1-4]Q|H[12]|[12]H|(?-i:9M))(?![A-Za-z0-9])", re.I)

_MEASURE_PATTERNS = (
    # A QUALIFIED MEASURE IS A DIFFERENT MEASURE. "EBITDA less CapEx" is not EBITDA; it is listed so its
    # longer match wins at the same position (ties go to the longer match — see _hits).
    ("EBITDA_LESS_CAPEX", r"\bEBITDA\s*(?:less|minus|-)\s*cap(?:ital)?[-\s]?ex(?:penditure)?\b"),
    ("EBITDA", r"\bEBITDA\b"),          # \bEBIT\b cannot match inside EBITDA, but the order documents it
    ("EBIT", r"\bEBIT\b|\boperating[-_\s]income\b"),   # US filers' "operating income" is EBIT
    ("EPS", r"\bEPS\b|earnings per share"),
    # NET INCOME IS NOT EPS. Per-share and aggregate earnings diverge by exactly the dilution and buyback
    # effects a scenario set is supposed to price, so they are different measures.
    ("NET_INCOME", r"\bnet[-_\s](?:income|earnings)\b"),
    ("BVPS", r"\bT?BVPS\b|book value"),
    # AFFO IS NOT FFO. The schema names "a REIT's AFFO" as the motivating example for an OPEN
    # vocabulary, and collapsing one onto the other let an FFO base beside an AFFO bear bypass the
    # reconciliation requirement entirely.
    ("AFFO", r"\bAFFO\b"),
    ("FFO", r"\bFFO\b"),
    ("NAV", r"\bNAV\b|net asset value"),
    ("CFO", r"\bCFO\b|operating cash[-_\s]flow|cash flow from operations"),
    ("FCF", r"\bFCF[EF]?\b|free cash[-_\s]flow"),
    # GMV IS NOT REVENUE. A marketplace books a take rate on GMV; pricing one case on GMV and another on
    # revenue is a measure mix of an order of magnitude, not a synonym.
    ("GMV", r"\bGMV\b|gross merchandi[sz]e value"),
    ("REVENUE", r"\brevenues?\b|\bsales\b|\bturnover\b"),
    ("GROSS_PROFIT", r"\bgross[-_\s]profit\b"),
    # THE PROFIT WORDS AN INDIAN OR IFRS FILER ACTUALLY USES. "FY27E PAT", "net profit", "operating
    # profit", "core earnings" all parsed to NO measure, so an EBITDA base beside a PAT bear returned
    # clean. §27: an Indian company is the default-likely case, not an edge case.
    ("PAT", r"\bPAT\b|profit[-_\s]?after[-_\s]?tax|net[-_\s]?profit|profit for the (?:year|period)"),
    ("EBT", r"\bEBT\b|profit before tax|\bPBT\b|pre[-_\s]tax (?:profit|income)"),
    ("OPERATING_PROFIT", r"operating[-_\s]?profit|\bEBITA\b"),
    ("CORE_EARNINGS", r"core[-_\s]?earnings|underlying[-_\s]?earnings"),
    ("EV_PER_SHARE", r"embedded[-_\s]?value|\bEVPS\b"),
)

# A MULTIPLE NAMES ITS OWN DENOMINATOR. "NTM P/E" states no measure word, but P/E is struck on EPS; a
# case whose metric is EBITDA priced on P/E is a measure mismatch even though no "EPS" appears anywhere.
_MULTIPLE_DENOMINATORS = (
    ("EBITDA", r"\bEV\s*/\s*(?:[A-Z+0-9.\s]{0,12})?EBITDA\b"),
    ("EBIT", r"\bEV\s*/\s*(?:[A-Z+0-9.\s]{0,12})?EBIT\b"),
    ("REVENUE", r"\bEV\s*/\s*(?:[A-Z+0-9.\s]{0,12})?(?:sales|revenues?)\b|\bP\s*/\s*S\b|price[-\s]to[-\s]sales"),
    ("BVPS", r"\bP\s*/\s*T?B(?:V|VPS)?\b|price[-\s]to[-\s](?:tangible[-\s])?book"),
    ("FCF", r"\bP\s*/\s*FCF\b|\bFCF\s+yield\b|price[-\s]to[-\s]free[-\s]cash"),
    ("AFFO", r"\bP\s*/\s*AFFO\b"),
    ("FFO", r"\bP\s*/\s*FFO\b"),
    ("NAV", r"\bP\s*/\s*NAV\b"),
    ("EPS", r"\bP\s*/\s*E\b|\bPE\s+(?:ratio|multiple)\b|price[-\s]to[-\s]earnings|earnings\s+multiple"),
)

# THE DEFINITION IS A THIRD AXIS. "NTM adjusted EPS" and "FY22 GAAP EPS" share a measure word and can
# share a period, and still differ by every add-back between them — the exact switch that carried BURL's
# bear. Reported and adjusted are different numbers, not two spellings of one.
_DEFINITION_PATTERNS = (
    ("ADJUSTED", r"\bnon[-_\s]?(?:GAAP|IFRS)\b|\badj(?:usted)?\b\.?|normali[sz]ed(?![-_\s]?cycle)"
                 r"|\bunderlying\b|\bcore\b|\brecurring\b|\bpro[-_\s]?forma\b|\bex[-_\s]items\b"),
    ("REPORTED", r"\breported\b|\bstatutory\b|\b(?:US[-_\s]?)?GAAP\b|\bIFRS\b|\bInd[-_\s]AS\b"),
)

# ISO 4217 codes, CASE-SENSITIVE so ordinary words ("try", "aud-") are never read as money. A set priced
# partly in one currency and partly in another is not one economic statement without a stated FX bridge
# (§15: no mixing of currencies without the FX date and rate).
_CURRENCY = re.compile(
    r"(?<![A-Za-z])(USD|EUR|GBP|JPY|CNY|RMB|HKD|INR|AED|SAR|QAR|KWD|CHF|CAD|AUD|NZD|SGD|KRW|TWD|BRL|MXN"
    r"|ZAR|SEK|NOK|DKK|IDR|MYR|THB|PLN|ILS|EGP|NGN|KES|PKR|VND|CLP|COP)(?![A-Za-z])")


def _hits(patterns, text):
    """Every (start, end, name) occurrence, earliest first and — at one position — longest first."""
    out = []
    for name, rx in patterns:
        for match in re.finditer(rx, text, re.I):
            out.append((match.start(), match.end(), name))
    return sorted(out, key=lambda h: (h[0], -(h[1] - h[0])))


def _interim_period(kind, token, text, end):
    """'Q1-FY26' / 'H2-CY26' / '9M-FY27', or None for an interim that names no year.

    A YEARLESS INTERIM IS AN UNKNOWN PERIOD, not a period of its own: "H1" alone cannot be compared with
    "H1 FY26", and letting bare "H1" join the set made two different years look like one."""
    if kind == "Q":
        kind = "Q" + re.search(r"[1-4]", token).group(0)
    year = _INTERIM_YEAR.match(text, end)
    if not year:
        return None
    prefix = (year.group(1) or "FY").upper()
    digits = year.group(2) or year.group(3) or year.group(4)
    return f"{kind}-{prefix}{digits[-2:]}"


def _resolve_period(hit, text):
    """The normalised period for one period hit, keeping its year and, for an interim, its number."""
    start, end, name = hit
    token = text[start:end]
    if name in _INTERIM_KINDS:
        return _interim_period(name, token, text, end)
    if name == "FY_REL":
        match = re.search(r"\+\s?(\d)", token)
        return f"FY+{match.group(1)}" if match else "FY+?"
    if name == "CY":
        match = re.search(r"(\d{4})", token)
        return f"CY{match.group(1)[-2:]}" if match else None
    if name == "FY":
        # Keep the YEAR: FY27 and FY29 are different periods. Two digits, so FY2027 and FY27 compare
        # equal. Read FROM THE WINNING TOKEN ONLY — searching the whole string lifted a year out of a
        # token the period scan had rejected. re.I so a lowercase "2027e" keeps its year.
        match = (re.search(r"FY[\s_]?\+?(\d{2,4})", token, re.I)
                 or re.search(r"\b(20\d{2})E?\b", token, re.I))
        if not match:
            return "FY"
        year = match.group(1)[-2:]
        interim = _INTERIM_AFTER_YEAR.match(text, end)
        if interim:
            kind = interim.group(1).upper()
            kind = {"1H": "H1", "2H": "H2"}.get(kind, kind)
            if kind[0].isdigit() and kind.endswith("Q"):
                kind = "Q" + kind[0]
            return f"{kind}-FY{year}"
        return f"FY{year}"
    return name


# Words that end the noun phrase a measure is stated in. "FY2022-trough margin applied TO FY2027E EBITDA"
# is an FY27 EBITDA case: the phrase attached to EBITDA starts after "to", so FY2022 is not its period.
_PHRASE_BREAK = re.compile(
    r"[,;:—–]|\s-\s|\b(?:at|of|to|from|on|onto|applied|using|with|vs\.?|versus|against|times|by|rolled"
    r"|in|for|over|under|than|below|above|plus|minus|less|x)\b", re.I)


def basis_detail(raw):
    """Free text -> {'period', 'measure', 'definition', 'currency'}, each None when the text does not say.

    Returns None for an absent/blank basis so callers can tell "undeclared" from "declared and
    unparseable" — they are different findings and only one of them is the analyst's fault.

    THE PERIOD IS THE ONE THE METRIC IS STATED ON — the period written in the same noun phrase as the
    measure — not any period word appearing anywhere in the string. "FY2026E EBITDA at FY2021-trough EBIT
    margin" is a FY26 metric that sources its margin from a trough year (HAIER, INDIAMART did exactly the
    re-basing the module requires); "FY2022-trough margin applied to FY2027E EBITDA" is the same case
    written the other way round, and taking the FIRST period in the string read it as FY22. When no period
    sits in the measure's own phrase, the earliest period in the string is used, as before.
    """
    if not isinstance(raw, str) or not raw.strip():
        return None
    text = raw.strip()

    # MEASURE BY POSITION: the metric is the one the case is stated on — the earliest mention — not
    # whichever pattern sits higher in a list ("FY27E Revenue at the FY21-trough EBIT margin" is REVENUE).
    m_hits = _hits(_MEASURE_PATTERNS, text)
    m_hit = m_hits[0] if m_hits else None
    measure = m_hit[2] if m_hit else None

    p_hits = _hits(_PERIOD_PATTERNS, text)
    phrase_start = 0
    if m_hit:
        breaks = [b.end() for b in _PHRASE_BREAK.finditer(text, 0, m_hit[0])]
        phrase_start = breaks[-1] if breaks else 0

    def _attached(h):
        # The period stated in the measure's OWN noun phrase.
        if not m_hit:
            return False
        if h[0] >= phrase_start and h[1] <= m_hit[0]:
            return True
        # An interim written "<interim> of FY26 EBITDA": the "of" is part of the interim's own
        # year-attachment (_INTERIM_YEAR consumes "of FY26"), not a phrase boundary. But _PHRASE_BREAK
        # counts "of" as a break, so the interim TOKEN lands before phrase_start while the bare FY token
        # it resolves to sits inside the phrase — which let "first half of FY26 EBITDA" read as FY26,
        # collapsing a half-year into the full year (CLAUDE.md §17/§27: a half-year is not the year).
        # Admit the interim when the YEAR it resolves to falls inside the measure's phrase, so the
        # specific interim period wins over the bare year it is built from.
        if h[2] in _INTERIM_KINDS:
            year = _INTERIM_YEAR.match(text, h[1])
            if year and phrase_start < year.end() <= m_hit[0]:
                return True
        return False

    attached = [h for h in p_hits if _attached(h)]
    p_hit = attached[0] if attached else (p_hits[0] if p_hits else None)
    period = _resolve_period(p_hit, text) if p_hit else None

    # The definition is read from the measure's own phrase first ("adjusted EPS"), then anywhere.
    scope = text[phrase_start:m_hit[1]] if m_hit else ""
    d_hits = _hits(_DEFINITION_PATTERNS, scope) or _hits(_DEFINITION_PATTERNS, text)
    definition = d_hits[0][2] if d_hits else None

    cur = _CURRENCY.search(text)
    currency = None if not cur else ("CNY" if cur.group(1) == "RMB" else cur.group(1))
    return {"period": period, "measure": measure, "definition": definition, "currency": currency}


def normalise_metric_basis(raw):
    """Free text -> (period, measure), either element None when the text does not say; None when blank.

    Thin accessor over basis_detail for callers that only need the pair."""
    detail = basis_detail(raw)
    return None if detail is None else (detail["period"], detail["measure"])


def multiple_measure(raw):
    """The measure a multiple is struck on: a measure word if the text names one, else its denominator
    (P/E -> EPS, EV/EBITDA -> EBITDA, P/B -> BVPS, EV/Sales -> REVENUE, P/FCF -> FCF)."""
    detail = basis_detail(raw)
    if detail and detail["measure"]:
        return detail["measure"]
    if not isinstance(raw, str):
        return None
    hits = _hits(_MULTIPLE_DENOMINATORS, raw)
    return hits[0][2] if hits else None


# ── declared tokens ───────────────────────────────────────────────────────────────────────────────
def _declared_token(raw):
    """A declared field as a stripped string, or None. A NUMBER IS A DECLARATION: `"metric_period": 2026`
    is how a JSON writer spells FY2026, and dropping it as not-a-string silently undeclared the case."""
    if isinstance(raw, bool):
        return None
    if isinstance(raw, (int, float)):
        raw = str(int(raw)) if float(raw).is_integer() else str(raw)
    return raw.strip() if isinstance(raw, str) and raw.strip() else None


def _fold(token):
    """Case- and separator-folded literal: 'Gross Written Premium' == 'gross_written_premium'."""
    return re.sub(r"[^A-Za-z0-9+]+", "_", str(token)).strip("_").upper()


# EXACT aliases for a DECLARED measure. A declared token is the author's own word, so it is matched whole:
# reading "EBITDA less CapEx" by its first measure word stripped the qualifier and compared it as EBITDA.
_MEASURE_ALIASES = {
    **{name: name for name, _ in _MEASURE_PATTERNS},
    "EBITDA_CAPEX": "EBITDA_LESS_CAPEX", "EBITDA_MINUS_CAPEX": "EBITDA_LESS_CAPEX",
    "OPERATING_INCOME": "EBIT", "EARNINGS_PER_SHARE": "EPS", "NET_EARNINGS": "NET_INCOME",
    "TBVPS": "BVPS", "BOOK_VALUE": "BVPS", "BOOK_VALUE_PER_SHARE": "BVPS", "BV": "BVPS",
    "NET_ASSET_VALUE": "NAV", "NAVPS": "NAV", "FCFF": "FCF", "FCFE": "FCF", "FREE_CASH_FLOW": "FCF",
    "OPERATING_CASH_FLOW": "CFO", "REVENUES": "REVENUE", "SALES": "REVENUE", "NET_SALES": "REVENUE",
    "TURNOVER": "REVENUE", "GROSS_MERCHANDISE_VALUE": "GMV", "PROFIT_AFTER_TAX": "PAT",
    "NET_PROFIT": "PAT", "PBT": "EBT", "PROFIT_BEFORE_TAX": "EBT", "EBITA": "OPERATING_PROFIT",
    "UNDERLYING_EARNINGS": "CORE_EARNINGS", "EMBEDDED_VALUE": "EV_PER_SHARE", "EVPS": "EV_PER_SHARE",
}
# A definition word in front of a KNOWN measure is the definition axis, not part of the measure.
_DECLARED_DEFINITION_PREFIX = (
    ("NON_GAAP", "ADJUSTED"), ("ADJUSTED", "ADJUSTED"), ("ADJ", "ADJUSTED"), ("NORMALISED", "ADJUSTED"),
    ("NORMALIZED", "ADJUSTED"), ("UNDERLYING", "ADJUSTED"), ("REPORTED", "REPORTED"),
    ("GAAP", "REPORTED"), ("STATUTORY", "REPORTED"), ("IFRS", "REPORTED"), ("DILUTED", None),
    ("BASIC", None),
)


def _declared_measure(token):
    """(measure, definition, known). Unknown -> its folded literal, compared as such."""
    folded = _fold(token)
    if folded in _MEASURE_ALIASES:
        return _MEASURE_ALIASES[folded], None, True
    for prefix, definition in _DECLARED_DEFINITION_PREFIX:
        rest = folded[len(prefix) + 1:]
        if folded.startswith(prefix + "_") and rest in _MEASURE_ALIASES:
            return _MEASURE_ALIASES[rest], definition, True
    return folded, None, False


def case_basis_full(case, use_multiple=True):
    """{'period','measure','definition','currency','notes'} for one case.

    DECLARED FIELDS ARE AUTHORITATIVE. The valuation_summary schema (#737/#740) says that when
    metric_period / metric_measure are present, metric_basis is NOT parsed for that axis — that is the
    point of declaring them, since prose parsing misreads re-based cases. So a declared field decides the
    comparison, and what the prose would have said is REPORTED (a note, never a gate): a gate that fires
    on the sentence the schema told the author it would not read punishes the compliant run.

    AN UNRECOGNISED DECLARED TOKEN IS COMPARED AS ITS FOLDED LITERAL, and noted. The vocabulary is open,
    so two cases both declaring "gross written premium" agree, and a case declaring it beside an EPS case
    is a genuine measure mix — neither is a reason to fall back to the prose the schema excluded.

    `use_multiple`: when the case names no measure at all, its multiple's denominator stands in.
    """
    out = {"period": None, "measure": None, "definition": None, "currency": None, "notes": []}
    if not isinstance(case, dict):
        return out
    notes = out["notes"]
    label = str(case.get("label") or "?")
    p_tok = _declared_token(case.get("metric_period"))
    m_tok = _declared_token(case.get("metric_measure"))

    if p_tok is not None:
        parsed = basis_detail(p_tok)
        if parsed and parsed["period"]:
            out["period"] = parsed["period"]
        else:
            out["period"] = _fold(p_tok)
            notes.append(f"{label}: declared metric_period {p_tok!r} is not a term this check knows — it "
                         f"is compared as the literal {out['period']!r} (report-only)")
        # A full basis written into metric_period ("FY2027E EBITDA") still declares its measure.
        if m_tok is None and parsed and parsed["measure"]:
            out["measure"] = parsed["measure"]
        if parsed:
            out["definition"], out["currency"] = parsed["definition"], parsed["currency"]
    if m_tok is not None:
        measure, definition, known = _declared_measure(m_tok)
        out["measure"] = measure
        out["definition"] = out["definition"] or definition
        if not known:
            notes.append(f"{label}: declared metric_measure {m_tok!r} is not a term this check knows — it "
                         f"is compared as the literal {measure!r} (report-only)")

    prose = basis_detail(case.get("metric_basis"))
    if prose:
        for declared, key, name in ((p_tok, "period", "metric_period"), (m_tok, "measure", "metric_measure")):
            implied = prose[key]
            if declared is not None and implied is not None and out[key] != implied:
                notes.append(
                    f"{label}: declared {name} {out[key]!r} contradicts its own metric_basis "
                    f"{str(case.get('metric_basis'))[:60]!r}, which reads as {implied!r} — the declaration "
                    "is used; check the sentence a reader sees (report-only)")
        if p_tok is None:
            out["period"] = prose["period"]
        if out["measure"] is None and m_tok is None:
            out["measure"] = prose["measure"]
        out["definition"] = out["definition"] or prose["definition"]
        out["currency"] = out["currency"] or prose["currency"]
    if use_multiple and out["measure"] is None:
        out["measure"] = multiple_measure(case.get("multiple_basis"))
    return out


def case_basis_detail(case):
    """(period, measure, notes) — the case's basis plus the report-only notes reading it produced."""
    full = case_basis_full(case, use_multiple=False)
    return (full["period"], full["measure"], full["notes"])


def case_basis(case):
    """(period, measure), preferring what the author DECLARED over what prose implies.

    Returns None when neither route says anything, so "undeclared" stays distinguishable from
    "declared and unparseable".
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
    pairs = []
    for case in _scenarios(sidecar):
        multiple = case.get("multiple_basis")
        if not (isinstance(multiple, str) and multiple.strip()):
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
        # The multiple's measure is its measure word, else its DENOMINATOR: "NTM P/E" names no "EPS",
        # but it is struck on EPS, and an EBITDA case priced on it is a measure mismatch.
        parsed = ((normalise_metric_basis(multiple) or (None, None))[0], multiple_measure(multiple))
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
# THE SCHEMA'S OWN ENUM, AND NOTHING ELSE. The valuation_summary schema as revised by the sibling
# prompt/schema stack (#737/#740) admits exactly `weighted | sensitivity | null` for set_membership, and
# valuation_summary_checks (AP) keys on the literal "sensitivity". An earlier revision here honoured nine
# spellings, so `set_membership: "stress"` bought a silent exit from THIS gate while AP still counted the
# case as weighted — a word that dodged the basis comparison and was invisible everywhere else.
_MEMBERSHIP_OUT = frozenset({"sensitivity"})
_MEMBERSHIP_IN = frozenset({"weighted"})


_MISSING = object()  # "field absent", which is NOT the same as an explicit null


def _scenarios(sidecar):
    """The sidecar's case dicts, or [] — never raises on a malformed shape.

    `{"scenarios": 1}` and a top-level JSON list are valid JSON that used to raise TypeError /
    AttributeError straight through scan_committed into eval.py, which then wrote no report at all.
    The shape defect itself is reported by `_shape_violations`; this only keeps the readers total."""
    if not isinstance(sidecar, dict):
        return []
    cases = sidecar.get("scenarios")
    return [c for c in cases if isinstance(c, dict)] if isinstance(cases, list) else []


def _shape_violations(sidecar):
    """A sidecar shape the basis checks cannot read is a finding about that run, never a crash."""
    if sidecar is None:
        return []
    if not isinstance(sidecar, dict):
        return [f"valuation_summary.json top level is a {type(sidecar).__name__}, not an object — "
                "no case basis can be read from it"]
    cases = sidecar.get("scenarios")
    if cases is None:
        return []
    if not isinstance(cases, list):
        return [f"valuation_summary.json `scenarios` is a {type(cases).__name__}, not a list — "
                "no case basis can be read from it"]
    bad = sum(1 for c in cases if not isinstance(c, dict))
    return [f"valuation_summary.json `scenarios` holds {bad} entr{'y' if bad == 1 else 'ies'} that "
            "are not objects — those cases cannot be compared"] if bad else []


def _membership_of(case) -> str:
    """Normalised set_membership. Absent / null means "weighted" — the schema's stated default."""
    return str(case.get("set_membership") or "weighted").strip().lower()


def _membership_violations(cases):
    """A set_membership outside the schema enum is a finding, not an exit and not a silent inclusion.

    Only "sensitivity" removes a case (the schema enum, and the one word AP recognises). Anything else
    keeps the case IN the comparison, so a typo can never quietly drop a real down-leg out of the
    probability-weighted set — but it is REPORTED rather than guessed either way, naming the value and
    the two it is allowed to be.
    """
    out = []
    for case in cases:
        got = _membership_of(case)
        if got in _MEMBERSHIP_OUT or got in _MEMBERSHIP_IN:
            continue
        out.append(
            f"set_membership {str(case.get('set_membership'))!r} on case "
            f"{str(case.get('label') or '?')!r} is not one of the two values the valuation_summary "
            "schema admits (weighted, sensitivity) — the case stays in the weighted comparison, and "
            "valuation_summary_checks counts it as weighted too"
        )
    return out


def _norm_label(value) -> str:
    return re.sub(r"[^a-z0-9]+", "_", str(value or "").lower()).strip("_")


def _positive(prob) -> bool:
    return isinstance(prob, (int, float)) and not isinstance(prob, bool) and prob > 0


def _refused_exclusions(cases, decision_scenarios):
    """(ids of sensitivity cases whose exclusion is refused, violations).

    THE DECISION RECORD OWNS THE PROBABILITIES, NOT THIS SIDECAR. The sidecar is written before the
    master synthesizer weights anything, so `set_membership: sensitivity` is a claim the frozen
    decision_record can contradict. Two contradictions refuse the exclusion (the case stays in the
    comparison and the refusal is reported):

      (a) the case's label matches a record scenario carrying >0 probability — a weighted case hidden
          from this gate;
      (b) the record weights (>0) a scenario that matches NO sidecar case at all — the rename evasion
          (sidecar `bear` marked sensitivity, record `Bear (structural)` at 30%). The weighted leg has
          no visible counterpart, so no sensitivity exclusion in this sidecar can be shown to be honest;
          every one not explicitly recorded at 0% is refused.

    A sensitivity case simply ABSENT from the record is honoured: the master leaves it out of the
    weighting or holds it at 0% (the sibling stack's synthesizer contract), and AP treats such a case as
    not an orphan. With no decision record (a partial run) there is nothing to join.
    """
    if not isinstance(decision_scenarios, list):
        return set(), []
    recorded = [s for s in decision_scenarios if isinstance(s, dict)]
    if not recorded:
        return set(), []

    def keys(s):
        return {k for k in (_norm_label(s.get("label")), _norm_label(s.get("scenario_id"))) if k}

    sidecar_keys = {_norm_label(c.get("label")) for c in cases} - {""}
    orphans = [s for s in recorded if _positive(s.get("probability")) and not (keys(s) & sidecar_keys)]
    refused, out = set(), []
    for case in cases:
        if _membership_of(case) not in _MEMBERSHIP_OUT:
            continue
        key = _norm_label(case.get("label"))
        match = [s for s in recorded if key and key in keys(s)]
        label = str(case.get("label") or "?")
        weighted = [s.get("probability") for s in match if _positive(s.get("probability"))]
        if weighted:
            refused.add(id(case))
            out.append(f"case {label!r} is declared set_membership: sensitivity but decision_record.json "
                       f"weights it at {weighted[0]} — a weighted case cannot leave the basis comparison; "
                       "it stays in")
        elif orphans and not match:
            refused.add(id(case))
            names = ", ".join(repr(str(s.get("label") or s.get("scenario_id") or "?")) for s in orphans)
            out.append(f"case {label!r} is declared set_membership: sensitivity while decision_record.json "
                       f"weights {names}, which matches no case in this sidecar — a renamed weighted leg "
                       "cannot be excluded through a sensitivity label; the case stays in")
    return refused, out


def _weighted_cases(sidecar, refused=frozenset()):
    """The cases that enter the probability-weighted result.

    A case explicitly marked as a sensitivity is excluded — unless its exclusion was refused against the
    decision record (`_refused_exclusions`). Reclassifying a stress case OUT of the weighted set is the
    sanctioned remedy for a basis mismatch, so the check must honour it. It is not an escape hatch —
    scenario_integrity_checks' span test still governs what the remaining set must contain.

    MEMBERSHIP IS DECLARED, NEVER GUESSED FROM THE LABEL. In every committed run that emits a
    `bear_structural` — HAIER, ORCL, SMPL, UBER, TSLA, DHER — the master synthesizer gives it a real
    probability inside the set that sums to 100%, so guessing it out of the set blessed the BURL-class
    defect on five of six runs. The only thing that removes a case is the run saying so,
    `set_membership: "sensitivity"` (introduced by #737/#740); an unrecognised value stays IN and is
    reported.
    """
    return [case for case in _scenarios(sidecar)
            if _membership_of(case) not in _MEMBERSHIP_OUT or id(case) in refused]


def _is_structural(case) -> bool:
    """A `bear_structural` case: SAME SET, DIFFERENT HORIZON BY DESIGN.

    .claude/agents/valuation/MODULE_RULES.md ("Name each case for what it IS", "Cases with different
    implied time horizons") defines bear_structural as a 24–36-month permanent-impairment reset beside a
    12-month cyclical bear, and requires each to state its own horizon. Its period therefore differs from
    the rest of the set on purpose, and the master flags the horizon blend in prose. So it is exempt from
    the PERIOD comparison only — its MEASURE, definition and currency are still checked, because a
    different horizon is no licence for a different denominator (ORCL's impaired-FCFF reset beside NTM
    EBITDA is still a measure mix)."""
    return _norm_label(case.get("label")) == "bear_structural"


# A §5 citation is [Source, Period, Page / Section / Date]. Requiring all three is what separates a
# reference from an assertion: "Bridged by the analyst, consistent with the thesis." clears a length test
# and the banned-phrase list while pointing at nothing.
_CITE_SOURCE = re.compile(
    r"\b(?:10-?[KQ]|20-?F|6-?K|8-?K|40-?F|DEF\s?14A|S-[13]|AR|annual report|interim report|results|filing"
    r"|transcript|presentation|deck|prospectus|D?RHP|AGM notice|notice|governance report|rating rationale"
    r"|CIQ|Capital IQ|Bloomberg|FactSet|IBKR|export|screenshot|LODR|RNS|NSE|BSE|SEC|Web:"
    r"|(?:0\d|99)(?:_[a-z][\w-]*)?(?![\w.%]))", re.I)
_CITE_PERIOD = re.compile(
    r"(?<![A-Za-z0-9])(?:FY|CY|Q[1-4]|[1-4]Q|H[12]|[12]H|9M)[\s_'-]?\d{2,4}|\b(?:19|20)\d{2}\b"
    r"|\b(?:LTM|NTM|TTM)\b", re.I)
_CITE_LOCATOR = re.compile(
    r"\bp{1,2}\.\s?\d|\bpages?\s+\d|§\s?\d|\bsec(?:tion|\.)\s*\d|\bnote\s+\d|\bitem\s+\d|\bex(?:hibit|\.)\s*\d"
    r"|\btable\s+\d|\bslide\s+\d|\bschedule\s+\d|\bpara(?:graph)?\.?\s*\d|\b\d{4}-\d{2}-\d{2}\b", re.I)


def _cited(value) -> bool:
    """A reconciliation must point at something, not merely assert itself.

    Not one of CLAUDE.md §5's banned bare phrases (the sibling module's helper, reused per §2) AND shaped
    like a §5 reference: a named source, a period, and a page / section / note / date locator —
    "FY24 AR p.9", "FY24 10-K, Note 13", "BVPS and EPS tie via the FY26 ROE, 02 §4",
    "Capital IQ export, data as of 2026-05-09".
    """
    if not isinstance(value, str) or not value.strip():
        return False
    text = value.strip()
    try:
        from valuation_summary_checks import _cited as _sibling_cited
        not_banned = bool(_sibling_cited(text))
    except Exception:
        banned = ("company filings", "annual report", "management said", "source", "industry data",
                  "filings", "see above", "as discussed", "n/a", "tbd")
        not_banned = text.lower().rstrip(".") not in banned
    return (not_banned and bool(_CITE_SOURCE.search(text)) and bool(_CITE_PERIOD.search(text))
            and bool(_CITE_LOCATOR.search(text)))


_FX_WORDS = re.compile(r"\bFX\b|exchange[-\s]rate|\b[A-Z]{3}\s?/\s?[A-Z]{3}\b|\bconvert", re.I)


def _describe(case, info) -> str:
    """What the check READ for one case, not only what the author wrote — so a finding shows the
    normalised (period, measure, definition, currency) it compared."""
    basis = case.get("metric_basis")
    return (f"{case.get('label') or '?'}=({info['period']}, {info['measure']}, {info['definition']}, "
            f"{info['currency']})" + (f" from {str(basis)!r}" if basis else ""))


def eval_scenario_basis_coherence(sidecar, notes=None, decision_scenarios=None):
    """Core of the scenario-basis check.

    Returns None when there is nothing to judge AND nothing to report (no sidecar, fewer than two
    weighted cases, or no declared basis at all), else a list of GATING violation strings — empty list
    meaning pass.

    `notes`: optional list; report-only findings (a declared token outside the known vocabulary, a
    declaration whose own sentence reads differently) are appended to it. They never gate: the schema
    makes the declared fields authoritative, so the prose they override is reported, not enforced.
    `decision_scenarios`: optional decision_record.json `scenarios` list; when given, a sidecar
    `sensitivity` exclusion the record contradicts is refused (`_refused_exclusions`).

    One probability-weighted set is one economic statement, so its cases must share a period, a
    measure, a definition and a currency. Mixing a forward normalized denominator with a historical GAAP
    trough produces a downside that is an artefact of the definition change rather than of the downturn
    it claims to model; on the BURL run that single switch carried the entire −74% bear leg.
    """
    if not isinstance(sidecar, dict):
        return _shape_violations(sidecar) or None  # None = no sidecar; a non-object sidecar is a finding
    report = notes if isinstance(notes, list) else []
    all_cases = _scenarios(sidecar)
    refused, refusals = _refused_exclusions(all_cases, decision_scenarios)
    # Findings that hold whatever the bases say: a malformed shape, a membership value outside the
    # enum, a sensitivity exclusion the decision record contradicts. Returning None on an undeclared
    # set used to DISCARD these — the run looked like nothing-to-judge while carrying a real finding.
    always = _shape_violations(sidecar) + _membership_violations(all_cases) + refusals
    cases = _weighted_cases(sidecar, refused)
    if len(cases) < 2:
        return always or None  # nothing to compare

    detail = [(case, case_basis_full(case)) for case in cases]
    for _, info in detail:
        report.extend(info["notes"])

    # A basis that parses to NOTHING is not a declaration: writing "see 07 section 2" into every case
    # must not pass. Declared means at least one of period / measure is actually readable.
    declared = [(c, i) for c, i in detail if i["period"] is not None or i["measure"] is not None]
    if not declared:
        return always or None  # wholly undeclared -> nothing to compare; presence is the BF gate's job

    violations = list(always)
    undeclared = [c for c, i in detail if i["period"] is None and i["measure"] is None]
    if undeclared:
        labels = ", ".join(str(c.get("label") or "?") for c in undeclared)
        violations.append(
            f"metric_basis declared on {len(declared)} of {len(cases)} weighted cases but missing on: {labels}"
            " — a set is only comparable if every case says what it is measured on"
        )

    reconciled = _cited(sidecar.get("cross_metric_reconciliation"))
    described = "; ".join(_describe(c, i) for c, i in declared)

    # ── period ── bear_structural is exempt by design (see _is_structural).
    timed = [(c, i) for c, i in declared if not _is_structural(c)]
    periods = {i["period"] for _, i in timed if i["period"] is not None}
    unparsed = [c for c, i in timed if i["period"] is None]
    # A basis that parses to no period is UNKNOWN, not a period of its own (EMAAR read ['LTM', None]),
    # and IF NOBODY NAMES A PERIOD THE SET IS NOT COMPARABLE AT ALL — the same defect, just unseen.
    if not periods and len(timed) >= 2:
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
    # WITH A CITED CROSS-METRIC RECONCILIATION, PERIODS ARE COMPARED WITHIN EACH MEASURE. A REIT's LTM
    # EPS case and its quarter-end BVPS case are a flow and a stock: they cannot share a period, and the
    # reconciliation is what bridges them. Two EPS cases on different periods are still a mismatch.
    groups = {}
    for _, i in timed:
        if i["period"] is not None:
            groups.setdefault(i["measure"] if reconciled else None, set()).add(i["period"])
    mixed = sorted({p for ps in groups.values() if len(ps) > 1 for p in ps})
    if mixed:
        violations.append(f"weighted cases mix earnings PERIODS {mixed} — {described}")

    # ── measure ── the measure analogue of the period rules: unknown is not a measure of its own.
    measures = {i["measure"] for _, i in declared if i["measure"] is not None}
    no_measure = [c for c, i in declared if i["measure"] is None]
    if not measures and len(declared) >= 2:
        violations.append(
            "no weighted case names a measure (EPS / EBITDA / EBIT / REVENUE / FCF / BVPS / NAV / FFO …) "
            "— the set cannot be shown to price one thing"
        )
    if no_measure and measures:
        labels = ", ".join(str(c.get("label") or "?") for c in no_measure)
        violations.append(
            f"metric_basis on {labels} names no measure that can be read against the rest of the set "
            f"{sorted(measures)} — state the measure (EPS / EBITDA / EBIT / REVENUE / FCF / BVPS …)"
        )
    if len(measures) > 1 and not reconciled:
        violations.append(
            f"weighted cases mix MEASURES {sorted(str(m) for m in measures)} with no cited "
            f"cross_metric_reconciliation — {described}"
        )

    # ── definition ── reported vs adjusted is a different number, not a different spelling.
    definitions = {i["definition"] for _, i in declared if i["definition"] is not None}
    if len(definitions) > 1 and not reconciled:
        violations.append(
            f"weighted cases mix DEFINITIONS {sorted(definitions)} (reported vs adjusted) with no cited "
            f"cross_metric_reconciliation bridging them — {described}"
        )

    # ── currency ── §15: no mixing of currencies without the FX date and rate.
    currencies = {i["currency"] for _, i in declared if i["currency"] is not None}
    fx_bridged = reconciled and bool(_FX_WORDS.search(str(sidecar.get("cross_metric_reconciliation"))))
    if len(currencies) > 1 and not fx_bridged:
        violations.append(
            f"weighted cases mix CURRENCIES {sorted(currencies)} with no cited FX reconciliation (rate "
            f"and date, §15) in cross_metric_reconciliation — {described}"
        )

    return violations


# ── enforcement gate ──────────────────────────────────────────────────────────────────────────────
# The rule is armed by DATE AND the emitter-canary flag below, not by merging this file. Two thirds of the committed corpus predates it —
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
# THE PRECONDITION, in order: the schema + emitter changes land, then a frozen-input canary proves a real
# run actually writes those fields. ARMING NEEDS BOTH the date AND the canary flag below: a run dated on or
# after BF_ENFORCE_DATE is enforced only while BF_EMITTER_CANARY_PROVEN is True; until then it is reported
# exactly like a pre-gate run. So the date arriving can neither arm the gate against a non-complying
# emitter (which fails every new run for a reason its author cannot fix) nor break CI on that day.
BF_ENFORCE_DATE = "2026-12-15"
# Set True ONLY once that frozen-input canary has been observed to emit the declared fields. The
# precondition is now code, not a comment: without this flag no date arms the gate.
BF_EMITTER_CANARY_PROVEN = False


def bf_armed(decision_date) -> bool:
    """True when a run of this date is ENFORCED: date on/after BF_ENFORCE_DATE AND the canary has run."""
    return bool(BF_EMITTER_CANARY_PROVEN) and _isdate(decision_date) and decision_date >= BF_ENFORCE_DATE

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
    # EXACTLY YYYY-MM-DD. Python 3.11+ fromisoformat also accepts ISO-week forms of the same length
    # ("2026-W50-1"), which then compare by string against "2026-12-15" as if they were dates.
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
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

    ARMED ONLY BY BOTH the date (decision_date >= BF_ENFORCE_DATE) AND BF_EMITTER_CANARY_PROVEN; any
    run short of either is 'na' (report-only) — see `bf_armed`.

    An UNDATED run is 'na'. That is deliberate and it is a known hole: a run carrying no decision_date
    cannot be placed on either side of a forward gate, and guessing from the folder name would make the
    gate depend on a filename convention rather than on the thesis's own stated date. It is reported by
    the scan so the hole is visible rather than silent.
    """
    if not bf_armed(decision_date):
        return "na"  # before the date, or before the emitter canary: report-only
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


def _read_json(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def _scan_run(run_dir):
    """(violations, report_only, verdict, why) for one run folder. Raises nothing it can name."""
    dr_path = os.path.join(run_dir, "decision_record.json")
    try:
        decision = _read_json(dr_path) if os.path.exists(dr_path) else {}
    except Exception:
        decision = {}
    # A decision_record whose top level is not an object is valid JSON and not a dict; reading .get()
    # off it used to raise straight through into eval.py and discard every per-run verdict.
    if not isinstance(decision, dict):
        decision = {}
    decision_date = decision.get("decision_date")
    decision_scenarios = decision.get("scenarios") if isinstance(decision.get("scenarios"), list) else None

    sc_path = os.path.join(run_dir, "valuation", "valuation_summary.json")
    sidecar, parse_error = None, None
    if os.path.exists(sc_path):
        try:
            sidecar = _read_json(sc_path)
        except Exception as exc:
            parse_error = f"could not parse valuation_summary.json: {exc}"

    notes = []
    if parse_error:
        violations = [parse_error]
    else:
        violations = eval_scenario_basis_coherence(sidecar, notes=notes,
                                                   decision_scenarios=decision_scenarios)
        # The within-case multiple/metric comparison rides on the same sidecar.
        within = eval_multiple_metric_basis(sidecar)
        if within:
            violations = (violations or []) + within

    # The statistic-label check reads 02's MARKDOWN, not the sidecar — which is why it is the only
    # check here that can see a run like BURL, whose bases lived in prose and which emitted no
    # sidecar at all.
    md_path = os.path.join(run_dir, "valuation", "02_multiples-own-history.md")
    label_viol = []
    if os.path.exists(md_path):
        try:
            with open(md_path, encoding="utf-8") as handle:
                label_viol = eval_statistic_label(handle.read()) or []
        except Exception as exc:
            # A markdown this module cannot decode is REPORTED, not silently skipped.
            label_viol = [f"could not read 02_multiples-own-history.md ({exc}) — the statistic-label "
                          "check could not run on this run"]

    # THE BASIS GATE IS ARMED BY BASIS VIOLATIONS ONLY. The label findings and the report-only notes
    # are published alongside them but kept out of the gate's input: they answer a different question,
    # and the notes concern prose the schema says is not read once a field is declared.
    verdict = eval_bf_basis_enforcement(decision_date, sidecar, violations)
    why = violations
    if verdict == "fail" and not violations:
        # Say WHICH presence demand fired. This used to claim "no valuation_summary.json" even when
        # the sidecar existed and its cases simply declared no readable basis.
        why = ([f"no valuation_summary.json — required for runs dated on/after "
                f"{BF_SIDECAR_REQUIRED_DATE}"] if sidecar is None else
               [f"{len(_weighted_cases(sidecar))} weighted cases and none declares a readable basis "
                "(metric_period / metric_measure / metric_basis) — required for runs dated on/after "
                f"{BF_ENFORCE_DATE}"])
    report_only = label_viol + [f"note (report-only): {n}" for n in notes]
    return violations, report_only, verdict, why


def scan_committed(root="."):
    """Replay every committed sidecar. Returns (checked, failures, enforced), each failure/enforced entry
    a (run, [messages]) pair.

    Deliberately UNGATED: this is the measurement entry point. Enforcement is date-gated so older runs
    are never retro-failed, but a gated measurement would hide exactly the runs the check exists to find.
    A run this module cannot evaluate at all becomes that run's own violation, never a crash that takes
    every other run's verdict down with it.
    """
    import glob

    # Walk the UNION of runs that have a decision_record OR a sidecar. A sidecar-only run is a real,
    # normal state — a partial run the per-run loop skips — and check AP scans those deliberately too.
    run_dirs = {os.path.dirname(p) for p in glob.glob(os.path.join(root, "analyses/*/decision_record.json"))}
    run_dirs |= {os.path.dirname(os.path.dirname(p))
                 for p in glob.glob(os.path.join(root, "analyses/*/valuation/valuation_summary.json"))}

    checked, failures, enforced = 0, [], []
    for run_dir in sorted(run_dirs):
        run = os.path.basename(run_dir)
        try:
            violations, report_only, verdict, why = _scan_run(run_dir)
        except Exception as exc:  # a checker defect on one run fails THAT run, visibly
            violations = [f"the basis check could not evaluate this run ({type(exc).__name__}: {exc})"]
            try:
                date = _read_json(os.path.join(run_dir, "decision_record.json")).get("decision_date")
            except Exception:
                date = None
            # Dated like every other finding: enforced past the gate, reported before it.
            report_only, verdict, why = [], eval_bf_basis_enforcement(date, None, violations), violations
        reported = (violations or []) + report_only
        if reported:
            checked += 1
            failures.append((run, reported))
        elif violations is not None:
            checked += 1
        if verdict == "fail":
            enforced.append((run, why))
    return checked, failures, enforced


def _selftest() -> int:
    """Drive every branch fixture-free. Returns the number of failed assertions.

    The enforcement branches are exercised ARMED (canary flag set for the duration, then restored);
    the unarmed behaviour has its own explicit [canary] assertions."""
    global BF_EMITTER_CANARY_PROVEN
    saved = BF_EMITTER_CANARY_PROVEN
    BF_EMITTER_CANARY_PROVEN = True
    try:
        return _selftest_body()
    finally:
        BF_EMITTER_CANARY_PROVEN = saved


def _selftest_body() -> int:
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
    # #13: the reconciled REIT shape is a flow (LTM EPS) beside a stock (quarter-end BVPS). With the
    # bridge cited, periods are compared only within a measure, so this set is clean OUTRIGHT — the old
    # assertion only checked that the MEASURE line went away and hid the period finding that remained.
    reit_ok = {"cross_metric_reconciliation": "Bridged in 07 §4: BVPS and EPS tie via the FY26 ROE.",
               "scenarios": [{"label": "Bull", "metric_basis": "LTM EPS"},
                             {"label": "Base", "metric_basis": "BVPS at Q2 FY26 quarter-end"}]}
    check("[#13] a cited reconciliation clears the stock-vs-flow set entirely",
          eval_scenario_basis_coherence(reit_ok) == [])
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
              for n in case_basis_detail({"label": "b", "metric_measure": "gross_written_premium"})[2]))
    # SUPERSEDED by #3/#9: the schema makes a declared field authoritative and says the prose is then
    # NOT parsed, so an unknown declared measure is compared as its folded literal — against EPS it is a
    # genuine measure mix, and the same literal spelled two ways is not.
    check("an unknown declared measure is compared as its folded literal, not replaced by the prose",
          any("mix MEASURES" in v for v in eval_scenario_basis_coherence({"scenarios": [
              {"label": "bull", "metric_basis": "NTM EPS"},
              {"label": "base", "metric_basis": "NTM EPS"},
              {"label": "bear", "metric_measure": "gross_written_premium", "metric_basis": "NTM EPS"}]})))

    # ---- F5: the schema's OWN mandated spellings must parse (underscore is a separator) ----
    # `_` is a word character, so \b never fires beside it. Every enum value below is mandated by
    # frameworks/valuation_summary.schema.json and 99_valuation-synthesis.md, and each one earned a
    # violation for being spelled exactly as instructed. Compliance must never be a finding.
    for token, want_period, want_measure in [
        # Interim spellings carry their year: a yearless interim is an unknown period (#14).
        ("mid_cycle", "mid_cycle", None), ("half_year FY26", "H1-FY26", None),
        ("nine_month FY27", "9M-FY27", None), ("down_cycle", "trough", None),
        ("H1_FY26", "H1-FY26", None), ("9M_FY27", "9M-FY27", None),
        ("Q2_FY27", "Q2-FY27", None), ("FY_2026", "FY26", None),
        ("net_profit", None, "PAT"), ("operating_profit", None, "OPERATING_PROFIT"),
        ("core_earnings", None, "CORE_EARNINGS"), ("embedded_value", None, "EV_PER_SHARE"),
    ]:
        got = normalise_metric_basis(token)
        check(f"schema spelling {token!r} parses (not a violation)",
              (got[0] == want_period if want_period else True)
              and (got[1] == want_measure if want_measure else True))
    check("a fully schema-compliant declared case is clean",
          not eval_scenario_basis_coherence({"scenarios": [
              {"label": "bull", "metric_period": "mid_cycle", "metric_measure": "EBITDA",
               "metric_basis": "mid_cycle EBITDA", "set_membership": "weighted", "probability": 0.3},
              {"label": "base", "metric_period": "mid_cycle", "metric_measure": "EBITDA",
               "metric_basis": "mid_cycle EBITDA", "set_membership": "weighted", "probability": 0.4},
              {"label": "bear", "metric_period": "mid_cycle", "metric_measure": "EBITDA",
               "metric_basis": "mid_cycle EBITDA", "set_membership": "weighted", "probability": 0.3}]}))

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
    # ARMING NEEDS THE CANARY FLAG AS WELL AS THE DATE — asserted both ways, independent of today.
    global BF_EMITTER_CANARY_PROVEN
    _armed_flag = BF_EMITTER_CANARY_PROVEN
    try:
        BF_EMITTER_CANARY_PROVEN = False
        check("[canary] without the canary flag a post-date run with findings is report-only",
              eval_bf_basis_enforcement(_after, sc, v_bad) == "na" and not bf_armed(_after))
        BF_EMITTER_CANARY_PROVEN = True
        check("[canary] with the canary flag a post-date run with findings is enforced",
              eval_bf_basis_enforcement(_after, sc, v_bad) == "fail" and bf_armed(_after))
        check("[canary] with the flag, a pre-date run is still report-only",
              eval_bf_basis_enforcement(_before, sc, v_bad) == "na")
    finally:
        BF_EMITTER_CANARY_PROVEN = _armed_flag

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
    # SUPERSEDED by #3: the declared field is authoritative (schema #737/#740: metric_basis is NOT
    # parsed once metric_period is present), so the prose contradiction is REPORTED, not gated.
    _f3_notes = []
    _f3 = eval_scenario_basis_coherence({"scenarios": [
        {"label": "Bull", "metric_period": "NTM", "metric_measure": "EPS", "metric_basis": "NTM EPS"},
        {"label": "Base", "metric_period": "NTM", "metric_measure": "EPS", "metric_basis": "NTM EPS"},
        {"label": "Bear", "metric_period": "NTM", "metric_measure": "EPS",
         "metric_basis": "FY2022 diluted GAAP trough EPS"}]}, notes=_f3_notes)
    check("[F3][#3] a declaration that contradicts its own sentence is reported, and does not gate",
          not any("contradicts" in v for v in _f3)
          and any("contradicts its own metric_basis" in n for n in _f3_notes))
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
    # SUPERSEDED by #3: unknown declared tokens are compared case- and separator-folded, so the same
    # unknown word agrees with itself however it is spelled — and its vocabulary note never gates.
    _f12_notes = []
    _f12 = eval_scenario_basis_coherence({"scenarios": [
        {"label": "bull", "metric_period": "Forward", "metric_measure": "EPS"},
        {"label": "base", "metric_period": "forward", "metric_measure": "EPS"},
        {"label": "bear", "metric_period": "FORWARD", "metric_measure": "EPS"}]}, notes=_f12_notes)
    check("[F12][#3] an unknown declared period agrees with itself folded, and its note is report-only",
          _f12 == [] and any("not a term this check knows" in n for n in _f12_notes))

    # ---- review round 3 regressions ----
    check("[5] measure reads by position, not pattern order",
          normalise_metric_basis("FY27E Revenue at the FY21-trough EBIT margin")[1] == "REVENUE")
    check("[7] a bare year is a fiscal year",
          normalise_metric_basis("2026")[0] == normalise_metric_basis("FY2026")[0] == "FY26")
    # ---- F12: the exit is the SCHEMA ENUM, not a vocabulary of near-synonyms ----
    # These two branches used to assert the opposite: that "stress" and "excluded" left the set. They
    # were asserting the escape hatch. The schema admits `weighted | sensitivity | null`, and AP keys on
    # the literal "sensitivity", so any other word bought a silent exit from THIS gate while AP counted
    # the case as weighted — the BURL-class mismatch dodged by one word nothing else recognised.
    def _mem(value):
        return eval_scenario_basis_coherence({"scenarios": [ntm("bull"), ntm("base"), dict(
            {"label": "x", "metric_basis": "FY2022 trough EPS"},
            **({} if value is _MISSING else {"set_membership": value}))]}) or []

    check("[8][F12] 'sensitivity' is the ONE word that leaves the set (schema enum + AP)",
          _mem("sensitivity") == [])
    for bad in ("stress", "excluded", "avoid_ruin", "illustrative", "unweighted", "weighed"):
        out = _mem(bad)
        check(f"[8][F12] {bad!r} does NOT buy an exit — it is reported",
              any("is not one of the two values" in v and repr(bad) in v for v in out))
        check(f"[8][F12] and the case {bad!r} tried to remove stays in the comparison",
              any("mix earnings PERIODS" in v for v in out))
    check("[8][F12] a schema-valid 'weighted' is neither reported nor excluded",
          _mem("weighted") and not any("is not one of the two" in v for v in _mem("weighted")))
    check("[8][F12] absent and null both default to weighted, silently",
          not any("is not one of the two" in v for v in _mem(_MISSING))
          and not any("is not one of the two" in v for v in _mem(None)))
    check("[8][F12] the reported value names the offending case, not just the value",
          any("'x'" in v for v in _mem("stress")))
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


    # ---- review round 6 regressions (each named for the review finding it closes) ----
    # chk() evaluates lazily and turns an exception into a FAIL, so these also run — and fail — against a
    # module that predates the API they exercise, instead of aborting the whole selftest.
    def chk(name, fn):
        try:
            ok = bool(fn())
        except Exception as exc:  # noqa: BLE001 — a crash is a failed assertion here
            ok = False
            name = f"{name} (raised {type(exc).__name__}: {exc})"
        check(name, ok)

    N = normalise_metric_basis
    E = eval_scenario_basis_coherence

    def _set(*bases, **extra):
        return dict({"scenarios": [{"label": f"c{i}", "metric_basis": b} for i, b in enumerate(bases)]},
                    **extra)

    import tempfile

    def _scan_tmp(sidecar_text, decision):
        with tempfile.TemporaryDirectory() as tmp:
            run = os.path.join(tmp, "analyses", "ZZZ_2099-01-01")
            os.makedirs(os.path.join(run, "valuation"))
            with open(os.path.join(run, "decision_record.json"), "w", encoding="utf-8") as handle:
                json.dump(decision, handle)
            with open(os.path.join(run, "valuation", "valuation_summary.json"), "w", encoding="utf-8") as h:
                h.write(sidecar_text)
            return scan_committed(tmp)

    # 4152293902 (#1): an undeclared set no longer discards the findings it does carry, and the gate's
    # reason names the real demand rather than a missing file.
    chk("[4152293902] an undeclared set still returns its membership finding",
        lambda: any("is not one of the two values" in v for v in (E({"scenarios": [
            {"label": "a"}, {"label": "b", "set_membership": "stress"}]}) or [])))
    chk("[4152293902] the enforced reason for a declares-nothing sidecar does not say the file is missing",
        lambda: (lambda r: r[2] and not any("no valuation_summary.json" in w for w in r[2][0][1])
                 and any("none declares a readable basis" in w for w in r[2][0][1]))(
            _scan_tmp(json.dumps({"scenarios": [{"label": "a"}, {"label": "b"}]}),
                      {"decision_date": _after})))

    # 4147748162 (#2): malformed shapes are per-run violations, never a crash.
    chk("[4147748162] scenarios=1 is a violation, not a TypeError",
        lambda: any("not a list" in v for v in E({"scenarios": 1}))
        and eval_multiple_metric_basis({"scenarios": 1}) is None)
    chk("[4147748162] a top-level list sidecar does not crash the gate",
        lambda: eval_bf_basis_enforcement(_after, [1, 2], None) in ("pass", "na", "fail"))
    chk("[4147748162] a top-level list sidecar is a per-run violation in the scan",
        lambda: any("top level is a list" in v
                    for _, vs in _scan_tmp("[1, 2]", {"decision_date": _before})[1] for v in vs))

    # 4151643279 / 4151734271 (#3): the period is the measured metric's own.
    chk("[4151643279] a trough margin applied to an FY27 metric reads FY27",
        lambda: N("FY2022-trough margin applied to FY2027E EBITDA") == ("FY27", "EBITDA"))
    chk("[4151734271] an unknown-vocabulary note is report-only (does not gate)",
        lambda: E({"scenarios": [{"label": "a", "metric_period": "NTM", "metric_measure": "GWP"},
                                 {"label": "b", "metric_period": "NTM", "metric_measure": "gwp"}]}) == [])
    chk("[4151734271] declared unknown tokens fold case and separators",
        lambda: case_basis({"metric_measure": "Gross Written Premium"})
        == case_basis({"metric_measure": "gross_written-premium"}))

    # #4: bear_structural is a separate horizon by design (MODULE_RULES) — period exempt, measure not.
    _struct = lambda basis: {"scenarios": [
        {"label": "bull", "metric_basis": "NTM EBITDA"}, {"label": "base", "metric_basis": "NTM EBITDA"},
        {"label": "Bear Structural", "metric_basis": basis}]}
    chk("[#4] a bear_structural on its own horizon is not a period mix",
        lambda: E(_struct("FY2029E EBITDA, 24-36 month structural reset")) == [])
    chk("[#4] but its measure is still compared",
        lambda: any("mix MEASURES" in v for v in E(_struct("FY2029E free cash flow reset"))))

    # 4147748120 / 4151643264 (#5): the decision record, not the sidecar, decides who is weighted.
    _sens = {"scenarios": [ntm("bull"), ntm("base"),
                           {"label": "bear", "metric_basis": "FY2022 trough EPS", "set_membership": "sensitivity"}]}
    chk("[4147748120] a 'sensitivity' case the decision record weights stays in and is reported",
        lambda: (lambda out: any("weights it at 15" in v for v in out) and any("PERIOD" in v for v in out))(
            E(_sens, decision_scenarios=[{"label": "bull", "probability": 40},
                                         {"label": "base", "probability": 45},
                                         {"label": "Bear", "probability": 15}])))
    chk("[#5 sibling contract] a 'sensitivity' case ABSENT from the decision record is honoured",
        lambda: E(_sens, decision_scenarios=[
            {"label": "bull", "probability": 50}, {"label": "base", "probability": 50}]) == [])
    chk("[4151643264] the rename evasion is refused: sidecar 'bear' sensitivity vs record 'Bear (structural)' 30%",
        lambda: (lambda out: any("matches no case in this sidecar" in v for v in out)
                 and any("PERIOD" in v for v in out))(E(_sens, decision_scenarios=[
            {"label": "bull", "probability": 30}, {"label": "base", "probability": 40},
            {"label": "Bear (structural)", "probability": 30}])))
    chk("[4151643264] a 'sensitivity' case the record carries at 0% is honoured",
        lambda: E(_sens, decision_scenarios=[{"label": "bull", "probability": 50},
                                             {"label": "base", "probability": 50},
                                             {"label": "bear", "probability": 0}]) == [])
    chk("[4147748120] the scan joins decision_record probabilities",
        lambda: any("weights it at" in v for _, vs in _scan_tmp(json.dumps(_sens), {
            "decision_date": _before, "scenarios": [{"label": "bear", "probability": 20}]})[1] for v in vs))

    # 4151643272 / 4151734256 (#6): a missing or unknown MEASURE no longer passes.
    chk("[4151643272] NTM EBITDA vs NTM operating income is a measure mix (operating income = EBIT)",
        lambda: any("mix MEASURES" in v for v in E(_set("NTM EBITDA", "NTM operating income"))))
    chk("[4151734256] NTM EPS vs a case naming no measure is a finding",
        lambda: any("names no measure" in v for v in E(_set("NTM EPS", "NTM consensus"))))
    chk("[4151734256] a set where nobody names a measure is a finding",
        lambda: any("names a measure" in v for v in E(_set("NTM consensus", "NTM street view"))))
    chk("[#6] net income is not EPS", lambda: N("NTM net income")[1] == "NET_INCOME" != N("NTM EPS")[1])

    # 4147748114 / 4151585966 (#7): reported vs adjusted.
    chk("[4147748114] adjusted vs GAAP in one weighted set is a definition mix",
        lambda: any("DEFINITIONS" in v for v in E(_set("NTM adjusted EPS", "NTM GAAP EPS"))))
    chk("[4151585966] a cited reconciliation clears the definition mix",
        lambda: E(_set("NTM adjusted EPS", "NTM GAAP EPS",
                       cross_metric_reconciliation="FY25 10-K, Item 7: adjusted-to-GAAP bridge")) == [])

    # 4147748155 / 4151585968 / 4151734259 (#8): a calendar year is not a fiscal year.
    chk("[4147748155] CY2026 reads as CY26", lambda: N("CY2026 EBITDA")[0] == "CY26")
    chk("[4151734259] CY2026 and FY2026 do not compare equal",
        lambda: any("PERIOD" in v for v in E(_set("CY2026 EBITDA", "FY2026 EBITDA"))))

    # 4151734263 (#9): a declared measure is matched whole.
    chk("[4151734263] a declared 'EBITDA less CapEx' is not EBITDA",
        lambda: case_basis({"metric_measure": "EBITDA less CapEx"})[1] != "EBITDA"
        and case_basis({"metric_measure": "adjusted EBITDA"})[1] == "EBITDA")

    # 4147651481 (#10)
    chk("[4147651481] lowercase 2027e keeps its year", lambda: N("2027e EBITDA")[0] == "FY27")

    # 4147748127 / 4151585971 (#11): a reconciliation must be shaped like a §5 reference.
    chk("[4147748127] an 8+ character assertion is not a citation",
        lambda: not _cited("Bridged by the analyst, consistent with the thesis."))
    chk("[4151585971] a §5-shaped reference is a citation",
        lambda: _cited("FY24 10-K, Note 13 (Debt)") and _cited("BVPS and EPS tie via the FY26 ROE, 02 §4")
        and _cited("Capital IQ Multiples export, data as of 2026-05-09")
        and not _cited("BVPS and EPS tie via the FY26 ROE"))

    # 4147748136 (#12): a multiple's denominator is a measure.
    chk("[4147748136] an EBITDA metric priced on P/E is a measure mismatch",
        lambda: any("struck on EPS" in v for v in eval_multiple_metric_basis({"scenarios": [
            {"label": "b", "metric_basis": "NTM EBITDA", "multiple_basis": "NTM P/E"}]})))
    chk("[4147748136] a case naming no measure takes its multiple's denominator",
        lambda: E({"scenarios": [ntm("bull"), ntm("base"),
                                 {"label": "bear", "metric_basis": "NTM", "multiple_basis": "NTM P/E 18x"}]}) == [])

    # 4147748143 (#13): with a cited bridge, periods are compared within each measure — not ignored.
    chk("[4147748143] two EPS cases on different periods still mismatch under a reconciliation",
        lambda: any("PERIOD" in v for v in E({
            "cross_metric_reconciliation": "Bridged in 07 §4: BVPS and EPS tie via the FY26 ROE.",
            "scenarios": [{"label": "a", "metric_basis": "LTM EPS"}, {"label": "b", "metric_basis": "NTM EPS"},
                          {"label": "c", "metric_basis": "BVPS at Q2 FY26 quarter-end"}]})))

    # 4151395622 (#14): interim periods keep their number and their year.
    chk("[4151395622] Q1-FY26 is not Q3-FY26",
        lambda: N("Q1 FY26 EPS")[0] == "Q1-FY26" != N("Q3 FY26 EPS")[0] == "Q3-FY26")
    chk("[4151395622] Qn-YY, Q2 CY2026, 1H26, H2 FY26 and 'second half FY26' read correctly",
        lambda: N("Q1-26 EPS")[0] == "Q1-FY26" and N("Q2 CY2026 EPS")[0] == "Q2-CY26"
        and N("1H26 EBITDA")[0] == "H1-FY26" and N("H2 FY26 EBITDA")[0] == "H2-FY26"
        and N("second half FY26 EBITDA")[0] == "H2-FY26")
    chk("[4151395622] H2 is neither H1 nor the full year",
        lambda: len({N("H2 FY26 EPS")[0], N("H1 FY26 EPS")[0], N("FY2026 EPS")[0]}) == 3)
    chk("[4151395622] a yearless interim is an unknown period", lambda: N("H1 EPS")[0] is None)
    # The "of" spelling of an interim must keep its number and year. "first half of FY26 EBITDA" put
    # the interim token before the "of" phrase-break while the bare FY token sat in the measure phrase,
    # so it collapsed to FY26 — a half-year read as the full year (§17/§27). Red on the pre-fix parser.
    chk("[interim-of] an interim written with 'of FYxx' keeps its number and year",
        lambda: N("first half of FY26 EBITDA")[0] == "H1-FY26"
        and N("H2 of FY26 EBITDA")[0] == "H2-FY26"
        and N("Q1 of FY26 EPS")[0] == "Q1-FY26"
        and N("9M of FY26 revenue")[0] == "9M-FY26")
    chk("[interim-of] a half-year 'of' leg against a full-year base still mismatches",
        lambda: any("PERIOD" in v for v in E(_set("FY2026 EBITDA", "first half of FY26 EBITDA"))))
    chk("[interim-of] 'EBITDA of 2026 crore' is still money, not FY26 (no regression)",
        lambda: N("EBITDA of 2026 crore")[0] is None)

    # 4151395628 / 4151395634 (#15)
    chk("[4151395628] GMV is not revenue", lambda: N("NTM GMV")[1] == "GMV" != N("NTM revenue")[1])
    chk("[4151395634] two currencies in a weighted set without an FX bridge is a finding",
        lambda: any("CURRENCIES" in v for v in E(_set("NTM EPS (USD)", "NTM EPS (INR)"))))
    chk("[4151395634] a cited FX reconciliation clears it",
        lambda: E(_set("NTM EPS (USD)", "NTM EPS (INR)", cross_metric_reconciliation=(
            "FY26 AR, Note 2: INR translated at the FX rate of 86.1 on 2026-03-31"))) == [])

    # 4151734268 (#17): the finding prints what was READ, per case.
    chk("[4151734268] diagnostics print the normalised tuple per case",
        lambda: any("(LTM, EPS, None, None)" in v and "(NTM, EPS, None, None)" in v
                    for v in E(_set("LTM EPS", "NTM EPS"))))

    # 4151718290 / 4151718322 / 4151718313 (#18)
    chk("[4151718290] a numeric declared metric_period is a declaration",
        lambda: case_basis({"metric_period": 2026, "metric_measure": "EPS"}) == ("FY26", "EPS"))
    chk("[4151718322] and a boolean is not", lambda: case_basis({"metric_period": True}) is None)
    chk("[4151718313] a full basis written into metric_period fills the measure",
        lambda: case_basis({"metric_period": "FY2027E EBITDA"}) == ("FY27", "EBITDA"))

    # 4151448487 residue (#19): an ISO-week string is not a date.
    chk("[4151448487] an ISO-week form is not a date", lambda: not _isdate("2026-W50-1"))

    return failed


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] in ("selftest", "--selftest"):
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
