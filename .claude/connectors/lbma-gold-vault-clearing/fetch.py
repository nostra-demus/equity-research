#!/usr/bin/env python3
"""Extract only LBMA's public aggregate vault and clearing statistics."""
from __future__ import annotations

import argparse
import calendar
import datetime as dt
import html
from html.parser import HTMLParser
import math
import os
import re
import sys

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from connector_fetch_support import fetch_bytes, load_manifest, provenance, publish_pair  # noqa: E402

MANIFEST = load_manifest(__file__)
VAULT_URL = "https://www.lbma.org.uk/prices-and-data/london-vault-data"
CLEARING_URL = "https://www.lbma.org.uk/prices-and-data/clearing-data"
MAX_RESPONSE_BYTES = 5 * 1024 * 1024


class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []
    def handle_data(self, data: str):
        if data.strip(): self.parts.append(data.strip())


def visible_text(raw: str) -> str:
    parser = Text(); parser.feed(raw)
    return re.sub(r"\s+", " ", html.unescape(" ".join(parser.parts))).strip()


def _period(value: str) -> tuple[str, str]:
    parsed = dt.datetime.strptime(value, "%B %Y").date()
    month = f"{parsed.year:04d}-{parsed.month:02d}"
    return month, f"{month}-{calendar.monthrange(parsed.year, parsed.month)[1]:02d}"


def _float(value: str) -> float:
    parsed = float(value.replace(",", ""))
    if not math.isfinite(parsed):
        raise RuntimeError("LBMA statistic is non-finite")
    return parsed


def _signed(value: str, direction: str) -> float:
    number = _float(value)
    return -number if direction.casefold() in {"decrease", "decreased", "down", "lower"} else number


def parse_vault(raw: str) -> tuple[str, str, dict]:
    text = visible_text(raw)
    period_match = re.search(r"LBMA London Vault Holdings Data ([A-Z][a-z]+ \d{4})", text)
    value_match = re.search(r"amount of gold held in London vaults was ([\d,.]+) tonnes \((?:a )?([\d.]+)% (increase|decrease)", text, re.I)
    if not period_match or not value_match:
        raise RuntimeError("LBMA vault page shape changed")
    period, as_of = _period(period_match.group(1))
    return period, as_of, {"period": period, "gold_tonnes": _float(value_match.group(1)),
                           "change_mom_pct": _signed(value_match.group(2), value_match.group(3))}


def parse_clearing(raw: str) -> tuple[str, str, dict]:
    text = visible_text(raw)
    period_match = re.search(r"LBMA Clearing Data ([A-Z][a-z]+ \d{4})", text)
    volume = re.search(r"volume of gold transferred in .*? (increased|decreased) by ([\d.]+)% .*? to ([\d.]+)mn ounces", text, re.I)
    value = re.search(r"value transferred (up|down) by ([\d.]+)% .*? to \$([\d.]+)bn", text, re.I)
    transfers = re.search(r"There were ([\d,]+) transfers, ([\d.]+)% (higher|lower)", text, re.I)
    if not all((period_match, volume, value, transfers)):
        raise RuntimeError("LBMA clearing page shape changed")
    period, as_of = _period(period_match.group(1))
    return period, as_of, {
        "period": period,
        "daily_average_volume_million_oz": _float(volume.group(3)),
        "volume_change_mom_pct": _signed(volume.group(2), volume.group(1)),
        "daily_average_value_billion_usd": _float(value.group(3)),
        "value_change_mom_pct": _signed(value.group(2), value.group(1)),
        "daily_average_transfers": int(transfers.group(1).replace(",", "")),
        "transfers_change_mom_pct": _signed(transfers.group(2), transfers.group(3)),
    }


def build(vault_html: str, clearing_html: str):
    _vp, vault_as_of, vault = parse_vault(vault_html)
    _cp, clearing_as_of, clearing = parse_clearing(clearing_html)
    as_of = max(vault_as_of, clearing_as_of)
    urls = [VAULT_URL, CLEARING_URL]
    payload = {"series": MANIFEST["series"], "as_of": as_of, "vault": vault, "clearing": clearing,
               "source_urls": urls, "benchmark_price_included": False}
    sidecar = provenance(
        MANIFEST, as_of=as_of, source_url=CLEARING_URL, source_urls=urls,
        note=(f"Public aggregate data only: London vault gold {vault['gold_tonnes']:,.0f} tonnes; "
              f"clearing {clearing['daily_average_volume_million_oz']:.1f}mn oz/day. No LBMA benchmark price."),
    )
    return as_of, payload, sidecar


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    vault = fetch_bytes(VAULT_URL, MANIFEST, max_bytes=MAX_RESPONSE_BYTES).decode("utf-8", "replace")
    clearing = fetch_bytes(CLEARING_URL, MANIFEST, max_bytes=MAX_RESPONSE_BYTES).decode("utf-8", "replace")
    as_of, payload, sidecar = build(vault, clearing)
    if args.verify:
        print(f"OK verify: LBMA public vault/clearing aggregates through {as_of}; benchmark excluded")
        return 0
    if not args.subject:
        parser.error("--subject is required unless --verify")
    path = publish_pair(data_root=args.data_root, subject=args.subject, provider_slug="lbma",
                        filename=f"vault_clearing_{as_of}.json", payload=payload, sidecar=sidecar)
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
