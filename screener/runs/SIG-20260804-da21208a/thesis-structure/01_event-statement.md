# M0.1 Event Statement — SIG-20260804-da21208a

## 1. Event Statement (sterile)

> On 4 August 2026, Grab Holdings Limited, the Singapore-headquartered ride-hailing and delivery company, raised its full-year 2026 revenue guidance to a range of $4.10 billion to $4.15 billion, up from a prior range of $4.04 billion to $4.10 billion, and raised its full-year 2026 adjusted EBITDA guidance to a range of $720 million to $740 million, up from a prior range of $700 million to $720 million. The company reported second-quarter 2026 revenue of $997 million, a 22% increase from the prior-year quarter, and on-demand gross merchandise value of $6.5 billion, a 21% increase from the prior-year quarter. Grab's board authorized a new $750 million share repurchase program, bringing total repurchase authorizations since 2024 to $1.75 billion. Shares of the Nasdaq-listed company rose 4% in extended trading after the announcement.

- **sentence_count:** 4
- **character_count:** 841 (≥ 50)

## 2. Sources

| Role | Source | URL | Grade | Rationale |
|---|---|---|---|---|
| Primary | Reuters | https://www.reuters.com/business/retail-consumer/singapores-grab-lifts-annual-revenue-forecast-2026-08-03/ | A | Reuters is a primary newswire named directly on `sources.signal_gate.allowed`, Source-quality Tier 1. |
| Supporting | Grab Investor Relations (official press release) | https://www.grab.com/sg/press/others/grab-reports-record-second-quarter-2026-results-raises-full-year-guidance-and-announces-750-million-share-repurchase-program/ | A | Tier-1 fallback source (`official_ir_exchange`) — the company's own press release, read directly, confirms the guidance figures, Q2 revenue/GMV, and buyback amount. |
| Supporting | DealStreetAsia | https://www.dealstreetasia.com/stories/grab-q2-2026-earnings-490963 | B | On `sources.signal_gate.allowed` (Tier 1/2 media fallback tier); read directly, confirms new and prior guidance ranges, Q2 revenue/GMV, and the buyback amount. |

## 3. Causal-Language Gate

- **Phrases checked/repaired:** grepped the draft against the banned list and synonyms doing causal work — "because", "due to", "driven by", "as a result", "leading to", "signals", "suggests", "implies", "panic", "crisis", "soaring", "plunging", "aggressively", "inevitably". None appear in the statement. The draft also omits the intake body's own causal framing ("encouraged by strong demand", "driven by promotional offers", "grappling with higher fuel prices following the Iran war") — those are motive/cause language reserved for M0.2, not the sterile statement.
- **causal_language_check:** PASS (locked true)

## 4. Source Confirmation

- **primary_read_quality:** fetch_error
- **paywall_detected:** false
- **What was checked on the primary:** WebFetch attempt on the Reuters URL at 2026-08-05T10:12:00Z returned tool error "Claude Code is unable to fetch from www.reuters.com" — a domain-level fetch restriction, not a paywall signature. No article body was retrieved or used.

**Alternate Sources Checked** (primary_read_quality != full):

| Tier | Source | URL | Confirms | Retrieved At |
|---|---|---|---|---|
| 1 | Grab Investor Relations (official press release, grab.com) | https://www.grab.com/sg/press/others/grab-reports-record-second-quarter-2026-results-raises-full-year-guidance-and-announces-750-million-share-repurchase-program/ | full | 2026-08-05T10:20:00Z |
| 2 | SEC EDGAR (Form 6-K, filing 1) | https://www.sec.gov/Archives/edgar/data/0001855612/000185561226000123/a2026q2-earningspressrelea.htm | none (HTTP 403, unreadable) | 2026-08-05T10:15:00Z |
| 2 | SEC EDGAR (Form 6-K, filing 2) | https://www.sec.gov/Archives/edgar/data/0001855612/000185561226000125/a52026q2-earningspressrele.htm | none (HTTP 403, unreadable) | 2026-08-05T10:15:30Z |
| 3 | DealStreetAsia | https://www.dealstreetasia.com/stories/grab-q2-2026-earnings-490963 | full | 2026-08-05T10:14:30Z |

- **Coverage-gap summary:** The Reuters primary could not be re-opened, so the fallback ran in priority order: the SEC EDGAR 6-K filings (tier 2) were located but both returned HTTP 403 and could not be read. The official Grab investor-relations press release (tier 1) and DealStreetAsia (tier 3, on the signal-gate allowed list) were both opened directly and fully confirm the guidance ranges, Q2 revenue and GMV figures, and the $750 million buyback. Nothing in the draft event statement rests on unread content — every fact traces to a source actually opened.
- **scripts/screener_confirmation_score.py output (copied verbatim):** `confirmation_status=confirmed extraction_confidence=75 gate_pass=True`
- **confirmation_status:** confirmed
- **extraction_confidence:** 75
- **60_second_source_check:** true — PASS

<details><summary>Fallback Search Log (machine-facing — developer debugging only, never summarized as user-facing prose elsewhere)</summary>

| # | Tool | Query / Target | Result | At |
|---|---|---|---|---|
| 1 | WebFetch | https://www.reuters.com/business/retail-consumer/singapores-grab-lifts-annual-revenue-forecast-2026-08-03/ | fetch_error | 2026-08-05T10:12:00Z |
| 2 | WebSearch | "Grab Holdings investor relations press release second quarter 2026 results raises guidance buyback" | corroboration_found | 2026-08-05T10:12:30Z |
| 3 | WebSearch | "Grab Holdings Q2 2026 earnings $750 million buyback revenue guidance raised" | corroboration_found | 2026-08-05T10:13:00Z |
| 4 | WebFetch | https://www.dealstreetasia.com/stories/grab-q2-2026-earnings-490963 | corroboration_found | 2026-08-05T10:14:30Z |
| 5 | WebFetch | https://www.sec.gov/Archives/edgar/data/0001855612/000185561226000123/a2026q2-earningspressrelea.htm | fetch_error | 2026-08-05T10:15:00Z |
| 6 | WebFetch | https://www.sec.gov/Archives/edgar/data/0001855612/000185561226000125/a52026q2-earningspressrele.htm | fetch_error | 2026-08-05T10:15:30Z |
| 7 | WebSearch | "Grab Holdings investor relations grab.com press release second quarter 2026 results" | corroboration_found | 2026-08-05T10:19:00Z |
| 8 | WebFetch | https://www.grab.com/sg/press/others/grab-reports-record-second-quarter-2026-results-raises-full-year-guidance-and-announces-750-million-share-repurchase-program/ | corroboration_found | 2026-08-05T10:20:00Z |

</details>

## 5. Verdict

Verdict: M0.1 complete
