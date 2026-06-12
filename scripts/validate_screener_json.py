#!/usr/bin/env python3
"""Dependency-free JSON Schema checker for the screener's schemas (draft-07 subset).

The screener schemas use a deliberate subset of JSON Schema: type, required, properties,
items, enum, const, minimum/maximum, minItems/maxItems, minLength/maxLength, pattern,
$ref (#/definitions/...), and allOf with if/then/else. This validator covers exactly that
subset, so schema conformance can be asserted on machines without the jsonschema package
(the engine's verification step and the fixture check both call it).

Usage:
    python3 scripts/validate_screener_json.py <schema.json> <doc.json> [...more pairs]
    python3 scripts/validate_screener_json.py --fixture   # validate the committed fixture set

Exit 0 = all valid; 1 = violations printed.
"""
from __future__ import annotations

import json
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TYPES = {
    "object": dict, "array": list, "string": str, "integer": int,
    "number": (int, float), "boolean": bool, "null": type(None),
}


class Checker:
    def __init__(self, schema: dict):
        self.root = schema
        self.errors: list[str] = []

    def deref(self, node: dict) -> dict:
        ref = node.get("$ref")
        if not ref:
            return node
        cur = self.root
        for part in ref.lstrip("#/").split("/"):
            cur = cur[part]
        return cur

    def err(self, path: str, msg: str):
        self.errors.append(f"{path or '(root)'} — {msg}")

    def matches(self, node: dict, doc) -> bool:
        sub = Checker(self.root)
        sub.check(node, doc, "")
        return not sub.errors

    def check(self, node: dict, doc, path: str):
        node = self.deref(node)

        t = node.get("type")
        if t is not None:
            types = t if isinstance(t, list) else [t]
            ok = any(
                (isinstance(doc, TYPES[x]) and not (x in ("integer", "number") and isinstance(doc, bool)))
                for x in types if x in TYPES
            )
            if not ok:
                self.err(path, f"expected type {t}, got {type(doc).__name__}")
                return

        if "const" in node and doc != node["const"]:
            self.err(path, f"must equal const {node['const']!r}, got {doc!r}")
        if "enum" in node and doc not in node["enum"]:
            self.err(path, f"{doc!r} not in enum {node['enum']!r}"[:200])

        if isinstance(doc, str):
            if "minLength" in node and len(doc) < node["minLength"]:
                self.err(path, f"shorter than minLength {node['minLength']}")
            if "maxLength" in node and len(doc) > node["maxLength"]:
                self.err(path, f"longer than maxLength {node['maxLength']}")
            if "pattern" in node and not re.search(node["pattern"], doc):
                self.err(path, f"{doc!r} does not match pattern {node['pattern']!r}")

        if isinstance(doc, (int, float)) and not isinstance(doc, bool):
            if "minimum" in node and doc < node["minimum"]:
                self.err(path, f"{doc} < minimum {node['minimum']}")
            if "maximum" in node and doc > node["maximum"]:
                self.err(path, f"{doc} > maximum {node['maximum']}")

        if isinstance(doc, list):
            if "minItems" in node and len(doc) < node["minItems"]:
                self.err(path, f"fewer than minItems {node['minItems']}")
            if "maxItems" in node and len(doc) > node["maxItems"]:
                self.err(path, f"more than maxItems {node['maxItems']}")
            items = node.get("items")
            if items:
                for i, v in enumerate(doc):
                    self.check(items, v, f"{path}[{i}]")

        if isinstance(doc, dict):
            for req in node.get("required", []):
                if req not in doc:
                    self.err(path, f"missing required property {req!r}")
            props = node.get("properties", {})
            for k, v in doc.items():
                if k in props:
                    self.check(props[k], v, f"{path}.{k}" if path else k)
            ap = node.get("additionalProperties")
            if isinstance(ap, dict):
                for k, v in doc.items():
                    if k not in props:
                        self.check(ap, v, f"{path}.{k}" if path else k)

        for branch in node.get("allOf", []):
            branch = self.deref(branch)
            if "if" in branch:
                if self.matches(branch["if"], doc):
                    if "then" in branch:
                        self.check(branch["then"], doc, path)
                elif "else" in branch:
                    self.check(branch["else"], doc, path)
            else:
                self.check(branch, doc, path)


def validate(schema_path: str, doc_path: str) -> list[str]:
    schema = json.load(open(schema_path, encoding="utf-8"))
    doc = json.load(open(doc_path, encoding="utf-8"))
    c = Checker(schema)
    c.check(schema, doc, "")
    return c.errors


FIXTURE_PAIRS = [
    ("frameworks/screener/intake.schema.json", "screener/runs/SIG-20260610-a3f2c81d/intake.json"),
    ("frameworks/screener/signal_payload.schema.json", "screener/runs/SIG-20260610-a3f2c81d/signal_payload.json"),
    ("frameworks/screener/thesis_record.schema.json", "screener/runs/SIG-20260610-a3f2c81d/thesis_record.json"),
    ("frameworks/screener/candidates.schema.json", "screener/runs/SIG-20260610-a3f2c81d/candidates.json"),
    ("frameworks/screener/board_index.schema.json", "screener/board/index.json"),
]


def main(argv: list[str]) -> int:
    if len(argv) >= 2 and argv[1] == "--fixture":
        pairs = [(os.path.join(REPO, s), os.path.join(REPO, d)) for s, d in FIXTURE_PAIRS]
    elif len(argv) >= 3 and len(argv) % 2 == 1:
        pairs = list(zip(argv[1::2], argv[2::2]))
    else:
        print(__doc__)
        return 2
    bad = 0
    for schema_p, doc_p in pairs:
        errs = validate(schema_p, doc_p)
        rel = os.path.relpath(doc_p, REPO)
        if errs:
            bad += 1
            print(f"FAIL {rel}")
            for e in errs[:10]:
                print(f"   - {e}")
        else:
            print(f"OK   {rel}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
