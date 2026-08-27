#!/usr/bin/env python3
"""Canonical run-root identity parser for deterministic Ideas publication gates."""
from __future__ import annotations

import datetime as dt
import os
import re


_FLAT = re.compile(r"analyses/(?P<ticker>[-A-Z0-9.]{1,24})_(?P<date>\d{4}-\d{2}-\d{2})")
_PARITY = re.compile(
    r"analyses/provider-parity/(?P<outer_date>\d{4}-\d{2}-\d{2})/"
    r"(?P<provider>claude|codex)/(?P<ticker>[-A-Z0-9.]{1,12})_"
    r"(?P<date>\d{4}-\d{2}-\d{2})(?:__attempt-[a-f0-9]{8,32})?"
)


def parse_idea_run_root(run_root):
    """Return ``(normalized_root, ticker, decision_date)`` or fail closed."""
    if not isinstance(run_root, str):
        raise ValueError("RUN_ROOT must be a repo-relative Ideas research path")
    normalized = run_root.replace(os.sep, "/").strip("/")
    match = _FLAT.fullmatch(normalized)
    if match is None:
        match = _PARITY.fullmatch(normalized)
        if match is None or match.group("outer_date") != match.group("date"):
            raise ValueError(
                "RUN_ROOT must be analyses/<TICKER>_<DATE> or one canonical provider-parity run root"
            )
    decision_date = match.group("date")
    try:
        dt.date.fromisoformat(decision_date)
    except ValueError as exc:
        raise ValueError("RUN_ROOT decision date is invalid") from exc
    return normalized, match.group("ticker"), decision_date
