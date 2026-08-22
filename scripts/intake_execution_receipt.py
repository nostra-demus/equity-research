#!/usr/bin/env python3
"""Validate and write content-bound, one-time intake-plan execution receipts.

This is the deterministic writer twin of ``ui/server/src/intake.ts``. Slash commands must call this
helper; they never hand-roll containment, canonical hashes, effective research corrections, filenames,
or exclusive creation in prompt prose.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
from typing import Any

from canonical_json import canonical_json, canonical_sha256
from ledger_records import load_one


RECEIPT_VERSION = "intake-execution-receipt/1"
FP_RE = re.compile(r"sha256:[a-f0-9]{64}\Z")
SAFE_ID_RE = re.compile(r"[A-Za-z0-9._:-]{1,160}\Z")
ORB_RE = re.compile(r"[a-z0-9][a-z0-9-]{0,79}\Z")
UTC_RE = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3,6})?Z\Z")
RECEIPT_FILE_RE = re.compile(r"\d{8}T\d{6}(?:\d{3})?Z_[a-f0-9]{12}\.json\Z")
RECEIPT_KEYS = {
    "schema_version", "receipt_id", "swarm", "subject", "run_root", "plan_path", "plan_sha256",
    "source_decision_fingerprint", "executed_against_decision_fingerprint", "executed_orbs",
    "completed_at", "result_decision_fingerprint", "result_decision_id",
}


class ReceiptError(ValueError):
    pass


def _inside(child: Path, parent: Path) -> bool:
    try:
        child.relative_to(parent)
        return True
    except ValueError:
        return False


def _repo_relative(value: str, root: Path, *, must_exist: bool = True) -> tuple[str, Path]:
    if not value or "\\" in value or "\x00" in value or Path(value).is_absolute():
        raise ReceiptError("path must be canonical repo-relative POSIX text")
    normalized = Path(value)
    if normalized.as_posix() != value or any(part in ("", ".", "..") for part in normalized.parts):
        raise ReceiptError("path is not canonical")
    real_root = root.resolve(strict=True)
    candidate = real_root.joinpath(*normalized.parts)
    current = real_root
    try:
        for index, part in enumerate(normalized.parts):
            current = current / part
            try:
                mode = os.lstat(current).st_mode
            except FileNotFoundError:
                if not must_exist and index == len(normalized.parts) - 1:
                    break
                raise
            if stat.S_ISLNK(mode):
                raise ReceiptError(f"path contains a symlink: {value}")
            if index < len(normalized.parts) - 1 and not stat.S_ISDIR(mode):
                raise ReceiptError(f"path parent is not a directory: {value}")
    except OSError as exc:
        raise ReceiptError(f"path is unavailable: {value}") from exc
    if not _inside(candidate, real_root):
        raise ReceiptError("path escapes the repository")
    return value, candidate


def _regular_no_link(path: Path) -> None:
    try:
        if not stat.S_ISREG(os.lstat(path).st_mode):
            raise ReceiptError(f"not a regular non-symlink file: {path}")
    except OSError as exc:
        raise ReceiptError(f"file is unavailable: {path}") from exc


def _load_object(path: Path) -> dict[str, Any]:
    _regular_no_link(path)
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ReceiptError(f"invalid JSON object: {path}") from exc
    if not isinstance(value, dict):
        raise ReceiptError(f"JSON root is not an object: {path}")
    return value


def _head_bytes(repo: Path, rel: str) -> bytes | None:
    result = subprocess.run(
        ["git", "-C", str(repo), "show", f"HEAD:{rel}"], check=False,
        stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
    )
    return result.stdout if result.returncode == 0 else None


def _fingerprint(run_root: str, record: dict[str, Any]) -> str:
    material = (run_root + "\n" + canonical_json(record)).encode("utf-8")
    return "sha256:" + hashlib.sha256(material).hexdigest()


def _effective_decision(repo: Path, swarm: str, run_root: str, run_abs: Path) -> dict[str, Any]:
    if swarm == "research":
        # ledger_records.load_one is the Python mirror of server normalizeRecord/readDataNeeds.
        value = load_one(str(run_abs))
    else:
        value = _load_object(run_abs / "decision_record.json")
    if not isinstance(value, dict):
        raise ReceiptError("run has no object decision_record.json")
    # Prove the terminal file itself is direct and regular even when research's correction projection reads it.
    decision = run_abs / "decision_record.json"
    _regular_no_link(decision)
    if decision.resolve(strict=True).parent != run_abs:
        raise ReceiptError("decision_record.json is not a direct run child")
    return value


def _plan_hash(plan: dict[str, Any]) -> str:
    authored = dict(plan)
    authored.pop("staged_for_scoped_rerun", None)
    return "sha256:" + canonical_sha256(authored)


def validate_plan(
    *, repo: Path, swarm: str, subject: str, run_root: str, plan_path: str, plan_sha256: str,
    source_decision_fingerprint: str, module: str, agent: str,
) -> tuple[Path, Path, dict[str, Any]]:
    if not re.fullmatch(r"[a-z0-9-]{1,40}", swarm):
        raise ReceiptError("invalid swarm")
    if not subject or "/" in subject or "\\" in subject or any(ord(c) < 32 for c in subject):
        raise ReceiptError("invalid subject")
    if not ORB_RE.fullmatch(module) or not ORB_RE.fullmatch(agent):
        raise ReceiptError("invalid module/agent")
    if not FP_RE.fullmatch(plan_sha256) or not FP_RE.fullmatch(source_decision_fingerprint):
        raise ReceiptError("invalid plan/source fingerprint")
    canonical_run, run_abs = _repo_relative(run_root, repo)
    if run_abs.is_symlink() or not run_abs.is_dir():
        raise ReceiptError("run root is not a real directory")
    canonical_plan, plan_abs = _repo_relative(plan_path, repo)
    intake_abs = run_abs / "intake"
    if intake_abs.is_symlink() or not intake_abs.is_dir() or intake_abs.resolve(strict=True).parent != run_abs:
        raise ReceiptError("intake directory is not a direct, real run child")
    if plan_abs.parent != intake_abs.resolve(strict=True) or not re.fullmatch(
            r"\d{4}-\d{2}-\d{2}_intake_plan(?:_v\d+)?\.json", plan_abs.name):
        raise ReceiptError("plan is not a direct canonical intake plan")
    plan = _load_object(plan_abs)
    if plan.get("schema_version") != "1.1" or plan.get("swarm") != swarm \
            or plan.get("subject") != subject or plan.get("ticker") != subject \
            or plan.get("run_root") != canonical_run \
            or plan.get("decision_fingerprint") != source_decision_fingerprint:
        raise ReceiptError("plan identity does not match the receipt intent")
    if _plan_hash(plan) != plan_sha256:
        raise ReceiptError("plan hash mismatch")
    if _head_bytes(repo, canonical_plan) != plan_abs.read_bytes():
        raise ReceiptError("plan bytes are not exact committed proof")
    commands = plan.get("rerun_plan", {}).get("commands")
    if not isinstance(commands, list) or sum(
            1 for command in commands if isinstance(command, dict)
            and command.get("module") == module and command.get("agent") == agent) != 1:
        raise ReceiptError("exact orb is not unique in this plan")
    return run_abs, plan_abs, plan


def _receipt_history(
    *, repo: Path, run_abs: Path, swarm: str, subject: str, run_root: str, plan_path: str,
    plan_sha256: str, source_decision_fingerprint: str, commands: list[Any],
) -> tuple[str, set[tuple[str, str]]]:
    receipts_dir = run_abs / "intake" / "receipts"
    try:
        receipts_mode = os.lstat(receipts_dir).st_mode
    except FileNotFoundError:
        return source_decision_fingerprint, set()
    except OSError as exc:
        raise ReceiptError("receipts path is unavailable") from exc
    if stat.S_ISLNK(receipts_mode) or not stat.S_ISDIR(receipts_mode):
        raise ReceiptError("receipts directory is unsafe")
    rel_dir = receipts_dir.relative_to(repo).as_posix()
    _, safe_dir = _repo_relative(rel_dir, repo)
    if not safe_dir.is_dir() or safe_dir.parent != run_abs / "intake":
        raise ReceiptError("receipts directory is unsafe")
    allowed = {
        (command.get("module"), command.get("agent"))
        for command in commands if isinstance(command, dict)
    }
    related: list[dict[str, Any]] = []
    for name in sorted(entry.name for entry in os.scandir(safe_dir) if entry.name.endswith(".json")):
        if not RECEIPT_FILE_RE.fullmatch(name):
            raise ReceiptError("malformed receipt filename")
        rel = f"{rel_dir}/{name}"
        _, receipt_abs = _repo_relative(rel, repo)
        _regular_no_link(receipt_abs)
        disk = receipt_abs.read_bytes()
        if _head_bytes(repo, rel) != disk:
            raise ReceiptError("receipt is not exact committed proof")
        try:
            raw = json.loads(disk.decode("utf-8"))
        except (UnicodeError, json.JSONDecodeError) as exc:
            raise ReceiptError("invalid receipt JSON") from exc
        if not isinstance(raw, dict) or set(raw) != RECEIPT_KEYS:
            raise ReceiptError("receipt schema is not exact")
        payload = dict(raw)
        receipt_id = payload.pop("receipt_id", None)
        if not isinstance(receipt_id, str) or not FP_RE.fullmatch(receipt_id) \
                or receipt_id != "sha256:" + canonical_sha256(payload) \
                or not name.endswith(f"_{receipt_id[7:19]}.json"):
            raise ReceiptError("receipt self-hash is invalid")
        executed = raw.get("executed_orbs")
        if raw.get("schema_version") != RECEIPT_VERSION \
                or not isinstance(raw.get("swarm"), str) or not re.fullmatch(r"[a-z0-9-]{1,40}", raw["swarm"]) \
                or not isinstance(raw.get("subject"), str) or not raw["subject"] \
                or not isinstance(raw.get("run_root"), str) or not raw["run_root"] \
                or not isinstance(raw.get("plan_path"), str) or not raw["plan_path"] \
                or not FP_RE.fullmatch(str(raw.get("plan_sha256", ""))) \
                or not FP_RE.fullmatch(str(raw.get("source_decision_fingerprint", ""))) \
                or not FP_RE.fullmatch(str(raw.get("executed_against_decision_fingerprint", ""))) \
                or not FP_RE.fullmatch(str(raw.get("result_decision_fingerprint", ""))) \
                or not isinstance(raw.get("completed_at"), str) or not UTC_RE.fullmatch(raw["completed_at"]) \
                or not (raw.get("result_decision_id") is None or (
                    isinstance(raw["result_decision_id"], str) and SAFE_ID_RE.fullmatch(raw["result_decision_id"]))) \
                or not isinstance(executed, list) or not 1 <= len(executed) <= 64:
            raise ReceiptError("receipt fields are invalid")
        pairs: list[tuple[str, str]] = []
        for orb in executed:
            if not isinstance(orb, dict) or set(orb) != {"module", "agent"} \
                    or not isinstance(orb.get("module"), str) or not ORB_RE.fullmatch(orb["module"]) \
                    or not isinstance(orb.get("agent"), str) or not ORB_RE.fullmatch(orb["agent"]):
                raise ReceiptError("receipt orb is invalid")
            pairs.append((orb["module"], orb["agent"]))
        if len(set(pairs)) != len(pairs):
            raise ReceiptError("receipt repeats an orb")
        # Structurally validate every historical receipt first. Only after exact plan identity matches is
        # current-plan orb membership relevant; a valid older plan may contain a now-absent orb.
        is_related = raw["swarm"] == swarm and raw["subject"] == subject and raw["run_root"] == run_root \
            and raw["plan_path"] == plan_path and raw["plan_sha256"] == plan_sha256
        if not is_related:
            continue
        if raw["source_decision_fingerprint"] != source_decision_fingerprint or any(p not in allowed for p in pairs):
            raise ReceiptError("receipt does not belong to this exact plan")
        related.append(raw)

    related.sort(key=lambda item: (item["completed_at"], item["receipt_id"]))
    expected = source_decision_fingerprint
    seen: set[tuple[str, str]] = set()
    for receipt in related:
        if receipt["executed_against_decision_fingerprint"] != expected:
            raise ReceiptError("receipt chain is not contiguous")
        for orb in receipt["executed_orbs"]:
            pair = (orb["module"], orb["agent"])
            if pair in seen:
                raise ReceiptError("exact plan orb already has a committed receipt")
            seen.add(pair)
        expected = receipt["result_decision_fingerprint"]
    return expected, seen


def preflight(args: argparse.Namespace) -> None:
    repo = Path(args.repo_root).resolve(strict=True)
    run_abs, _, plan = validate_plan(
        repo=repo, swarm=args.swarm, subject=args.subject, run_root=args.run_root,
        plan_path=args.plan_path, plan_sha256=args.plan_sha256,
        source_decision_fingerprint=args.source_decision_fingerprint,
        module=args.module, agent=args.agent,
    )
    if not FP_RE.fullmatch(args.current_decision_fingerprint):
        raise ReceiptError("invalid current decision fingerprint")
    result = _effective_decision(repo, args.swarm, args.run_root, run_abs)
    if _fingerprint(args.run_root, result) != args.current_decision_fingerprint:
        raise ReceiptError("current decision fingerprint mismatch")
    terminal, seen = _receipt_history(
        repo=repo, run_abs=run_abs, swarm=args.swarm, subject=args.subject, run_root=args.run_root,
        plan_path=args.plan_path, plan_sha256=args.plan_sha256,
        source_decision_fingerprint=args.source_decision_fingerprint,
        commands=plan["rerun_plan"]["commands"],
    )
    if terminal != args.current_decision_fingerprint:
        raise ReceiptError("receipt chain does not end at the current decision")
    if (args.module, args.agent) in seen:
        raise ReceiptError("exact plan orb already has a committed receipt")
    print("INTAKE-RECEIPT-PREFLIGHT: OK")


def create(args: argparse.Namespace) -> None:
    if os.environ.get("NOSTRA_COCKPIT_RUN") == "1" and args.swarm == "commodity":
        # The immutable commodity archive is supervisor-created only after the paid process group is
        # extinct. Its dependent receipt must therefore be queued too; creating it here would bind a
        # provisional, unarchived decision. The live RunState supplies every other frozen plan/orb field.
        from supervisor_publication import SupervisorPublicationError, post
        try:
            result = post({
                "phase": "intake-receipt",
                "executedAgainstDecisionFingerprint": args.executed_against_decision_fingerprint,
            }, timeout=5 * 60)
        except SupervisorPublicationError as error:
            raise ReceiptError(f"supervisor intake-receipt queue failed: {error}") from error
        intent_id = result.get("intentId") if isinstance(result, dict) else None
        if result.get("ok") is not True or result.get("phase") != "queued" or not isinstance(intent_id, str):
            raise ReceiptError("supervisor did not queue the post-archive intake receipt")
        print(f"INTAKE-RECEIPT: deferred/{intent_id}.json sha256:{'0' * 64}")
        return
    repo = Path(args.repo_root).resolve(strict=True)
    run_abs, _, plan = validate_plan(
        repo=repo, swarm=args.swarm, subject=args.subject, run_root=args.run_root,
        plan_path=args.plan_path, plan_sha256=args.plan_sha256,
        source_decision_fingerprint=args.source_decision_fingerprint,
        module=args.module, agent=args.agent,
    )
    if not FP_RE.fullmatch(args.executed_against_decision_fingerprint):
        raise ReceiptError("invalid executed-against decision fingerprint")
    terminal, seen = _receipt_history(
        repo=repo, run_abs=run_abs, swarm=args.swarm, subject=args.subject, run_root=args.run_root,
        plan_path=args.plan_path, plan_sha256=args.plan_sha256,
        source_decision_fingerprint=args.source_decision_fingerprint,
        commands=plan["rerun_plan"]["commands"],
    )
    if terminal != args.executed_against_decision_fingerprint:
        raise ReceiptError("receipt chain does not end at the executed-against decision")
    if (args.module, args.agent) in seen:
        raise ReceiptError("exact plan orb already has a committed receipt")
    result = _effective_decision(repo, args.swarm, args.run_root, run_abs)
    result_fp = _fingerprint(args.run_root, result)
    decision_id = result.get("decision_id")
    if decision_id is not None and (not isinstance(decision_id, str) or not SAFE_ID_RE.fullmatch(decision_id)):
        raise ReceiptError("result decision_id is unsafe")
    now = dt.datetime.now(dt.timezone.utc)
    completed_at = now.isoformat(timespec="milliseconds").replace("+00:00", "Z")
    payload = {
        "schema_version": RECEIPT_VERSION,
        "swarm": args.swarm,
        "subject": args.subject,
        "run_root": args.run_root,
        "plan_path": args.plan_path,
        "plan_sha256": args.plan_sha256,
        "source_decision_fingerprint": args.source_decision_fingerprint,
        "executed_against_decision_fingerprint": args.executed_against_decision_fingerprint,
        "executed_orbs": [{"module": args.module, "agent": args.agent}],
        "completed_at": completed_at,
        "result_decision_fingerprint": result_fp,
        "result_decision_id": decision_id,
    }
    receipt_id = "sha256:" + canonical_sha256(payload)
    receipt = dict(payload, receipt_id=receipt_id)
    intake_abs = run_abs / "intake"
    receipts = intake_abs / "receipts"
    try:
        receipts_mode = os.lstat(receipts).st_mode
    except FileNotFoundError:
        receipts_mode = None
    except OSError as exc:
        raise ReceiptError("receipts path is unavailable") from exc
    if receipts_mode is not None:
        if stat.S_ISLNK(receipts_mode) or not stat.S_ISDIR(receipts_mode) \
                or receipts.resolve(strict=True).parent != intake_abs.resolve(strict=True):
            raise ReceiptError("receipts path is not a direct, real intake child")
    else:
        receipts.mkdir(mode=0o755)
    stamp = now.strftime("%Y%m%dT%H%M%S") + f"{now.microsecond // 1000:03d}Z"
    target = receipts / f"{stamp}_{receipt_id[7:19]}.json"
    data = (canonical_json(receipt) + "\n").encode("utf-8")
    directory_fd = os.open(receipts, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0))
    try:
        fd = os.open(target.name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0), 0o644,
                     dir_fd=directory_fd)
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
    except OSError as exc:
        raise ReceiptError("could not exclusively create receipt") from exc
    finally:
        os.close(directory_fd)
    rel = target.relative_to(repo).as_posix()
    print(f"INTAKE-RECEIPT: {rel} {receipt_id}")


def cleanup(args: argparse.Namespace) -> None:
    repo = Path(args.repo_root).resolve(strict=True)
    if not FP_RE.fullmatch(args.receipt_id):
        raise ReceiptError("invalid receipt id")
    rel, target = _repo_relative(args.receipt_path, repo)
    parts = Path(rel).parts
    if len(parts) < 4 or parts[-2] != "receipts" or parts[-3] != "intake":
        raise ReceiptError("receipt path is outside an intake receipts directory")
    parent = target.parent
    parent_fd = os.open(parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0))
    try:
        try:
            file_fd = os.open(target.name, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0), dir_fd=parent_fd)
        except OSError as exc:
            raise ReceiptError("receipt is not a regular non-symlink file") from exc
        try:
            opened = os.fstat(file_fd)
            if not stat.S_ISREG(opened.st_mode):
                raise ReceiptError("receipt is not a regular non-symlink file")
            with os.fdopen(file_fd, "rb", closefd=False) as handle:
                disk_bytes = handle.read()
        finally:
            os.close(file_fd)
        try:
            parsed = json.loads(disk_bytes.decode("utf-8"))
        except (UnicodeError, json.JSONDecodeError) as exc:
            raise ReceiptError("invalid receipt JSON") from exc
        if not isinstance(parsed, dict) or parsed.get("receipt_id") != args.receipt_id:
            raise ReceiptError("receipt id mismatch")
        # Never delete committed proof. Cleanup exists only for commit-run.sh failure after this invocation's
        # exclusive create.
        committed = _head_bytes(repo, rel)
        if committed == disk_bytes:
            raise ReceiptError("refusing to remove a committed receipt")
        current = os.stat(target.name, dir_fd=parent_fd, follow_symlinks=False)
        if not stat.S_ISREG(current.st_mode) or (current.st_dev, current.st_ino) != (opened.st_dev, opened.st_ino):
            raise ReceiptError("receipt changed during cleanup")
        # unlinkat against the already-opened, no-follow parent can remove only this directory entry. It
        # never follows a swapped final symlink or a renamed ancestor to an outside target.
        os.unlink(target.name, dir_fd=parent_fd)
    finally:
        os.close(parent_fd)
    print(f"INTAKE-RECEIPT-CLEANUP: {rel}")


def parser() -> argparse.ArgumentParser:
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--repo-root", default=str(Path(__file__).resolve().parents[1]))
    for name in ("swarm", "subject", "run-root", "plan-path", "plan-sha256",
                 "source-decision-fingerprint", "module", "agent"):
        common.add_argument("--" + name, required=True)
    root = argparse.ArgumentParser()
    sub = root.add_subparsers(dest="command", required=True)
    pre = sub.add_parser("preflight", parents=[common])
    pre.add_argument("--current-decision-fingerprint", required=True)
    create_parser = sub.add_parser("create", parents=[common])
    create_parser.add_argument("--executed-against-decision-fingerprint", required=True)
    clean = sub.add_parser("cleanup")
    clean.add_argument("--repo-root", default=str(Path(__file__).resolve().parents[1]))
    clean.add_argument("--receipt-path", required=True)
    clean.add_argument("--receipt-id", required=True)
    return root


def main() -> int:
    args = parser().parse_args()
    try:
        {"preflight": preflight, "create": create, "cleanup": cleanup}[args.command](args)
        return 0
    except ReceiptError as exc:
        print(f"INTAKE-RECEIPT-FAIL: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
