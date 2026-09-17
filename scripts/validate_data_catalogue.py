#!/usr/bin/env python3
"""Fail closed when a proposed Git tree contains uncatalogued engine data.

The permanent-memory catalogue is part of the program. Autonomous data writes may
not edit it, but every tree they publish must still be fully covered by it. Reading
the Git index/tree instead of the mutable worktree keeps this check race-safe for
``commit-run.sh``.

``--paths`` answers the same question one step earlier, for a path list that is not
staged yet: the cockpit supervisor asks it before it seals an immutable publication
receipt, because a sealed list the catalogue rejects can never publish and is retried
at every startup. It reads the same index catalogue and applies the same
``uncovered_paths`` as ``--index``, so the two cannot disagree about the proposed paths.
``--index`` and ``--tree`` still judge the WHOLE index or tree, so they can additionally
fail on unrelated uncatalogued data this publication did not propose.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import subprocess
import sys
from typing import Any


CATALOGUE_PATH = "frameworks/memory/phase0/catalogue.json"
DATA_ROOTS = ("analyses/", "commodity/", "screener/", "watchlist/")
IGNORED_NAMES = frozenset({".gitkeep"})
MAX_PROPOSED_BYTES = 4 * 1024 * 1024


class CatalogueError(RuntimeError):
    pass


def git(repo: pathlib.Path, *args: str) -> bytes:
    try:
        return subprocess.check_output(
            ["git", "-C", str(repo), *args],
            stderr=subprocess.PIPE,
        )
    except (OSError, subprocess.CalledProcessError) as error:
        detail = ""
        if isinstance(error, subprocess.CalledProcessError):
            detail = error.stderr.decode("utf-8", "replace").strip()
        raise CatalogueError(detail or f"git {' '.join(args)} failed") from error


def load_catalogue(repo: pathlib.Path, source: str) -> dict[str, Any]:
    raw = git(repo, "show", f"{source}:{CATALOGUE_PATH}")
    if len(raw) > 2 * 1024 * 1024:
        raise CatalogueError("catalogue exceeds the 2 MiB safety limit")
    try:
        value = json.loads(raw)
    except (UnicodeError, json.JSONDecodeError) as error:
        raise CatalogueError(f"catalogue is not valid UTF-8 JSON: {error}") from error
    if not isinstance(value, dict) or not isinstance(value.get("stores"), list):
        raise CatalogueError("catalogue must contain a stores list")
    return value


def catalogue_patterns(catalogue: dict[str, Any]) -> list[str]:
    patterns: list[str] = []
    for store in catalogue["stores"]:
        if not isinstance(store, dict):
            raise CatalogueError("catalogue stores must be objects")
        paths = store.get("paths")
        if not isinstance(paths, list) or not paths:
            raise CatalogueError(f"catalogue store {store.get('id')!r} has no paths")
        for pattern in paths:
            if not isinstance(pattern, str) or not pattern:
                raise CatalogueError(f"catalogue store {store.get('id')!r} has an invalid path")
            if not pattern.startswith("data/") and "<" not in pattern:
                patterns.append(pattern)
    if not patterns:
        raise CatalogueError("catalogue has no mounted repository data paths")
    return patterns


def listed_paths(repo: pathlib.Path, source: str, index: bool) -> list[str]:
    if index:
        raw = git(repo, "ls-files", "--cached", "-z", "--")
    else:
        raw = git(repo, "ls-tree", "-r", "--name-only", "-z", source)
    result: list[str] = []
    for encoded in raw.split(b"\0"):
        if not encoded:
            continue
        try:
            result.append(encoded.decode("utf-8", "strict"))
        except UnicodeError as error:
            raise CatalogueError("Git tree contains a non-UTF-8 path") from error
    return result


def proposed_paths(raw: bytes) -> list[str]:
    """Decode a NUL-separated path list. NUL is the one byte a path cannot contain."""
    if len(raw) > MAX_PROPOSED_BYTES:
        raise CatalogueError("proposed path list exceeds the 4 MiB safety limit")
    result: list[str] = []
    for encoded in raw.split(b"\0"):
        if not encoded:
            continue
        try:
            relative = encoded.decode("utf-8", "strict")
        except UnicodeError as error:
            raise CatalogueError("proposed path list contains a non-UTF-8 path") from error
        # uncovered_paths() skips anything outside the data roots. That is right for --index, whose
        # index also holds code, but here it would let a path pass without ever being judged:
        # `./analyses/X/.interrupted` does not start with a data root, so it would slip the filter.
        # A proposed publication path must be exactly the normalised repository-relative form Git
        # reports; anything else is a caller bug and is refused rather than waved through.
        parts = relative.split("/")
        if (not relative.startswith(DATA_ROOTS) or "\\" in relative
                or any(part in ("", ".", "..") for part in parts)):
            raise CatalogueError(f"proposed path is not a normalised data path: {relative!r}")
        result.append(relative)
    if not result:
        # An empty list would pass vacuously. A caller with nothing to publish has a bug upstream;
        # never turn that into a PASS it can seal.
        raise CatalogueError("no proposed paths were supplied")
    return result


def uncovered_paths(paths: list[str], patterns: list[str]) -> list[str]:
    compiled = [segment_glob(pattern) for pattern in patterns]
    uncovered: list[str] = []
    for relative in paths:
        if not relative.startswith(DATA_ROOTS) or pathlib.PurePosixPath(relative).name in IGNORED_NAMES:
            continue
        if not any(pattern.fullmatch(relative) for pattern in compiled):
            uncovered.append(relative)
    return uncovered


def segment_glob(pattern: str) -> re.Pattern[str]:
    """Compile repository globs: ``*`` stays in one segment; only ``**`` crosses ``/``."""
    translated: list[str] = []
    index = 0
    while index < len(pattern):
        if pattern.startswith("**", index):
            translated.append(".*")
            index += 2
        elif pattern[index] == "*":
            translated.append("[^/]*")
            index += 1
        elif pattern[index] == "?":
            translated.append("[^/]")
            index += 1
        else:
            translated.append(re.escape(pattern[index]))
            index += 1
    return re.compile("".join(translated))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=".")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--index", action="store_true")
    source.add_argument("--tree")
    source.add_argument(
        "--paths", action="store_true",
        help="validate NUL-separated repository paths from stdin against the index catalogue",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo = pathlib.Path(args.repo).resolve()
    # --paths deliberately shares --index's catalogue source: it predicts the verdict commit-run.sh
    # reaches moments later, so it must consult the very same catalogue bytes.
    source = args.tree if args.tree else ""
    subject = "proposed publication" if args.paths else "proposed tree"
    try:
        patterns = catalogue_patterns(load_catalogue(repo, source))
        candidates = (
            proposed_paths(sys.stdin.buffer.read(MAX_PROPOSED_BYTES + 1))
            if args.paths else listed_paths(repo, source, args.index)
        )
        missing = uncovered_paths(candidates, patterns)
    except CatalogueError as error:
        print(f"DATA-CATALOGUE: FAIL — {error}", file=sys.stderr)
        return 1
    if missing:
        shown = ", ".join(missing[:20])
        suffix = f" (+{len(missing) - 20} more)" if len(missing) > 20 else ""
        print(
            f"DATA-CATALOGUE: FAIL — {subject} has uncatalogued data: {shown}{suffix}",
            file=sys.stderr,
        )
        return 1
    print("DATA-CATALOGUE: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
