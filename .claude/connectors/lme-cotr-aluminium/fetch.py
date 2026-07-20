#!/usr/bin/env python3
"""LME Commitments-of-Traders (COTR) connector — Aluminium (AH) investment-fund positioning.

Fetches the LME's weekly MiFID-II COTR workbook for high-grade primary aluminium and writes the
investment-fund positioning (the crowded-long / shakeout read the aluminium thesis is gated on) into a
subject's external pool as a typed, §4 tier-5 vendor export. A file-writing fetcher per EXTERNAL_DATA.md §7
— zero engine wiring. Fails CLOSED: a non-200, a bot-wall challenge page, or a workbook that doesn't parse
writes NOTHING. `as_of` is the position date read from inside the workbook, never a file mtime.

The LME's static media store serves the workbook at a date-stamped URL. The position date is a Friday, but
the file is published the following Tuesday (occasionally Wednesday, when the preceding Monday is a UK
bank holiday) — so the network path is best-effort (candidate publish-Tuesday/Wednesday URLs, then a
page-scrape for the media link), and `--from-file` is a first-class fallback: download the free XLSX
from the COTR page in a browser and feed it through the SAME parser to the SAME typed output.

Usage:
  python3 fetch.py --verify                              # prove fetch + parse works; write nothing
  python3 fetch.py --subject ALUMINIUM                   # write into data/ALUMINIUM/external/lme/
  python3 fetch.py --from-file cotr.xlsx --subject ALUMINIUM   # manual-download fallback, same output
"""
from __future__ import annotations

import argparse
import html
import io
import json
import os
import re
import sys
import tempfile
import urllib.request
import zipfile
from datetime import datetime, timedelta, timezone
from xml.etree import ElementTree as ET

HOST = "www.lme.com"                     # the ONE host this connector may reach
CONTRACT = "AH"                          # LME two-letter code: Aluminium High Grade
PROVIDER = "lme"
CONNECTOR_ID = "lme-cotr-aluminium"
PAGE_URL = f"https://{HOST}/en/market-data/reports-and-data/commitments-of-traders/aluminium"
# Observed static-store pattern (publish-date Tue/Wed, DDMMYYYY), e.g.
# .../AH-aluminium/MiFID-Weekly-COTR-Report--AH--14072026.xls (an OOXML/xlsx workbook despite the .xls name)
MEDIA_URL = ("https://" + HOST + "/-/media/Files/Data/COTRs/AH-aluminium/"
             "MiFID-Weekly-COTR-Report--{c}--{d:02d}{m:02d}{y}.xls")
_HEADERS = {  # browser-like — the media store rejects bare urllib UAs outright
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/126.0.0.0 Safari/537.36",
    "Accept": "*/*",
}

_HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(_HERE, "connector.json"), encoding="utf-8") as _f:
    MANIFEST = json.load(_f)  # series / license / output_path come from the manifest so they can't drift


def _candidate_publish_dates(n: int = 4):
    """LME publishes the Friday position data the following Tuesday, or Wednesday when the preceding
    Monday is a UK bank holiday — try both weekdays for the last n weeks."""
    today = datetime.now(timezone.utc).date()
    tuesday = today - timedelta(days=(today.weekday() - 1) % 7)
    dates = []
    for i in range(n):
        tue = tuesday - timedelta(days=7 * i)
        dates.append(tue)
        dates.append(tue + timedelta(days=1))
    return dates


def _get(url: str, timeout: int = 30) -> bytes:
    req = urllib.request.Request(url, headers=_HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as r:  # noqa: S310 — fixed HTTPS host, not user input
        if r.status != 200:
            raise RuntimeError(f"HTTP {r.status} from {url}")
        return r.read()


def fetch_workbook():
    """Best-effort network path: candidate publish-Tuesday/Wednesday URLs, then a page-scrape for the media link.
    Accepts a body ONLY when it starts with ZIP magic b"PK" — an Imperva HTML challenge never parses."""
    tried = []
    for d in _candidate_publish_dates():
        url = MEDIA_URL.format(c=CONTRACT, d=d.day, m=d.month, y=d.year)
        tried.append(url)
        try:
            body = _get(url)
            if body[:2] == b"PK":
                return body, url
        except Exception:
            pass
    try:
        page = _get(PAGE_URL).decode("utf-8", "replace")
        links = re.findall(r"/-/media/[^\"']*COTRs?[^\"']*\.xlsx?", html.unescape(page), flags=re.I)
        for link in list(dict.fromkeys(links))[:5]:
            url = f"https://{HOST}{link}" if link.startswith("/") else link
            tried.append(url)
            try:
                body = _get(url)
                if body[:2] == b"PK":
                    return body, url
            except Exception:
                pass
    except Exception:
        pass
    raise RuntimeError(
        "could not fetch a current COTR workbook (LME serves current-date links behind a bot wall). "
        f"Download the latest Aluminium COTR XLSX from {PAGE_URL} in a browser, then rerun with "
        "--from-file <file>.xlsx --subject ALUMINIUM. Tried: " + ", ".join(tried)
    )


def _local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _col_num(ref: str) -> int:
    n = 0
    for ch in ref:
        n = n * 26 + (ord(ch) - 64)
    return n


def _si_text(si) -> str:
    return "".join(t.text or "" for t in si.iter() if _local(t.tag) == "t")


def _worksheet_part(zf: zipfile.ZipFile) -> str:
    """Resolve the first sheet's real archive path via workbook.xml + its rels — LME's own exporter
    names the part xl/worksheets/sheet.xml (no digit), not Excel's usual xl/worksheets/sheet1.xml.
    Falls back to the sheet1.xml convention for workbooks that don't carry rels (e.g. this test's
    synthetic fixture, or a genuine Excel export)."""
    try:
        wb = ET.fromstring(zf.read("xl/workbook.xml"))
        rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
        targets = {rel.get("Id"): rel.get("Target") for rel in rels if _local(rel.tag) == "Relationship"}
        for sheet_el in wb.iter():
            if _local(sheet_el.tag) != "sheet":
                continue
            rid = next((v for k, v in sheet_el.attrib.items() if k.endswith("}id") or k == "id"), None)
            if rid in targets:
                target = targets[rid].lstrip("/")
                return target if target.startswith("xl/") else f"xl/{target}"
    except (KeyError, ET.ParseError):
        pass
    return "xl/worksheets/sheet1.xml"


def grid_from_xlsx(data: bytes):
    """bytes → {(row, col): str}. Keyed by each cell's own r= reference, so the observed
    one-cell-per-<row> quirk and merged/sparse rows need no special handling."""
    try:
        zf = zipfile.ZipFile(io.BytesIO(data))
        sheet = zf.read(_worksheet_part(zf))
    except (zipfile.BadZipFile, KeyError) as e:
        raise RuntimeError(f"not a readable COTR workbook (fail closed): {e}")
    shared = []
    try:
        ss = ET.fromstring(zf.read("xl/sharedStrings.xml"))
        shared = [_si_text(si) for si in ss if _local(si.tag) == "si"]
    except KeyError:
        pass
    except ET.ParseError as e:
        raise RuntimeError(f"bad sharedStrings.xml (fail closed): {e}")
    try:
        root = ET.fromstring(sheet)
    except ET.ParseError as e:
        raise RuntimeError(f"bad sheet XML (fail closed): {e}")
    grid = {}
    for c in root.iter():
        if _local(c.tag) != "c":
            continue
        ref = c.get("r") or ""
        m = re.fullmatch(r"([A-Z]+)(\d+)", ref)
        if not m:
            continue
        row, col = int(m.group(2)), _col_num(m.group(1))
        t = c.get("t")
        text = ""
        if t == "s":
            v = next((el for el in c if _local(el.tag) == "v"), None)
            if v is not None and v.text is not None:
                idx = int(v.text)
                text = shared[idx] if 0 <= idx < len(shared) else ""
        elif t == "inlineStr":
            is_el = next((el for el in c if _local(el.tag) == "is"), None)
            text = _si_text(is_el) if is_el is not None else ""
        else:  # t == "str" or numeric
            v = next((el for el in c if _local(el.tag) == "v"), None)
            text = (v.text or "") if v is not None else ""
        if text.strip():
            grid[(row, col)] = text.strip()
    return grid


def _num(grid, row: int, col: int, what: str) -> float:
    raw = grid.get((row, col))
    if raw is None:
        raise RuntimeError(f"missing numeric cell for {what} at row {row} col {col} (fail closed)")
    try:
        return float(raw.replace(",", ""))
    except ValueError:
        raise RuntimeError(f"non-numeric {what} at row {row} col {col}: {raw!r} (fail closed)")


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


_SECTIONS = ("number of positions", "change since the previous report", "percentage of the total open interest")


def build(grid, source_url: str, acquired_via: str = "direct_fetch", original_filename: str = ""):
    """Pure transform (cell grid → payload + sidecar). Label-anchored, never coordinates; fails closed on a
    wrong contract, a missing preamble date, a missing Investment Funds column, or a missing section Total."""
    cells = sorted(grid.items())  # row-major

    asof = None
    for (_, _), text in cells:
        m = re.search(r"\d{4}-\d{2}-\d{2}", text)
        if m:
            try:
                datetime.strptime(m.group(0), "%Y-%m-%d")
                asof = m.group(0)
                break
            except ValueError:
                continue
    if not asof:
        raise RuntimeError("no ISO position date found in the workbook preamble (fail closed)")

    header_row = None
    for (row, _), text in cells:
        if "investment funds" in text.lower():
            header_row = row
            break
    if header_row is None:
        raise RuntimeError("Investment Funds column not found — COTR layout changed? (fail closed)")

    contract = next((t for (r, _), t in cells if r < header_row and re.fullmatch(r"[A-Z]{2}", t)), None)
    if contract is None:
        raise RuntimeError("no LME contract code in the workbook preamble (fail closed)")
    if contract != CONTRACT:
        raise RuntimeError(f"unexpected contract {contract!r}, wanted {CONTRACT!r} (fail closed)")

    pair_row = header_row + 1
    categories = {}  # col → name; a category is a header cell with a Long/Short pair directly beneath
    for (row, col), text in cells:
        if row != header_row:
            continue
        if (grid.get((pair_row, col), "").lower() == "long"
                and grid.get((pair_row, col + 1), "").lower() == "short"):
            categories[col] = text
    if_col = next((c for c, name in categories.items() if "investment funds" in name.lower()), None)
    if if_col is None:
        raise RuntimeError("Investment Funds header has no Long/Short pair beneath it (fail closed)")

    section_rows = {}
    for (row, col), text in cells:
        key = text.lower().rstrip(":")
        for s in _SECTIONS:
            if key.startswith(s):
                section_rows.setdefault(s, (row, col))
    missing = [s for s in _SECTIONS if s not in section_rows]
    if missing:
        raise RuntimeError(f"section label(s) missing: {missing} (fail closed)")

    bounds = sorted(r for r, _ in section_rows.values())
    max_row = max((r for r, _ in grid), default=0)

    def total_row(section: str) -> int:
        """The 'Total' sub-row label can sit in a different column than the section header itself
        (observed: header in col A, sub-row labels — Risk Reducing / Other / Total — in col C), so
        scan every column in the row range rather than assuming the header's own column."""
        srow, _ = section_rows[section]
        nxt = min([b for b in bounds if b > srow] + [max_row + 1], default=max_row + 1)
        for row in range(srow + 1, nxt):
            if any(v.lower() == "total" for (r, _), v in grid.items() if r == row):
                return row
        raise RuntimeError(f"no Total row under section {section!r} (fail closed)")

    pos_row, chg_row, pct_row = (total_row(s) for s in _SECTIONS)

    if_long = _num(grid, pos_row, if_col, "Investment Funds long")
    if_short = _num(grid, pos_row, if_col + 1, "Investment Funds short")
    net = round(if_long - if_short, 2)
    stance = "net_short" if net < 0 else ("net_long" if net > 0 else "flat")
    net_chg = round(_num(grid, chg_row, if_col, "IF change long") - _num(grid, chg_row, if_col + 1, "IF change short"), 2)

    categories_net = {
        _slug(name): round(_num(grid, pos_row, col, f"{name} long") - _num(grid, pos_row, col + 1, f"{name} short"), 2)
        for col, name in categories.items()
    }

    payload = {
        "series": MANIFEST["series"],
        "as_of": asof,
        "contract": CONTRACT,
        "notation": "lots",
        "investment_funds": {
            "long": if_long, "short": if_short, "net": net, "stance": stance, "net_change_wow": net_chg,
            # the sheet stores this section as a raw fraction of 1 (the long-side fractions across all
            # categories sum to 1.0) — scale to percentage points to match the field name and §15 hygiene
            "pct_of_oi_long": round(_num(grid, pct_row, if_col, "IF pct of OI long") * 100, 4),
            "pct_of_oi_short": round(_num(grid, pct_row, if_col + 1, "IF pct of OI short") * 100, 4),
        },
        "categories_net": categories_net,
        "acquired_via": acquired_via,
        "source_url": source_url,
    }
    note = f"Investment funds net {net:+,.2f} lots ({stance}) as of {asof}."
    if acquired_via == "manual_file":
        note += f" Manual browser download, original filename {original_filename!r}."
    sidecar = {
        "provider": "LME",
        "source_type": "vendor_export",     # §4 tier-5 "vendor export, dated" — an exchange-published workbook
        "tier": 5,
        "as_of": asof,
        "received": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source_url": source_url,
        "license": MANIFEST["license"],
        "connector_id": CONNECTOR_ID,
        "origin": original_filename or os.path.basename(source_url),
        "note": note,
    }
    return asof, net, stance, payload, sidecar


def _atomic_write_json(path: str, obj) -> None:
    """Write JSON atomically — a crash / disk-full mid-write can't leave a truncated file at `path`
    (write a temp in the same dir, fsync, then os.replace, which is atomic on POSIX)."""
    d = os.path.dirname(path) or "."
    fd, tmp = tempfile.mkstemp(dir=d, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(obj, f, indent=2)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def _output_path(data_root: str, subject: str, asof: str) -> str:
    rel = MANIFEST["output_path"].replace("<SUBJECT>", subject).replace("<as_of>", asof)
    if rel.startswith("data/"):
        rel = rel[len("data/"):]
    return os.path.join(data_root, rel)


def main() -> int:
    ap = argparse.ArgumentParser(description="Fetch the LME Aluminium COTR into a subject's external-data pool.")
    ap.add_argument("--subject", help="the pool subject, e.g. ALUMINIUM (required unless --verify)")
    ap.add_argument("--data-root", default="data", help="pool root (default: data)")
    ap.add_argument("--verify", action="store_true", help="prove fetch + parse works; write nothing")
    ap.add_argument("--from-file", help="parse a hand-downloaded COTR .xlsx instead of fetching (bot-wall fallback)")
    a = ap.parse_args()

    try:
        if a.from_file:
            with open(a.from_file, "rb") as f:
                body = f.read()
            if body[:2] != b"PK":
                raise RuntimeError(f"{a.from_file} is not an .xlsx workbook (no ZIP magic; fail closed)")
            asof, net, stance, payload, sidecar = build(
                grid_from_xlsx(body), f"file://{os.path.abspath(a.from_file)}",
                acquired_via="manual_file", original_filename=os.path.basename(a.from_file))
        else:
            body, url = fetch_workbook()
            asof, net, stance, payload, sidecar = build(grid_from_xlsx(body), url)
    except RuntimeError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1

    if a.verify:
        print(f"OK verify: AH investment funds net {net:+,.2f} lots ({stance}), as_of {asof} "
              f"[{payload['acquired_via']}]")
        return 0

    if not a.subject:
        print("error: --subject is required (unless --verify)", file=sys.stderr)
        return 2

    data_path = _output_path(a.data_root, a.subject, asof)
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    _atomic_write_json(data_path, payload)
    _atomic_write_json(data_path + ".source.json", sidecar)
    print(f"wrote {data_path} (IF net {net:+,.2f} lots, {stance}, as_of {asof}) + .source.json sidecar (tier 5)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
