#!/usr/bin/env python3
"""Create immutable provider-parity input bindings before either run starts."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import math
import os
import re
import stat
import sys
from pathlib import Path
from typing import Any, Mapping

REPO_ROOT = Path(__file__).resolve().parent.parent
FREEZE_SCHEMA_PATH = REPO_ROOT / "frameworks/provider_parity_freeze.schema.json"
RUN_BINDING_SCHEMA_PATH = REPO_ROOT / "frameworks/provider_parity_run_binding.schema.json"
ADJUDICATION_SCHEMA_PATH = REPO_ROOT / "frameworks/provider_parity_adjudication.schema.json"
EXECUTION_RECEIPT_SCHEMA_PATH = REPO_ROOT / "frameworks/provider_parity_execution_receipt.schema.json"
SCHEMA_VERSION = "provider-parity-freeze/2.0"
RUN_BINDING_SCHEMA_VERSION = "provider-parity-run-binding/1.0"
RUN_BINDING_BASENAME = ".provider-parity-input.json"
_DATE = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}$")
_UTC = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$")


class FreezeError(ValueError):
    """The pre-launch receipt cannot be created safely."""


class SchemaValidationError(FreezeError):
    """A parity artifact violates its checked-in schema."""


def _canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def digest_json(value: Any) -> str:
    return "sha256:" + hashlib.sha256(_canonical_json(value).encode()).hexdigest()


def digest_file(path: str | Path) -> str:
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return "sha256:" + digest.hexdigest()


def _type_matches(value: Any, expected: str) -> bool:
    return {
        "object": isinstance(value, Mapping),
        "array": isinstance(value, list),
        "string": isinstance(value, str),
        "integer": isinstance(value, int) and not isinstance(value, bool),
        "number": isinstance(value, (int, float)) and not isinstance(value, bool)
        and math.isfinite(float(value)) if isinstance(value, (int, float)) else False,
        "boolean": isinstance(value, bool),
        "null": value is None,
    }.get(expected, False)


def _schema_matches(value: Any, schema: Mapping[str, Any], location: str) -> bool:
    try:
        _validate_schema(value, schema, location)
        return True
    except SchemaValidationError:
        return False


def _validate_schema(value: Any, schema: Mapping[str, Any], location: str) -> None:
    supported = {
        "$schema", "$id", "title", "description", "type", "required", "properties",
        "additionalProperties", "const", "enum", "pattern", "minLength", "minItems",
        "maxItems", "minimum", "exclusiveMinimum", "items", "allOf", "anyOf", "not",
        "if", "then", "else",
    }
    unknown = set(schema) - supported
    if unknown:
        raise SchemaValidationError(f"{location}: unsupported schema keywords {sorted(unknown)}")
    expected = schema.get("type")
    if expected is not None:
        choices = [expected] if isinstance(expected, str) else expected
        if not isinstance(choices, list) or not any(_type_matches(value, item) for item in choices):
            raise SchemaValidationError(f"{location}: wrong JSON type")
    if "const" in schema and value != schema["const"]:
        raise SchemaValidationError(f"{location}: must equal {schema['const']!r}")
    if "enum" in schema and value not in schema["enum"]:
        raise SchemaValidationError(f"{location}: value is not allowed")
    if isinstance(value, str):
        if "minLength" in schema and len(value) < schema["minLength"]:
            raise SchemaValidationError(f"{location}: string is too short")
        if "pattern" in schema and re.search(schema["pattern"], value) is None:
            raise SchemaValidationError(f"{location}: does not match required pattern")
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]:
            raise SchemaValidationError(f"{location}: below minimum")
        if "exclusiveMinimum" in schema and value <= schema["exclusiveMinimum"]:
            raise SchemaValidationError(f"{location}: not above exclusive minimum")
    if isinstance(value, list):
        if "minItems" in schema and len(value) < schema["minItems"]:
            raise SchemaValidationError(f"{location}: array is too short")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            raise SchemaValidationError(f"{location}: array is too long")
        if "items" in schema:
            for index, item in enumerate(value):
                _validate_schema(item, schema["items"], f"{location}[{index}]")
    if isinstance(value, Mapping):
        for key in schema.get("required", []):
            if key not in value:
                raise SchemaValidationError(f"{location}: missing required property {key!r}")
        properties = schema.get("properties", {})
        for key, child in properties.items():
            if key in value:
                _validate_schema(value[key], child, f"{location}.{key}")
        extras = set(value) - set(properties)
        additional = schema.get("additionalProperties", True)
        if additional is False and extras:
            raise SchemaValidationError(f"{location}: unknown properties {sorted(extras)}")
        if isinstance(additional, Mapping):
            for key in extras:
                _validate_schema(value[key], additional, f"{location}.{key}")
    for child in schema.get("allOf", []):
        _validate_schema(value, child, location)
    if "anyOf" in schema and not any(_schema_matches(value, child, location) for child in schema["anyOf"]):
        raise SchemaValidationError(f"{location}: no anyOf branch matched")
    if "not" in schema and _schema_matches(value, schema["not"], location):
        raise SchemaValidationError(f"{location}: matched forbidden schema")
    if "if" in schema:
        branch = schema.get("then") if _schema_matches(value, schema["if"], location) else schema.get("else")
        if branch is not None:
            _validate_schema(value, branch, location)


def validate_against_schema(value: Any, schema_path: str | Path, *, label: str | None = None) -> None:
    path = Path(schema_path)
    try:
        schema = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SchemaValidationError(f"cannot load checked-in schema {path}: {exc}") from exc
    if not isinstance(schema, Mapping):
        raise SchemaValidationError(f"schema is not an object: {path}")
    _validate_schema(value, schema, label or path.name)


def _hash_file(path: Path) -> tuple[int, str]:
    before = path.lstat()
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    after = path.lstat()
    if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (
        after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns
    ):
        raise FreezeError(f"snapshot file changed while hashing: {path}")
    return before.st_size, "sha256:" + digest.hexdigest()


def snapshot_receipt(root_value: str | Path, frozen_at: str) -> dict[str, Any]:
    if not _UTC.fullmatch(frozen_at):
        raise FreezeError("frozen_at must be UTC: YYYY-MM-DDTHH:MM:SSZ")
    root_input = Path(root_value).expanduser()
    if root_input.is_symlink():
        raise FreezeError(f"snapshot root must not be a symlink: {root_input}")
    try:
        root_stat = root_input.lstat()
    except OSError as exc:
        raise FreezeError(f"cannot read snapshot root {root_input}: {exc}") from exc
    if not stat.S_ISDIR(root_stat.st_mode):
        raise FreezeError(f"snapshot root must be a directory: {root_input}")
    root = root_input.resolve()
    files: list[dict[str, Any]] = []

    def walk(directory: Path, relative: Path) -> None:
        try:
            with os.scandir(directory) as scan:
                entries = sorted(scan, key=lambda item: item.name)
        except OSError as exc:
            raise FreezeError(f"cannot enumerate snapshot {directory}: {exc}") from exc
        for entry in entries:
            path, rel = directory / entry.name, relative / entry.name
            mode = entry.stat(follow_symlinks=False).st_mode
            if stat.S_ISLNK(mode):
                raise FreezeError(f"symlink is not allowed in snapshot: {rel.as_posix()}")
            if stat.S_ISDIR(mode):
                walk(path, rel)
            elif stat.S_ISREG(mode):
                size, sha = _hash_file(path)
                files.append({"path": rel.as_posix(), "bytes": size, "sha256": sha})
            else:
                raise FreezeError(f"special file is not allowed in snapshot: {rel.as_posix()}")
    walk(root, Path())
    files.sort(key=lambda item: item["path"])
    total = sum(item["bytes"] for item in files)
    if not files or total < 1:
        raise FreezeError("data snapshot must contain at least one non-empty regular file")
    return {"sha256": digest_json({"files": files}), "file_count": len(files), "bytes": total,
            "frozen_at": frozen_at, "files": files}


def receipt_digest(receipt: Mapping[str, Any]) -> str:
    core = dict(receipt)
    core.pop("receipt_sha256", None)
    return digest_json(core)


def _relative(path: Path, parent: Path) -> str:
    try:
        return Path(os.path.relpath(path, parent)).as_posix()
    except ValueError:
        return str(path)


def _empty_run_root(value: str | Path) -> Path:
    path = Path(value).expanduser()
    if path.is_symlink():
        raise FreezeError(f"run root must not be a symlink: {path}")
    path.mkdir(parents=True, exist_ok=True)
    path = path.resolve()
    if not path.is_dir() or any(path.iterdir()):
        raise FreezeError(f"pre-launch run root must be an empty directory: {path}")
    return path


def _disjoint(snapshot: Path, run_a: Path, run_b: Path, output: Path) -> None:
    if run_a == run_b or run_a in run_b.parents or run_b in run_a.parents:
        raise FreezeError("provider run roots must be isolated and non-nested")
    for run_root in (run_a, run_b):
        if snapshot == run_root or snapshot in run_root.parents or run_root in snapshot.parents:
            raise FreezeError("snapshot and run roots must be separate and non-nested")
        if output == run_root or run_root in output.parents:
            raise FreezeError("freeze receipt must be outside run roots")
    if output == snapshot or snapshot in output.parents:
        raise FreezeError("freeze receipt must be outside the snapshot")


def _text(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise FreezeError(f"{field} must be a non-empty string")
    return value.strip()


def binding_payload(receipt: Mapping[str, Any], row: Mapping[str, Any], receipt_path: Path) -> dict[str, Any]:
    return {
        "schema_version": RUN_BINDING_SCHEMA_VERSION, "receipt_path": str(receipt_path.resolve()),
        "receipt_sha256": receipt["receipt_sha256"], "created_at": receipt["created_at"],
        "subject": receipt["subject"], "decision_date": receipt["decision_date"],
        "data_snapshot_sha256": receipt["data_snapshot"]["sha256"],
        "price_anchor_sha256": digest_json(receipt["price_anchor"]), "label": row["label"],
        "provider": row["provider"], "run_root": str(Path(row["resolved_run_root"]).resolve()),
        "expected_model": row["expected_model"], "expected_reasoning_level": row["expected_reasoning_level"],
        "expected_profile_key": row["expected_profile_key"],
    }


def write_new_json(path: Path, value: Mapping[str, Any], mode: int = 0o444) -> None:
    path = path.expanduser().absolute()
    if path.exists() or path.is_symlink():
        raise FreezeError(f"refusing to overwrite immutable parity artifact: {path}")
    if not path.parent.is_dir() or path.parent.is_symlink() \
            or path.parent.resolve(strict=True) != path.parent.absolute():
        raise FreezeError(f"parity artifact parent must be an existing real directory: {path.parent}")
    rendered = json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    try:
        descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, mode)
    except FileExistsError as exc:
        raise FreezeError(f"refusing to overwrite immutable parity artifact: {path}") from exc
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(rendered); handle.flush(); os.fsync(handle.fileno())
        os.chmod(path, mode)
    except Exception:
        try: path.unlink()
        except OSError: pass
        raise


def build_freeze_manifest(*, data_snapshot_root: str | Path, claude_run: str | Path,
                          codex_run: str | Path, subject: str, decision_date: str,
                          price_value: float, price_currency: str, price_as_of: str,
                          price_source: str, claude_model: str, claude_reasoning: str,
                          claude_profile: str, codex_model: str, codex_reasoning: str,
                          codex_profile: str, output: str | Path,
                          frozen_at: str | None = None) -> dict[str, Any]:
    subject = _text(subject, "subject")
    if not _DATE.fullmatch(decision_date) or not _DATE.fullmatch(price_as_of):
        raise FreezeError("decision_date and price_as_of must be YYYY-MM-DD")
    if isinstance(price_value, bool) or not isinstance(price_value, (int, float)) \
            or not math.isfinite(float(price_value)) or price_value <= 0:
        raise FreezeError("price_value must be positive and finite")
    created_at = frozen_at or dt.datetime.now(dt.timezone.utc).replace(microsecond=0).strftime("%Y-%m-%dT%H:%M:%SZ")
    if not _UTC.fullmatch(created_at):
        raise FreezeError("frozen_at must be UTC: YYYY-MM-DDTHH:MM:SSZ")
    output_input = Path(output).expanduser()
    if output_input.exists() or output_input.is_symlink():
        raise FreezeError(f"refusing to overwrite freeze receipt: {output_input}")
    output_path = output_input.resolve()
    snapshot_input = Path(data_snapshot_root).expanduser()
    if snapshot_input.is_symlink():
        raise FreezeError(f"snapshot root must not be a symlink: {snapshot_input}")
    snapshot_root = snapshot_input.resolve(strict=True)
    run_a, run_b = _empty_run_root(claude_run), _empty_run_root(codex_run)
    _disjoint(snapshot_root, run_a, run_b, output_path)
    snapshot = snapshot_receipt(snapshot_root, created_at)
    if snapshot_receipt(snapshot_root, created_at) != snapshot:
        raise FreezeError("snapshot changed while the receipt was being built")
    snapshot["root"] = _relative(snapshot_root, output_path.parent)
    price_anchor = {"value": float(price_value), "currency": _text(price_currency, "price_currency"),
                    "as_of": price_as_of, "source": _text(price_source, "price_source")}
    values = (
        ("run_a", "claude", run_a, claude_model, claude_reasoning, claude_profile),
        ("run_b", "codex", run_b, codex_model, codex_reasoning, codex_profile),
    )
    rows, internal = [], []
    for label, provider, root, model, reasoning, profile in values:
        row = {"label": label, "provider": provider, "run_root": _relative(root, output_path.parent),
               "binding": _relative(root / RUN_BINDING_BASENAME, output_path.parent),
               "expected_model": _text(model, f"{provider}_model"),
               "expected_reasoning_level": _text(reasoning, f"{provider}_reasoning"),
               "expected_profile_key": _text(profile, f"{provider}_profile")}
        rows.append(row); internal.append({**row, "resolved_run_root": str(root)})
    receipt: dict[str, Any] = {"schema_version": SCHEMA_VERSION, "receipt_sha256": "",
        "created_at": created_at, "subject": subject, "decision_date": decision_date,
        "data_snapshot": snapshot, "price_anchor": price_anchor, "runs": rows}
    receipt["receipt_sha256"] = receipt_digest(receipt)
    validate_against_schema(receipt, FREEZE_SCHEMA_PATH, label="freeze receipt")
    bindings = [binding_payload(receipt, row, output_path) for row in internal]
    for binding in bindings:
        validate_against_schema(binding, RUN_BINDING_SCHEMA_PATH, label=f"{binding['label']} binding")
    written: list[Path] = []
    try:
        for root, binding in zip((run_a, run_b), bindings):
            path = root / RUN_BINDING_BASENAME; write_new_json(path, binding); written.append(path)
        write_new_json(output_path, receipt); written.append(output_path)
    except Exception:
        for path in reversed(written):
            try: path.chmod(0o644); path.unlink()
            except OSError: pass
        raise
    return receipt


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("data-snapshot", "claude-run", "codex-run", "subject", "decision-date",
                 "price-currency", "price-as-of", "price-source", "claude-model",
                 "claude-reasoning", "claude-profile", "codex-model", "codex-reasoning",
                 "codex-profile", "output"):
        parser.add_argument(f"--{name}", required=True)
    parser.add_argument("--price-value", required=True, type=float)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        receipt = build_freeze_manifest(
            data_snapshot_root=args.data_snapshot, claude_run=args.claude_run, codex_run=args.codex_run,
            subject=args.subject, decision_date=args.decision_date, price_value=args.price_value,
            price_currency=args.price_currency, price_as_of=args.price_as_of, price_source=args.price_source,
            claude_model=args.claude_model, claude_reasoning=args.claude_reasoning,
            claude_profile=args.claude_profile, codex_model=args.codex_model,
            codex_reasoning=args.codex_reasoning, codex_profile=args.codex_profile, output=args.output)
    except (FreezeError, OSError) as exc:
        sys.stderr.write(f"provider-parity-freeze: {exc}\n"); return 2
    sys.stdout.write(_canonical_json({"ok": True, "receipt": str(Path(args.output).resolve()),
        "receipt_sha256": receipt["receipt_sha256"],
        "data_snapshot_sha256": receipt["data_snapshot"]["sha256"],
        "bindings": [str(Path(args.claude_run).resolve() / RUN_BINDING_BASENAME),
                     str(Path(args.codex_run).resolve() / RUN_BINDING_BASENAME)]}) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
