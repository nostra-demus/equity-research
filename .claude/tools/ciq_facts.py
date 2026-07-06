"""ciq_facts.py — deterministic, source-bound CIQ facts (the B2 facts sidecar).

Reads a subject's CIQ folder, resolves each (file, tab) to a canonical concept (concept_resolve.py, so a
SPLIT per-tab export and a single multi-tab workbook parse identically), and applies the PROVEN CIQ reading
rules (ported from mosaic-theory/vinci/dossier/ciq_sheets.py — Close-only Multiples with the partial last
column excluded, Reclassified-basis boundaries, Balance-Sheet 'as of' anchor column, header-LABEL columns,
UNAVAILABLE->None never 0) to emit ciq_facts.json.

Every fact is one of: PRESENT (value + the exact sheet/row/period it came from), UNKNOWN (looked for,
absent — with the reason), or MISSING (the whole CIQ export is absent). A number is NEVER fabricated
(CLAUDE.md §3/§5/§15). This layer only PUBLISHES facts — no agent reads it yet (wiring is a later change);
it gives verify-evidence a machine ground-truth and the agents a source-pinned base to cite.

Usage:  python3 ciq_facts.py <DATA_DIR> [--json]
"""
from __future__ import annotations

import enum
import json
import re
import statistics
import sys
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path
from typing import Any, Callable

from ciq import CiqUnavailableError, clean_num, excel_date
from concept_resolve import ResolvedPool, resolve_folder

Rows = list[list[Any]]


class SourceStatus(str, enum.Enum):
    PRESENT = "present"
    UNKNOWN = "unknown"  # looked for, absent
    MISSING = "missing"  # the whole CIQ export is absent


@dataclass(frozen=True)
class Sourced:
    """One mechanical fact: a value bound to a source_ref, or an honest UNKNOWN/MISSING (value=None)."""

    value: Any = None
    source_ref: str | None = None
    status: SourceStatus = SourceStatus.UNKNOWN
    note: str | None = None

    @classmethod
    def present(cls, value: Any, *, source_ref: str, note: str | None = None) -> "Sourced":
        return cls(value=value, source_ref=source_ref, status=SourceStatus.PRESENT, note=note)

    @classmethod
    def unknown(cls, *, note: str) -> "Sourced":
        return cls(status=SourceStatus.UNKNOWN, note=note)

    @classmethod
    def missing(cls, *, note: str) -> "Sourced":
        return cls(status=SourceStatus.MISSING, note=note)


class ResolvedBundle:
    """Backs the reading rules with the layout-agnostic concept map instead of vinci's filename mapping."""

    def __init__(self, pool: ResolvedPool) -> None:
        self.pool = pool
        self.ticker = pool.ticker

    def has(self, kind: str) -> bool:
        return self.pool.has(kind)

    def sheet(self, kind: str, sheet: str, *, freq: str | None = None) -> Rows:
        rows = self.pool.rows(kind, sheet, freq)
        if rows is None:
            raise CiqUnavailableError(f"no '{kind}/{sheet}' concept resolved for {self.ticker}")
        return rows


# --- shared helpers (ported from ciq_sheets.py) -----------------------------------------------
_MULT_HEADER = ("For Quarter Ending", "For Period Ending", "For the Period")
_RANGE_BANDS = ((0.25, "near-floor"), (0.50, "below-center"), (0.75, "above-center"), (1.01, "near-ceiling"))
_MIN_CONFIDENT_CLOSES = 8


def _miss_or_unknown(bundle: ResolvedBundle, kind: str, exc: Exception) -> Sourced:
    if not bundle.has(kind):
        return Sourced.missing(note=f"CIQ '{kind}' export not found for {bundle.ticker} — pull it")
    return Sourced.unknown(note=str(exc))


def _find_row(rows: Rows, label: str) -> int | None:
    return next((i for i, r in enumerate(rows) if r and str(r[0]).strip() == label), None)


def _find_row_prefix(rows: Rows, label: str) -> int | None:
    return next((i for i, r in enumerate(rows) if r and str(r[0]).strip().startswith(label)), None)


def _period_header(rows: Rows) -> int | None:
    return next((i for i, r in enumerate(rows) if r and "Fiscal Period" in str(r[0])), None)


def _bs_period_header(rows: Rows) -> int | None:
    return next((i for i, r in enumerate(rows) if r and "as of" in str(r[0]).lower()), None)


def _reclassified_cols(header: list[Any]) -> set[int]:
    return {j for j, c in enumerate(header) if isinstance(c, str) and "Reclassified" in c}


def _amt(v: float | None, ccy: str | None) -> str:
    """A money amount labelled with its currency CODE, never a hard-coded '$'. CIQ target prices are in the
    company's own trading currency (INR/GBP/…), so asserting USD on a non-US name is a §15/§27 defect."""
    if v is None:
        return "—"
    return f"{ccy} {v:,.2f}" if ccy else f"{v:,.2f}"


def _pct1(v: float | None) -> str:
    return f"{v * 100:.1f}%" if v is not None else "—"


def _latest_col(rows: Rows, ri: int, hdr: int | None) -> tuple[int, float, str] | None:
    present = [(j, v) for j in range(1, len(rows[ri])) if (v := clean_num(rows[ri][j])) is not None]
    if not present:
        return None
    j, v = present[-1]
    period = ""
    if hdr is not None and j < len(rows[hdr]):
        period = str(rows[hdr][j]).strip().replace("\n", " ")
    return j, v, period


def _multiples_close(rows: Rows, metric: str) -> list[tuple[date | None, float | None]]:
    hdr = next((i for i, r in enumerate(rows) if r and any(str(r[0]).strip().startswith(h) for h in _MULT_HEADER)), None)
    lbl = _find_row(rows, metric)
    if hdr is None or lbl is None:
        return []
    close = next((i for i in range(lbl, min(lbl + 6, len(rows)))
                  if len(rows[i]) > 1 and str(rows[i][1]).strip() == "Close"), None)
    if close is None:
        return []
    cols = range(2, min(len(rows[hdr]), len(rows[close])))
    return [(excel_date(rows[hdr][j]), clean_num(rows[close][j])) for j in cols]


def _period_label(cell: Any) -> str:
    s = str(cell).replace("\n", " ").strip()
    m = re.search(r"([A-Z][a-z]{2}-[\d-]*\d{4}|\d{4})", s)
    suffix = (" (R)" if "Reclassified" in s else "") + (" (LTM)" if "LTM" in s.upper() else "")
    return (m.group(1) if m else s[:10]) + suffix


_QUARTER_LABEL = re.compile(r"\bQ[1-4]\b|\b[1-4]Q\b|(?:three|3)[\s-]*months?", re.I)


def _is_single_quarter(label: Any) -> bool:
    """True when a Fiscal-Period label denotes a SINGLE quarter (3 months) rather than a full fiscal year
    or LTM. Used to stop an annual/LTM money fact from ever publishing a single-quarter figure under an
    'ltm_' key — a 4x period error (§15). 'LTM …' (twelve months) and 'FY…' both return False."""
    s = str(label)
    if re.search(r"\bLTM\b", s, re.I):
        return False
    return bool(_QUARTER_LABEL.search(s))


def _fmt_num(v: float) -> str:
    return f"{v:,.0f}"


def _fmt_pct(v: float) -> str:
    return f"{v * 100:.1f}%"


def _trajectory_row(rows: Rows, ri: int | None, hdr: int | None, fmt: Callable[[float], str] = _fmt_num) -> str | None:
    if ri is None or hdr is None:
        return None
    parts = [f"{_period_label(rows[hdr][j]) if j < len(rows[hdr]) else f'c{j}'} {fmt(v)}"
             for j in range(1, len(rows[ri])) if (v := clean_num(rows[ri][j])) is not None]
    return " → ".join(parts) if len(parts) >= 2 else None


def _quarter_token(cell: Any) -> str | None:
    m = re.search(r"\bQ([1-4])\b", str(cell))
    return f"Q{m.group(1)}" if m else None


def _short_period(cell: Any) -> str:
    s = str(cell).replace("\n", " ").strip()
    m = re.search(r"(Q[1-4]).*?([A-Z][a-z]{2}-[\d-]*\d{4})", s)
    return f"{m.group(1)} {m.group(2)}" if m else s[:16]


# --- valuation: Financials -> Multiples (historical, Close-only) ------------------------------
def ev_ebitda_current(bundle: ResolvedBundle) -> Sourced:
    try:
        rows = bundle.sheet("financials", "Multiples", freq="quarterly")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "financials", exc)
    ev = [v for _, v in _multiples_close(rows, "TEV/LTM EBITDA") if v is not None]
    if not ev:
        return Sourced.unknown(note="TEV/LTM EBITDA Close has no value")
    return Sourced.present(round(ev[-1], 1), source_ref="CIQ Financials→Multiples 'TEV/LTM EBITDA' Close (latest)")


def ev_ebitda_percentile(bundle: ResolvedBundle) -> Sourced:
    try:
        rows = bundle.sheet("financials", "Multiples", freq="quarterly")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "financials", exc)
    series = [v for _, v in _multiples_close(rows, "TEV/LTM EBITDA") if v is not None]
    if len(series) < 4:
        return Sourced.unknown(note=f"TEV/LTM EBITDA Close <4 quarters ({len(series)}) — no pctile")
    current, history = series[-1], series[:-1]  # partial last col = current, excluded from history
    pct = sum(1 for h in history if h <= current) / len(history)
    return Sourced.present(round(pct, 3),
                           source_ref=f"CIQ Financials→Multiples 'TEV/LTM EBITDA' Close — {len(history)} quarters (last col excluded)")


def range_position(bundle: ResolvedBundle) -> Sourced:
    try:
        rows = bundle.sheet("financials", "Multiples", freq="quarterly")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "financials", exc)
    ev_pairs = [(d, v) for d, v in _multiples_close(rows, "TEV/LTM EBITDA") if v is not None]
    if len(ev_pairs) < 4:
        return Sourced.unknown(note="TEV/LTM EBITDA Close has <4 quarters — no range position")
    ev = [v for _, v in ev_pairs]
    cur, hist = ev[-1], ev[:-1]
    lo, hi, med = min(hist), max(hist), statistics.median(hist)
    pct = sum(1 for h in hist if h <= cur) / len(hist)
    if len(hist) < _MIN_CONFIDENT_CLOSES:
        where = f"LOW-CONFIDENCE ({len(hist)} closes <{_MIN_CONFIDENT_CLOSES}q ≈2y) — floor read unreliable"
    else:
        where = f"{pct:.0%}ile → {next(b for t, b in _RANGE_BANDS if pct <= t)}"
    asof = f" as-of {ev_pairs[-1][0].isoformat()}" if ev_pairs[-1][0] is not None else ""
    return Sourced.present(
        f"EV/EBITDA (TEV/LTM) {cur:.1f}x{asof} — trailing range {lo:.1f}–{hi:.1f}x (median {med:.1f}x) over {len(hist)} closes → {where}",
        source_ref="CIQ Financials→Multiples (Close; last col = current, excluded from history)")


def pe_ltm_current(bundle: ResolvedBundle) -> Sourced:
    try:
        rows = bundle.sheet("financials", "Multiples", freq="quarterly")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "financials", exc)
    pe = [v for _, v in _multiples_close(rows, "P/LTM EPS") if v is not None]
    if not pe:
        return Sourced.unknown(note="P/LTM EPS Close has no value")
    return Sourced.present(round(pe[-1], 1), source_ref="CIQ Financials→Multiples 'P/LTM EPS' Close (latest)")


# --- quality: Cash Flow / Income Statement / Balance Sheet ------------------------------------
def levered_fcf(bundle: ResolvedBundle) -> Sourced:
    """CIQ's LEVERED Free Cash Flow (after interest & debt service) — NOT the engine's §15 FCF (CFO − total
    capex, unlevered). Named + source-labelled so an agent never cites it as the canonical §15 FCF."""
    try:
        rows = bundle.sheet("financials", "Cash Flow", freq="annual")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "financials", exc)
    ri = _find_row(rows, "Levered Free Cash Flow")
    if ri is None:
        return Sourced.unknown(note="Cash Flow sheet has no 'Levered Free Cash Flow' row")
    latest = _latest_col(rows, ri, _period_header(rows))
    if latest is None:
        return Sourced.unknown(note="Levered Free Cash Flow has no value in any period")
    _, value, period = latest
    if _is_single_quarter(period):
        return Sourced.unknown(note=f"latest Levered Free Cash Flow column is a single quarter [{period}], not "
                                    "LTM/annual — refusing to publish a 3-month figure as an annual fact (§15)")
    return Sourced.present(round(value, 1),
                           source_ref=f"CIQ Financials→Cash Flow 'Levered Free Cash Flow' [{period}] — LEVERED FCF (after interest), NOT the §15 CFO−capex FCF")


def interest_coverage(bundle: ResolvedBundle) -> Sourced:
    try:
        rows = bundle.sheet("financials", "Income Statement", freq="annual")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "financials", exc)
    e_i, i_i, hdr = _find_row(rows, "EBITDA"), _find_row(rows, "Interest Expense"), _period_header(rows)
    if e_i is None or i_i is None:
        return Sourced.unknown(note="Income Statement missing EBITDA or Interest Expense row")
    col = next((j for j in range(len(rows[e_i]) - 1, 0, -1)
                if clean_num(rows[e_i][j]) is not None and j < len(rows[i_i]) and clean_num(rows[i_i][j]) is not None), None)
    if col is None:
        return Sourced.unknown(note="no period with both EBITDA and Interest Expense")
    ebitda, interest = clean_num(rows[e_i][col]), clean_num(rows[i_i][col])
    if not interest or ebitda is None:
        return Sourced.unknown(note="interest expense is zero/unavailable")
    period = str(rows[hdr][col]).strip().replace("\n", " ") if hdr is not None else ""
    return Sourced.present(round(ebitda / abs(interest), 1),
                           source_ref=f"CIQ Financials→Income Statement EBITDA ÷ Interest Expense [{period}]")


def _bs_latest(bundle: ResolvedBundle, label: str) -> Sourced:
    def pick(rows: Rows) -> Sourced | None:
        ri = _find_row(rows, label)
        if ri is None:
            return None
        latest = _latest_col(rows, ri, _bs_period_header(rows))
        if latest is None:
            return None
        _, value, period = latest
        suffix = f" [{period}]" if period else " [latest]"
        return Sourced.present(round(value, 1), source_ref=f"CIQ Financials→Balance Sheet '{label}'{suffix}")

    seen = False
    unavailable: Exception | None = None
    for freq in ("quarterly", "annual"):  # freshest first
        try:
            rows = bundle.sheet("financials", "Balance Sheet", freq=freq)
            seen = True
            if (got := pick(rows)) is not None:
                return got
        except CiqUnavailableError as exc:
            unavailable = exc
    if not seen and unavailable is not None:
        return _miss_or_unknown(bundle, "financials", unavailable)
    return Sourced.unknown(note=f"Balance Sheet has no '{label}' row (quarterly or annual)")


def net_debt(bundle: ResolvedBundle) -> Sourced:
    # CIQ's 'Net Debt' is a VENDOR basis (may net short-term / liquid investments) — label it so a consumer
    # reconciles against the strict total-debt − cash-equivalents basis before publishing (§15).
    s = _bs_latest(bundle, "Net Debt")
    if s.status is SourceStatus.PRESENT and s.source_ref:
        return Sourced.present(s.value, note=s.note,
                               source_ref=s.source_ref + " — CIQ vendor basis (may net short-term/liquid investments; confirm vs the strict total-debt−cash basis, §15)")
    return s


def total_debt(bundle: ResolvedBundle) -> Sourced:
    return _bs_latest(bundle, "Total Debt")


def ltm_ebitda(bundle: ResolvedBundle) -> Sourced:
    try:
        rows = bundle.sheet("financials", "Income Statement", freq="annual")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "financials", exc)
    ri = _find_row(rows, "EBITDA")
    if ri is None:
        return Sourced.unknown(note="Income Statement sheet has no 'EBITDA' row")
    latest = _latest_col(rows, ri, _period_header(rows))
    if latest is None:
        return Sourced.unknown(note="EBITDA row has no value in any period")
    _, value, period = latest
    if _is_single_quarter(period):
        return Sourced.unknown(note=f"latest EBITDA column is a single quarter [{period}], not LTM/annual — "
                                    "refusing to publish a 3-month figure under an LTM key (§15)")
    return Sourced.present(round(value, 1), source_ref=f"CIQ Financials→Income Statement 'EBITDA' [{period}]")


def net_debt_to_ebitda(bundle: ResolvedBundle) -> Sourced:
    """Derived leverage ratio: net debt ÷ LTM EBITDA (dimensionless ×). Computed ONLY when BOTH operands
    are PRESENT and EBITDA > 0 — never fabricated (§3). A negative result is net cash (a valid, important
    outcome), so only a non-positive EBITDA denominator is rejected — not a negative numerator. Inherits
    net_debt's CIQ vendor basis, so the ratio carries the same §15 confirm-vs-strict caveat via the
    embedded source_ref."""
    nd = net_debt(bundle)
    eb = ltm_ebitda(bundle)
    if nd.status is SourceStatus.MISSING or eb.status is SourceStatus.MISSING:
        return Sourced.missing(note="net debt / EBITDA needs the CIQ Financials export (net debt + LTM EBITDA) — pull it")
    if nd.status is not SourceStatus.PRESENT or eb.status is not SourceStatus.PRESENT:
        absent = "net debt" if nd.status is not SourceStatus.PRESENT else "LTM EBITDA"
        return Sourced.unknown(note=f"cannot derive net debt / EBITDA — {absent} is not PRESENT")
    if eb.value is None or eb.value <= 0:
        return Sourced.unknown(note=f"LTM EBITDA is {eb.value} — net debt / EBITDA is undefined against a non-positive EBITDA")
    return Sourced.present(
        round(nd.value / eb.value, 2),
        source_ref=(f"derived = net debt ÷ LTM EBITDA = {nd.value:,.1f} / {eb.value:,.1f} "
                    f"[{nd.source_ref}; {eb.source_ref}]"),
    )


def ltm_ocf(bundle: ResolvedBundle) -> Sourced:
    try:
        rows = bundle.sheet("financials", "Cash Flow", freq="annual")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "financials", exc)
    ri = _find_row(rows, "Cash from Ops.")
    if ri is None:
        return Sourced.unknown(note="Cash Flow sheet has no 'Cash from Ops.' row")
    latest = _latest_col(rows, ri, _period_header(rows))
    if latest is None:
        return Sourced.unknown(note="'Cash from Ops.' has no value in any period")
    _, value, period = latest
    if _is_single_quarter(period):
        return Sourced.unknown(note=f"latest Cash from Ops. column is a single quarter [{period}], not LTM/annual — "
                                    "refusing to publish a 3-month figure under an LTM key (§15)")
    return Sourced.present(round(value, 1), source_ref=f"CIQ Financials→Cash Flow 'Cash from Ops.' [{period}]")


def margin_trend(bundle: ResolvedBundle) -> Sourced:
    try:
        rows = bundle.sheet("financials", "Income Statement", freq="annual")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "financials", exc)
    hdr, rev_i = _period_header(rows), _find_row(rows, "Total Revenue")
    if rev_i is None or hdr is None:
        return Sourced.unknown(note="Income Statement missing Total Revenue / period header")

    def margin_traj(ri: int | None) -> str | None:
        if ri is None:
            return None
        parts = []
        for j in range(1, len(rows[ri])):
            v, rv = clean_num(rows[ri][j]), (clean_num(rows[rev_i][j]) if j < len(rows[rev_i]) else None)
            if v is not None and rv:
                lab = _period_label(rows[hdr][j]) if j < len(rows[hdr]) else f"c{j}"
                parts.append(f"{lab} {v / rv:.0%}")
        return " → ".join(parts) if len(parts) >= 2 else None

    eb_i = _find_row(rows, "EBITDA")
    eb_traj, gp_traj = margin_traj(eb_i), margin_traj(_find_row(rows, "Gross Profit"))
    if eb_traj is None and gp_traj is None:
        return Sourced.unknown(note="no gross/EBITDA margin series in the Income Statement")
    bits = [f"EBITDA margin: {eb_traj}"] if eb_traj else []
    if gp_traj:
        bits.append(f"gross margin: {gp_traj}")
    if (abs_eb := _trajectory_row(rows, eb_i, hdr)):
        bits.append(f"absolute EBITDA: {abs_eb}")
    return Sourced.present("; ".join(bits) + "  [R reclassified; margin % can fall while absolute EBITDA RISES — read together]",
                           source_ref="CIQ Financials→Income Statement (margin % + absolute EBITDA reconciler)")


# --- concentration: Segments -----------------------------------------------------------------
def _segment_section(bundle: ResolvedBundle, section: str, *, after_label: str | None = None,
                     total_label: str = "Total") -> Sourced:
    try:
        rows = bundle.sheet("financials", "Segments", freq="annual")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "financials", exc)
    hdr, floor = _period_header(rows), 0
    if after_label is not None:
        a = next((i for i, r in enumerate(rows) if r and after_label in str(r[0])), None)
        if a is None:
            return Sourced.unknown(note=f"Segments sheet has no '{after_label}' section")
        floor = a
        h = _period_header(rows[a:])
        hdr = h + a if h is not None else None
    start = next((i for i in range(floor, len(rows)) if rows[i] and str(rows[i][0]).strip() == section), None)
    total = next((i for i in range(floor, len(rows))
                  if rows[i] and str(rows[i][0]).strip().startswith(f"Total {section.rstrip('s')}")), None)
    if start is None or total is None or hdr is None:
        return Sourced.unknown(note=f"Segments sheet has no '{section}' section as expected")
    latest = _latest_col(rows, total, hdr)
    if latest is None:
        return Sourced.unknown(note=f"Segments 'Total {section}' has no value")
    col, tot, period = latest
    parts = []
    for i in range(start + 1, total):
        seg = str(rows[i][0]).strip()
        v = clean_num(rows[i][col]) if col < len(rows[i]) else None
        if seg and v is not None and tot:
            parts.append(f"{seg} {v:,.0f} ({v / tot:.0%})")
    if not parts:
        return Sourced.unknown(note=f"no {section} segment rows with values")
    label = f"{after_label} → {section}" if after_label else section
    return Sourced.present(f"[{period}] " + "; ".join(parts) + f" of {total_label} {tot:,.0f}",
                           source_ref=f"CIQ Financials→Segments ({label}, latest annual column)")


def segments(bundle: ResolvedBundle) -> Sourced:
    return _segment_section(bundle, "Revenues")


def geographic(bundle: ResolvedBundle) -> Sourced:
    return _segment_section(bundle, "Revenues", after_label="Geographic Segment")


def multi_year_trajectory(bundle: ResolvedBundle) -> Sourced:
    lines: list[str] = []
    try:
        inc = bundle.sheet("financials", "Income Statement", freq="annual")
        ihdr = _period_header(inc)
        if (rev := _trajectory_row(inc, _find_row(inc, "Total Revenue"), ihdr)) is not None:
            lines.append(f"Revenue: {rev}")
        if (eb := _trajectory_row(inc, _find_row(inc, "EBITDA"), ihdr)) is not None:
            lines.append(f"EBITDA: {eb}")
    except CiqUnavailableError:
        pass
    try:
        rat = bundle.sheet("financials", "Ratios", freq="annual")
        if (roic := _trajectory_row(rat, _find_row(rat, "Return on Capital %"), _period_header(rat), _fmt_pct)) is not None:
            lines.append(f"ROIC: {roic}")
    except CiqUnavailableError:
        pass
    if not lines:
        return Sourced.unknown(note="no multi-year revenue/EBITDA series in the sheets")
    return Sourced.present("; ".join(lines) + "  [R reclassified; per-period values, never YoY'd across a basis]",
                           source_ref="CIQ Financials→Income Statement + Ratios (multi-year columns)")


# --- estimates: Surprise / Consensus / Revisions ---------------------------------------------
def surprise_history(bundle: ResolvedBundle) -> Sourced:
    try:
        rows = bundle.sheet("estimates", "Surprise")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "estimates", exc)
    yhdr = next((i for i, r in enumerate(rows)
                 if sum(1 for c in r[1:10] if (n := clean_num(c)) is not None and 2000 < n < 2100) >= 3), None)
    if yhdr is None:
        return Sourced.unknown(note="Surprise sheet has no fiscal-year header row")

    def series(ri: int | None) -> str | None:
        if ri is None:
            return None
        out = [f"FY{int(yr)} {v:+.0%}" for j in range(1, len(rows[ri]))
               if (v := clean_num(rows[ri][j])) is not None and j < len(rows[yhdr]) and (yr := clean_num(rows[yhdr][j])) is not None]
        return ", ".join(out[-5:]) if out else None

    parts = []
    if (e := series(_find_row_prefix(rows, "EPS (GAAP)"))) is not None:
        parts.append(f"GAAP-EPS surprise: {e}")
    if (rv := series(_find_row(rows, "Revenue"))) is not None:
        parts.append(f"Revenue surprise: {rv}")
    if not parts:
        return Sourced.unknown(note="no EPS/Revenue surprise series in the Surprise sheet")
    return Sourced.present("; ".join(parts) + " (GAAP-EPS basis; +beat / −miss)", source_ref="CIQ Estimates→Surprise (annual)")


def consensus_view(bundle: ResolvedBundle) -> Sourced:
    try:
        rows = bundle.sheet("estimates", "Consensus")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "estimates", exc)
    ccy = _reported_currency(bundle.pool)
    parts = []
    tp = _find_row_prefix(rows, "Target Price")
    if tp is not None and len(rows[tp]) > 2 and (clean_num(rows[tp][1]) is not None or clean_num(rows[tp][2]) is not None):
        parts.append(f"Target price: mean {_amt(clean_num(rows[tp][1]), ccy)} / median {_amt(clean_num(rows[tp][2]), ccy)}")
    lg = _find_row_prefix(rows, "LT Growth")
    if lg is not None and len(rows[lg]) > 2 and (clean_num(rows[lg][1]) is not None or clean_num(rows[lg][2]) is not None):
        parts.append(f"LT growth: mean {_pct1(clean_num(rows[lg][1]))} / median {_pct1(clean_num(rows[lg][2]))}")
    rec = _find_row_prefix(rows, "Industry Recommend")
    if rec is not None and len(rows[rec]) > 1:
        v = str(rows[rec][1]).strip()
        if v and clean_num(v) is not None:
            parts.append(f"Recommendation: {v} (CIQ score, 1=buy … 5=sell)")
    if not parts:
        return Sourced.unknown(note="no Target Price/LT Growth/Recommendation rows in Consensus")
    ccy_note = f"; target price in {ccy}" if ccy else "; target price in the reported currency (code not stated in the export)"
    return Sourced.present("; ".join(parts), source_ref="CIQ Estimates→Consensus" + ccy_note)


def _revisions_field(bundle: ResolvedBundle, metric: str) -> Sourced:
    try:
        rows = bundle.sheet("estimates", "Revisions")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "estimates", exc)
    bi = _find_row(rows, metric)
    if bi is None or bi + 1 >= len(rows):
        return Sourced.unknown(note=f"no '{metric}' revision block in Estimates→Revisions")
    header = rows[bi + 1]
    fy_col = next((j for j, c in enumerate(header) if isinstance(c, str) and c.strip().startswith("FY")), None)
    rng = range(bi, min(bi + 10, len(rows)))
    up = next((i for i in rng if rows[i] and str(rows[i][0]).strip() == "Upward"), None)
    dn = next((i for i in rng if rows[i] and str(rows[i][0]).strip() == "Downward"), None)
    if fy_col is None or up is None or dn is None:
        return Sourced.unknown(note=f"no Upward/Downward + FY column for '{metric}' in Revisions")
    u, d = clean_num(rows[up][fy_col]), clean_num(rows[dn][fy_col])
    return Sourced.present(f"{metric} {str(header[fy_col]).strip()}: {int(u or 0)}↑/{int(d or 0)}↓ last mo",
                           source_ref="CIQ Estimates→Revisions (Last-Month breadth, FY)")


def eps_revisions(bundle: ResolvedBundle) -> Sourced:
    return _revisions_field(bundle, "EPS (GAAP)")


def revenue_revisions(bundle: ResolvedBundle) -> Sourced:
    return _revisions_field(bundle, "Revenue")


# --- ownership: Insider Trading / History (CIQ 'Public Ownership' exports) --------------------
# These are the numbers management-governance/04 (fix F20) REQUIRES from a pool filing precisely because an LLM
# fabricates them — net insider buy/sell, institutional concentration/trend. The disclosure is a grid, so we bind
# it deterministically; the "is the owner aligned?" judgement stays the agent's narrative call.
#
# Two structural facts about a real CIQ Insider-Trading export, learned by reading one (do NOT undo — each
# closes a confirmed fabrication-by-aggregation bug):
#  - It is NOT a flat list of atomic trades: each insider EVENT is a NAMED summary row (holder in column 0)
#    followed by its blank-name COMPONENT LEGS. Summing every row double-counts (a 1M open-market buy shows as
#    a named 1M parent PLUS two blank +550k/+450k legs). We sum ONE row per event — the named rows only.
#  - "Open market" is a specific Transaction Type ('Open Market Acquisition' / 'Open Market Disposition') — NOT
#    "anything that isn't a derivative". 'Sale' (an option-exercise sale leg), 'Sale to Issuer' (buyback),
#    'Other'/'Private' dispositions are all non-open-market. The conviction cut WHITELISTS 'open market' (the
#    old 'not derivative' filter over-counted the real MGM open-market net by ~84x).
#
# A share cell above ~1 trillion is a CIQ data sentinel (a real MGM row holds the literal 1234567891244257) —
# impossible for any float, so we EXCLUDE it and DISCLOSE the drop (never blow up a sum, never hide it — §3/§15).
# The 1e12 cutoff only screens GROSS corruption; a plausible sub-threshold garbage value is not caught.
_MAX_SANE_SHARES = 1e12
_INSIDER_WINDOW_DAYS = 365  # the trailing window the "recent" net covers — what a red-flag read cares about


def _label_date(cell: Any) -> date | None:
    """A period date from a header cell that may embed it ('Jun-30-2025 Common Stock Equivalent Held')."""
    d = excel_date(cell)
    if d is not None:
        return d
    m = re.search(r"[A-Z][a-z]{2}-\d{1,2}-\d{4}", str(cell))
    return excel_date(m.group(0)) if m else None


def _insider_table(rows: Rows) -> tuple[int, dict[str, int | None]] | None:
    """(header_row, {shares/ttype/filed: col}) for the Insider-Trading grid — columns mapped by header LABEL
    (order varies across exports), so a reordered CIQ export still reads. None if no grid header."""
    hdr = next((i for i, r in enumerate(rows) if r and str(r[0]).strip() == "Holder Name"), None)
    if hdr is None:
        return None
    header = [str(c).strip().lower() for c in rows[hdr]]

    def col(pred: Callable[[str], bool]) -> int | None:
        return next((j for j, c in enumerate(header) if pred(c)), None)

    cols = {
        "shares": col(lambda c: "transacted shares" in c),
        "ttype": col(lambda c: c == "transaction type"),   # exact — NOT 'transaction value range'
        "filed": col(lambda c: "filed date" in c),          # a single reliable serial (Trade Date can be a range string)
    }
    return (hdr, cols) if cols["shares"] is not None else None


Event = tuple[float, str, "date | None"]


def _insider_events(rows: Rows, hdr: int, cols: dict[str, int | None]) -> tuple[list[Event], int]:
    """One (shares, transaction_type, filed_date) tuple per insider EVENT — the NAMED summary rows only (the
    blank-name component legs would double-count). Excludes data-error sentinels; returns the drop count."""
    sc, tc, fc = cols["shares"], cols["ttype"], cols["filed"]
    events: list[Event] = []
    dropped = 0
    for r in rows[hdr + 1:]:
        holder = r[0] if r else None  # None (openpyxl) and '' (xlrd) are both blank — str(None) would read 'None'
        if holder is None or not str(holder).strip():  # blank-name continuation leg — its named parent has the total
            continue
        v = clean_num(r[sc]) if sc is not None and sc < len(r) else None
        if v is None:
            continue
        if abs(v) >= _MAX_SANE_SHARES:
            dropped += 1
            continue
        ttype = str(r[tc]).strip().lower() if tc is not None and tc < len(r) else ""
        fdate = excel_date(r[fc]) if fc is not None and fc < len(r) else None
        events.append((v, ttype, fdate))
    return events, dropped


def _net_counts(evs: list[Event]) -> tuple[float, int, int]:
    """(net signed shares, #positive, #negative) over (shares, type, date) events."""
    return sum(v for v, _t, _d in evs), sum(v > 0 for v, _t, _d in evs), sum(v < 0 for v, _t, _d in evs)


def _recent(evs: list[Event]) -> tuple[list[Event], date | None]:
    """The events filed within the trailing window, anchored on the latest filed date (or [], None if undated)."""
    dates = [d for _v, _t, d in evs if d is not None]
    if not dates:
        return [], None
    cut = max(dates) - timedelta(days=_INSIDER_WINDOW_DAYS)
    return [(v, t, d) for v, t, d in evs if d is not None and d >= cut], max(dates)


def insider_net_activity(bundle: ResolvedBundle) -> Sourced:
    """Net insider share-position change across ALL transaction types, per event (named summary rows; legs
    excluded). Reports the trailing ~12 months (what a red-flag read cares about) plus the full history."""
    try:
        rows = bundle.sheet("ownership", "Insider Trading")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "ownership", exc)
    t = _insider_table(rows)
    if t is None:
        return Sourced.unknown(note="Insider-Trading grid header ('Holder Name' + 'Transacted Shares') not found")
    events, dropped = _insider_events(rows, t[0], t[1])
    if not events:
        return Sourced.unknown(note="no insider events with a share count in the grid")
    fnet, fb, fs = _net_counts(events)
    recent, anchor = _recent(events)
    rec = ""
    if anchor is not None:
        rnet, rb, rs = _net_counts(recent)
        rec = f"trailing 12m (to {anchor.isoformat()}): net {rnet:+,.0f} ({rb} acq / {rs} disp); "
    dn = f" [{dropped} implausible row(s) excluded as data errors]" if dropped else ""
    return Sourced.present(
        f"{rec}full history: net {fnet:+,.0f} ({fb} acq / {fs} disp){dn}",
        source_ref="CIQ Public Ownership→Insider Trading 'Transacted Shares' — per-event (named summary rows, legs excluded; all types)")


def insider_open_market(bundle: ResolvedBundle) -> Sourced:
    """The CONVICTION cut: net insider shares from OPEN-MARKET trades only ('Open Market Acquisition' / 'Open
    Market Disposition') — cash buys/sells, separating a real purchase from an option exercise or grant. Trailing
    ~12 months plus full history, per event (named rows only)."""
    try:
        rows = bundle.sheet("ownership", "Insider Trading")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "ownership", exc)
    t = _insider_table(rows)
    if t is None or t[1]["ttype"] is None:
        return Sourced.unknown(note="Insider-Trading grid has no 'Transaction Type' column to identify open-market trades")
    events, dropped = _insider_events(rows, t[0], t[1])
    om = [(v, tt, d) for v, tt, d in events if "open market" in tt]
    if not om:
        return Sourced.unknown(note="no 'Open Market' insider transactions in the grid")
    fnet, fb, fs = _net_counts(om)
    recent, anchor = _recent(om)
    rec = ""
    if anchor is not None:
        rnet, rb, rs = _net_counts(recent)
        rec = f"trailing 12m (to {anchor.isoformat()}): net {rnet:+,.0f} ({rb} buys / {rs} sells); "
    dn = f" [{dropped} implausible row(s) excluded]" if dropped else ""
    return Sourced.present(
        f"{rec}full history: net {fnet:+,.0f} ({fb} buys / {fs} sells){dn}",
        source_ref="CIQ Public Ownership→Insider Trading — Open Market Acq/Disp only, per-event (named summary rows, legs excluded)")


def _history_table(rows: Rows) -> tuple[int, list[tuple[int, date]]] | None:
    """(header_row, [(col, period_date)]) for the History grid. Header = 'Holder | <date> Common Stock
    Equivalent Held | ...'. Only DATED period columns are kept — CIQ appends an undated 'Latest' rolling
    column whose figures belong to no quarter; binding to it drops the as-of stamp and mixes periods."""
    hdr = next((i for i, r in enumerate(rows)
                if r and str(r[0]).strip().lower().startswith("holder")
                and any(_label_date(c) is not None for c in r[1:])), None)
    if hdr is None:
        return None
    cols = [(j, d) for j in range(1, len(rows[hdr])) if (d := _label_date(rows[hdr][j])) is not None]
    return (hdr, cols) if cols else None


def _history_holders(rows: Rows, hdr: int, col: int) -> tuple[list[tuple[str, float]], int]:
    """(holders, dropped) for a period column — named holder rows with a sane positive share count; the count
    of cells excluded by the sentinel guard is returned so the caller can DISCLOSE it (§3/§15)."""
    out: list[tuple[str, float]] = []
    dropped = 0
    for r in rows[hdr + 1:]:
        holder = r[0] if r else None  # None (openpyxl) / '' (xlrd) are both blank
        if holder is None or not str(holder).strip():
            continue
        v = clean_num(r[col]) if col < len(r) else None
        if v is None or v <= 0:
            continue
        if v >= _MAX_SANE_SHARES:
            dropped += 1
            continue
        out.append((str(holder).strip(), v))
    return out, dropped


def top_institutional_holders(bundle: ResolvedBundle) -> Sourced:
    """Top holders at the latest DATED period + a concentration read (top-5 as a share of all TRACKED holders'
    shares — NOT of shares outstanding; the % of S/O lives in the narrative Ownership Summary)."""
    try:
        rows = bundle.sheet("ownership", "History")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "ownership", exc)
    t = _history_table(rows)
    if t is None:
        return Sourced.unknown(note="ownership History grid header ('Holder' + dated period columns) not found")
    hdr, cols = t
    latest_col, latest_date = cols[-1]
    holders, dropped = _history_holders(rows, hdr, latest_col)
    holders.sort(key=lambda x: x[1], reverse=True)
    if not holders:
        return Sourced.unknown(note="ownership History grid has no holder rows with a latest-period share count")
    total = sum(v for _n, v in holders)
    top = holders[:5]
    conc = (sum(v for _n, v in top) / total) if total else 0.0
    body = "; ".join(f"{n} {v:,.0f}" for n, v in top)
    dn = f" [{dropped} implausible holder row(s) excluded]" if dropped else ""
    return Sourced.present(
        f"top holders as-of {latest_date.isoformat()}: {body} — top-5 = {conc:.0%} of {len(holders)} tracked holders' {total:,.0f} shares{dn}",
        source_ref="CIQ Public Ownership→History (latest dated period, Common Stock Equivalent Held; % of tracked holders, not S/O)")


def institutional_ownership_trend(bundle: ResolvedBundle) -> Sourced:
    """Aggregate tracked-institutional holdings, first dated period vs last — institutional ownership rising or
    falling (conviction building or bleeding)."""
    try:
        rows = bundle.sheet("ownership", "History")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "ownership", exc)
    t = _history_table(rows)
    if t is None or len(t[1]) < 2:
        return Sourced.unknown(note="ownership History grid has <2 dated period columns — no trend")
    hdr, cols = t
    (first_col, first_date), (last_col, last_date) = cols[0], cols[-1]
    first, d1 = _history_holders(rows, hdr, first_col)
    last, d2 = _history_holders(rows, hdr, last_col)
    a, b = sum(v for _n, v in first), sum(v for _n, v in last)
    if not a or not b:
        return Sourced.unknown(note="ownership History grid has no aggregate share count in the first/last period")
    dn = f" [{max(d1, d2)} implausible holder row(s) excluded]" if (d1 or d2) else ""
    return Sourced.present(
        f"tracked institutional holdings {a:,.0f} ({first_date.isoformat()}) → {b:,.0f} ({last_date.isoformat()}), {(b - a) / a:+.1%}{dn}",
        source_ref="CIQ Public Ownership→History (aggregate of tracked holders, first vs last dated period)")


# --- debt: Capital Structure Details (the maturity wall — the §18/§24 distress input) ---------
# The per-instrument debt schedule an LLM cannot reliably bucket out of a prose debt note. The single
# nuance it routinely botches: a company's headline "Total Debt" includes LEASE liabilities that carry NO
# maturity date — they amortize, they do not refinance. The refinancing WALL is only the DATED bonds/loans;
# we separate the two so a survival read never treats 25bn of amortizing leases as a refinancing cliff.
def _capstruct_block(rows: Rows) -> tuple[int, dict[str, int | None], date | None] | None:
    """The LATEST per-instrument 'As Reported Details' block: the FIRST 'Description' header row, its columns
    mapped by label (order varies), and the block's as-of date parsed from the section header just above it."""
    hdr = next((i for i, r in enumerate(rows) if r and str(r[0]).strip() == "Description"), None)
    if hdr is None:
        return None
    header = [str(c).strip().lower().replace("\xa0", " ") for c in rows[hdr]]

    def col(pred: Callable[[str], bool]) -> int | None:
        return next((j for j, c in enumerate(header) if pred(c)), None)

    cols = {
        "principal": col(lambda c: "principal due" in c),
        "type": col(lambda c: c == "type"),
        "floating": col(lambda c: "floating" in c),
        "maturity": col(lambda c: c == "maturity"),
    }
    asof = next((_label_date(rows[i][0]) for i in range(hdr - 1, max(hdr - 4, -1), -1)
                 if rows[i] and _label_date(rows[i][0]) is not None), None)
    return (hdr, cols, asof) if cols["principal"] is not None and cols["maturity"] is not None else None


def debt_maturity_wall(bundle: ResolvedBundle) -> Sourced:
    """The refinancing wall: DATED bond/loan principal by maturity year (+ nearest, weighted-avg maturity,
    fixed vs floating), with amortizing LEASES separated out (they have no maturity to refinance)."""
    try:
        rows = bundle.sheet("financials", "Capital Structure Details", freq="annual")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "financials", exc)
    blk = _capstruct_block(rows)
    if blk is None:
        return Sourced.unknown(note="Capital Structure Details grid header ('Description' + 'Principal Due' + 'Maturity') not found")
    hdr, cols, asof = blk
    pc, mc, fc, tc = cols["principal"], cols["maturity"], cols["floating"], cols["type"]
    by_year: dict[int, float] = {}
    dated = leases = undated = floating = fixed = 0.0
    nearest: date | None = None
    wam_num = 0.0
    for r in rows[hdr + 1:]:
        desc = str(r[0]).strip() if r else ""
        if not desc or "as reported" in desc.lower():  # end of the latest block (blank row or the next FY block)
            break
        p = clean_num(r[pc]) if pc < len(r) else None
        if p is None or p <= 0:
            continue
        mat = excel_date(r[mc]) if mc < len(r) else None
        typ = str(r[tc]).strip().lower() if tc is not None and tc < len(r) else ""
        # An instrument is floating ONLY when the Floating Rate cell carries a real value (a spread/margin or
        # a 'Yes'/'Floating' flag). A BLANK cell means fixed by CIQ convention — and openpyxl returns a blank
        # cell as None (which str()s to 'None'), so normalise None → "" first; otherwise every fixed
        # instrument with a blank cell is mis-bucketed as floating, overstating floating exposure (§15).
        fval = str(r[fc]).strip() if (fc is not None and fc < len(r) and r[fc] is not None) else ""
        if fval and fval.upper() not in ("NA", "N/A", "-", "—", "NM"):
            floating += p
        else:
            fixed += p
        if "lease" in typ:  # leases amortize — no refinancing maturity
            leases += p
        elif mat is None:  # a bond/loan with no parseable maturity — part of the wall, timing UNKNOWN; DISCLOSE
            undated += p    # (do NOT fold into leases — that would silently understate the refinancing wall)
        else:
            by_year[mat.year] = by_year.get(mat.year, 0.0) + p
            dated += p
            nearest = mat if nearest is None or mat < nearest else nearest
            if asof is not None:
                wam_num += p * ((mat - asof).days / 365.25)
    if dated == 0 and leases == 0 and undated == 0:
        return Sourced.unknown(note="no priced instruments in Capital Structure Details")
    sched = "; ".join(f"{y} {v:,.0f}" for y, v in sorted(by_year.items())) or "—"
    asof_s = asof.isoformat() if asof else "the reporting date"
    wam = f", WAM ~{wam_num / dated:.1f}y from {asof_s}" if dated and asof else ""
    near = f"; nearest {nearest.isoformat()}" if nearest else ""
    lease = f"; amortizing leases (no refi maturity) {leases:,.0f}" if leases else ""
    undat = f"; undated debt {undated:,.0f} (maturity not parsed — timing unknown)" if undated else ""
    total = dated + leases + undated
    return Sourced.present(
        f"dated debt {dated:,.0f} of {total:,.0f} total principal by maturity — {sched}{near}{wam}; "
        f"{floating:,.0f} floating / {fixed:,.0f} fixed{lease}{undat}",
        source_ref="CIQ Financials→Capital Structure Details (latest as-reported block: Principal Due × Maturity × Floating Rate; leases carry no maturity)")


# --- comps: peer relative valuation + the anchor keystones (price, shares outstanding) --------
# The comp-set grid carries, on the SUBJECT's own row, the tier-critical current price and the diluted
# share count — the keystone that unlocks per-share checks (§15), ownership % of shares outstanding, and a
# relative sanity anchor for the insider sentinel — plus the peer relative multiple (§16), read from CIQ's
# own Summary-Statistics median rather than a re-derivation.
def _comps_grid(rows: Rows, ticker: str) -> dict[str, Any] | None:
    """Locate a CIQ Quick-Comparable grid: the 'Company Name' header row, the SUBJECT row (the one carrying
    the analyzed ticker, ':TICKER)'), and the Summary-Statistics stat rows (High/Low/Mean/Median)."""
    hdr = next((i for i, r in enumerate(rows) if r and str(r[0]).strip() == "Company Name"), None)
    if hdr is None:
        return None
    pat = re.compile(rf"[:(]\s*{re.escape(ticker)}\s*\)", re.I)
    subj = summ = None
    for i in range(hdr + 1, len(rows)):
        c0 = str(rows[i][0]).strip() if rows[i] else ""
        if c0.lower().startswith("summary statistics"):
            summ = i
            break
        if pat.search(c0):
            subj = i  # the subject sits after the peer set — the last self-match before Summary wins
    if subj is None and summ is not None:  # fallback: the last non-blank row above Summary is the subject
        j = summ - 1
        while j > hdr and not (rows[j] and str(rows[j][0]).strip()):
            j -= 1
        subj = j if j > hdr else None
    stat = {}
    if summ is not None:
        for i in range(summ + 1, min(summ + 8, len(rows))):
            lbl = str(rows[i][0]).strip().lower() if rows[i] else ""
            if lbl in ("high", "low", "mean", "median"):
                stat[lbl] = i
    return {"hdr": hdr, "header": [str(c).strip().lower() for c in rows[hdr]], "subj": subj, "stat": stat}


def _comps_col(g: dict[str, Any], pred: Callable[[str], bool]) -> int | None:
    return next((j for j, c in enumerate(g["header"]) if pred(c)), None)


def _comps_subject_cell(bundle: ResolvedBundle, sheet: str, pred: Callable[[str], bool]) -> tuple[Rows, dict, float] | Sourced:
    """Shared read: the subject row's value in the column matching `pred`, or an honest Sourced UNKNOWN/MISSING."""
    try:
        rows = bundle.sheet("comps", sheet)
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "comps", exc)
    g = _comps_grid(rows, bundle.ticker)
    if g is None or g["subj"] is None:
        return Sourced.unknown(note=f"comps {sheet}: subject (self) row not found")
    col = _comps_col(g, pred)
    v = clean_num(rows[g["subj"]][col]) if col is not None and col < len(rows[g["subj"]]) else None
    if v is None:
        return Sourced.unknown(note=f"comps {sheet}: subject column unavailable")
    return rows, g, v


def shares_outstanding(bundle: ResolvedBundle) -> Sourced:
    """Diluted shares outstanding (millions) — the keystone: unlocks §15 per-share checks, ownership % of
    shares outstanding, and the insider sentinel's relative sanity anchor."""
    got = _comps_subject_cell(bundle, "Financial Data", lambda c: "shares outstanding" in c)
    if isinstance(got, Sourced):
        return got
    _rows, _g, v = got
    return Sourced.present(round(v, 1), source_ref="CIQ Comps→Financial Data 'Shares Outstanding Latest' (subject row)")


def current_price(bundle: ResolvedBundle) -> Sourced:
    """The current share price + its as-of date — the tier-critical valuation anchor (its absence caps
    valuation confidence), read from the comp grid's subject row where present."""
    got = _comps_subject_cell(bundle, "Financial Data", lambda c: "close price" in c)
    if isinstance(got, Sourced):
        return got
    rows, _g, v = got
    ai = next((k for k, r in enumerate(rows) if r and "as-of date" in str(r[0]).lower()), None)
    asof = excel_date(rows[ai][1]) if ai is not None and len(rows[ai]) > 1 else None
    asof_s = f" as-of {asof.isoformat()}" if asof else ""
    return Sourced.present(round(v, 2), source_ref=f"CIQ Comps→Financial Data 'Day Close Price Latest' (subject row){asof_s}")


def peer_ev_ebitda(bundle: ResolvedBundle) -> Sourced:
    """The subject's EV/EBITDA vs the peer set — the §16 peer relative read, using CIQ's own comp-set
    Summary-Statistics median (not a re-derivation)."""
    try:
        rows = bundle.sheet("comps", "Trading Multiples")
    except CiqUnavailableError as exc:
        return _miss_or_unknown(bundle, "comps", exc)
    g = _comps_grid(rows, bundle.ticker)
    if g is None or g["subj"] is None:
        return Sourced.unknown(note="comps Trading Multiples: subject (self) row not found")
    ec = _comps_col(g, lambda c: "tev/ebitda" in c)
    subj = clean_num(rows[g["subj"]][ec]) if ec is not None and ec < len(rows[g["subj"]]) else None
    if subj is None:
        return Sourced.unknown(note="comps Trading Multiples: subject TEV/EBITDA unavailable")

    def stat(name: str) -> float | None:
        i = g["stat"].get(name)
        return clean_num(rows[i][ec]) if i is not None and ec < len(rows[i]) else None

    med, hi, lo = stat("median"), stat("high"), stat("low")
    band = f" vs peer set median {med:.1f}x" if med is not None else ""
    rng = f" (high {hi:.1f} / low {lo:.1f})" if hi is not None and lo is not None else ""
    return Sourced.present(f"TEV/EBITDA {subj:.1f}x{band}{rng}",
                           source_ref="CIQ Comps→Trading Multiples 'TEV/EBITDA LTM' (subject vs comp-set Summary Statistics)")


# --- emit ------------------------------------------------------------------------------------
# Money facts are in MILLIONS OF THE REPORTED CURRENCY (the '_m' suffix) — NOT necessarily USD. CIQ states
# the currency as a 'Currency | USD' cell (Capital Structure / per-column) or 'Currency: | US Dollar'
# (comps); the financials sheets only say 'in millions of the reported currency'. We read and publish the
# actual code so a non-USD figure (INR/GBP/… — the §27 default case) is never read as USD (§15/§27).
_CURRENCY_NAMES = {
    "us dollar": "USD", "u.s. dollar": "USD", "indian rupee": "INR", "pound sterling": "GBP",
    "british pound": "GBP", "euro": "EUR", "japanese yen": "JPY", "chinese yuan": "CNY", "chinese renminbi": "CNY",
    "hong kong dollar": "HKD", "canadian dollar": "CAD", "australian dollar": "AUD", "swiss franc": "CHF",
    "singapore dollar": "SGD", "south korean won": "KRW", "brazilian real": "BRL",
}


def _reported_currency(pool: ResolvedPool) -> str | None:
    """Best-effort read of the workbook's reported-currency CODE from any resolved sheet's 'Currency' header
    — a 3-letter code cell, or a spelled-out name mapped via _CURRENCY_NAMES. 'Reported Currency' (the CIQ
    conversion SETTING, not a code) is skipped. None if the code is never stated."""
    for sheets in pool._cache.values():
        for rows in sheets.values():
            for r in rows[:16]:
                if not r or str(r[0]).strip().lower().rstrip(":") != "currency":
                    continue
                for cell in r[1:]:
                    v = str(cell).strip()
                    if re.fullmatch(r"[A-Z]{3}", v):
                        return v
                    if v.lower() in _CURRENCY_NAMES:
                        return _CURRENCY_NAMES[v.lower()]
    return None


FACTS: dict[str, Callable[[ResolvedBundle], Sourced]] = {
    "net_debt_m": net_debt,
    "total_debt_m": total_debt,
    "ltm_ebitda_m": ltm_ebitda,
    "net_debt_ebitda_x": net_debt_to_ebitda,
    "ltm_ocf_m": ltm_ocf,
    "levered_fcf_m": levered_fcf,
    "interest_coverage_x": interest_coverage,
    "ev_ebitda_current_x": ev_ebitda_current,
    "ev_ebitda_percentile": ev_ebitda_percentile,
    "pe_ltm_current_x": pe_ltm_current,
    "range_position": range_position,
    "segments_revenue": segments,
    "geographic": geographic,
    "margin_trend": margin_trend,
    "multi_year_trajectory": multi_year_trajectory,
    "consensus_view": consensus_view,
    "surprise_history": surprise_history,
    "eps_revisions": eps_revisions,
    "revenue_revisions": revenue_revisions,
    "insider_net_activity": insider_net_activity,
    "insider_open_market": insider_open_market,
    "top_institutional_holders": top_institutional_holders,
    "institutional_ownership_trend": institutional_ownership_trend,
    "debt_maturity_wall": debt_maturity_wall,
    "shares_outstanding_m": shares_outstanding,
    "current_price": current_price,
    "peer_ev_ebitda": peer_ev_ebitda,
}


def build_facts(data_dir: Path, ticker: str | None = None) -> dict[str, Any]:
    pool = resolve_folder(data_dir, ticker or data_dir.name)
    bundle = ResolvedBundle(pool)
    facts = {}
    for name, fn in FACTS.items():
        # PER-FACT ISOLATION: one malformed sheet must degrade THAT fact to an honest UNKNOWN, never
        # crash the whole sidecar and lose the other 17 facts (still no fabricated value — CLAUDE.md §3).
        try:
            s = fn(bundle)
        except Exception as exc:  # noqa: BLE001 — any extractor throw becomes one honest UNKNOWN
            s = Sourced.unknown(note=f"extractor '{name}' failed: {type(exc).__name__}: {exc}")
        facts[name] = {"value": s.value, "source_ref": s.source_ref, "status": s.status.value, "note": s.note}
    # Surface concept CONFLICTS (>1 file resolved to the same address) so a consumer knows a fact was
    # contested; rows() serves the FRESHEST, but the losing file(s) are named here for the human to prune.
    conflicts = [
        {"kind": k, "sheet": s, "freq": fr, "files": [u["file"] for u in units]}
        for (k, s, fr), units in pool.concept_map.items() if len(units) > 1
    ]
    return {"ticker": bundle.ticker, "facts": facts,
            "currency": _reported_currency(pool) or "reported currency (code not stated in the export)",
            "concepts_resolved": len(pool.concept_map), "non_ciq": len(pool.non_ciq),
            "conflicts": conflicts}


def main(argv: list[str]) -> int:
    if not argv:
        print("usage: ciq_facts.py <DATA_DIR> [--json]", file=sys.stderr)
        return 2
    data_dir = Path(argv[0])
    out = build_facts(data_dir)
    if "--json" in argv[1:]:
        print(json.dumps(out, indent=2, default=str))
        return 0
    print(f"=== ciq_facts for {out['ticker']} ({out['concepts_resolved']} concepts resolved) ===")
    for name, f in out["facts"].items():
        val = str(f["value"])
        if len(val) > 74:
            val = val[:74] + "…"
        print(f"  {name:24} [{f['status']:8}] {val}")
        if f["source_ref"]:
            print(f"  {'':24}  ↳ {f['source_ref'][:100]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
