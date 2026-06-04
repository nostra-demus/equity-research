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
from datetime import datetime, date, time

WORKBOOK_EXTS = {"xls", "xlsx", "xlsm"}
TEXT_EXTS = {"txt", "md", "csv", "tsv"}
PDF_EXTS = {"pdf"}
RTF_EXTS = {"rtf"}
# Google Drive pointer stubs — tiny JSON, no real content
POINTER_EXTS = {"gdoc", "gsheet", "gslides"}


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

def _read_pdf(path):
    # pdftotext (poppler) preferred; -layout keeps tables aligned
    try:
        r = subprocess.run(["pdftotext", "-layout", path, "-"],
                           capture_output=True, text=True, timeout=120)
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


# ---------- one-file inspect (UI / --list-json) ----------

def list_file(path):
    ext = path.lower().rsplit(".", 1)[-1] if "." in os.path.basename(path) else ""
    base = os.path.basename(path)
    if ext in WORKBOOK_EXTS:
        try:
            sheets = read_workbook(path, ext)
            return {
                "file": base, "ext": ext, "kind": "workbook", "status": "ok",
                "sheets": [
                    {"name": nm, "rows": nr, "cols": nc, "cells": _nonempty_cells(rows)}
                    for (nm, nr, nc, rows) in sheets
                ],
            }
        except Exception as e:  # noqa — HTML-disguised .xls, corrupt, missing lib
            return {"file": base, "ext": ext, "kind": "workbook",
                    "status": "fail", "error": f"{type(e).__name__}: {e}", "sheets": []}
    return {"file": base, "ext": ext, "kind": "other", "status": "skipped", "sheets": []}


# ---------- full pool extract ----------

def iter_pool_files(data_path):
    for p in sorted(glob.glob(os.path.join(data_path, "**", "*"), recursive=True)):
        if os.path.isfile(p):
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

        if ext in WORKBOOK_EXTS:
            n_workbooks += 1
            try:
                sheets = read_workbook(p, ext)
            except Exception as e:  # noqa — try HTML-as-text fallback before giving up
                txt, ferr = _read_rtf(p) if False else (_html_xls_fallback(p))
                if txt:
                    out_name = _unique(used, stem) + ".txt"
                    open(os.path.join(out_dir, out_name), "w").write(txt)
                    n_written += 1
                    sources.append({"file": base, "ext": ext, "kind": "workbook",
                                    "status": "fallback-text",
                                    "error": f"{type(e).__name__}: {e}",
                                    "extract": out_name, "sheets": []})
                else:
                    n_fail += 1
                    sources.append({"file": base, "ext": ext, "kind": "workbook",
                                    "status": "fail",
                                    "error": f"{type(e).__name__}: {e}", "sheets": []})
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

        elif ext in PDF_EXTS:
            txt, err = _read_pdf(p)
            if txt:
                out_name = _unique(used, stem) + ".txt"
                open(os.path.join(out_dir, out_name), "w").write(txt)
                n_written += 1
                sources.append({"file": base, "ext": ext, "kind": "pdf", "status": "ok",
                                "extract": out_name, "chars": len(txt)})
            else:
                n_fail += 1
                sources.append({"file": base, "ext": ext, "kind": "pdf",
                                "status": "fail", "error": err})

        elif ext in RTF_EXTS:
            txt, err = _read_rtf(p)
            if txt:
                out_name = _unique(used, stem) + ".txt"
                open(os.path.join(out_dir, out_name), "w").write(txt)
                n_written += 1
                sources.append({"file": base, "ext": ext, "kind": "rtf", "status": "ok",
                                "extract": out_name, "chars": len(txt)})
            else:
                n_fail += 1
                sources.append({"file": base, "ext": ext, "kind": "rtf",
                                "status": "fail", "error": err})

        elif ext in TEXT_EXTS:
            sources.append({"file": base, "ext": ext, "kind": "text",
                            "status": "in-place", "extract": "(original)"})

        elif ext in POINTER_EXTS:
            sources.append({"file": base, "ext": ext, "kind": "gdrive-pointer",
                            "status": "skipped",
                            "error": "Google Drive pointer stub — open in browser; no local content"})
        else:
            sources.append({"file": base, "ext": ext or "(none)", "kind": "other",
                            "status": "skipped"})

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
    if "--list-json" in argv:
        i = argv.index("--list-json")
        f = argv[i + 1]
        print(json.dumps(list_file(f)))
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
