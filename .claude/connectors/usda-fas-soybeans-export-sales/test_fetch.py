#!/usr/bin/env python3
import os, sys
SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
sys.path.insert(0, SCRIPTS)
from commodity_usda_fas_esr_test_support import run_fixture  # noqa: E402
run_fixture(__file__)
