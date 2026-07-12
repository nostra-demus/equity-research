# Thesis Structure Synthesis — SIG-20260711-b55e8917

## Abstract

In mid-2026, Carvana completed the acquisition of seven Stellantis (CDJR) franchised dealerships for $171 million and applied its online-only, no-commission sales model to the acquired sites. The strongest confirmed world change is the Casa Grande, Arizona store reaching 700+ new vehicles sold in May 2026 — more than 14 times the prior operator's monthly average of 30–50 units — making it the highest-volume Stellantis store in the United States. The primary blast radius falls on online/direct-to-consumer used-car retail (structural winner), traditional franchise dealership networks (direct volume displacement), and automotive OEMs (new high-throughput distribution channel confirmed). The thesis window is up to three months, expiring when Carvana's Q2 2026 earnings release discloses new-vehicle franchise volumes. The kill switch: if the acquired stores collectively average fewer than 350 new vehicles per store per month by 2026-10-31, the volume-superiority claim is broken. All five gates passed — routing is Proceed.

## 1. Gate Ledger

| Gate | Result | Evidence |
|---|---|---|
| M0.1 causal language | PASS | "No instances of: because, due to, driven by, as a result, leading to, signals, suggests, implies, panic, crisis, soaring, plunging, aggressively, inevitably, or synonyms doing causal work." |
| M0.1 60-second source | PASS | primary_read_quality=full; paywall_detected=false; confirmation_status=confirmed; extraction_confidence=70; gate_pass=True (scripts/screener_confirmation_score.py output copied verbatim) |
| M0.2 reality lock (2–6 quantified) | pass | 4 changes: WC-001 ($171M / 7 dealerships), WC-002 (700+ units/month vs 30–50 baseline, 14x), WC-003 (+40% YoY used-car retail units Q1 2026), WC-004 (+52% YoY revenue Q1 2026) |
| M0.3 population + carry-forward | proceed | 5 carried forward (3 primary, 2 secondary); 3 parked |
| M0.3 ticker check | PASS | violations: none; no cashtags, exchange-prefix symbols, or company names used as investment picks found |
| M0.4 observable expiry | PASS | expiry_condition_is_observable=true (locked); expiry_condition_is_opinion=false (locked); expiry event = Carvana Q2 2026 8-K on SEC EDGAR |
| M0.5 uncomfortable check | PASS | uncomfortable_check=true (locked); kill switch genuinely threatens the only load-bearing empirical claim (700+ units at Casa Grande) |

## 2. The Thesis Core (assembled)

- **Event:** In July 2026, Carvana completed the acquisition of seven Stellantis dealerships for $171 million and began operating them using an online-only, no-commission model, while reporting record used-car retail volumes of 187,393 units (+40% YoY) and $6.432 billion in total revenue (+52% YoY) for Q1 2026.

- **World changes:**
  - WC-001: 7 dealerships acquired for $171M vs a baseline of 0 Carvana-owned new-car franchises (confirmed February 2025 – July 2026; CNBC June 16 2026, The Motley Fool July 11 2026)
  - WC-002: 700+ new vehicles sold at Casa Grande in May 2026 vs prior average of 30–50 units/month — more than 14x increase, making it the #1 Stellantis U.S. volume store (confirmed via Stellantis data shared with CNBC June 16 2026)
  - WC-003: 187,393 used-car retail units in Q1 2026 (+53,495 units, +40% YoY vs 133,898 in Q1 2025; Carvana 8-K SEC EDGAR, filed April 29 2026)
  - WC-004: $6.432B total revenue in Q1 2026 (+$2.2B, +52% YoY vs $4.232B in Q1 2025; Carvana 8-K SEC EDGAR, filed April 29 2026)

- **Blast radius:** Primary — online/DTC used-car retail (DIR-001, composite 85), automotive franchise dealership networks harmed (DIR-002, composite 80), automotive OEM supply chains (DIR-003, composite 80); Secondary — auto F&I / non-bank auto lenders (IND-001, composite 70), automotive parts/accessories/service (IND-002, composite 60); three parties parked (IND-003, HARM-003, plus HARM-001 unified with DIR-002)

- **Clock:** medium_weeks_3months; expiry = Carvana Q2 2026 8-K filing on SEC EDGAR (CIK 0001690820) disclosing new-vehicle franchise volume, or absence of further franchise expansion announcement by Q3 2026 results (expected late October 2026)

- **Kill switch:** If the acquired Stellantis stores collectively average fewer than 350 new vehicles per store per month (metric: Carvana Q2 2026 8-K / Stellantis North America monthly sales report, store-level; threshold: 350 units/store/month; date: 2026-10-31), the core volume-superiority claim is broken and the thesis is dead

## 3. Routing Decision

All five gates passed on their own specialist-reported results without any re-adjudication here. The load-bearing gate is M0.2: four already-occurred, quantified world changes cleared the two-item minimum, with each carrying a number, a baseline, a confirmation date, and a named source. M0.3 produced five carry-forward parties (three primary, two secondary) across both the beneficiary and harmed sides, so the zero-carry-forward terminal condition does not apply. M0.1's 60-second source check returned gate_pass=True from the confirmation scorer. M0.4 and M0.5 set observable, non-opinion conditions. The routing is Proceed.

## Machine Output

Wrote: `screener/runs/SIG-20260711-b55e8917/thesis_record.json` (draft, locked: false, validates against frameworks/screener/thesis_record.schema.json)

## Routing

Routing: Proceed
Next module: edge-definition
