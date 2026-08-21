# Permanent memory Phase 4: read-only agent shadow integration

Status: reference implementation, 2026-08-21.

Phase 4 exposes one vendor-neutral read path over the Phase 3 context compiler. It recalls
prior decisions, open forecasts nested in those decisions, outcome reviews, and correction
sidecars. Its output is observational: it cannot append canonical memory, alter a rating,
change calibration, or promote feedback.

## Trust boundary

The tool request contains only a closed `memory-shadow-request/v1` document and its closed
Phase 3 query. The following inputs are launcher-owned and are never tool arguments:

- the trusted `AccessScope` loaded from `memory-shadow-access-scope/v1`;
- the expected bare projection digest;
- the policy-evaluation time;
- the projection database and exact-evidence resolver; and
- any optional local embedding implementation.

The query's permitted classifications and source tiers can only narrow `AccessScope`.
The projection is opened read-only and must match the expected digest before retrieval.
Classification, retention, entitlement, source-tier, valid-time, system-time, and exact-byte
checks run in Phase 3 before candidate text enters lexical or embedding search.

The reference launcher resolves the existing Git-backed legacy decision ledger. Protected
Phase 2 object-store material needs a separately authorized exact-verifier adapter; absence of
that adapter fails toward omission or abstention. Scope files belong outside agent-writable
project paths and should be mode `0600` under the account that launches the server.

## Domain contract

`memory-shadow-request/v1` wraps exactly one `memory-query-spec/v1`. To keep this phase to
one high-value path, its query must use:

```json
{
  "event_types": [
    "correction.recorded",
    "decision.recorded",
    "outcome.reviewed"
  ],
  "record_types": ["legacy-adapter"],
  "reporting_basis": null,
  "currency": null,
  "metric": null,
  "segment": null
}
```

Open forecast rows remain inside historical decision records at this phase. Phase 4 does not
invent a canonical forecast type or write them back.

`memory-shadow-response/v1` is closed and contains:

- fixed `mode: shadow`, `read_only: true`, `rating_effect: none`, and
  `canonical_write: none` fields;
- context-packet, packet, manifest, projection, and response digests;
- `packet_json`, the exact UTF-8 canonical packet bytes represented losslessly as a JSON
  string;
- `manifest_json`, the exact canonical manifest bytes; and
- sorted event and evidence IDs copied from the verified manifest lineage.

The response digest binds every field. Verification reparses both canonical JSON strings,
checks their byte length and hashes, invokes the Phase 3 packet verifier, and requires the
response IDs to equal the manifest lineage. JSON is used directly rather than base64 because
MCP structured content carries JSON losslessly.

## CLI

Create a trusted scope file:

```json
{
  "schema": "memory-shadow-access-scope/v1",
  "scope_id": "internal-research-shadow",
  "policy_version": "2026-08-21",
  "classifications": ["internal"],
  "source_tiers": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "embedding_classifications": [],
  "entitlement_ids": []
}
```

The launcher must own this regular file, give it exactly one hard link, and remove all
group/other permission bits (for example, `chmod 0600`). The CLI and server reject symlinks,
wrong ownership, permissive modes, linked files, and any mode, owner, inode, size, mtime, or
ctime change observed while reading it. Request and schema files do not convey authority and
use the ordinary strict JSON reader.

Compile one packet. The digest is deliberately a separate launcher argument, not a request
field:

```bash
python3 scripts/memory_shadow.py context \
  --database /trusted/projection.sqlite \
  --expected-projection-digest 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef \
  --request /tmp/shadow-request.json \
  --scope /trusted/internal-shadow-scope.json \
  --evaluated-at 2026-08-21T00:00:00Z \
  --repo-root /absolute/path/to/equity-research \
  --packet-out /tmp/context-packet.json \
  --manifest-out /tmp/context-packet-manifest.json
```

The CLI prints the closed response to stdout. Explicit output paths are create-only, so a
rerun cannot silently overwrite a prior packet or feedback artifact.

## STDIO MCP

The current MCP specification dated 2026-07-28 makes requests stateless, requires modern
per-request metadata, and defines `server/discover`. It also specifies how a dual-era STDIO
implementation supports pre-2026 clients that still use `initialize`:

- [MCP 2026-07-28 discovery](https://modelcontextprotocol.io/specification/2026-07-28/server/discover)
- [MCP 2026-07-28 STDIO and backward compatibility](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio#backward-compatibility)
- [MCP 2026-07-28 versioning compatibility matrix](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning#backward-compatibility-with-initialization-based-versions)
- [MCP 2026-07-28 tools and structured results](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)

`memory_mcp_server.py` implements only this bounded surface:

| Protocol era | Methods |
|---|---|
| `2026-07-28` | `server/discover`, `tools/list`, `tools/call` |
| `2025-11-25`, `2025-06-18` | `initialize`, `notifications/initialized`, `tools/list`, `tools/call` |

Unknown request methods return JSON-RPC `-32601`; malformed requests and params return
`-32600`/`-32602`; an unsupported modern protocol returns `-32022` with the dated versions
the server supports. STDIO uses one newline-delimited JSON-RPC message per line, logs only to
stderr, bounds each line before buffering it, and exits when stdin closes. Legacy request and
notification `params` remain optional where the protocol schema makes them optional. There are no
prompts, resources, sampling, elicitation, subscriptions, vendor model calls, credentials, or
server-side feedback writes.

The one tool is `memory.shadow_context`. It declares closed input/output schemas and read-only,
non-destructive, idempotent, closed-world annotations. Its initialization/discovery
instructions make the no-write/no-rating boundary explicit in fewer than 512 characters.

OpenAI's current Codex documentation confirms local STDIO servers, initialization
instructions, and shared host configuration across the ChatGPT desktop app, Codex CLI, and
IDE extension: [OpenAI Docs — Model Context Protocol](https://developers.openai.com/codex/mcp/).
An illustrative user-level configuration is:

```toml
[mcp_servers.permanent_memory_shadow]
command = "python3"
args = [
  "/absolute/path/scripts/memory_mcp_server.py",
  "--database", "/trusted/projection.sqlite",
  "--expected-projection-digest", "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "--scope", "/trusted/internal-shadow-scope.json",
  "--evaluated-at", "2026-08-21T00:00:00Z",
  "--repo-root", "/absolute/path/to/equity-research"
]
enabled_tools = ["memory.shadow_context"]
required = true
```

Claude Code also accepts the same local STDIO command without a different payload or server
branch: [Anthropic documentation — Connect Claude Code to tools via MCP](https://docs.anthropic.com/en/docs/claude-code/mcp).

```bash
claude mcp add permanent-memory-shadow -- \
  python3 /absolute/path/scripts/memory_mcp_server.py \
  --database /trusted/projection.sqlite \
  --expected-projection-digest 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef \
  --scope /trusted/internal-shadow-scope.json \
  --evaluated-at 2026-08-21T00:00:00Z \
  --repo-root /absolute/path/to/equity-research
```

These examples configure hosts; they do not claim that either host negotiates one hard-coded
legacy revision. The server negotiates the documented dual-era protocol and never branches on
`clientInfo` or a vendor name.

## Inert feedback

Phase 4 can seal explicit useful, missing, stale, or contradictory observations as
`memory-shadow-feedback/v1`. The artifact binds the context-packet, packet, and query hashes,
the observing client, observation time, referenced event/evidence IDs, and notes. Its
deterministic ID is UUIDv5 over the canonical content digest.

```bash
python3 scripts/memory_shadow.py feedback \
  --input /tmp/shadow-feedback-content.json \
  --output /tmp/shadow-feedback.json
```

The artifact is intentionally marked `inert-shadow-only`, `canonical_write: none`, and
`rating_effect: none`. It is not an MCP tool and no adapter ingests it. A future controlled
writer may append a separate, attributable review event that binds the exact artifact hash and
records an accept/reject/needs-work disposition; it must never mutate the shadow artifact or
treat retrieval usefulness as investment confidence.

## Verification and exit evidence

Run:

```bash
python3 scripts/test_memory_shadow_schemas.py
python3 scripts/test_memory_shadow.py
python3 scripts/test_memory_mcp_server.py
```

The tests prove:

- all request, response, scope, feedback, MCP input, and MCP output object schemas are closed;
- access scope, projection digest, and policy time cannot be smuggled into tool arguments;
- protected and post-cutoff events never enter packet IDs and are not sent to the exact
  resolver;
- the projection database remains byte-identical across in-process, CLI, and MCP reads;
- two legacy-era harness labels (`codex`, `claude`) and an independent modern JSON-RPC client
  receive identical response bytes, packet bytes, event IDs, and evidence IDs from the same
  server command;
- malformed, unsupported-version, pre-initialization, unknown-method, widened-request, and
  stale-projection cases fail closed; and
- feedback is deterministic, tamper-evident, create-only, non-canonical, and rating-neutral.

The harnesses exercise protocol behavior without calling Codex, Claude, or any model API and
require no credentials. Human review of shadow answers remains an adoption requirement; Phase 4
does not claim that byte parity alone improves investment outcomes.
