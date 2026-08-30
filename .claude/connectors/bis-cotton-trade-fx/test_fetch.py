#!/usr/bin/env python3
from __future__ import annotations
import os, sys
SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path: sys.path.append(SCRIPTS)
from commodity_bis_fx_feed import self_test  # noqa: E402
self_test(__file__)
