#!/usr/bin/env python3
"""No-model boundary probe for one exact tracked-Claude sandbox configuration."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import socket
import subprocess
import sys


def must_fail(label: str, operation) -> None:
    try:
        operation()
    except (OSError, subprocess.SubprocessError):
        return
    raise RuntimeError(f"sandbox unexpectedly allowed {label}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--allow-read", required=True)
    parser.add_argument("--allow-write", required=True)
    parser.add_argument("--deny-read", action="append", default=[])
    parser.add_argument("--deny-write", action="append", default=[])
    parser.add_argument("--deny-exec", required=True)
    parser.add_argument("--unix-socket", required=True)
    parser.add_argument("--denied-unix-socket", required=True)
    parser.add_argument("--loopback-port", type=int, required=True)
    parser.add_argument("--publication-helper", required=True)
    args = parser.parse_args()

    # Positive controls prove the sandbox is not merely failing every operation.
    Path(args.allow_read).read_bytes()
    writable = Path(args.allow_write)
    writable.write_text("sandbox probe\n", encoding="utf-8")
    writable.unlink()

    for candidate in args.deny_read:
        must_fail(f"read {candidate}", lambda p=candidate: Path(p).read_bytes())
    for candidate in args.deny_write:
        def write_forbidden(p=candidate):
            with Path(p).open("ab") as handle:
                handle.write(b"sandbox escape\n")
        must_fail(f"write {candidate}", write_forbidden)
    # macOS Seatbelt permits process-exec even for a denyRead path. The quota boundary is the stronger
    # fact we need: broad home/auth denial plus the scrubbed environment must make a nested CLI unable to
    # obtain the user's Max session. An executable that cannot start is also safely unauthenticated.
    try:
        nested = subprocess.run(
            [args.deny_exec, "auth", "status", "--json"], check=False, text=True,
            stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10,
        )
        status = json.loads(nested.stdout or "{}")
        if status.get("loggedIn") is True or status.get("authMethod") not in {None, "none"}:
            raise RuntimeError("sandbox exposed an authenticated nested Claude session")
    except (OSError, subprocess.SubprocessError):
        pass

    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
        client.settimeout(2)
        client.connect(args.unix_socket)

    # Exercise the same ownership/mode checks and HTTP client used by commit-run.sh. A raw connect alone
    # does not prove the helper can stat the exact socket; that gap previously let a paid run finish every
    # agent and fail only at publication.
    helper = Path(args.publication_helper)
    if helper.name != "supervisor_publication.py" or not helper.is_file():
        raise RuntimeError("publication helper is unavailable")
    sys.path.insert(0, str(helper.parent))
    from supervisor_publication import post

    publication = post({"phase": "sandbox-boundary-probe"}, timeout=2)
    if publication.get("probe") is not True:
        raise RuntimeError("publication helper did not complete the sandbox transport probe")

    def unrelated_unix() -> None:
        with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
            client.settimeout(2)
            client.connect(args.denied_unix_socket)
    must_fail("unrelated Unix socket", unrelated_unix)

    def loopback() -> None:
        with socket.create_connection(("127.0.0.1", args.loopback_port), timeout=2):
            pass
    must_fail("loopback TCP", loopback)

    def public_network() -> None:
        with socket.create_connection(("example.com", 443), timeout=2):
            pass
    must_fail("public TCP", public_network)

    print("CLAUDE_SANDBOX_BOUNDARY_OK=1")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"claude sandbox boundary probe failed: {error}", file=sys.stderr)
        raise SystemExit(1)
