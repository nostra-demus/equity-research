#!/usr/bin/env python3
"""One cross-runtime canonical JSON byte contract for immutable idea artifacts.

The server verifies Python-produced SHA-256 values, so ordinary ``json.dumps(sort_keys=True)`` is not
enough: Python emits ``100.0``, ``-0.0``, and ``1e-06`` where ECMAScript ``JSON.stringify`` emits
``100``, ``0``, and ``0.000001``.  This module implements an explicit, fail-closed subset of the JSON
Canonicalization Scheme's ECMAScript rules without adding a runtime dependency:

* only JSON values are accepted;
* strings must contain Unicode scalar values (lone surrogates fail closed);
* object keys sort by UTF-16 code units, as JavaScript's default ``Array.sort`` does;
* numbers must be finite IEEE-754 binary64 values; ``-0`` becomes ``0``;
* every integer-valued number outside JavaScript's safe-integer range fails closed instead of being
  rounded (including a Python float such as ``1e20``); and
* numeric spelling follows ECMAScript ``Number::toString`` / ``JSON.stringify`` thresholds.

The returned UTF-8 bytes are the bytes hashed by every Python idea sealer.  TypeScript readers must
mirror this exact contract before trusting a Python-produced digest.
"""
from __future__ import annotations

import hashlib
import json
import math


MAX_SAFE_INTEGER = 9_007_199_254_740_991


def _checked_string(value: str) -> str:
    if any(0xD800 <= ord(char) <= 0xDFFF for char in value):
        raise ValueError("canonical JSON strings must not contain lone UTF-16 surrogates")
    return value


def _string(value: str) -> str:
    return json.dumps(_checked_string(value), ensure_ascii=False, separators=(",", ":"))


def _utf16_sort_key(value: str) -> bytes:
    # JavaScript's default string sort compares UTF-16 code units, not Unicode code points.
    return _checked_string(value).encode("utf-16-be")


def _ecmascript_float(value: float) -> str:
    if not math.isfinite(value):
        raise ValueError("canonical JSON numbers must be finite")
    if value == 0:
        return "0"
    # After JSON.parse TypeScript cannot tell a Python ``int`` from an integral ``float``.  Apply the
    # safe-integer boundary to both so the two runtimes accept and reject the same input domain.
    if value.is_integer() and abs(value) > MAX_SAFE_INTEGER:
        raise ValueError("canonical JSON integral numbers must be within JavaScript's safe-integer range")

    negative = value < 0
    spelling = repr(abs(value)).lower()
    if "e" in spelling:
        mantissa, exponent_text = spelling.split("e", 1)
        exponent = int(exponent_text)
    else:
        mantissa = spelling
        exponent = 0
    if "." in mantissa:
        whole, fraction = mantissa.split(".", 1)
    else:
        whole, fraction = mantissa, ""

    digits = (whole + fraction).lstrip("0")
    decimal_exponent = exponent - len(fraction)
    while digits.endswith("0"):
        digits = digits[:-1]
        decimal_exponent += 1
    if not digits or not digits.isdigit():  # defensive: repr(finite float) must never reach this
        raise ValueError("canonical JSON number could not be represented")

    # ``digits * 10**decimal_exponent`` with the decimal point at position ``n``.  These are the
    # exact fixed/scientific cutovers required by ECMAScript Number::toString.
    width = len(digits)
    n = width + decimal_exponent
    if width <= n <= 21:
        rendered = digits + ("0" * (n - width))
    elif 0 < n <= 21:
        rendered = digits[:n] + "." + digits[n:]
    elif -6 < n <= 0:
        rendered = "0." + ("0" * (-n)) + digits
    else:
        coefficient = digits[0] + (("." + digits[1:]) if width > 1 else "")
        scientific_exponent = n - 1
        rendered = coefficient + "e" + ("+" if scientific_exponent >= 0 else "") + str(scientific_exponent)
    return ("-" if negative else "") + rendered


def canonical_json(value) -> str:
    """Return canonical JSON text or fail closed for values TypeScript cannot reproduce exactly."""
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, str):
        return _string(value)
    if isinstance(value, int):
        if abs(value) > MAX_SAFE_INTEGER:
            raise ValueError("canonical JSON integers must be within JavaScript's safe-integer range")
        return str(value)
    if isinstance(value, float):
        return _ecmascript_float(value)
    if isinstance(value, list):
        return "[" + ",".join(canonical_json(item) for item in value) + "]"
    if isinstance(value, dict):
        if not all(isinstance(key, str) for key in value):
            raise ValueError("canonical JSON object keys must be strings")
        keys = sorted(value, key=_utf16_sort_key)
        return "{" + ",".join(_string(key) + ":" + canonical_json(value[key]) for key in keys) + "}"
    raise ValueError(f"canonical JSON does not support {type(value).__name__}")


def canonical_json_bytes(value) -> bytes:
    return canonical_json(value).encode("utf-8")


def canonical_sha256(value) -> str:
    return hashlib.sha256(canonical_json_bytes(value)).hexdigest()
