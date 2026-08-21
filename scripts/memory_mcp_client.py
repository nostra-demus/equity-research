#!/usr/bin/env python3
"""Minimal vendor-neutral JSON-RPC client harness for the Phase 4 STDIO MCP server."""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from typing import Any, Mapping, Sequence

from canonical_json import canonical_json
from memory_mcp_server import LEGACY_PROTOCOLS, MODERN_PROTOCOL, TOOL_NAME
from memory_shadow import ShadowError, load_closed_json, parse_closed_json, verify_shadow_response


class MCPClientError(RuntimeError):
    """The child server or JSON-RPC exchange violated the tested contract."""


def _meta(client_name: str) -> dict[str, Any]:
    return {
        "io.modelcontextprotocol/protocolVersion": MODERN_PROTOCOL,
        "io.modelcontextprotocol/clientInfo": {"name": client_name, "version": "1.0.0"},
        "io.modelcontextprotocol/clientCapabilities": {},
    }


def _request(request_id: int, method: str, params: Mapping[str, Any]) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": request_id, "method": method, "params": dict(params)}


def _response_by_id(lines: Sequence[Any]) -> dict[int, Mapping[str, Any]]:
    result: dict[int, Mapping[str, Any]] = {}
    for row in lines:
        if not isinstance(row, Mapping) or row.get("jsonrpc") != "2.0":
            raise MCPClientError("server emitted a non-JSON-RPC response")
        response_id = row.get("id")
        if not isinstance(response_id, int) or isinstance(response_id, bool) or response_id in result:
            raise MCPClientError("server response ID is invalid or duplicated")
        result[response_id] = row
    return result


def invoke_stdio_tool(
    command: Sequence[str],
    *,
    client_name: str,
    protocol_version: str,
    arguments: Mapping[str, Any],
    timeout: float = 30.0,
) -> dict[str, Any]:
    """Launch one server process, negotiate one era, and call the shadow tool once."""
    if not command or not all(isinstance(item, str) and item for item in command):
        raise MCPClientError("server command must be a nonempty string sequence")
    if not isinstance(client_name, str) or not client_name:
        raise MCPClientError("client_name must be nonempty")
    messages: list[dict[str, Any]] = []
    if protocol_version == MODERN_PROTOCOL:
        metadata = _meta(client_name)
        messages.extend(
            [
                _request(1, "server/discover", {"_meta": metadata}),
                _request(2, "tools/list", {"_meta": metadata}),
                _request(
                    3,
                    "tools/call",
                    {"name": TOOL_NAME, "arguments": dict(arguments), "_meta": metadata},
                ),
            ]
        )
    elif protocol_version in LEGACY_PROTOCOLS:
        messages.extend(
            [
                _request(
                    1,
                    "initialize",
                    {
                        "protocolVersion": protocol_version,
                        "capabilities": {},
                        "clientInfo": {"name": client_name, "version": "1.0.0"},
                    },
                ),
                {"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}},
                _request(2, "tools/list", {}),
                _request(3, "tools/call", {"name": TOOL_NAME, "arguments": dict(arguments)}),
            ]
        )
    else:
        raise MCPClientError(f"unsupported harness protocol version: {protocol_version}")
    wire = "".join(canonical_json(message) + "\n" for message in messages)
    try:
        completed = subprocess.run(
            list(command),
            input=wire,
            text=True,
            capture_output=True,
            timeout=timeout,
            check=False,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        raise MCPClientError("could not run STDIO MCP server") from exc
    if completed.returncode != 0:
        raise MCPClientError(
            f"STDIO MCP server exited {completed.returncode}: {completed.stderr.strip()}"
        )
    try:
        rows = [parse_closed_json(line) for line in completed.stdout.splitlines() if line]
    except ShadowError as exc:
        raise MCPClientError("STDIO MCP server emitted invalid JSON") from exc
    responses = _response_by_id(rows)
    if set(responses) != {1, 2, 3}:
        raise MCPClientError("STDIO MCP server did not answer every request exactly once")
    if "error" in responses[1]:
        raise MCPClientError(f"MCP negotiation failed: {responses[1]['error']}")
    tool_list = responses[2].get("result")
    if not isinstance(tool_list, Mapping) or [tool.get("name") for tool in tool_list.get("tools", [])] != [TOOL_NAME]:
        raise MCPClientError("MCP tool discovery did not return the one shadow tool")
    call = responses[3]
    if "error" in call:
        raise MCPClientError(f"MCP tool call failed at protocol level: {call['error']}")
    tool_result = call.get("result")
    if not isinstance(tool_result, Mapping) or tool_result.get("isError") is not False:
        raise MCPClientError(f"MCP shadow tool refused the request: {tool_result}")
    response = tool_result.get("structuredContent")
    if not isinstance(response, dict):
        raise MCPClientError("MCP shadow tool omitted structuredContent")
    try:
        verify_shadow_response(response)
    except ShadowError as exc:
        raise MCPClientError(f"MCP shadow response failed verification: {exc}") from exc
    text_content = tool_result.get("content")
    if (
        not isinstance(text_content, list)
        or len(text_content) != 1
        or text_content[0] != {"type": "text", "text": canonical_json(response)}
    ):
        raise MCPClientError("MCP text fallback is not the canonical structured response")
    return response


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Invoke the read-only shadow MCP tool over STDIO")
    parser.add_argument("--client-name", default="generic-jsonrpc-harness")
    parser.add_argument("--protocol-version", choices=(MODERN_PROTOCOL, *LEGACY_PROTOCOLS), required=True)
    parser.add_argument("--request", required=True)
    parser.add_argument("server_command", nargs=argparse.REMAINDER)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    command = list(args.server_command)
    if command[:1] == ["--"]:
        command = command[1:]
    try:
        request = load_closed_json(Path(args.request))
        if not isinstance(request, Mapping):
            raise MCPClientError("request document must be an object")
        response = invoke_stdio_tool(
            command,
            client_name=args.client_name,
            protocol_version=args.protocol_version,
            arguments=request,
        )
    except (MCPClientError, ShadowError) as exc:
        sys.stderr.write(f"memory MCP client error: {exc}\n")
        return 1
    sys.stdout.write(canonical_json(response) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
