#!/usr/bin/env python3
import os, sys
SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
sys.path.insert(0, SCRIPTS)
from commodity_usda_psd_feed import self_test  # noqa: E402
self_test(__file__)
