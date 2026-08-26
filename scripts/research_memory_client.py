#!/usr/bin/env python3
"""Unprivileged client for the run-scoped supervisor memory capability."""
from __future__ import annotations

import argparse
import http.client
import json
import os
import socket
import sys
from pathlib import Path


class UnixHTTPConnection(http.client.HTTPConnection):
    def __init__(self, socket_path: str) -> None:
        super().__init__("localhost", timeout=30)
        self.socket_path = socket_path

    def connect(self) -> None:
        connection = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        connection.settimeout(self.timeout)
        connection.connect(self.socket_path)
        self.sock = connection


def request(path: str, body: dict) -> dict:
    socket_path = os.environ.get("NOSTRA_PUBLICATION_SOCKET", "")
    token = os.environ.get("NOSTRA_PUBLICATION_TOKEN", "")
    if not socket_path or not token:
        raise RuntimeError("supervisor memory capability is unavailable")
    encoded = json.dumps(body, separators=(",", ":")).encode()
    connection = UnixHTTPConnection(socket_path)
    try:
        connection.request("POST", path, body=encoded, headers={
            "Content-Type": "application/json",
            "Content-Length": str(len(encoded)),
            "X-Nostra-Publication-Token": token,
        })
        response = connection.getresponse()
        raw = response.read()
    finally:
        connection.close()
    try:
        value = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError("supervisor returned invalid JSON") from exc
    if response.status != 200 or not isinstance(value, dict) or value.get("ok") is not True:
        raise RuntimeError(str(value.get("error") if isinstance(value, dict) else "memory request failed"))
    return value


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    compile_parser = sub.add_parser("compile")
    compile_parser.add_argument("--agent-key", required=True)
    compile_parser.add_argument("--rendered-only", action="store_true")
    status_parser = sub.add_parser("status")
    status_parser.add_argument("--agent-key", required=True)
    status_parser.add_argument("--output", required=True)
    use_parser = sub.add_parser("attest")
    use_parser.add_argument("--agent-key", required=True)
    use_parser.add_argument("--output", required=True)
    use_parser.add_argument("--use", required=True)
    args = parser.parse_args()
    try:
        if args.command == "compile":
            value = request("/memory/compile", {"agentKey": args.agent_key})
            sys.stdout.write(str(value["rendered"]) if args.rendered_only else json.dumps(value, sort_keys=True) + "\n")
        elif args.command == "status":
            value = request("/memory/status", {"agentKey": args.agent_key, "outputRel": args.output})
            sys.stdout.write(json.dumps(value, sort_keys=True) + "\n")
        else:
            use = json.loads(Path(args.use).read_text(encoding="utf-8"))
            value = request("/memory/use", {
                "agentKey": args.agent_key, "outputRel": args.output, "use": use,
            })
            sys.stdout.write(json.dumps(value, sort_keys=True) + "\n")
        return 0
    except (OSError, ValueError, RuntimeError, KeyError) as exc:
        sys.stderr.write(f"research-memory-client: {exc}\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
