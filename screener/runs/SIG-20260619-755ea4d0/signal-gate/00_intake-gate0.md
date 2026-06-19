# Signal Intake & Gate 0 — SIG-20260619-755ea4d0

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260619-755ea4d0 |
| Event ID (sha256-12) | EVT-64fc2697662937d0 |
| Input nature | human_prompt |
| Input datetime | 2026-06-19T11:28:45.815Z |
| Headline | Barry Diller and other members of management have been buying MGM shares, and Barry Diller proposed an all-cash deal at a premium to the floor price. MGM is actively working to open its IR in Osaka, Japan, in 2030 which could increase their revenue massively due to Asia being the gambling hub and Japan being a better-suited location over Macau/Shanghai. The MGM stock holds a 2X potential from its current price. |
| Source name (as given / canonical) | (none — human_prompt input; no source_name or source_url field provided) |
| Source URL | (none) |
| Requested by | banks@alloc8.xyz |

Human prompt note (verbatim): "UAE/Dubai could be another strategic expansion plan for MGM given govts efforts towards re-attracting the travellers and foreign nationals and boost demand post US-Israel-Ran war"

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** N/A — input_nature is `human_prompt`. Per swarm doctrine (SWARM.md §2), human_prompt inputs pass Gate 0 on the verbatim note with no source URL to check. The approved-source check is deferred: M0.1 must find an on-list source for each underlying factual claim (insider buying, proposed deal, Osaka IR timeline, 2X price target) or the thesis fails at M0.1.
- **Source grade:** Deferred — no source presented at intake. The human_prompt_note records a supplementary observation (UAE/Dubai expansion angle). No grade can be assigned until M0.1 retrieves corroborating on-list coverage.
- **approved_source_check:** Deferred to M0.1 (human_prompt pass)

## 3. Dedup Pre-Check

- **event_id match in ledger:** No — EVT-64fc2697662937d0 is not present in `screener/ledger/events.ndjson`.
- **URL match in ledger:** No — source_url is empty; no URL match applicable.

## 4. Gate Decision

This signal arrives as a `human_prompt` — a direct observation from a user, not a machine-ingested article. Under swarm doctrine, human_prompt inputs pass Gate 0 on the verbatim note without an approved-source URL to check. The signal is new: the computed event_id (EVT-64fc2697662937d0) has no match in the ledger, and there is no URL to match against. The signal proceeds to the next signal-gate module. M0.1 must find on-list sources for the key factual claims — insider purchases by Barry Diller and other insiders, the proposed all-cash deal and its premium, and the Osaka IR opening timeline — or the thesis fails at that step. The UAE/Dubai angle in the human_prompt_note is a supplementary observation that also needs on-list sourcing at M0.1.

## Routing

Routing: Proceed
Next module: signal-gate continues (M0.1 — 60-second source check and relevance read)
