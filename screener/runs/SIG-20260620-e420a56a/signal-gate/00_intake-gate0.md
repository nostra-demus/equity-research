# Signal Intake & Gate 0 — SIG-20260620-e420a56a

## 1. Intake Record

| Field | Value |
|---|---|
| Signal ID | SIG-20260620-e420a56a |
| Event ID (sha256-12) | EVT-1afb1afeddc5 |
| Input nature | news_headline |
| Input datetime | 2026-06-20T11:31:54.179Z |
| Headline | Jio Files For Mega IPO: Debt Reduction, AI Ambitions And A New Valuation Story |
| Source name (as given / canonical) | Outlook Business / Outlook Business |
| Source URL | https://www.outlookbusiness.com/markets/jio-files-for-mega-ipo-debt-reduction-ai-ambitions-and-a-new-valuation-story |
| Requested by | ceekay@muns.io |

## 2. Gate 0 — Approved-Source Check

- **On the approved list:** Yes — matched canonical name "Outlook Business" (listed under the Jun 2026 IBKR-tradable markets expansion block in SWARM.md `sources.signal_gate.allowed`)
- **Source grade:** B — Outlook Business is an Indian business news magazine and digital publication; it is a secondary aggregator / financial press outlet rather than a primary newswire or official regulatory filing. No cited Grade A source is named in the intake body text, so the M0.1 60-second check must confirm whether the underlying IPO filing event is sourced to a primary document (SEBI DRHP / LODR disclosure / exchange filing) or a first-tier wire.
- **approved_source_check:** true

## 3. Dedup Pre-Check

- **event_id match in ledger:** No — EVT-1afb1afeddc5 not found in screener/ledger/events.ndjson
- **URL match in ledger:** No — https://www.outlookbusiness.com/markets/jio-files-for-mega-ipo-debt-reduction-ai-ambitions-and-a-new-valuation-story not found in screener/ledger/events.ndjson

## 4. Gate Decision

The signal passes Gate 0. "Outlook Business" is on the approved source list and this URL has no prior match in the ledger, so it is not a resubmission. The source is graded B because Outlook Business is financial press, not a primary newswire or official filing. The next module (M0.1 relevance check) must locate the primary source for the IPO filing claim — ideally a SEBI DRHP filing, an NSE/BSE exchange intimation, or a Reuters/Bloomberg wire — and record it; if no on-list primary source is found at M0.1, the signal should fail there.

## Routing

Routing: Proceed
Next module: signal-gate continues
