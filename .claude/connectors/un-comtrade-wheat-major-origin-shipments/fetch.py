#!/usr/bin/env python3
from __future__ import annotations
import os, sys
SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from commodity_un_comtrade_wheat_shipments_feed import main  # noqa: E402
if __name__ == "__main__":
    raise SystemExit(main(__file__))
