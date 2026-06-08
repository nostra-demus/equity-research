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
    """The extractor needs xlrd (.xls/BIFF) + openpyxl (.xlsx) to read workbooks.
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
        return repr(v)
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

def _read_xls(path):
    import xlrd  # xlrd >= 2.0 is purpose-built for legacy .xls
    # xlrd logs warnings to stdout by default — redirect so stdout stays clean
    # (the UI parses --list-json stdout as JSON, and corpus consumers grep it).
    wb = xlrd.open_workbook(path, on_demand=True, logfile=sys.stderr)
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
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    out = []
    for ws in wb.worksheets:
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
    try:
        cmd = ["pdftotext"] + (["-l", str(max_pages)] if max_pages else []) + ["-layout", path, "-"]
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if r.returncode == 0 and r.stdout.strip():
            return r.stdout, None
        return "", f"pdftotext rc={r.returncode}"
    except FileNotFoundError:
        return "", "pdftotext not installed"
    except Exception as e:  # noqa
        return "", f"{type(e).__name__}: {e}"


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
                                   "cells": _nonempty_cells(rows), "extract": out_name})
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


def main(argv):
    _ensure_deps()  # re-exec under .claude/tools/.venv if xlrd/openpyxl are missing here
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
