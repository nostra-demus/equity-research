#!/usr/bin/env python3
"""Cross-runtime regressions for the idea seal's canonical JSON bytes."""
from __future__ import annotations

import json
import hashlib
import math
import os
import subprocess

from canonical_json import (
    MAX_SAFE_INTEGER, _checked_string, canonical_json, canonical_json_bytes, canonical_sha256,
)


HERE = os.path.dirname(os.path.abspath(__file__))
FIXTURE = os.path.join(HERE, "canonical_json_parity.json")


NODE_CHECK = r"""
const fs = require('fs')
const fixture = JSON.parse(fs.readFileSync(0, 'utf8'))
const maxSafe = Number.MAX_SAFE_INTEGER
function scalarString(value) {
  for (let i = 0; i < value.length; i++) {
    const unit = value.charCodeAt(i)
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(i + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) throw new Error('lone surrogate')
      i++
    } else if (unit >= 0xdc00 && unit <= 0xdfff) throw new Error('lone surrogate')
  }
}
function canonical(value) {
  if (value === null) return 'null'
  if (typeof value === 'string') { scalarString(value); return JSON.stringify(value) }
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('non-finite')
    if (Number.isInteger(value) && Math.abs(value) > maxSafe) throw new Error('unsafe integral')
    return JSON.stringify(Object.is(value, -0) ? 0 : value)
  }
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'
  if (typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((key) => {
      scalarString(key)
      return JSON.stringify(key) + ':' + canonical(value[key])
    }).join(',') + '}'
  }
  throw new Error('non-JSON value')
}
const accepted = fixture.accepted.map((row) => canonical(row.value))
const rejected = [NaN, Infinity, 9007199254740992, 1e20, '\ud800', undefined].map((value) => {
  try { canonical(value); return false } catch { return true }
})
process.stdout.write(JSON.stringify({ accepted, rejected }))
"""


def expect_rejected(value):
    try:
        canonical_json(value)
    except ValueError:
        return
    raise AssertionError(f"canonicalizer accepted forbidden value: {value!r}")


def expect_error(call, error_type, message):
    try:
        call()
    except error_type as error:
        assert str(error) == message, (type(error), str(error))
        return
    raise AssertionError(f"expected {error_type.__name__}: {message}")


def check_string_contract():
    ascii_expected = (
        '"\\u0000\\u0001\\u0002\\u0003\\u0004\\u0005\\u0006\\u0007'
        '\\b\\t\\n\\u000b\\f\\r\\u000e\\u000f'
        '\\u0010\\u0011\\u0012\\u0013\\u0014\\u0015\\u0016\\u0017'
        '\\u0018\\u0019\\u001a\\u001b\\u001c\\u001d\\u001e\\u001f'
        " !\\\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\\]"
        '^_`abcdefghijklmnopqrstuvwxyz{|}~\x7f"'
    )
    accepted = [
        ("", '""'), ("a", '"a"'),
        ("a" * 64, '"' + "a" * 64 + '"'),
        ("a" * 4096, '"' + "a" * 4096 + '"'),
        ("".join(map(chr, range(128))), ascii_expected),
        ("é", '"é"'), ("नमस्ते", '"नमस्ते"'),
        ("\ud7ff\ue000", '"\ud7ff\ue000"'), ("😀", '"😀"'),
        ("aéन😀", '"aéन😀"'),
    ]

    class Ordinary(str):
        pass

    class PretendASCII(str):
        def isascii(self):
            return True

    class RaisingASCII(str):
        def isascii(self):
            raise AssertionError("subclass isascii must not run")

    class SurrogateIterator(str):
        def __iter__(self):
            return iter("\ud800")

    class IteratorFailure(RuntimeError):
        pass

    class RaisingIterator(str):
        def __iter__(self):
            raise IteratorFailure("fixed iterator failure")

    accepted.extend([(Ordinary("ascii"), '"ascii"'), (RaisingASCII("ascii"), '"ascii"')])
    for value, expected in accepted:
        assert _checked_string(value) is value
        assert canonical_json(value) == expected
        assert canonical_json({value: 0}) == "{" + expected + ":0}"

    surrogate_message = "canonical JSON strings must not contain lone UTF-16 surrogates"
    rejected = ["\ud83d\ude00", "\ude00\ud83d", PretendASCII("\ud800"), SurrogateIterator("ascii")]
    for surrogate in ("\ud800", "\udbff", "\udc00", "\udfff"):
        rejected.extend([surrogate, "before" + surrogate + "after"])
    for value in rejected:
        for call in (lambda: _checked_string(value), lambda: canonical_json(value),
                     lambda: canonical_json({value: 0})):
            expect_error(call, ValueError, surrogate_message)
    value = RaisingIterator("ascii")
    for call in (lambda: _checked_string(value), lambda: canonical_json(value),
                 lambda: canonical_json({value: 0})):
        expect_error(call, IteratorFailure, "fixed iterator failure")
    expect_error(lambda: _checked_string(b"a"), TypeError,
                 "ord() expected string of length 1, but int found")
    expect_error(lambda: _checked_string(1), TypeError, "'int' object is not iterable")

    nested = {"\ue000": "BMP", "😀": "astral", "a\n": 'quote"\\',
              "é": ["नमस्ते", "\ud7ff", "😀"]}
    expected = '{"a\\n":"quote\\\"\\\\","é":["नमस्ते","\ud7ff","😀"],"😀":"astral","\ue000":"BMP"}'
    expected_bytes = expected.encode("utf-8")
    assert canonical_json(nested) == expected
    assert canonical_json_bytes(nested) == expected_bytes
    assert canonical_sha256(nested) == hashlib.sha256(expected_bytes).hexdigest()


def main():
    check_string_contract()
    with open(FIXTURE, encoding="utf-8") as handle:
        fixture = json.load(handle)
    assert fixture["schema_version"] == "idea-canonical-json-parity/v1"
    assert fixture["contract"] == "idea-canonical-json/v1"
    for row in fixture["accepted"]:
        assert canonical_json(row["value"]) == row["canonical"], row["name"]
        assert canonical_sha256(row["value"]) == row["sha256"], row["name"]

    # The float cases are load-bearing: ordinary json.dumps spells every one of these differently.
    assert canonical_json([100.0, 1.0, -0.0, 1e-7, 1e-6, 0.00000123]) == \
        "[100,1,0,1e-7,0.000001,0.00000123]"
    for value in (math.nan, math.inf, -math.inf, MAX_SAFE_INTEGER + 1, 1e20, "\ud800", ("tuple",)):
        expect_rejected(value)

    completed = subprocess.run(
        ["node", "-e", NODE_CHECK], input=json.dumps(fixture, ensure_ascii=False, allow_nan=False),
        text=True, capture_output=True, check=True,
    )
    result = json.loads(completed.stdout)
    assert result["accepted"] == [row["canonical"] for row in fixture["accepted"]]
    assert result["rejected"] == [True] * len(fixture["rejected"])
    print("test_canonical_json: PASS")


if __name__ == "__main__":
    main()
