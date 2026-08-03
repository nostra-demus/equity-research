#!/usr/bin/env python3
"""Cross-runtime regressions for the idea seal's canonical JSON bytes."""
from __future__ import annotations

import json
import math
import os
import subprocess

from canonical_json import MAX_SAFE_INTEGER, canonical_json, canonical_sha256


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


def main():
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
