#!/usr/bin/env python3
"""Fetch IAU's public issuer page plus its official historical fund download."""
from __future__ import annotations

import argparse
import datetime as dt
import html
from html.parser import HTMLParser
import math
import os
import re
import sys
import xml.etree.ElementTree as ET

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from connector_fetch_support import fetch_bytes, load_manifest, provenance, publish_pair  # noqa: E402

MANIFEST = load_manifest(__file__)
PAGE_URL = "https://www.ishares.com/us/products/239561/iau-ishares-gold-trust-fund"
DOWNLOAD_URL = ("https://www.blackrock.com/varnish-api/blk-one01-product-data/product-data/api/v1/get-fund-document?"
                "appType=PRODUCT_PAGE&appSubType=ISHARES&targetSite=us-ishares&locale=en_US&portfolioId=239561&"
                "component=fundDownload&userType=individual")
MAX_RESPONSE_BYTES = 4 * 1024 * 1024
SS = "{urn:schemas-microsoft-com:office:spreadsheet}"


class Text(HTMLParser):
    def __init__(self): super().__init__(); self.parts = []
    def handle_data(self, data: str):
        if data.strip(): self.parts.append(data.strip())


def _visible(raw: str) -> str:
    parser = Text(); parser.feed(raw)
    return re.sub(r"\s+", " ", html.unescape(" ".join(parser.parts))).strip()


def _metric(text: str, label: str) -> tuple[float, str]:
    match = re.search(re.escape(label) + r"\s+([\d,.]+)\s+as of ([A-Z][a-z]{2} \d{2}, \d{4})", text)
    if not match:
        raise RuntimeError(f"IAU page lacks {label}")
    value = float(match.group(1).replace(",", ""))
    day = dt.datetime.strptime(match.group(2), "%b %d, %Y").date().isoformat()
    if not math.isfinite(value) or value <= 0:
        raise RuntimeError(f"IAU page has invalid {label}")
    return value, day


def parse_page(raw: str) -> tuple[str, dict]:
    text = _visible(raw)
    ounces, ounces_day = _metric(text, "Ounces in Trust")
    tonnes, tonnes_day = _metric(text, "Tonnes in Trust")
    shares, shares_day = _metric(text, "Shares Outstanding")
    if len({ounces_day, tonnes_day, shares_day}) != 1:
        raise RuntimeError("IAU page metrics have inconsistent as-of dates")
    if abs(ounces / 32150.7466 - tonnes) > max(0.1, tonnes * 0.001):
        raise RuntimeError("IAU ounces and tonnes do not reconcile")
    if not shares.is_integer():
        raise RuntimeError("IAU shares outstanding is not an integer")
    return ounces_day, {"ounces_in_trust": ounces, "tonnes_in_trust": tonnes, "shares_outstanding": int(shares)}


def parse_history(raw: str) -> list[dict]:
    worksheet = re.search(
        r"<ss:Worksheet\b[^>]*\bss:Name=(['\"])Historical\1[^>]*>.*?</ss:Worksheet>",
        raw,
        flags=re.DOTALL,
    )
    if not worksheet:
        raise RuntimeError("IAU fund download lacks one Historical worksheet")
    raw = (
        '<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
        + worksheet.group(0)
        + "</ss:Workbook>"
    )
    # BlackRock's SpreadsheetML download currently emits query-string
    # ampersands unescaped inside ss:HRef attributes. Repair only that bounded
    # attribute class inside the Historical sheet before strict XML parsing.
    # Malformed marketing disclaimers elsewhere in the workbook are outside
    # the data contract and are deliberately never fed to the XML parser.
    raw = re.sub(
        r'(ss:HRef=")([^"]*)(")',
        lambda match: match.group(1) + html.escape(html.unescape(match.group(2)), quote=False) + match.group(3),
        raw,
    )
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as error:
        raise RuntimeError(f"IAU fund download is malformed XML: {error}") from error
    worksheets = [node for node in root.findall(f"{SS}Worksheet") if node.attrib.get(f"{SS}Name") == "Historical"]
    if len(worksheets) != 1:
        raise RuntimeError("IAU fund download lacks one Historical worksheet")
    table = worksheets[0].find(f"{SS}Table")
    if table is None:
        raise RuntimeError("IAU Historical worksheet lacks a table")
    rows = table.findall(f"{SS}Row")
    if not rows:
        raise RuntimeError("IAU Historical worksheet is empty")
    parsed = []
    for row in rows[1:]:
        values = []
        for cell in row.findall(f"{SS}Cell"):
            data = cell.find(f"{SS}Data")
            values.append((data.text or "").strip() if data is not None else "")
        if len(values) < 4:
            raise RuntimeError("IAU Historical row has fewer than four cells")
        try:
            day = dt.datetime.strptime(values[0], "%b %d, %Y").date().isoformat()
        except ValueError as error:
            raise RuntimeError("IAU Historical row has an invalid date") from error
        if values[1] in {"", "--", "N/A", "n/a"} or values[3] in {"", "--", "N/A", "n/a"}:
            continue
        try:
            nav = float(values[1]); shares = int(values[3])
        except ValueError as error:
            raise RuntimeError("IAU Historical row has invalid NAV/shares") from error
        if not math.isfinite(nav) or nav <= 0 or shares <= 0:
            raise RuntimeError("IAU Historical row has invalid values")
        parsed.append({"date": day, "nav_per_share": nav, "shares_outstanding": shares})
    parsed.sort(key=lambda row: row["date"])
    if len(parsed) < 500 or len({row["date"] for row in parsed}) != len(parsed):
        raise RuntimeError("IAU fund download lacks 500 unique history rows")
    return parsed[-800:]


def build(page_html: str, download_xml: str):
    as_of, current = parse_page(page_html)
    history = parse_history(download_xml)
    if history[-1]["date"] != as_of or history[-1]["shares_outstanding"] != current["shares_outstanding"]:
        raise RuntimeError("IAU page and historical download disagree on current shares/date")
    urls = [PAGE_URL, DOWNLOAD_URL]
    payload = {"series": MANIFEST["series"], "as_of": as_of, "fund": "IAU", "current": current,
               "share_history": history, "source_urls": urls}
    sidecar = provenance(
        MANIFEST, as_of=as_of, source_url=PAGE_URL, source_urls=urls,
        note=(f"Issuer-reported IAU holdings {current['tonnes_in_trust']:.2f} tonnes; "
              f"shares {current['shares_outstanding']:,}. Share history supports flow changes."),
    )
    return as_of, payload, sidecar


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    page = fetch_bytes(PAGE_URL, MANIFEST, max_bytes=MAX_RESPONSE_BYTES).decode("utf-8", "replace")
    download = fetch_bytes(DOWNLOAD_URL, MANIFEST, max_bytes=MAX_RESPONSE_BYTES).decode("utf-8", "strict")
    as_of, payload, sidecar = build(page, download)
    if args.verify:
        print(f"OK verify: IAU issuer holdings through {as_of}; {len(payload['share_history'])} history rows")
        return 0
    if not args.subject:
        parser.error("--subject is required unless --verify")
    path = publish_pair(data_root=args.data_root, subject=args.subject, provider_slug="ishares",
                        filename=f"iau_holdings_{as_of}.json", payload=payload, sidecar=sidecar)
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
