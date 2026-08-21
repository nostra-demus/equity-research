#!/usr/bin/env python3
"""Phase 4 dual-era MCP negotiation, least-authority, and client parity tests."""
from __future__ import annotations

import copy
import hashlib
import io
import subprocess
import sys
from pathlib import Path

from canonical_json import canonical_json, canonical_json_bytes
from memory_mcp_client import invoke_stdio_tool
from memory_mcp_server import (
    INSTRUCTIONS,
    LEGACY_PROTOCOLS,
    MAX_REQUEST_BYTES,
    MODERN_PROTOCOL,
    SUPPORTED_PROTOCOLS,
    TOOL_NAME,
    ShadowMCPServer,
    ShadowRuntime,
    _read_bounded_request,
)
from memory_shadow import (
    access_scope_from_dict,
    build_legacy_evidence_verifier,
    parse_closed_json,
    verify_shadow_response,
)
from test_memory_shadow import FUTURE_ID, PROTECTED_ID, shadow_fixture


ROOT = Path(__file__).resolve().parents[1]
SERVER = ROOT / "scripts" / "memory_mcp_server.py"
CLIENT = ROOT / "scripts" / "memory_mcp_client.py"


def _modern_meta(version: str = MODERN_PROTOCOL) -> dict:
    return {
        "io.modelcontextprotocol/protocolVersion": version,
        "io.modelcontextprotocol/clientInfo": {"name": "generic-test", "version": "1.0.0"},
        "io.modelcontextprotocol/clientCapabilities": {},
    }


def _rpc(request_id: int, method: str, params: dict) -> dict:
    return {"jsonrpc": "2.0", "id": request_id, "method": method, "params": params}


def main() -> None:
    assert MODERN_PROTOCOL == "2026-07-28"
    assert LEGACY_PROTOCOLS == ("2025-11-25", "2025-06-18")
    assert SUPPORTED_PROTOCOLS == ("2026-07-28", "2025-11-25", "2025-06-18")
    assert len(INSTRUCTIONS[:512]) == len(INSTRUCTIONS)
    assert "Read-only shadow memory" in INSTRUCTIONS
    assert "never change ratings or write canonical memory" in INSTRUCTIONS

    # Framing is bounded before buffering, and an oversized line is drained so
    # the next independent JSON-RPC message can still be read correctly.
    framing = io.BytesIO(b"x" * (MAX_REQUEST_BYTES + 1) + b"\n{\"jsonrpc\":\"2.0\"}\n")
    assert _read_bounded_request(framing) == (b"", True)
    assert _read_bounded_request(framing) == (b'{"jsonrpc":"2.0"}\n', False)
    assert _read_bounded_request(framing) is None
    for hostile_json in (
        b'{"jsonrpc":"2.0","id":9007199254740992,"method":"tools/list"}',
        b'{"jsonrpc":"2.0","id":"\\ud800","method":"tools/list"}',
        b'{"jsonrpc":"2.0","id":1e400,"method":"tools/list"}',
    ):
        try:
            parse_closed_json(hostile_json)
        except Exception as exc:
            assert exc.__class__.__name__ == "ShadowError"
        else:
            raise AssertionError("non-canonical JSON-RPC scalar was accepted")

    with shadow_fixture() as fixture:
        scope = access_scope_from_dict(fixture["scope"])
        verifier = build_legacy_evidence_verifier(
            fixture["repo"],
            access_scope=scope,
            evaluated_at="2026-08-21T00:00:00Z",
        )
        runtime = ShadowRuntime(
            database_path=fixture["database"],
            expected_projection_digest=fixture["projection_digest"],
            access_scope=scope,
            evidence_verifier=verifier,
            evaluated_at="2026-08-21T00:00:00Z",
        )

        # Modern 2026-07-28 discovery is stateless, advertises instructions, and
        # rejects unratified/unknown protocol versions with the normative code.
        modern_server = ShadowMCPServer(runtime)
        invalid_direct_id = modern_server.handle(
            {"jsonrpc": "2.0", "id": 9_007_199_254_740_992, "method": "tools/list"}
        )
        assert invalid_direct_id == {
            "jsonrpc": "2.0",
            "id": None,
            "error": {"code": -32600, "message": "Invalid Request"},
        }
        invalid_direct_version = modern_server.handle(
            _rpc(99, "server/discover", {"_meta": _modern_meta(float("inf"))})
        )
        assert invalid_direct_version["error"]["code"] == -32602
        invalid_surrogate_version = modern_server.handle(
            _rpc(100, "server/discover", {"_meta": _modern_meta("\ud800")})
        )
        assert invalid_surrogate_version["error"]["code"] == -32602
        discovery = modern_server.handle(
            _rpc(1, "server/discover", {"_meta": _modern_meta()})
        )
        assert discovery["result"]["supportedVersions"] == list(SUPPORTED_PROTOCOLS)
        assert discovery["result"]["instructions"] == INSTRUCTIONS
        assert discovery["result"]["resultType"] == "complete"
        unsupported = modern_server.handle(
            _rpc(2, "server/discover", {"_meta": _modern_meta("2099-01-01")})
        )
        assert unsupported["error"]["code"] == -32022
        assert unsupported["error"]["data"]["supported"] == list(SUPPORTED_PROTOCOLS)
        unknown = modern_server.handle(
            _rpc(3, "resources/list", {"_meta": _modern_meta()})
        )
        assert unknown["error"]["code"] == -32601

        listing = modern_server.handle(_rpc(4, "tools/list", {"_meta": _modern_meta()}))
        tools = listing["result"]["tools"]
        assert [tool["name"] for tool in tools] == [TOOL_NAME]
        tool = tools[0]
        assert tool["annotations"] == {
            "readOnlyHint": True,
            "destructiveHint": False,
            "idempotentHint": True,
            "openWorldHint": False,
        }
        assert tool["inputSchema"]["additionalProperties"] is False
        assert tool["inputSchema"]["properties"]["query"]["additionalProperties"] is False
        assert tool["outputSchema"]["additionalProperties"] is False
        schema_text = canonical_json(tool["inputSchema"])
        assert "expected_projection_digest" not in schema_text
        assert "scope_id" not in schema_text
        assert "policy_version" not in schema_text
        assert "evaluated_at" not in schema_text

        modern_call = modern_server.handle(
            _rpc(
                5,
                "tools/call",
                {
                    "name": TOOL_NAME,
                    "arguments": fixture["request"],
                    "_meta": _modern_meta(),
                },
            )
        )
        modern_response = modern_call["result"]["structuredContent"]
        verify_shadow_response(modern_response)
        assert modern_call["result"]["resultType"] == "complete"
        assert modern_call["result"]["isError"] is False
        assert modern_call["result"]["content"] == [
            {"type": "text", "text": canonical_json(modern_response)}
        ]

        widened = copy.deepcopy(fixture["request"])
        widened["expected_projection_digest"] = fixture["projection_digest"]
        refused = modern_server.handle(
            _rpc(
                6,
                "tools/call",
                {"name": TOOL_NAME, "arguments": widened, "_meta": _modern_meta()},
            )
        )
        assert refused["result"]["isError"] is True
        assert "structuredContent" not in refused["result"]

        # Legacy clients cannot call tools until initialize + initialized. Both
        # ratified legacy versions negotiate without a vendor-specific branch.
        legacy_server = ShadowMCPServer(runtime)
        before_init = legacy_server.handle(_rpc(1, "tools/list", {}))
        assert before_init["error"]["code"] == -32002
        initialized = legacy_server.handle(
            _rpc(
                2,
                "initialize",
                {
                    "protocolVersion": "2025-11-25",
                    "capabilities": {},
                    "clientInfo": {"name": "legacy-test", "version": "1.0.0"},
                },
            )
        )
        assert initialized["result"]["protocolVersion"] == "2025-11-25"
        assert initialized["result"]["instructions"] == INSTRUCTIONS
        notification = {
            "jsonrpc": "2.0",
            "method": "notifications/initialized",
        }
        assert legacy_server.handle(notification) is None
        malformed_notification = {
            "jsonrpc": "2.0",
            "method": "notifications/initialized",
            "params": [],
        }
        fresh_legacy_server = ShadowMCPServer(runtime)
        fresh_legacy_server.handle(
            _rpc(
                20,
                "initialize",
                {
                    "protocolVersion": "2025-11-25",
                    "capabilities": {},
                    "clientInfo": {"name": "legacy-test", "version": "1.0.0"},
                },
            )
        )
        assert fresh_legacy_server.handle(malformed_notification) is None
        assert fresh_legacy_server.handle(_rpc(21, "tools/list", {}))["error"]["code"] == -32002
        legacy_listing = legacy_server.handle(
            {"jsonrpc": "2.0", "id": 3, "method": "tools/list"}
        )
        assert [item["name"] for item in legacy_listing["result"]["tools"]] == [TOOL_NAME]
        assert "resultType" not in legacy_listing["result"]

        # Three independent client harnesses launch the exact same command. The
        # server never sees or branches on the vendor label.
        server_command = [
            sys.executable,
            str(SERVER),
            "--database",
            str(fixture["database"]),
            "--expected-projection-digest",
            fixture["projection_digest"],
            "--scope",
            str(fixture["scope_path"]),
            "--evaluated-at",
            "2026-08-21T00:00:00Z",
            "--repo-root",
            str(fixture["repo"]),
        ]
        database_before = hashlib.sha256(fixture["database"].read_bytes()).hexdigest()
        codex_response = invoke_stdio_tool(
            server_command,
            client_name="codex-shadow-harness",
            protocol_version="2025-11-25",
            arguments=fixture["request"],
        )
        claude_response = invoke_stdio_tool(
            server_command,
            client_name="claude-shadow-harness",
            protocol_version="2025-06-18",
            arguments=fixture["request"],
        )
        generic_response = invoke_stdio_tool(
            server_command,
            client_name="generic-jsonrpc-harness",
            protocol_version=MODERN_PROTOCOL,
            arguments=fixture["request"],
        )
        assert canonical_json_bytes(codex_response) == canonical_json_bytes(claude_response)
        assert canonical_json_bytes(codex_response) == canonical_json_bytes(generic_response)
        assert codex_response["packet_json"].encode("utf-8") == claude_response["packet_json"].encode("utf-8")
        assert codex_response["packet_json"].encode("utf-8") == generic_response["packet_json"].encode("utf-8")
        assert codex_response["event_ids"] == claude_response["event_ids"] == generic_response["event_ids"]
        assert codex_response["evidence_ids"] == claude_response["evidence_ids"] == generic_response["evidence_ids"]
        assert PROTECTED_ID not in generic_response["event_ids"]
        assert FUTURE_ID not in generic_response["event_ids"]
        assert database_before == hashlib.sha256(fixture["database"].read_bytes()).hexdigest()

        # Exercise the standalone third JSON-RPC client executable, not only its
        # imported helper, against the same server command.
        client_run = subprocess.run(
            [
                sys.executable,
                str(CLIENT),
                "--client-name",
                "standalone-generic-jsonrpc-client",
                "--protocol-version",
                MODERN_PROTOCOL,
                "--request",
                str(fixture["request_path"]),
                "--",
                *server_command,
            ],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
            timeout=30,
        )
        assert client_run.returncode == 0, client_run.stderr
        standalone_response = parse_closed_json(client_run.stdout)
        assert canonical_json_bytes(standalone_response) == canonical_json_bytes(generic_response)
        assert database_before == hashlib.sha256(fixture["database"].read_bytes()).hexdigest()

    print("memory MCP server tests: PASS")


if __name__ == "__main__":
    main()
