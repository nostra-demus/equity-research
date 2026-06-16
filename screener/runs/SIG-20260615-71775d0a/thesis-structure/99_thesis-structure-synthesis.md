# Thesis Structure Synthesis — SIG-20260615-71775d0a

## Abstract

On June 15, 2026, Honeywell International's board formally approved the spin-off of Honeywell Aerospace into a separately listed company on Nasdaq (ticker HONA), with the actual share distribution scheduled for June 29, 2026. The strongest confirmed world change is Honeywell Aerospace's registration as a stand-alone public company with $17.4B in net sales and $4.3B in pro forma adjusted earnings (profit before interest and tax) for FY2025 — a business that had no separate public financials the day before. The primary industry that benefits immediately is investment banking and financial advisory, which earns non-reversible fees from managing the separation; three secondary industries (pure-play aerospace manufacturers, securities brokers, and diversified industrial conglomerates) carry forward to edge-definition. The thesis window runs roughly 10 weeks from the June 29 distribution date; the kill switch fires if the combined market value of HONA and the renamed Honeywell Technologies (HON) falls and stays more than 10% below the pre-spin combined market value of ~$138.85B for two consecutive weeks. All five gates passed — routing is Proceed to edge-definition.

## 1. Gate Ledger

| Gate | Result | Evidence |
|---|---|---|
| M0.1 causal language | PASS | Checked: "formally approved" (factual verb), "will receive" (distribution mechanic), "scheduled for" (date reference), "will be renamed" (corporate action outcome), "is scheduled to occur" (timing). No instances of because, due to, driven by, as a result, leading to, signals, suggests, implies, panic, crisis, soaring, plunging, aggressively, inevitably. |
| M0.1 60-second source | PASS | Fetched https://www.prnewswire.com/news-releases/honeywell-board-of-directors-approves-spin-off-of-honeywell-aerospace-302799898.html at 2026-06-15T18:10:00Z. All seven headline facts (board approval, 1-for-2 ratio, June 15 record date, June 29 distribution date, HON rename, HONA ticker, 1-for-2 reverse split) confirmed literally in the source. Source is on the approved list (PR Newswire). |
| M0.2 reality lock (2–6 quantified) | pass | 4 changes confirmed: WC-001 (Form 10 effective, $17.4B net sales / $4.3B EBIT disclosed), WC-002 (HONAV when-issued trading commenced, new listed instrument), WC-003 (HON fell ~4.6% to $205.88 on June 15 ex-date), WC-004 (Evanko resignation, board shrank 13 → 12). |
| M0.3 population + carry-forward | proceed | 1 primary / 3 secondary / 2 parked. 4 parties carry forward. Zero-carry-forward action: proceed. |
| M0.3 ticker check | PASS | 0 violations. Scan run for $-prefixed cashtags, exchange-prefixed symbols, and company names. None found in narrative or table cells of the M0.3 file. Repair action: none required. |
| M0.4 observable expiry | PASS | expiry_condition_is_observable locked true; expiry_condition_is_opinion locked false. Expiry = HONA regular-way trading opens on Nasdaq June 29, 2026; full resolution within 10 weeks of that date. Checkable tomorrow on Nasdaq market data or SEC EDGAR 8-K. |
| M0.5 uncomfortable check | PASS | uncomfortable_check locked true. Kill switch attacks the load-bearing mechanism (conglomerate-discount unlocking) directly — fires if combined HONA + HON market cap stays below $124,965M for two consecutive weeks. Every beneficiary party except DIR-001 (fees already earned) collapses if this fires. |

## 2. The Thesis Core (assembled)

- **Event:** On June 15, 2026, Honeywell International's board of directors formally approved the spin-off of Honeywell Aerospace from the parent company, with distribution of one HONA share per two HON shares scheduled for June 29, 2026, and the remaining business to trade as Honeywell Technologies (HON) after a simultaneous 1-for-2 reverse stock split.

- **World changes:**
  - WC-001 (strongest): Honeywell Aerospace Form 10 declared effective by the SEC on June 11, 2026 — first time the business has carried separate public financials ($17.4B net sales and $4.3B pro forma adjusted EBIT for FY2025 vs. no public stand-alone financials before).
  - WC-002: HONAV when-issued trading commenced on Nasdaq on June 15, 2026, creating a new listed instrument where none existed.
  - WC-003: HON fell ~4.6% to $205.88 intraday on June 15, 2026 (prior close ~$215.72), as the stock began trading ex-distribution.
  - WC-004: Jillian Evanko resigned immediately from the HON board on June 13, 2026, reducing HON's board from 13 to 12 directors.

- **Blast radius:** Primary — Investment Banking & Financial Advisory (GICS 40201040, composite 90); Secondary — Aerospace & Defense Equipment Manufacturers pure-play listed (GICS 20101010, composite 60), Securities Brokers & Prime Brokers (GICS 40203010, composite 60), Diversified Multi-Segment Industrial Conglomerates (GICS 20106010, composite 60); Parked — Passive Index Management & ETF Sponsors (composite 50), Derivatives Dealers & Options Market Makers (composite 50).

- **Clock:** medium_weeks_3months; distribution date June 29, 2026 starts the clock; full resolution within 10 weeks (by ~September 7, 2026).

- **Kill switch:** If the combined market cap of HONA and HON (post-split shares times their prices) falls and stays more than 10% below the pre-spin combined market cap of ~$138.85B — that is, below ~$124,965M — for two consecutive weeks after regular-way trading begins on June 29, 2026, the thesis is falsified. (Metric 1: HONA closing price × ~317M shares; Metric 2: HON closing price × ~317M post-split shares; threshold: $124,965M combined; deadline: 2026-09-07.)

## 3. Routing Decision

All five gates passed in pipeline order with no terminal condition triggered. M0.1 produced a clean sterile statement verified against a Grade-A source within the session. M0.2 confirmed four already-occurred world changes with quantitative magnitudes and baselines, clearing the two-change minimum. M0.3 carried forward four parties (one primary, three secondary) against a zero-carry-forward threshold, with no ticker violations. M0.4 produced an observable, non-opinion expiry condition tied to a verifiable market event (Nasdaq regular-way trading open on June 29). M0.5 set a kill switch with two monitorable metrics, a numeric threshold ($124,965M), a deadline (2026-09-07), and an uncomfortable-check rationale that ties directly to the mechanism the entire thesis depends on. Routing is Proceed.

## Machine Output

Wrote: `screener/runs/SIG-20260615-71775d0a/thesis_record.json` (draft, locked: false, validates against frameworks/screener/thesis_record.schema.json)

Routing is Proceed — ledger status line, theses copy, and board index update are left to edge-definition.

## Routing

Routing: Proceed
Next module: edge-definition
