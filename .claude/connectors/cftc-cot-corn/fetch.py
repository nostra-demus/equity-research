#!/usr/bin/env python3
"""Fetch three years of CBOT Corn positioning from the CFTC public API."""
from __future__ import annotations

import os
import sys

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from cftc_disaggregated_cot import (  # noqa: E402
    ContractSpec, build as build_contract, fetch as fetch_contract,
    main as contract_main, source_url as contract_source_url,
)
from connector_fetch_support import load_manifest  # noqa: E402

MANIFEST = load_manifest(__file__)
SPEC = ContractSpec(
    contract="CORN", contract_code="002602", instrument_label="CBOT Corn",
    filename_stem="cot_corn", verify_label="Corn",
)
HOST, DATASET, CONTRACT, CONTRACT_CODE = SPEC.host, SPEC.dataset, SPEC.contract, SPEC.contract_code
MAX_RESPONSE_BYTES = SPEC.max_response_bytes


def source_url() -> str:
    return contract_source_url(SPEC)


def build(rows: object):
    return build_contract(rows, MANIFEST, SPEC)


def fetch():
    return fetch_contract(MANIFEST, SPEC)


def main() -> int:
    return contract_main(MANIFEST, SPEC)


if __name__ == "__main__":
    raise SystemExit(main())
