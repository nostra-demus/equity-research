#!/usr/bin/env python3
import os, sys
SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
sys.path.insert(0, SCRIPTS)
from commodity_usda_psd_feed import run  # noqa: E402
if __name__ == "__main__":
    raise SystemExit(run(__file__))
