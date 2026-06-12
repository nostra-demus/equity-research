---
id: screener
label: Screener
color: "#3fc6d2"
unit: signal
order: 2
layout: flow
command_ns: screener
run_root_template: screener/runs/{SIG_ID}
placeholder: SIG_ID
runs_root: screener/runs
ledger_root: screener/ledger
board_index: screener/board/index.json
inbox_root: screener/inbox
schemas_root: frameworks/screener
routing:
  verdict_field: "Routing"
  terminal:
    - LOG
    - PARK
    - suppress
    - watchlist_no_source
    - watchlist_no_world_change
    - return_to_m0_2
    - watchlist_no_edge
  continue:
    - PROMOTE
    - Proceed
    - provisional
    - full_machine
sources:
  signal_gate:
    reject_if_unapproved: true
    allowed:
      - Reuters
      - Associated Press
      - Bloomberg
      - AFP
      - Financial Times
      - The Wall Street Journal
      - CNBC
      - MarketWatch
      - The Economic Times
      - Business Standard
      - LiveMint
      - Moneycontrol
      - S&P Global Market Intelligence
      - SEC EDGAR
      - BSE / NSE Exchange Filing
      - Company Investor Relations Page
      - Baltic Exchange
      - LME
      - CME
      - ICE
      - IBKR
      - CapIQ
      - Tasnim News Agency
      - Official Government Statement
      - IEA
      - OPEC Secretariat
      - US EIA
      - Spark Commodities
      - Platts S&P Global
      - Argus Media
      - LSEG
  thesis_structure:
    reject_if_unapproved: false
    note: "Prefer the signal_gate list plus primary data (filings, exchange data, official statistics). An off-list source must be dated and labelled, and never outranks an on-list source on the same fact."
  edge_definition:
    missing_reason_required: true
    preferred:
      - CapIQ
      - Bloomberg
      - Exchange data (NSE / BSE / NYSE / NASDAQ / CBOE)
    allowed_market_data: "Reputable market-data sites are allowed for consensus, estimates, options, and positioning data — every such input is dated and labelled, and every unfilled field carries a missing_reason. Gate-0 strictness does NOT apply here."
  candidate_surfacing:
    exchanges_and_listings:
      - NSE
      - BSE
      - NYSE
      - NASDAQ
      - LSE
      - Other recognised national exchanges
---

# SCREENER SWARM — Idea-Generation Doctrine

This is the swarm-level rulebook for the screener: the idea-generation pipeline that turns a raw market signal (a headline, a filing, a price move, a human observation) into either a locked, machine-routable thesis record with named candidate companies — or an honest rejection. It implements the two-phase framework: **Phase 0.1** (the signal gauntlet: is this a new, high-impact event that should change an investment decision?) and **Phase 1** (the thesis assembly line M0.1–M0.6: event statement → world change → beneficiary map → time horizon → falsification → edge definition → routing).

The root `CLAUDE.md` constitution applies in full. Each module's `MODULE_RULES.md` adds module rules. If this file conflicts with a module file, the stricter, more conservative rule wins (§23).

## 1. The unit of work: a signal

- A signal is one event-shaped input. Its identity is `SIG-YYYYMMDD-<8char_hash>` (hash of normalized headline/URL + date). The run folder is `screener/runs/<SIG_ID>/`.
- Every signal starts as `screener/runs/<SIG_ID>/intake.json` (schema: `frameworks/screener/intake.schema.json`) with: `input_nature` (one of: human_prompt, news_headline, price_alert, regulatory_filing, earnings_release, earnings_call_transcript, company_press_release, exchange_announcement, commodity_price_move, shipping_rate_move, options_flow_alert, chart_pattern, geopolitical_event, macro_data_release), `source_name`, `source_url` (or `human_prompt_note`), `headline`, `body_text` (optional), `input_datetime`, `requested_by`.
- A signal is NOT a ticker. Tickers are banned until the `candidate-surfacing` module (see §5).

## 2. Gate 0 — the origin firewall

- The intake source must be on the `sources.signal_gate.allowed` list above. On-list newswires/officials are grade A; a secondary aggregator citing a grade-A source is grade B. Anything else fails Gate 0: the signal is recorded with status `watchlist_no_source` and the pipeline stops. No exceptions, no "but it looks credible".
- `human_prompt` inputs pass Gate 0 with `human_prompt_note` as the verbatim observation (there is no URL to check); the 60-second source check in M0.1 must then find an on-list source for the underlying fact, or the thesis fails at M0.1.
- Dedup before work: if the URL hash or normalized headline matches a ledger event from the last 72 hours with the same issuer(s), the intake agent applies the duplicate logic (Phase 0.1 Steps 4–7) at reduced cost — a hard duplicate is recorded (`action: suppress`) and the pipeline stops.

## 3. Phase 0.1 — the ten-step gauntlet (module `signal-gate`)

The deterministic logic is specified in the module's agents and `MODULE_RULES.md`: relevance → event types → entities/linkage → similarity vs the event ledger (48–72h window, same-issuer first) → fact delta → confirmation upgrade → pairwise classification → novelty → canonical action → materiality 0–100.

**Promotion bands (the Phase 0.1 → Phase 1 gate):**
- `PROMOTE` — materiality ≥ 70: the signal proceeds to `thesis-structure`.
- `PARK` — materiality 40–69: recorded in the ledger and shown on the board as Parked; a human can re-launch it with an explicit override.
- `LOG` — materiality < 40, or canonical action `suppress`/duplicate: recorded in the ledger only.

These bands are doctrine, not engine code. Changing them is a one-line edit here and in `signal-gate/MODULE_RULES.md`.

## 4. Phase 1 — the thesis record (modules `thesis-structure`, `edge-definition`)

- The thesis record (`thesis_record.json`, schema: `frameworks/screener/thesis_record.schema.json`) is the single structured artifact. Its `meta.status` is one of: `active`, `watchlist_no_source`, `watchlist_no_world_change`, `watchlist_no_edge`, `provisional`, `full_machine`.
- **Locked booleans are locked.** `already_occurred=true`, `hypothetical_flag=false`, `ticker_check=true`, `expiry_condition_is_observable=true`, `expiry_condition_is_opinion=false`, `uncomfortable_check=true`, `causal_language_check=true`, `approved_source_check=true`. An agent that cannot truthfully set a locked boolean does not bend the field — it fails the gate and routes to the corresponding watchlist status.
- **The kill switch locks.** Once `edge-definition` completes and the record is locked (`locked: true`, `version: 1`), the falsification criteria (M0.5) cannot be moved. Amendments append to `version_history` and increment `version`; they never overwrite.
- **Edge routing bands (M0.6.6):** final edge score < 60 → `watchlist_no_edge`; 60–80 → `provisional`; > 80 → `full_machine`. The blended formula must be printed in the synthesis (visible math, §10-style).

## 5. The no-ticker rule, and where tickers begin

- M0.3 (beneficiary map) names industries and business models (with GICS), never companies or tickers. This is machine-checked (`ticker_check` object in the record: `performed`, `violations`, `repair_action`).
- `candidate-surfacing` is the FIRST module allowed to name companies. It runs only when routing is `provisional` or `full_machine` — watchlist records keep their industry map visible on the board without spending on ticker mapping.

## 6. Memory, ledger, and board state (canonical machine records)

- `screener/ledger/events.ndjson` — one line per processed signal (append-only; use `scripts/append-ndjson.sh`). This is the gauntlet's similarity/dedup memory.
- `screener/ledger/theses/<thesis_id>.json` — the locked thesis record copy (index for the board and for handoff).
- `screener/ledger/candidates/<thesis_id>.json` — the candidate shortlist for a routed thesis.
- `screener/ledger/handoffs.ndjson` — append-only handoff log; idempotency key `<thesis_id>::<ticker>`.
- `screener/board/index.json` (schema: `frameworks/screener/board_index.schema.json`) — the single machine-readable board state (inbox summary, signals by stage, theses by status, candidates, handoffs). Every synthesis/command that changes state updates it via `scripts/update_board_index.py`. The UI reads this file — it never scrapes agent prose.
- Every canonical record carries `status`, `status_reason`, `routing`, `routing_reason`, `next_action`, and a compact source evidence packet (`[{url, source_name, source_grade, retrieved_at, claim_supported}]`).

## 7. Handoff — the bridge to the research swarm

- `full_machine` (and, at human discretion, `provisional`) theses surface candidates; a human shortlists a ticker and triggers `/screener:handoff <thesis_id> <TICKER>`.
- Handoff writes `data/<TICKER>/screener_thesis_<thesis_id>.md` — a self-contained memo of the locked thesis (event, world changes, beneficiary tier for THIS company's industry, horizon, falsifiers, edge view, convergence trigger), clearly labelled: *"Engine-generated screener thesis — treat as an internal user-note-tier source (CLAUDE.md §4 tier 9), not a filing."*
- Handoff is idempotent on `<thesis_id>::<ticker>`: a repeat call returns the existing seeded path and writes nothing new.
- Handoff does NOT launch the research run. The human launches `/research:full <TICKER>` (cockpit or CLI) with its own cost confirmation.

## 8. Writing and evidence standard

- §5 citation format everywhere: `[Source, Period/Date, Section]`. Web inputs dated and labelled. No vague citations.
- Banned in screener outputs (machine-checkable per module rules): "could benefit", "may be impacted", bare "significant"/"material" without a quantified basis, "the market hasn't realized" without coverage-gap evidence, causal verbs inside the M0.1 event statement.
- Numbers over adjectives. A magnitude is a number with a baseline, not a direction.

## 9. Adaptation note (NLP stack)

The source framework specifies an ML ingestion stack (FAISS embeddings, DeBERTa classification, FinBERT sentiment, FinGPT extraction, LightGBM ranking). This swarm encodes the SAME deterministic logic — thresholds, bands, matrices, penalties, overrides — as agent rubrics over an append-only ledger memory. The ML stack remains the documented productionization path for a future live-feed ingestion layer; nothing in the scoring logic changes if that layer is added in front.
