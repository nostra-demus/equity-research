"""concept_resolve.py — LAYOUT-AGNOSTIC CIQ concept resolver.

The problem it solves: a CIQ export arrives EITHER as one multi-tab workbook (Estimates with
Consensus/Surprise/Revisions/... tabs) OR as many single-tab files (01_Consensus.xls ... 07_Revisions.xls).
Matching a concept by FILENAME keyword (what vinci's from_files does) silently drops the split files —
05_Surprise.xls has no "estimate"/"consensus" token, so (estimates, Surprise) was reported UNKNOWN even
though the data was right there.

This keys off what the workbook ACTUALLY contains: for each (file, tab) it resolves a canonical CIQ
concept address (kind, sheet, freq) by TAB-NAME first (CIQ tab titles are stable across renames/splits),
then CONTENT, then the FILENAME as a weak tie-break — and NEVER drops a tab because of its filename. Both
layouts produce the SAME concept_map, so the facts layer downstream is layout-blind. Reads each workbook
ONCE (cached rows) so the facts layer reuses the parse.

Usage:  python3 concept_resolve.py <DATA_DIR> [--json]
"""
from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path
from typing import Any

from ciq import CiqFormat, CiqParseError, classify, excel_date, period_type, read_sheets

Rows = list[list[Any]]

# Historical-Multiples header cells (financials/Close-based) — distinguishes a historical Multiples tab
# from the forward estimates ladder (NTM / FY20xx), and anchors the freshness read on a Multiples sheet.
_MULT_HEADER_STARTS = ("For Quarter Ending", "For Period Ending", "For the Period")

# Canonical CIQ concept catalog: (kind, sheet, tab-name regex). ONE shared table — a new CIQ sheet is one
# new row here (and mirrors the cockpit's SHEET_TYPE_RULES so the two never disagree). "Multiples" is
# ambiguous (financials-historical vs estimates-forward) and resolved by context below, not by this table.
CATALOG: tuple[tuple[str, str, str], ...] = (
    ("financials", "Income Statement", r"^income statement$"),
    ("financials", "Balance Sheet", r"^balance sheet$"),
    ("financials", "Cash Flow", r"^cash flow$"),
    ("financials", "Segments", r"^segments$"),
    ("financials", "Ratios", r"^ratios$"),
    ("financials", "Capital Structure Details", r"^capital structure details$"),
    ("financials", "Capital Structure Summary", r"^capital structure summary$"),
    ("estimates", "Consensus", r"^consensus$"),
    ("estimates", "Recent Changes", r"^recent changes$"),
    ("estimates", "Guidance", r"^guidance$"),
    ("estimates", "Surprise", r"^surprise$"),
    ("estimates", "Trends", r"^trends$"),
    ("estimates", "Revisions", r"^revisions$"),
    ("comps", "Financial Data", r"^financial data$"),
    ("comps", "Trading Multiples", r"^trading multiples$"),
    ("comps", "Operating Statistics", r"^operating statistics$"),
)


def _content_head(rows: Rows, n: int = 40) -> str:
    """A small text fingerprint of a tab (first ~40 rows) for content-based disambiguation."""
    return "\n".join(" ".join(str(c) for c in r if str(c).strip()) for r in rows[:n])


def _has_forward_fy(head: str) -> bool:
    """True if the tab names a fiscal year strictly AFTER the current calendar year — the forward
    estimates ladder. Anchored on today (a future FY is forward relative to now), not a fixed floor."""
    this_year = date.today().year
    return any(int(y) > this_year for y in re.findall(r"FY\s?(20\d{2})", head, re.I))


def resolve_concept(tab: str, siblings: list[str], rows: Rows) -> tuple[str, str, str] | None:
    """(kind, sheet, basis) or None (non-CIQ). Tab-name primary; content resolves 'Multiples' + a
    generic tab name; filename is only a weak tie-break upstream, never a reason to drop a tab."""
    t = tab.strip().lower()
    if t == "multiples":  # ambiguous: financials-historical (Close-based) vs estimates-forward (ladder)
        sib = {s.lower() for s in siblings}
        head = _content_head(rows)
        # A historical financials Multiples is Close-based: it carries a 'For Quarter/Period Ending' header
        # AND a 'Close' sub-row. Route it to financials.Multiples by CONTENT even when it ships as its own
        # split file with no in-file Income Statement / Balance Sheet sibling (the split-layout this tool
        # exists to support) — otherwise every EV/EBITDA and P/E fact silently goes UNKNOWN.
        is_historical_close = any(h in head for h in _MULT_HEADER_STARTS) and re.search(r"\bClose\b", head)
        if {"income statement", "balance sheet"} & sib or is_historical_close:
            basis = "tab-name+sibling" if {"income statement", "balance sheet"} & sib else "tab-name+content"
            return ("financials", "Multiples", basis)
        # forward estimates ladder: 'NTM' or an FY strictly AFTER the current calendar year (a bare 'FY2026'
        # in 2026 is the current/historical column, not forward — never anchor on a hardcoded year floor).
        if re.search(r"\bNTM\b", head, re.I) or _has_forward_fy(head):
            return ("estimates", "Multiples", "tab-name+content")
        return ("estimates", "Multiples", "tab-name+standalone")
    for kind, sheet, pat in CATALOG:
        if re.search(pat, t):
            return (kind, sheet, "tab-name")
    # content fallback ONLY for a genuinely GENERIC tab name (Sheet1 / empty). A NAMED tab that is not in
    # the catalog (Key Stats, Historical Capitalization, Supplemental, …) is deliberately not a CIQ fact
    # sheet — content-guessing it would falsely claim a second Income Statement / Balance Sheet and create
    # a spurious concept conflict. A real Income Statement carries the verbatim 'Period Type:' cell; a real
    # Balance Sheet leads with 'Balance Sheet as of:'.
    if not t or re.fullmatch(r"(sheet|tab|worksheet)\s*\d*", t):
        head = _content_head(rows)
        if "Period Type:" in head and "Total Revenue" in head:
            return ("financials", "Income Statement", "content")
        if re.search(r"balance sheet\s+as of", head, re.I) and "Total Debt" in head:
            return ("financials", "Balance Sheet", "content")
    return None


def _freq(filename: str) -> str | None:
    """annual/quarterly from the FILENAME token — anchored on the '_' so a company NAME with
    'annual'/'quarterly' can't false-match (CIQ names them '..Financials_Annual/_Quarterly')."""
    low = filename.lower()
    if "_quarterly" in low:
        return "quarterly"
    if "_annual" in low:
        return "annual"
    return None


def _workbook_freq(filename: str, sheets: dict[str, Rows]) -> str | None:
    """annual/quarterly for a financials WORKBOOK (a workbook property — all its financials tabs share
    it): the filename token first, else the verbatim 'Period Type:' cell on the Income Statement
    (vinci's _financials_freq fallback). Without this, two workbooks named WITHOUT the token
    ('…Annual Report.xlsx' + '…Q Report.xlsx') both resolve to freq=None and collapse onto one concept
    key — a silent conflict that can serve the stale workbook's leverage/valuation number as current."""
    f = _freq(filename)
    if f is not None:
        return f
    inc = next((r for tab, r in sheets.items() if tab.strip().lower() == "income statement"), None)
    pt = period_type(inc) if inc is not None else None
    if pt is None:  # a generic-named IS tab (Sheet1…): find any sheet carrying the 'Period Type:' cell
        for r in sheets.values():
            if (pt := period_type(r)) is not None:
                break
    if pt is None:
        return None
    if "quarter" in pt:
        return "quarterly"
    if "annual" in pt:
        return "annual"
    return None


def _cell_date(cell: Any) -> date | None:
    """A period-header cell -> its date, for the freshest-wins conflict tie-break. Handles an Excel
    serial ('For Quarter Ending'), an ISO / 'Mon-DD-YYYY' date, an embedded 'Mon-DD-YYYY'
    ('LTM Mar-31-2026'), and a bare fiscal year ('FY2025' -> Dec-31 of that year)."""
    if isinstance(cell, (int, float)) and not isinstance(cell, bool):
        n = int(cell)
        if 1990 <= n <= 2100:  # a bare year label, NOT an Excel serial (serials for 2020s dates are ~44000+)
            return date(n, 12, 31)
        return excel_date(cell)
    d = excel_date(cell)
    if d is not None:
        return d
    s = str(cell)
    if (m := re.search(r"[A-Z][a-z]{2}-\d{1,2}-\d{4}", s)) and (d := excel_date(m.group(0))) is not None:
        return d
    if m := re.search(r"\b(19\d{2}|20\d{2})\b", s):
        return date(int(m.group(1)), 12, 31)
    return None


def _freshness(rows: Rows) -> tuple[date, int]:
    """A comparable freshness key for a resolved unit: (latest period date in its header, row count).
    Lets rows() prefer the FRESHEST workbook when >1 file resolves to one concept — a stale re-pulled
    file must never shadow the current one with an arbitrary alphabetical first-win."""
    hdr = next((r for r in rows[:20] if r and (
        "fiscal period" in str(r[0]).strip().lower()
        or "as of" in str(r[0]).strip().lower()
        or any(str(r[0]).strip().startswith(h) for h in _MULT_HEADER_STARTS))), None)
    latest: date | None = None
    if hdr is not None:
        for cell in hdr[1:]:
            if (d := _cell_date(cell)) is not None and (latest is None or d > latest):
                latest = d
    return (latest or date.min, len(rows))


class ResolvedPool:
    """The resolved concept map for one subject's CIQ folder + the cached workbook rows the facts layer
    reads. concept_map: {(kind, sheet, freq): [unit, ...]}, each unit = {file, tab, basis}."""

    def __init__(self, ticker: str) -> None:
        self.ticker = ticker
        self.concept_map: dict[tuple[str, str, str | None], list[dict[str, Any]]] = {}
        self.non_ciq: list[dict[str, str]] = []
        self._cache: dict[str, dict[str, Rows]] = {}  # filename -> {tab: rows}

    def rows(self, kind: str, sheet: str, freq: str | None) -> Rows | None:
        """The winning unit's rows for a concept address (exact freq, else another cadence), or None."""
        units = self.concept_map.get((kind, sheet, freq))
        if units is None:
            # exact cadence absent — fall back to another for this (kind, sheet), but PREFER an unlabelled
            # (freq=None) unit over a DIFFERENT explicit cadence, so an annual request never silently
            # serves a sheet the workbook explicitly tagged 'quarterly' (a single-quarter figure read as
            # LTM). Multiples (quarterly-cadence, tagged with its workbook's freq) still resolves — it is
            # normally the only unit for its (kind, sheet). Residual: a quarterly-ONLY financials export
            # served to an annual request still relies on the period label in source_ref to stay honest.
            none_lists = [u for (k, s, f), u in self.concept_map.items() if k == kind and s == sheet and f is None]
            any_lists = [u for (k, s, _f), u in self.concept_map.items() if k == kind and s == sheet]
            units = none_lists[0] if none_lists else (any_lists[0] if any_lists else None)
        if not units:
            return None
        u = self._winner(units)
        return self._cache.get(u["file"], {}).get(u["tab"])

    def _winner(self, units: list[dict[str, Any]]) -> dict[str, Any]:
        """The unit to serve when a concept address has >1 contributing file (a genuine conflict, e.g. a
        stale re-pulled export beside the current one): the FRESHEST by latest period date, then most
        rows — deterministic, never an arbitrary alphabetical first-win that could publish a stale
        leverage/valuation number as PRESENT (the worst-case contract violation, CLAUDE.md §3/§24)."""
        if len(units) == 1:
            return units[0]
        return max(units, key=lambda u: _freshness(self._cache.get(u["file"], {}).get(u["tab"]) or []))

    def has(self, kind: str) -> bool:
        return any(k == kind for (k, _s, _f) in self.concept_map)


def resolve_folder(data_dir: Path, ticker: str) -> ResolvedPool:
    """Read every CIQ file in the folder ONCE, resolve each (file, tab) to a canonical concept."""
    pool = ResolvedPool(ticker)
    for p in sorted(data_dir.iterdir()):
        if not p.is_file() or p.name.startswith("."):
            continue
        try:
            fmt = classify(p)
        except OSError:
            continue
        if fmt not in (CiqFormat.BIFF_XLS, CiqFormat.OOXML):
            pool.non_ciq.append({"file": p.name, "why": f"not a CIQ workbook ({fmt.value})"})
            continue
        try:
            sheets = read_sheets(p, fmt)
        except CiqParseError as exc:
            pool.non_ciq.append({"file": p.name, "why": f"unreadable: {exc}"})
            continue
        pool._cache[p.name] = sheets
        siblings = list(sheets.keys())
        file_freq = _workbook_freq(p.name, sheets)  # workbook-level; applied to all its financials tabs
        for tab, rows in sheets.items():
            r = resolve_concept(tab, siblings, rows)
            if r is None:
                pool.non_ciq.append({"file": f"{p.name} :: {tab}", "why": "unmapped (non-CIQ / needs a rule)"})
                continue
            kind, sheet, basis = r
            freq = file_freq if kind == "financials" else None
            pool.concept_map.setdefault((kind, sheet, freq), []).append(
                {"file": p.name, "tab": tab, "basis": basis})
    return pool


def concept_map_json(pool: ResolvedPool) -> dict[str, Any]:
    """Serializable view (JSON needs string keys): one entry per concept, with all contributing units
    and a conflict flag when >1 unit resolved to the same address (never silently first-wins)."""
    concepts = []
    for (kind, sheet, freq), units in sorted(pool.concept_map.items(), key=lambda x: (x[0][0], x[0][1], x[0][2] or "")):
        concepts.append({
            "kind": kind, "sheet": sheet, "freq": freq,
            "units": units, "conflict": len(units) > 1,
        })
    return {"ticker": pool.ticker, "concepts": concepts, "non_ciq": pool.non_ciq}


def main(argv: list[str]) -> int:
    if not argv:
        print("usage: concept_resolve.py <DATA_DIR> [--json]", file=sys.stderr)
        return 2
    data_dir = Path(argv[0])
    ticker = data_dir.name
    pool = resolve_folder(data_dir, ticker)
    out = concept_map_json(pool)
    if "--json" in argv[1:]:
        print(json.dumps(out, indent=2, default=str))
        return 0
    print(f"=== concept map for {ticker} ({len(out['concepts'])} concepts) ===")
    for c in out["concepts"]:
        fr = f" [{c['freq']}]" if c["freq"] else ""
        flag = "  <-- CONFLICT" if c["conflict"] else ""
        u = c["units"][0]
        print(f"  ({c['kind']}, {c['sheet']}{fr})  <=  {u['file']} :: '{u['tab']}'  ({u['basis']}){flag}")
    print(f"\n  non-CIQ / unmapped: {len(out['non_ciq'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
