#!/usr/bin/env python3
"""
extract_pool.py — Canonical data-pool extractor for the equity-research engine.

WHY THIS EXISTS
  Capital IQ / NSE / broker exports frequently ship a *multi-tab* workbook in a
  single file (e.g. one `EstimatesReport.xls` whose tabs are Consensus / Recent
  Changes / Multiples / Surprise / Trends / Revisions). Legacy `.xls` is OLE2/BIFF
  and `.xlsx` cells are binary — the values are NOT recoverable with grep/strings,
  and a filename-only inventory sees ONE opaque file and silently drops every tab
  but the first. This splits every workbook into one readable text extract PER TAB,
  and extracts pdf/rtf to text, so the front-door triage and every downstream
  specialist read EVERY tab — nothing left behind (CLAUDE.md §2 reuse, §11 data
  sufficiency, §24 "leave no data behind").

SINGLE SOURCE OF TRUTH. Consumers:
  - Layer-0 `*-data-triage` agents  -> run at ingestion, list every tab as a row
  - commands/research/verify-evidence.md -> post-hoc corpus build (--corpus)
  - ui/server/src/data-status.ts     -> cockpit tab listing (--list-json)

USAGE
  python3 extract_pool.py <DATA_PATH> <OUT_DIR> [--force] [--corpus PATH]
  python3 extract_pool.py --list-json <FILE>     # print one file's sheets as JSON; no writes

OUTPUTS (in OUT_DIR)
  <stem>__<sheet>.txt   one per spreadsheet tab (header + TSV body)
  <stem>.txt            one per pdf/rtf (extracted text)
  manifest.json         machine-readable inventory (per source, per tab)
  manifest.md           human-readable table to paste into the triage inventory

CONTRACT
  Tolerant   — missing libs / unreadable files become EXTRACT-FAIL rows; never aborts.
  Idempotent — skips when manifest.json is newer than every source AND this script,
               unless --force.
  Pure-ish   — only writes inside OUT_DIR (keeps the Google Drive pool pristine).
"""
import sys
import os
import re
import io
import json
import glob
import subprocess
import tempfile
import time as _time  # NB: `from datetime import ... time` below would shadow a bare `import time`
import email as _email
import html as _htmlmod
from datetime import datetime, date, time

WORKBOOK_EXTS = {"xls", "xlsx", "xlsm"}
TEXT_EXTS = {"txt", "md", "csv", "tsv"}
PDF_EXTS = {"pdf"}
RTF_EXTS = {"rtf"}
# Google Drive pointer stubs — tiny JSON, no real content
POINTER_EXTS = {"gdoc", "gsheet", "gslides"}


def _ensure_deps():
    """The extractor needs xlrd (.xls/BIFF) + openpyxl (.xlsx) to read workbooks, plus
    pypdf as a pure-Python PDF text fallback when poppler/pdftotext is absent.
    On a PEP-668 "externally-managed" system Python (e.g. Homebrew) you cannot
    pip-install them globally, so the engine ships an isolated venv at
    `.claude/tools/.venv` (gitignored; recreate via setup-tools.sh). If the current
    interpreter lacks the libs but that venv has them, transparently re-exec under it
    so `python3 extract_pool.py ...` just works regardless of which python invoked it.
    [fix F-EXTRACT-DEP — validated on the CRM pool: Homebrew py3.14 had neither lib,
    so every .xls silently degraded to useless 'fallback-text'.]"""
    try:
        import xlrd  # noqa
        import openpyxl  # noqa
        import pypdf  # noqa  [DD-16] pure-Python PDF text fallback when poppler is absent
        return
    except Exception:
        pass
    # A venv's bin/python is a SYMLINK to the same base binary, so comparing
    # realpath(executable) can't tell venv from base — use an env sentinel instead,
    # which also guarantees we never re-exec more than once (no loop).
    if os.environ.get("_EXTRACT_POOL_VENV") == "1":
        return
    here = os.path.dirname(os.path.abspath(__file__))
    venv_py = os.path.join(here, ".venv", "bin", "python")
    if os.path.exists(venv_py):
        os.environ["_EXTRACT_POOL_VENV"] = "1"  # invoke via the symlink path so the venv activates
        os.execv(venv_py, [venv_py, os.path.abspath(__file__)] + sys.argv[1:])
    # No venv: don't abort — workbook reads will mark 'missing-dependency' LOUDLY
    # (a real failure with the install command), never silent fallback-text.


def sniff_format(path):
    """Return the TRUE format from magic bytes / head, because Capital IQ mislabels
    extensions wholesale — a `.doc` that is MHTML, a `.rtf` that is binary Word, an
    `.xls` that is an HTML table. Content wins over extension.
    [fix F-EXTRACT — live-validated on the CRM pool, where all three mismatches occurred.]
    Returns one of: ole2 | zip | pdf | rtf | mime | html | text | empty | unreadable."""
    try:
        with open(path, "rb") as fh:
            head = fh.read(4096)
    except Exception:
        return "unreadable"
    if not head.strip():
        return "empty"
    if head[:8] == b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1":
        return "ole2"          # OLE2 Compound Document — BIFF .xls OR binary Word .doc
    if head[:4] == b"PK\x03\x04":
        return "zip"           # zip container — .xlsx / .docx
    if head[:5] == b"%PDF-":
        return "pdf"
    if head[:5].lower() == b"{\\rtf":
        return "rtf"
    low = head[:1024].lower()
    if (b"mime-version:" in low or low.lstrip().startswith(b"x-sender:")
            or b"content-type: multipart" in low or low.lstrip().startswith(b"from:")):
        return "mime"          # MHTML (HTML wrapped in MIME) — CIQ filing exports
    if b"<html" in low or b"<table" in low or b"<!doctype html" in low or b"<spreadsheet" in low:
        return "html"          # HTML table mislabeled .xls
    return "text"


def _fmt(v):
    """Render a cell value greppably: integral floats lose the '.0', dates -> ISO."""
    if v is None:
        return ""
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, float):
        if v == int(v) and abs(v) < 1e15:
            return str(int(v))
        r = repr(v)
        # [fix F25] repr() emits scientific notation for very large/small floats, which defeats the
        # verify-evidence / resolve_citations grep (a cited "1500000000" can't match "1.5e+09"). Expand it.
        return f"{v:.12f}".rstrip("0").rstrip(".") if ("e" in r or "E" in r) else r
    if isinstance(v, (datetime, date, time)):
        return v.isoformat()
    return str(v)


def _sanitize(name, fallback="sheet"):
    s = re.sub(r"[^A-Za-z0-9._-]+", "-", str(name)).strip("-._")
    s = re.sub(r"-{2,}", "-", s)
    return s or fallback


def _unique(used, base):
    name = base
    i = 2
    while name in used:
        name = f"{base}-{i}"
        i += 1
    used.add(name)
    return name


# ---------- workbook readers: return list of (sheet_name, rows, cols, list_of_rows) ----------

def _read_bytes_retry(path, tries=5):
    """Read a file's bytes with bounded retry on a transient OSError. [fix F02]
    On a Google Drive FUSE mount, concurrent access to the same .xls (the 6 module
    triage agents race on identical files) raises 'OSError: Resource deadlock avoided'
    (errno 11) — a RECOVERABLE lock that the old code turned into a permanent extraction
    failure. Reading into memory here also lets the workbook readers avoid mmap entirely."""
    last = None
    for i in range(tries):
        try:
            with open(path, "rb") as fh:
                return fh.read()
        except OSError as e:  # EAGAIN / EDEADLK / transient FUSE lock
            last = e
            _time.sleep(0.2 * (i + 1))
    raise last


def _detect_units(rows):
    """Scan a tab's first rows for a declared unit/currency header (CIQ tabs carry
    'Currency: …' / 'Units: …' / 'in millions' near the top). [fix F04] Surfaced into
    the manifest so downstream reads carry scale/currency and a crore-vs-million mix
    can be caught instead of silently producing a 10x error."""
    head = " ".join(c for r in rows[:20] for c in r if c)[:1200]  # CIQ pads empty rows before the header block
    hits = []
    for pat in (r"currency\s*[:=]\s*[A-Za-z ]+", r"units?\s*[:=]\s*[A-Za-z0-9 ()]+",
                r"\bin (?:thousands|millions|billions|lakhs?|crores?)\b",
                r"\b(?:USD|INR|EUR|GBP|JPY)\b", r"[₹$€£]\s*in\s*\w+"):
        m = re.search(pat, head, re.I)
        if m:
            hits.append(m.group(0).strip())
    return "; ".join(dict.fromkeys(hits))[:160]  # dedupe, cap length


def _read_xls(path):
    import xlrd  # xlrd >= 2.0 is purpose-built for legacy .xls
    # xlrd logs warnings to stdout by default — redirect so stdout stays clean
    # (the UI parses --list-json stdout as JSON, and corpus consumers grep it).
    # [fix F02] open from in-memory bytes (file_contents=) so xlrd never mmaps the file
    # over the FUSE mount, the source of the 'Resource deadlock avoided' failures.
    wb = xlrd.open_workbook(file_contents=_read_bytes_retry(path), on_demand=True, logfile=sys.stderr)
    datemode = wb.datemode
    out = []
    for name in wb.sheet_names():
        sh = wb.sheet_by_name(name)
        rows = []
        for r in range(sh.nrows):
            cells = []
            for c in range(sh.ncols):
                cell = sh.cell(r, c)
                val = cell.value
                if cell.ctype == xlrd.XL_CELL_DATE:
                    try:
                        val = xlrd.xldate_as_datetime(val, datemode)
                    except Exception:
                        pass
                elif cell.ctype == xlrd.XL_CELL_BOOLEAN:
                    val = bool(val)
                elif cell.ctype == xlrd.XL_CELL_EMPTY:
                    val = None
                cells.append(_fmt(val))
            rows.append(cells)
        out.append((name, sh.nrows, sh.ncols, rows))
        wb.unload_sheet(name)
    return out


def _read_xlsx(path):
    import openpyxl
    # [fix F02] load from in-memory bytes (retry-guarded) rather than the FUSE path.
    wb = openpyxl.load_workbook(io.BytesIO(_read_bytes_retry(path)), data_only=True, read_only=True)
    out = []
    for ws in wb.worksheets:
        # [fix F24; corrected per PR#9 review] read_only mode trusts the stored <dimension> tag,
        # which some CIQ/broker exporters write stale/missing — causing iter_rows to silently stop
        # early and drop trailing rows/cols while the tab still looks 'ok'. Force a real cell scan.
        # NB: reset_dimensions is a METHOD in read-only mode — it must be CALLED, not assigned. The
        # old `ws.reset_dimensions = True` overwrote the method and never ran, so the truncation it
        # was meant to fix kept reproducing.
        if hasattr(ws, "reset_dimensions"):
            ws.reset_dimensions()
        rows = []
        maxc = 0
        for row in ws.iter_rows(values_only=True):
            cells = [_fmt(v) for v in row]
            # trim trailing empties for a tidy extract
            while cells and cells[-1] == "":
                cells.pop()
            maxc = max(maxc, len(cells))
            rows.append(cells)
        out.append((ws.title, len(rows), maxc, rows))
    wb.close()
    return out


def read_workbook(path, ext):
    return _read_xls(path) if ext == "xls" else _read_xlsx(path)


def _nonempty_cells(rows):
    return sum(1 for r in rows for c in r if c.strip())


def _tab_text(src_name, sheet_name, idx, total, rows, ncols):
    buf = io.StringIO()
    buf.write(f"# SOURCE: {src_name}\n")
    buf.write(f"# SHEET: {sheet_name}  ({idx} of {total})\n")
    buf.write(f"# DIMS: {len(rows)} rows x {ncols} cols\n")
    buf.write("# ---\n")
    for r in rows:
        buf.write("\t".join(r) + "\n")
    return buf.getvalue()


# ---------- pdf / rtf ----------

def _read_pdf(path, max_pages=None):
    # pdftotext (poppler) preferred; -layout keeps tables aligned. max_pages caps
    # the scan for fast sniffing (a cover page already says "Annual Report" / "10-K").
    # Falls back to pure-Python pypdf (auto-bootstrapped in the venv, no system dep) when
    # poppler is absent or yields nothing, so PDF extraction never hard-depends on a system
    # binary. [fix DD-16 — live-validated on the TMCV pool, where Homebrew lacked pdftotext
    # and all 8 statutory PDFs (annual reports + transcripts) produced zero extracts.]
    try:
        cmd = ["pdftotext"] + (["-l", str(max_pages)] if max_pages else []) + ["-layout", path, "-"]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if r.returncode == 0 and r.stdout.strip():
            return r.stdout, None
        # poppler present but produced no text (image-only scan, or a soft error) — try pypdf
        txt, err = _read_pdf_py(path, max_pages)
        return (txt, None) if txt.strip() else ("", err or f"pdftotext rc={r.returncode}; pypdf produced no text")
    except FileNotFoundError:
        # poppler not installed at all — pure-Python fallback
        txt, err = _read_pdf_py(path, max_pages)
        return (txt, None) if txt.strip() else ("", err or "pdftotext not installed and pypdf produced no text")
    except Exception as e:  # noqa
        return "", f"{type(e).__name__}: {e}"


def _read_pdf_py(path, max_pages=None):
    """Pure-Python PDF text fallback via pypdf (no system dependency). Returns (text, error).
    Poppler's `pdftotext -layout` is preferred for table alignment; this keeps the engine
    working on machines without poppler. An image-only / scanned PDF still yields no text here
    (the caller marks it image-only) — that is a real limitation, not a fallback failure."""
    try:
        import pypdf
    except Exception as e:
        return "", f"pypdf unavailable ({e}); run .claude/tools/setup-tools.sh"
    try:
        reader = pypdf.PdfReader(path)
        pages = reader.pages[:max_pages] if max_pages else reader.pages
        out = []
        for pg in pages:
            try:
                out.append(pg.extract_text() or "")
            except Exception:
                continue  # one bad page shouldn't sink the whole document
        return "\n".join(out), None
    except Exception as e:
        return "", f"pypdf: {type(e).__name__}: {e}"


def _read_rtf(path):
    try:  # macOS textutil handles RTF (and HTML)
        r = subprocess.run(["textutil", "-convert", "txt", "-stdout", path],
                           capture_output=True, text=True, timeout=120)
        if r.returncode == 0:
            return r.stdout, None
        return "", f"textutil rc={r.returncode}"
    except FileNotFoundError:
        return "", "textutil not available"
    except Exception as e:  # noqa
        return "", f"{type(e).__name__}: {e}"


# ---------- binary-Word / MHTML / HTML (Capital IQ's mislabeled exports) ----------

def _html_to_text(b):
    """Strip an HTML/XHTML byte string to readable text (no external deps)."""
    t = b.decode("utf-8", "ignore") if isinstance(b, (bytes, bytearray)) else b
    t = re.sub(r"(?is)<(script|style|head)\b.*?</\1>", " ", t)
    t = re.sub(r"(?is)<(br|/p|/tr|/div|/h[1-6])\s*>", "\n", t)
    t = re.sub(r"(?is)</td>\s*<td[^>]*>", "\t", t)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    t = _htmlmod.unescape(t)
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n[ \t]*\n+", "\n\n", t)
    return t.strip()


def _read_doc(path):
    """Binary Word (OLE2 .doc) via macOS `textutil`. textutil keys off the file
    EXTENSION, so a CIQ transcript saved as `.rtf` but really OLE2 Word must be fed
    through a temp file with a `.doc` suffix. [fix F-EXTRACT — the CRM transcripts.]"""
    try:
        with tempfile.NamedTemporaryFile(suffix=".doc", delete=False) as tf:
            tf.write(open(path, "rb").read())
            tmp = tf.name
        try:
            r = subprocess.run(["textutil", "-convert", "txt", "-stdout", tmp],
                               capture_output=True, text=True, timeout=180)
        finally:
            os.unlink(tmp)
        if r.returncode == 0 and r.stdout.strip():
            return r.stdout, None
        return "", f"textutil rc={r.returncode}"
    except FileNotFoundError:
        return "", "textutil not available (macOS-only); install antiword/libreoffice for .doc"
    except Exception as e:  # noqa
        return "", f"{type(e).__name__}: {e}"


def _read_mhtml(path):
    """MHTML — HTML wrapped in MIME, how Capital IQ exports filings (often a `.doc`
    extension). Parse the MIME, take the HTML part, strip to text.
    [fix F-EXTRACT — the CRM 10-K extracted as MHTML, 598K chars recovered.]"""
    try:
        msg = _email.message_from_bytes(open(path, "rb").read())
        htmlbytes = None
        for part in msg.walk():
            if part.get_content_type() in ("text/html", "application/xhtml+xml"):
                htmlbytes = part.get_payload(decode=True)
                break
        if htmlbytes is None:
            htmlbytes = msg.get_payload(decode=True) or open(path, "rb").read()
        txt = _html_to_text(htmlbytes)
        return (txt, None) if txt.strip() else ("", "mhtml: empty after html strip")
    except Exception as e:  # noqa
        return "", f"{type(e).__name__}: {e}"


def _read_html(path):
    try:
        return _html_to_text(open(path, "rb").read()), None
    except Exception as e:  # noqa
        return "", f"{type(e).__name__}: {e}"


# ---------- one-file inspect (UI / --list-json) ----------

def list_file(path):
    base = os.path.basename(path)
    ext = base.lower().rsplit(".", 1)[-1] if "." in base else ""
    fmt = sniff_format(path)  # content, not extension — CIQ mislabels workbooks
    if fmt in ("ole2", "zip"):
        wbext = "xls" if fmt == "ole2" else "xlsx"
        try:
            sheets = read_workbook(path, wbext)
            return {
                "file": base, "ext": ext, "kind": "workbook", "status": "ok",
                "sheets": [
                    {"name": nm, "rows": nr, "cols": nc, "cells": _nonempty_cells(rows)}
                    for (nm, nr, nc, rows) in sheets
                ],
            }
        except Exception as e:  # noqa — OLE2/zip Word doc, corrupt, or missing lib
            return {"file": base, "ext": ext, "kind": "document",
                    "status": "fail", "error": f"{type(e).__name__}: {e}", "sheets": []}
    return {"file": base, "ext": ext, "kind": fmt, "status": "skipped", "sheets": []}


def sniff_text(path, max_chars=16000):
    """Plain-text head of ANY supported file, for content-classification (the cockpit
    sniff). Workbook -> tab names + first rows; pdf -> first pages; rtf -> textutil;
    txt/csv/md -> head. One extractor, so the cockpit reads pdf/rtf the same way the
    pipeline does instead of guessing from raw bytes."""
    fmt = sniff_format(path)  # content, not extension
    try:
        if fmt in ("ole2", "zip"):
            wbext = "xls" if fmt == "ole2" else "xlsx"
            try:
                parts = []
                for (nm, _nr, _nc, rows) in read_workbook(path, wbext):
                    parts.append(nm)
                    for r in rows[:40]:
                        parts.append("\t".join(r))
                    if sum(len(x) for x in parts) > max_chars:
                        break
                return "\n".join(parts)[:max_chars]
            except Exception:  # noqa — OLE2/zip Word doc, not a sheet
                return (_read_doc(path)[0] or "")[:max_chars]
        if fmt == "pdf":
            return (_read_pdf(path, max_pages=12)[0] or "")[:max_chars]
        if fmt == "mime":
            return (_read_mhtml(path)[0] or "")[:max_chars]
        if fmt == "rtf":
            return (_read_rtf(path)[0] or "")[:max_chars]
        if fmt == "html":
            return (_read_html(path)[0] or "")[:max_chars]
        if fmt == "text":
            return open(path, errors="ignore").read(max_chars)
    except Exception:  # noqa — sniffing must never throw
        return ""
    return ""


# ---------- full pool extract ----------

def iter_pool_files(data_path):
    for p in sorted(glob.glob(os.path.join(data_path, "**", "*"), recursive=True)):
        if not os.path.isfile(p):
            continue
        # skip engine-written output folders (the memos/thesis/dossier saved back into the company's
        # Drive folder), marked by a .nostradamus_output sentinel — so a run never re-ingests its own
        # prior research as input data and contaminates the new analysis.
        if os.path.exists(os.path.join(os.path.dirname(p), ".nostradamus_output")):
            continue
        yield p


def is_fresh(out_dir, data_path, script_path):
    man = os.path.join(out_dir, "manifest.json")
    if not os.path.exists(man):
        return None
    man_m = os.path.getmtime(man)
    newest = os.path.getmtime(script_path)
    for p in iter_pool_files(data_path):
        newest = max(newest, os.path.getmtime(p))
    if man_m >= newest:
        try:
            return json.load(open(man))
        except Exception:  # noqa
            return None
    return None


def extract_pool(data_path, out_dir, force=False, corpus_path=None):
    script_path = os.path.abspath(__file__)
    if not force:
        cached = is_fresh(out_dir, data_path, script_path)
        if cached:
            t = cached.get("totals", {})
            print(f"[extract_pool] fresh — {t.get('tabs',0)} tabs across "
                  f"{t.get('workbooks',0)} workbook(s), {t.get('extracts_written',0)} "
                  f"extract(s) already in {out_dir} (use --force to rebuild)")
            if corpus_path:
                _write_corpus(out_dir, data_path, corpus_path)
            return cached

    os.makedirs(out_dir, exist_ok=True)
    used = set()
    sources = []
    n_workbooks = n_tabs = n_written = n_fail = 0

    for p in iter_pool_files(data_path):
        base = os.path.basename(p)
        if base.startswith(".") or os.path.dirname(p).rstrip("/").endswith("_pool_extracts"):
            continue
        ext = base.lower().rsplit(".", 1)[-1] if "." in base else ""
        stem = _sanitize(base.rsplit(".", 1)[0] if "." in base else base, "file")

        # Route by SNIFFED content, not extension — Capital IQ mislabels files
        # (a `.doc` that is MHTML, a `.rtf` that is binary Word, an `.xls` that is HTML).
        fmt = sniff_format(p)

        # ---- workbooks: OLE2 (BIFF .xls) or zip (.xlsx). The same OLE2/zip container can
        #      hold a Word .doc/.docx, so a non-workbook parse error falls through to a
        #      document read instead of failing. A missing reader lib fails LOUDLY. ----
        if fmt in ("ole2", "zip"):
            n_workbooks += 1
            wbext = "xls" if fmt == "ole2" else "xlsx"
            try:
                sheets = read_workbook(p, wbext)
            except ModuleNotFoundError as e:  # xlrd/openpyxl absent — never silent garbage
                n_workbooks -= 1
                n_fail += 1
                lib = "xlrd" if fmt == "ole2" else "openpyxl"
                sources.append({"file": base, "ext": ext, "kind": "workbook",
                                "status": "missing-dependency",
                                "error": f"{type(e).__name__}: {e} — run "
                                         f"`.claude/tools/setup-tools.sh` (installs {lib})",
                                "sheets": []})
                continue
            except Exception as e:  # noqa — an OLE2/zip that is NOT a sheet is a Word doc
                n_workbooks -= 1
                txt, derr = _read_doc(p)
                if txt:
                    out_name = _unique(used, stem) + ".txt"
                    open(os.path.join(out_dir, out_name), "w").write(txt)
                    n_written += 1
                    sources.append({"file": base, "ext": ext, "kind": "document",
                                    "status": "ok",
                                    "note": f"{fmt} container, not a workbook — read as document",
                                    "extract": out_name, "chars": len(txt)})
                else:
                    n_fail += 1
                    sources.append({"file": base, "ext": ext, "kind": "workbook",
                                    "status": "fail",
                                    "error": f"not a workbook ({type(e).__name__}); doc fallback: {derr}",
                                    "sheets": []})
                continue
            sheet_meta = []
            for i, (nm, nr, nc, rows) in enumerate(sheets, 1):
                out_name = _unique(used, f"{stem}__{_sanitize(nm, f'sheet{i}')}") + ".txt"
                open(os.path.join(out_dir, out_name), "w").write(
                    _tab_text(base, nm, i, len(sheets), rows, nc))
                n_written += 1
                n_tabs += 1
                sheet_meta.append({"name": nm, "rows": nr, "cols": nc,
                                   "cells": _nonempty_cells(rows), "units": _detect_units(rows),
                                   "extract": out_name})
            sources.append({"file": base, "ext": ext, "kind": "workbook",
                            "status": "ok", "sheets": sheet_meta})

        # ---- document / text formats, again by sniffed content ----
        elif fmt in ("pdf", "mime", "rtf", "html"):
            if fmt == "pdf":
                txt, err = _read_pdf(p); kind = "pdf"
            elif fmt == "mime":
                txt, err = _read_mhtml(p); kind = "mhtml"
            elif fmt == "rtf":
                txt, err = _read_rtf(p); kind = "rtf"
            else:
                txt, err = _read_html(p); kind = "html"
            if txt:
                out_name = _unique(used, stem) + ".txt"
                open(os.path.join(out_dir, out_name), "w").write(txt)
                n_written += 1
                sources.append({"file": base, "ext": ext, "kind": kind, "status": "ok",
                                "extract": out_name, "chars": len(txt)})
            else:
                n_fail += 1
                # [fix F35] a valid PDF that yields no text is image-only/scanned — say so explicitly
                # (an actionable "needs OCR" row), not a generic fail that reads like a corrupt file.
                if kind == "pdf" and "not installed" not in (err or ""):
                    err = "image-only/scanned PDF — no extractable text layer (needs OCR; re-export as text or run ocrmypdf)"
                sources.append({"file": base, "ext": ext, "kind": kind,
                                "status": "fail", "error": err})

        elif ext in POINTER_EXTS:  # pointer stubs are JSON text — match by extension
            sources.append({"file": base, "ext": ext, "kind": "gdrive-pointer",
                            "status": "skipped",
                            "error": "Google Drive pointer stub — open in browser; no local content"})

        elif fmt == "text":
            sources.append({"file": base, "ext": ext or "(none)", "kind": "text",
                            "status": "in-place", "extract": "(original)"})

        elif fmt == "empty":
            n_fail += 1
            sources.append({"file": base, "ext": ext or "(none)", "kind": "other",
                            "status": "fail", "error": "empty file"})

        else:  # unknown binary — last-ditch document conversion, else surface honestly
            txt, derr = _read_doc(p)
            if txt:
                out_name = _unique(used, stem) + ".txt"
                open(os.path.join(out_dir, out_name), "w").write(txt)
                n_written += 1
                sources.append({"file": base, "ext": ext or "(none)", "kind": "document",
                                "status": "ok", "note": "unrecognized binary — read via textutil",
                                "extract": out_name, "chars": len(txt)})
            else:
                sources.append({"file": base, "ext": ext or "(none)", "kind": "other",
                                "status": "skipped", "error": f"unrecognized format ({fmt}); {derr}"})

    manifest = {
        "data_path": os.path.abspath(data_path),
        "out_dir": os.path.abspath(out_dir),
        "generated_by": "extract_pool.py",
        "sources": sources,
        "totals": {"sources": len(sources), "workbooks": n_workbooks,
                   "tabs": n_tabs, "extracts_written": n_written, "failures": n_fail},
    }
    json.dump(manifest, open(os.path.join(out_dir, "manifest.json"), "w"), indent=2)
    open(os.path.join(out_dir, "manifest.md"), "w").write(_manifest_md(manifest))
    if corpus_path:
        _write_corpus(out_dir, data_path, corpus_path)

    print(f"[extract_pool] {len(sources)} source(s) | {n_workbooks} workbook(s) "
          f"-> {n_tabs} tab(s) | {n_written} extract(s) written | {n_fail} failure(s)")
    print(f"[extract_pool] manifest: {os.path.join(out_dir, 'manifest.md')}")
    return manifest


def _manifest_md(m):
    lines = ["# Pool Extraction Manifest", "",
             f"- Data pool: `{m['data_path']}`",
             f"- Extracts: `{m['out_dir']}`",
             f"- Totals: {m['totals']['workbooks']} workbook(s) → "
             f"{m['totals']['tabs']} tab(s); {m['totals']['extracts_written']} extract file(s); "
             f"{m['totals']['failures']} failure(s)", "",
             "| Source File | Type | Tab / Stream | Rows×Cols | Cells | Extract |",
             "|---|---|---|---|---|---|"]
    for s in m["sources"]:
        if s["kind"] == "workbook" and s.get("sheets"):
            for sh in s["sheets"]:
                lines.append(f"| {s['file']} | workbook | {sh['name']} | "
                             f"{sh['rows']}×{sh['cols']} | {sh['cells']} | `{sh['extract']}` |")
        else:
            note = s.get("extract", s.get("error", "—"))
            lines.append(f"| {s['file']} | {s['kind']} ({s['status']}) | — | — | — | {note} |")
    return "\n".join(lines) + "\n"


def _html_xls_fallback(path):
    """Some '.xls' files are actually HTML tables. textutil can flatten them to text."""
    txt, _ = _read_rtf(path)  # textutil -convert txt also reads HTML
    return txt or ""


def _write_corpus(out_dir, data_path, corpus_path):
    """Concatenate every extract + every original .txt into one searchable corpus."""
    parts = []
    for p in sorted(glob.glob(os.path.join(out_dir, "*.txt"))):
        parts.append(f"\n===== EXTRACT: {os.path.basename(p)} =====\n")
        parts.append(open(p, errors="ignore").read())
    for p in iter_pool_files(data_path):
        if p.lower().endswith(".txt"):
            parts.append(f"\n===== SOURCE: {os.path.basename(p)} =====\n")
            parts.append(open(p, errors="ignore").read())
    open(corpus_path, "w").write("".join(parts))
    print(f"[extract_pool] corpus: {corpus_path} ({sum(len(x) for x in parts)} chars)")


# ---------- readiness pre-flight (the data-readiness GATE; deterministic, no LLM) ----------
#
# Feeds the cockpit's pre-spawn gate. Summarizes the pool's readiness from the SAME extraction
# truth the pipeline uses (manifest sources[].status), plus a surface-and-confirm entity read.
# severity: 'blocker' (wrong-direction / garbage if proceeded) | 'degrade' (same-direction, weaker)
# | 'info' (note only). The launcher folds in type-based issues (no-price, annual-vs-quarterly,
# §26 module readiness) from data-status.ts — this stays extraction- and entity-truth only.

# A file COUNTS as usable when it has real content: 'ok' (extracted) OR 'in-place' (a plain text / CSV /
# MD file used as-is). Everything else (fail / missing-dependency / skipped / gdrive-pointer stub) is not.
USABLE_STATUSES = {"ok", "in-place"}

_STATUS_ISSUES = {                       # per-source NON-usable status -> (issue code, severity)
    "fail":               ("extraction_failed", "degrade"),
    "missing-dependency": ("missing_dependency", "degrade"),
    "skipped":            ("unreadable_format",  "info"),
}

_CORP_SUFFIX = (r"(?:Limited|Ltd\.?|Inc\.?|Incorporated|Corporation|Corp\.?|Company|"
                r"PLC|LLC|N\.V\.|S\.A\.|S\.p\.A\.|AG|SE|Holdings|Group)")

# Don't read a registrant name from non-filings that name PEERS: transcripts/decks (peers + people) and
# comparables/comps (a comp sheet's whole point is to list rivals). Key-developments + most CIQ data
# exports DO carry a clean "{Company} (EXCH:TICKER)" subject header (see _CIQ_HEADER), so they're allowed.
_NON_FILING_NAME = re.compile(
    r"(transcript|earnings.?call|\bcall\b|presentation|investor.?(?:deck|present)|\bdeck\b|\bppt\b|"
    r"conference|webcast|comparable|\bcomps?\b)",
    re.I)

# CIQ / data-vendor export header: "{Company} ({Exchange}:{Ticker}) > Report > Section". The SUBJECT
# company precedes the (EXCH:TICKER) tag — a high-confidence registrant signal that also works for
# filings whose cover carries their own ticker. Used FIRST + only in the header region (so a deep-prose
# peer mention can't match), which lets data exports contribute their clean entity.
_CIQ_HEADER = re.compile(
    r"([A-Za-z][\w&.,'’\- ]{2,80}?)\s*\(\s*[A-Za-z][\w.]*\s*:\s*[A-Za-z0-9.\-]+\s*\)")


def _clean_entity(s):
    return re.sub(r"\s+", " ", s or "").strip(" .,:-\t–—")


def _norm_entity(s):
    """Normalize an entity name for comparison: lowercase, drop corporate suffixes + punctuation."""
    s = re.sub(r"[^a-z0-9 ]", " ", (s or "").lower())
    s = re.sub(r"\b(limited|ltd|inc|incorporated|corporation|corp|company|plc|llc|nv|sa|spa|"
               r"ag|se|holdings|group|the|formerly|erstwhile)\b", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def _looks_like_entity(name):
    """A registrant name LOOKS like a name, not prose or a bare suffix word: it has a real (non-suffix)
    word, is short, and isn't mostly lowercase function words ("is in fact the very purpose of ...")."""
    words = (name or "").split()
    if not (1 <= len(words) <= 8):
        return False
    if not _norm_entity(name):                  # nothing but corporate suffixes ("Company", "The Group")
        return False
    lower = sum(1 for w in words if w[:1].islower())
    return lower <= len(words) // 2             # mostly-lowercase -> prose, not a name


_MIN_FILES_FOR_CONFLICT = 2   # a different company must appear in >=2 files to flag (1 = extraction noise)


def _entity_clusters(entities):
    """Group [{file,entity}] into distinct companies by EXACT normalized name. Case / punctuation /
    corporate-suffix variants collapse (they share a normalized form via _norm_entity), but a BUSINESS-UNIT
    qualifier does NOT — 'Tata Motors' and 'Tata Motors Passenger Vehicles' stay separate, because for a CV
    ticker the PV demerged entity is a different company (the exact gap that read 'clean' before). Returns
    [{tokens, name (fullest display), files:[...]}], sorted by file count desc. A file can contribute more
    than one name (its content AND its filename)."""
    groups = {}  # normalized name -> {name: fullest display, files: [...]}
    for e in entities:
        nm = _norm_entity(e.get("entity", ""))
        if not nm:
            continue
        g = groups.setdefault(nm, {"name": e["entity"], "files": []})
        if e["file"] not in g["files"]:
            g["files"].append(e["file"])
        if len(e["entity"]) > len(g["name"]):
            g["name"] = e["entity"]                  # keep the fullest display name
    reps = [{"tokens": set(nm.split()), "name": g["name"], "files": g["files"]} for nm, g in groups.items()]
    reps.sort(key=lambda r: -len(r["files"]))
    return reps


def _entity_conflict(entities):
    """Severity of an entity conflict among [{file,entity}], or None. A different company must appear in
    >=_MIN_FILES_FOR_CONFLICT files to flag — a single odd extraction is treated as NOISE, because diverse
    real pools throw off one-off garbage names (an owner on a holdings sheet, an exchange on a cover page, a
    model's cell headers). Among the companies that clear the threshold and differ from the majority:
      - 'blocker' if one shares NO word with the majority — clearly unrelated, so the pool is contaminated
        with another company's files (e.g. a batch of 'Tata Motors' files in a 'Salesforce' pool);
      - 'degrade' if it still shares a word (related group / abbreviation / weak extraction)."""
    reps = _entity_clusters(entities)
    if len(reps) < 2:
        return None
    maj = reps[0]
    level = None
    for r in reps[1:]:
        if len(r["files"]) < _MIN_FILES_FOR_CONFLICT:
            continue                                 # singleton -> extraction noise, ignore
        if not (maj["tokens"] & r["tokens"]):
            return "blocker"
        level = "degrade"
    return level


def _entities_disagree(names):
    """TEST-ONLY bool used by the smoke's clustering assertions (production reads use _entity_conflict +
    _entity_evidence). Same EXACT-normalized clustering as production — so it answers "is there more than
    one distinct company?" ignoring the file-count threshold (which the smoke tests separately via
    _entity_conflict). NOT token-subset: a business-unit qualifier ('Passenger Vehicles') counts as
    distinct, exactly as the production path treats it."""
    return len(_entity_clusters([{"file": "", "entity": n} for n in names])) > 1


def _entity_evidence(entities):
    """A FOCUSED evidence line: name the majority company and point only at the files of the companies that
    actually FLAGGED (cleared the >=2-file threshold) — not a dump of every file, and not the ignored
    singletons."""
    reps = _entity_clusters(entities)
    flagged = [r for r in reps[1:] if len(r["files"]) >= _MIN_FILES_FOR_CONFLICT]
    if not flagged:
        return "; ".join(f'{e["file"]} → {e["entity"]}' for e in entities if e.get("entity"))
    maj = reps[0]
    odd_files = [f for r in flagged for f in r["files"]]
    odd_names = " / ".join(dict.fromkeys(r["name"] for r in flagged))
    return (f'{len(maj["files"])} file(s) name "{maj["name"]}"; {len(odd_files)} look out of place '
            f'({odd_names}): {", ".join(odd_files)}')


def entity_from_header(text):
    """Best-guess the registrant / issuer name from a filing's header text — deterministic, heuristic.
    Collects candidates from a few patterns and returns the first that LOOKS like a real name (not prose
    or a bare suffix word). Returns '' if none. Surface-and-confirm: shows what the document says; the
    engine never asserts the canonical name."""
    if not text:
        return ""
    head = text[:2500]
    cands = []
    # CIQ / data-vendor export header "{Company} (EXCH:TICKER) > ..." — checked FIRST and only in the
    # header region, so a data export contributes its clean subject (not a peer named deeper in the file).
    m = _CIQ_HEADER.search(head[:300])
    if m:
        cands.append(m.group(1))
    # SEC: the name precedes "Exact name of registrant as specified in its charter"
    m = re.search(r"([^\n]{3,90}?)\s*\n[^\n]{0,40}Exact name of (?:the )?[Rr]egistrant", head)
    if m:
        cands.append(m.group(1))
    # India / generic: "Name of the Company / Listed Entity:" — REQUIRE a real separator (colon/dash or a
    # line break) before the value, so it can't capture inline prose ("...name of the Company is in fact").
    m = re.search(r"Name of (?:the )?(?:Listed Entity|Company)\s*(?:[:\-]\s*|\n\s*)([^\n]{3,90})", head, re.I)
    if m:
        cands.append(m.group(1))
    # the first short STANDALONE line ending in a corporate suffix (cover-page title; often ALL CAPS).
    # Strip a trailing parenthetical first ("(Formerly TML ...)", "(NYSE: CRM)") so the registrant name
    # is matched, not lost to the suffix being followed by ")".
    for line in head.splitlines():
        core = re.sub(r"\s*\([^)]*\)\s*$", "", line.strip()).strip()
        if 3 <= len(core) <= 90 and len(core.split()) <= 8 and re.search(_CORP_SUFFIX + r"\.?\s*$", core, re.I):
            cands.append(core)
            break
    for c in cands:
        c = _clean_entity(c)
        if _looks_like_entity(c):           # reject prose ("fact the very purpose") + bare suffixes ("Company")
            return c
    return ""


def entity_from_filename(name):
    """Best-guess the entity from the FILE NAME. CIQ exports + downloaded filings are usually named after
    the company ("Tata_Motors_Passenger_Vehicles_Limited_-_Form_Annual_Report...", "Salesforce Inc NYSE
    CRM Financials..."). This catches a wrong-entity file whose CONTENT hides it — e.g. a demerged entity
    whose cover page still carries the former parent's name. Returns the leading name up to its first
    corporate suffix, or '' (a cryptic filename yields nothing — content still covers it)."""
    base = re.sub(r"[_\-]+", " ", os.path.splitext(name)[0])
    base = re.sub(r"\s+", " ", base).strip()
    m = re.match(r"([A-Z][A-Za-z0-9&.,' ]{2,78}?\b" + _CORP_SUFFIX + r")\b", base)
    if m:
        cand = _clean_entity(m.group(1))
        if _looks_like_entity(cand):
            return cand
    return ""


def readiness_summary(data_path, out_dir, force=False):
    """Deterministic pre-flight summary for the data-readiness gate. No LLM.
    Returns {file_count, usable_count, issues[], entities[]}."""
    # The whole body sniffs files — extract_pool prints log lines, and the entity reads can invoke pypdf
    # in-process (which may print). Redirect stdout->stderr for ALL of it so a stray library write can't
    # corrupt the pure-JSON stdout the caller parses. Restored in finally, before main() prints the result.
    _saved_stdout = sys.stdout
    sys.stdout = sys.stderr
    try:
        manifest = extract_pool(data_path, out_dir, force=force)   # reuses the is_fresh cache unless --force
        sources = manifest.get("sources", [])
        usable = [s for s in sources if s.get("status") in USABLE_STATUSES]
        issues = []
        if not sources:
            issues.append({"code": "zero_files", "severity": "blocker",
                           "message": "No files found in the data pool — nothing to analyze.",
                           "evidence": f"data path: {os.path.abspath(data_path)}"})
        elif not usable:
            issues.append({"code": "zero_usable_data", "severity": "blocker",
                           "message": "No file in the pool could be read — nothing usable to analyze.",
                           "evidence": f"{len(sources)} file(s) present, 0 readable"})
        for s in sources:
            spec = _STATUS_ISSUES.get(s.get("status"))
            if spec:
                code, sev = spec
                issues.append({"code": code, "severity": sev, "file": s.get("file"),
                               "message": f'Could not fully read "{s.get("file")}" ({s.get("status")}).',
                               "evidence": s.get("error") or s.get("status")})

        # entity read (surface-and-confirm): sniff each file's header for the registrant/subject name.
        # Allow documents (pdf/mhtml/rtf/html) AND workbooks/Word docs (ole2/zip) — CIQ data exports carry
        # a clean "{Company} (EXCH:TICKER)" subject header (entity_from_header checks it first). Still skip
        # peer-listing non-filings by name (transcripts/decks/comparables) via _NON_FILING_NAME.
        entities = []
        for p in iter_pool_files(data_path):
            base = os.path.basename(p)
            if _NON_FILING_NAME.search(base):
                continue
            # (a) the FILE NAME as an entity signal — catches a wrong-entity file whose content hides it
            # (a demerged entity whose cover still says the former parent's name). Works for any format.
            fn = entity_from_filename(base)
            if fn:
                entities.append({"file": base, "entity": fn})
            # (b) the CONTENT header — documents + workbooks (CIQ exports carry a "{Company} (EXCH:TICKER)").
            if sniff_format(p) not in ("pdf", "mime", "rtf", "html", "ole2", "zip"):
                continue
            name = entity_from_header(sniff_text(p, 2500))
            if name:
                entities.append({"file": base, "entity": name})
        _evid = _entity_evidence(entities)
        _level = _entity_conflict(entities)
        if _level == "blocker":
            # Unrelated companies in one pool = contamination: wrong-company files present and/or the
            # right ones missing. High-confidence, so it's a hard stop, not a one-click.
            issues.append({"code": "entity_disagreement", "severity": "blocker",
                           "message": "Some files are for a different company — the pool mixes entities "
                                      "(and the files you want may be missing).",
                           "evidence": _evid})
        elif _level == "degrade":
            # Distinct but RELATED names (share a word) — could be a group entity / abbreviation / weak
            # extraction, where a false positive is plausible, so surface it but allow a one-click proceed.
            issues.append({"code": "entity_disagreement", "severity": "degrade",
                           "message": "Some files may be for a different (related) company — worth a "
                                      "check before you run.",
                           "evidence": _evid})

        return {
            "data_path": os.path.abspath(data_path),
            "file_count": len(sources),
            "usable_count": len(usable),
            "issues": issues,
            "entities": entities,       # the launcher confirms these against the ticker (surface-and-confirm)
        }
    finally:
        sys.stdout = _saved_stdout


def main(argv):
    _ensure_deps()  # re-exec under .claude/tools/.venv if xlrd/openpyxl are missing here
    if "--readiness-json" in argv:
        i = argv.index("--readiness-json")
        dp = argv[i + 1]
        rest = [a for a in argv[i + 2:] if not a.startswith("--")]
        od = rest[0] if rest else tempfile.mkdtemp(prefix="readiness_")
        print(json.dumps(readiness_summary(dp, od, force=("--force" in argv))))
        return 0
    if "--list-json" in argv:
        i = argv.index("--list-json")
        f = argv[i + 1]
        print(json.dumps(list_file(f)))
        return 0
    if "--text" in argv:
        f = argv[argv.index("--text") + 1]
        mx = int(argv[argv.index("--max-chars") + 1]) if "--max-chars" in argv else 16000
        sys.stdout.write(sniff_text(f, mx))
        return 0
    args = [a for a in argv if not a.startswith("--")]
    if len(args) < 2:
        print(__doc__)
        return 2
    data_path, out_dir = args[0], args[1]
    corpus = None
    if "--corpus" in argv:
        corpus = argv[argv.index("--corpus") + 1]
    extract_pool(data_path, out_dir, force=("--force" in argv), corpus_path=corpus)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
