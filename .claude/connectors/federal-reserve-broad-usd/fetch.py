#!/usr/bin/env python3
"""Shared macro-series wrapper for the Federal Reserve broad-dollar index."""
from __future__ import annotations

import os
import sys
from datetime import date

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from connector_fetch_support import load_manifest  # noqa: E402
from fred_broad_usd import (  # noqa: E402
    MAX_RESPONSE_BYTES, SERIES_ID, build as build_series,
    main as series_main, source_url as series_source_url,
)

MANIFEST = load_manifest(__file__)


def source_url(today: date | None = None) -> str:
    return series_source_url(today)


def build(text: str, *, url: str | None = None):
    return build_series(text, MANIFEST, url=url)


def main() -> int:
    return series_main(MANIFEST, filename_stem="shared_broad_usd")


if __name__ == "__main__":
    raise SystemExit(main())
