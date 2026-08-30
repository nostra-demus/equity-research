"""ciq.py — deterministic Capital IQ workbook parsing primitives.

Ported (jurisdiction-neutral CIQ-workbook parts only) from the proven readers in
mosaic-theory/vinci/dossier/ciq.py. Pure stdlib + the same xlrd/openpyxl the canonical
extractor (extract_pool.py) already uses — NO pydantic, NO EDGAR/US plumbing, NO
RTF/HTML/PDF text extraction (extract_pool.py owns text; the facts layer only reads
workbook cells).

CARDINAL RULE (from the CIQ notes): extensions mislead — sniff the real format from the
header bytes, never trust the extension. And a missing/withheld cell is UNAVAILABLE (None),
never coerced to 0 — a fabricated number is worse than an honest gap (CLAUDE.md §3/§15).
"""
from __future__ import annotations

import enum
import math
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

_OLE_MAGIC = b"\xd0\xcf\x11\xe0"
_ZIP_MAGIC = b"PK\x03\x04"


try:
    _StrEnum = enum.StrEnum
except AttributeError:  # Python 3.9/3.10 (production currently runs 3.9).
    class _StrEnum(str, enum.Enum):
        """Small stdlib-compatible backport of the behaviour this module needs."""

        def __str__(self) -> str:
            return str(self.value)


class CiqFormat(_StrEnum):
    """The REAL format behind a CIQ file (sniffed from bytes, not the extension)."""

    BIFF_XLS = "biff_xls"  # legacy Excel binary -> xlrd
    OOXML = "ooxml"  # .xlsx/.docx zip -> openpyxl
    RTF_TEXT = "rtf_text"
    OLE_DISGUISED = "ole_disguised"  # .doc/.rtf that is really an OLE Word doc
    MIME_DOC = "mime_doc"
    HTML = "html"
    PDF = "pdf"
    UNKNOWN = "unknown"


class CiqParseError(RuntimeError):
    """A CIQ file could not be parsed in this environment (e.g. a needed library is absent)."""


class CiqUnavailableError(RuntimeError):
    """A needed CIQ workbook/subsheet is absent or a parse tool is missing — fail loud, never fake."""


def classify(path: Path) -> CiqFormat:
    """Sniff the real format from header bytes (never trust the extension)."""
    head = path.read_bytes()[:512]
    ext = path.suffix.lower()
    if head[:4] == _OLE_MAGIC:
        # OLE compound doc: a legacy .xls IS BIFF; an OLE-backed .rtf/.doc is a disguised Word doc.
        return CiqFormat.BIFF_XLS if ext == ".xls" else CiqFormat.OLE_DISGUISED
    if head[:4] == _ZIP_MAGIC:
        return CiqFormat.OOXML
    if head[:4] == b"%PDF":
        return CiqFormat.PDF
    stripped = head.lstrip()
    if stripped[:5] == b"{\\rtf":
        return CiqFormat.RTF_TEXT
    low = stripped[:200].lower()
    if low[:6] == b"<html>" or low[:9] == b"<!doctype" or low[:5] == b"<html":
        return CiqFormat.HTML
    if any(m in head[:200] for m in (b"MIME-Version", b"X-Sender", b"Content-Type", b"------=")):
        return CiqFormat.MIME_DOC
    return CiqFormat.UNKNOWN


def read_sheets(path: Path, fmt: CiqFormat | None = None) -> dict[str, list[list[Any]]]:
    """Read a CIQ spreadsheet into ``{sheet: rows}``. Lazy xlrd/openpyxl; fail loud if absent."""
    fmt = fmt or classify(path)
    if fmt is CiqFormat.BIFF_XLS:
        try:
            import xlrd  # type: ignore[import-untyped]
        except ImportError as exc:
            raise CiqParseError(f"{path.name}: legacy .xls needs `xlrd` (pip install xlrd)") from exc
        # xlrd binds its default logfile to the process' original stdout at
        # import time.  Passing stderr explicitly is mandatory: this reader is
        # called while building the readiness JSON sidecars, and one legacy BIFF
        # warning must never become a byte in that machine protocol.
        book = xlrd.open_workbook(str(path), logfile=sys.stderr)
        return {s.name: [s.row_values(r) for r in range(s.nrows)] for s in book.sheets()}
    if fmt is CiqFormat.OOXML:
        try:
            import openpyxl  # type: ignore[import-untyped]
        except ImportError as exc:
            raise CiqParseError(f"{path.name}: .xlsx needs `openpyxl` (pip install openpyxl)") from exc
        wb = openpyxl.load_workbook(str(path), read_only=True, data_only=True)
        return {ws.title: [list(row) for row in ws.iter_rows(values_only=True)] for ws in wb.worksheets}
    raise CiqParseError(f"{path.name}: format {fmt.value} is not a spreadsheet")


# unparseable / withheld CIQ cells — ALL mean UNAVAILABLE; never coerce to 0 (notes lines 61, 74).
_UNAVAILABLE_CELLS = frozenset({"", "-", "—", "NM", "NA", "N/A", "Entitlement Needed"})


def clean_num(cell: Any) -> float | None:
    """A CIQ numeric cell -> float, or None when UNAVAILABLE (empty / '-' / 'NM' / 'Entitlement'
    / 'NA') — never coerced to 0 or a value."""
    if isinstance(cell, bool):
        return None
    if isinstance(cell, (int, float)):
        # a finite 0.0 is a REAL zero and survives; NaN/inf is not a number — treat as UNAVAILABLE,
        # never let it flow into a median/percentile or get emitted as a PRESENT 'nan' (a non-honest value).
        return float(cell) if math.isfinite(cell) else None
    s = str(cell).strip()
    if s in _UNAVAILABLE_CELLS:
        return None
    try:
        return float(s.replace(",", "").replace("%", ""))
    except ValueError:
        return None


def excel_date(cell: Any) -> date | None:
    """A CIQ date cell -> date: Excel serial (Multiples/Estimates), already-decoded datetime, or an
    ISO/``Mon-DD-YYYY`` string. UNAVAILABLE -> None."""
    if isinstance(cell, datetime):
        return cell.date()
    if isinstance(cell, (int, float)) and not isinstance(cell, bool):
        try:
            return (datetime(1899, 12, 30) + timedelta(days=int(cell))).date()
        except (ValueError, OverflowError):
            return None
    s = str(cell).strip()
    for fmt in ("%Y-%m-%d", "%b-%d-%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None


def period_type(income_rows: list[list[Any]]) -> str | None:
    """Verbatim Period-Type read: scan for the "Period Type:" label cell, return the next cell
    (ground frequency on this cell, NEVER on column-count/shape inference)."""
    for row in income_rows[:14]:
        for j, cell in enumerate(row):
            if isinstance(cell, str) and cell.strip() == "Period Type:" and j + 1 < len(row):
                return str(row[j + 1]).strip().lower() or None
    return None
