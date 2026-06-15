# Expression Ranking — SIG-20260613-4bbcdeae

**Signal:** Intel BofA double-upgrade / server CPU TAM revision to >$170B by 2030
**Date:** 2026-06-14
**Thesis routing:** provisional (edge score 64)
**Upstream input:** 01_ticker-mapping.md (11 candidates across 6 parties)

---

## 1. Ranked Shortlist

| Rank | CND | Ticker | Company | Side | Exposure /100 (driver) | Liquidity | Prior coverage (decision · date · pool?) | Caveats |
|---:|---|---|---|---|---|---|---|---|
| 1 | CND-001 | INTC | Intel Corporation | Long | **72** — DC+AI segment was 37% of Q1 2026 revenue ($5.1B of $13.6B); Intel is the named subject of the BofA TAM revision; Xeon 6 is the specific platform cited. Dilution: foundry ($5.4B) and CCG (~$4.7B) segments are ~63% of revenue and do not benefit from the mechanism — this caps the score below 80. The mechanism reaches earnings in the next quarterly print (Q2 2026-07-23), the fastest of any candidate. | S&P 500 / Nasdaq 100; NASDAQ; highly liquid; no restrictions | 0 analyses/ matches; 0 data/ pool present — research run requires full cold start | Variant-perception caveat: the thesis asserts Q2 2026 gross margin will print ~39% (not ~41%), compressing BofA's EPS model; this makes INTC the highest-sensitivity name to SF-001 / M0.5 falsifier. 117x forward P/E already prices recovery optimism. IV at 99th percentile. INTC is also the convergence trigger ticker — a Q2 miss simultaneously confirms the short thesis and kills the DC+AI run-rate claim. |
| 2 | CND-002 | AMD | Advanced Micro Devices | Long | **58** — Data Center segment $16.6B FY2025 (+39% YoY), described as "majority of revenue" by AMD. EPYC Venice holds ~27.4% server CPU unit share (Q1 2026) and is co-beneficiary of the same TAM expansion (WC-005). Dilution: Gaming (~$1.3B) and Embedded (~$1.7B) segments are unrelated; Client (PC CPUs) adds further dilution — Data Center is ~55–60% of total revenue by inference [AMD FY2025 8-K, SEC EDGAR, 2026-01-28]. The mechanism reaches AMD one step removed from the BofA upgrade event itself (upgrade is Intel-specific; AMD benefits from TAM logic not from the analyst re-rating). | S&P 500; NASDAQ; highly liquid; no restrictions | 0 analyses/ matches; 0 data/ pool present | SF-002 sensitivity: any hyperscaler disclosure of ARM/custom silicon preference over x86 harms AMD more severely than INTC in unit-share terms (AMD has less incumbent embedded base). AMD trades at ~38x forward P/E — elevated but less stretched than INTC. |
| 3 | CND-003 | KLAC | KLA Corporation | Long | **44** — Advanced packaging revenue expected to exceed $925M in CY2025 (+70% YoY), directly tied to AI infrastructure; total FY2025 revenue $12.16B (+24% YoY) [KLA FY2025 10-K, SEC EDGAR]. The mechanism reaches KLA via equipment orders that lag chip-revenue inflections by 6–18 months; two-step chain (TAM expansion → wafer-start increase → inspection and metrology orders). Process-control equipment is near-mandatory at every new node expansion, reducing the conditionality of the mechanism. Scored at 44 because equipment revenue is a fraction (~10–15%) of the chip revenue the TAM covers, and timing lag is real. | S&P 500; NASDAQ; highly liquid; no restrictions | 0 analyses/ matches; 0 data/ pool present | DIR-002 mechanism is secondary-pace: orders may not accelerate until H2 2026 or 2027. KLA's FY ends June — next print is August 2026, after the INTC Q2 date. |
| 4 | CND-004 | AMAT | Applied Materials, Inc. | Long | **42** — Semiconductor Systems segment ~73% of FY2025 net revenue ($28.37B) [Applied Materials FY2025 earnings release, ir.appliedmaterials.com, 2025-11]; advanced packaging cited as AI-driven growth category. Mechanism and timing are identical to KLAC (DIR-002 party, 6–18 month equipment-order lag). Scored 1 point below KLAC because AMAT's revenue base is more diversified across DRAM and NAND (which do not benefit from server CPU TAM expansion), diluting the pure server CPU signal slightly more. | S&P 500; NASDAQ; highly liquid; no restrictions | 0 analyses/ matches; 0 data/ pool present | Same DIR-002 timing caveat as KLAC. AMAT's memory-equipment revenue (~20–25% of Semiconductor Systems) is insensitive to server CPU TAM growth. |
| 5 | CND-005 | AMKR | Amkor Technology, Inc. | Long | **38** — Management guided AI advanced packaging portfolio to "triple in 2026"; FY2025 total revenue $6.7B [Amkor FY2025 earnings release, ir.amkor.com, 2026]. Two-step mechanism (chip volume → outsourced assembly throughput); score capped by the fact that conventional packaging revenue (consumer, automotive, mobile) continues to dilute the AI/server portion — AI advanced packaging is a growing but not yet majority share of Amkor's $6.7B base. Tripling guidance from a small base is directionally strong but not yet quantified as a segment share [Amkor Q4 2025 investor presentation 8-K, SEC EDGAR, 2026]. | NASDAQ; liquid (mid-cap; not S&P 500); no restrictions | 0 analyses/ matches; 0 data/ pool present | Not an S&P 500 constituent — passive flow absent; lower institutional ownership than INTC/AMD/KLAC/AMAT. Tripling guidance is management commentary, not a filed segment result. |
| 6 | CND-006 | EQIX | Equinix, Inc. | Long | **32** — 100% of revenue is data-center-derived (colocation, interconnection, managed services); colocation revenue for nine months ended September 2025 was $4,767M (annualised ~$6.36B) [Equinix 10-Q, SEC EDGAR, Q3 2025]. Mechanism is two-step and slow (TAM expansion → more servers deployed → facility demand); the effect on Equinix P&L materialises 9–18 months after chip availability. REIT structure means mechanism flows through occupancy rates and interconnection volumes, not EPS from chip sales. Score reflects broad but genuine data-center exposure with muted and slow thesis transmission. | S&P 500; NASDAQ; highly liquid; no restrictions | 0 analyses/ matches; 0 data/ pool present | REIT classification means different sector sensitivity and valuation framework from the semiconductor names; a data-center REIT rally is as likely to be driven by interest-rate policy as by server CPU TAM. IND-002 mechanism is the furthest removed from the BofA upgrade event. SF-001 (consensus stalls) does not directly harm Equinix. |

**Excluded from ranked shortlist (reasons below):**

- **LRCX (Lam Research):** Mechanism and score are nearly identical to KLAC and AMAT (DIR-002, equipment lag, ~41 exposure). Including all three capital-equipment names in an 8-name shortlist would triple-weight a single mechanism. KLAC is ranked over LRCX because KLA's FY2025 advanced-packaging revenue (+70% YoY, $925M) is more specifically quantified to AI-workload expansion from public filings; AMAT is ranked over LRCX for revenue-base size and process breadth. LRCX remains a valid research candidate if the research swarm wants to compare within DIR-002.

- **DLR (Digital Realty Trust):** Ranked below EQIX in IND-002 on exposure purity (EQIX's interconnection density inside AI hyperscaler campuses is more directly tied to the TAM mechanism than DLR's wholesale colocation). Two data-center REITs in a 6-name shortlist would duplicate the slowest-transmitting mechanism. EQIX is the cleaner expression.

- **ARM (long leg):** ARM's server royalty sub-segment is not disclosed as a standalone line in the 20-F; total royalty revenue is $939M FY2025 but the server/cloud contribution is not quantified [ARM Holdings FY2025 20-F, SEC EDGAR]. Exposure score cannot be grounded in a filing-derived number — it would rest on inference. ARM also appears as the short pair leg (see Section 2), creating dual-sided ambiguity that reduces its value as a standalone long candidate.

- **2317.TW (Hon Hai / Foxconn) and 2382.TW (Quanta Computer):** Taiwan-listed with no liquid US ADR. Access eligibility for the account must be confirmed before these can be actioned. Both remain valid candidates for a Taiwan-market-accessible account; their IND-001 server ODM exposure is directionally real but AI server revenue is not broken out as a segment in available public disclosures, limiting score quantification.

- **ASX (ASE Technology):** NYSE-listed ADR; advanced packaging revenue expected to double to $3.2B in 2026 [Digitimes, 2026-02, unverified secondary]. Exposure is real (IND-003, same party as AMKR) but AMKR's management guidance is more directly and recently sourced from SEC-filed IR materials, and AMKR carries less Taiwan-listing-access ambiguity than ASX (which is a foreign-issuer ADR on a 6-K filing regime). AMKR ranks ahead of ASX in IND-003; ASX is the reserve name.

---

## 2. Pair Expressions

| Pair | Long leg | Short leg | What the pair isolates |
|---|---|---|---|
| PAIR-A | CND-001 (INTC) | ARM (short, HARM-001) | x86 server CPU socket-share recovery versus ARM-architecture server royalty growth — both in GICS 45301020; trade is sector-neutral at the semiconductor sub-industry level and isolates the relative architecture share-shift mechanism (WC-005 + WC-004) from broad semiconductor or market beta. If x86 recaptures AI inference sockets, INTC benefits directly while ARM's royalty growth from hyperscaler custom silicon programs (Cobalt, Axion, Graviton) slows. |

**Notes on PAIR-A:**
- The pair construction is grounded in `pair_trade_notes` from M0.3, which explicitly names "Long Server CPU Semiconductors (DIR-001) vs Short ARM/RISC-V Server CPU Architecture Vendors (HARM-001)" as the primary pair.
- ARM as a short leg requires careful sizing: ARM's total royalty revenue ($939M FY2025) is not all server-related; the short thesis applies to the server/cloud royalty growth rate, not to ARM's embedded / mobile royalty stream. A mismatch in notional size against a large INTC long would leave residual semiconductor-cycle beta in the trade. Equal-notional sizing is standard; the research swarm should confirm the beta-neutral sizing when actioning.
- ARM's conflict (it appears as both a potential long in DIR-001 and a short in HARM-001) is resolved by the pair framing: the pair long/short simultaneously holds the positive TAM-expansion view (INTC benefits) and the relative-share-shift view (ARM's server royalty growth rate slows), which is internally consistent with the thesis.

**Pair indicated but not recommended for action (surface for monitoring only):**

Per M0.3 `pair_trade_notes`, the second pair (Long DIR-002 capital equipment vs Short HARM-002 system software) has asymmetric conviction — HARM-002 scored composite 25 and is parked. A short on any system-software name against capital-equipment longs is not actionable from this thesis.

---

## 3. Ranking Rationale

INTC ranks first because it is the thesis in a single ticker: the BofA upgrade event, the TAM revision, the gross margin variant, the Q2 2026-07-23 falsification trigger, and the convergence mechanism all resolve specifically on Intel's quarterly print. No other candidate in the universe captures all four mechanisms simultaneously. AMD ranks second because EPYC Venice holds the second-largest server CPU unit position (27.4% in Q1 2026) and benefits directly from the same TAM expansion — but the upgrade event was Intel-specific, so AMD's re-rating is derivative rather than the primary read. The three-point separation between INTC (72) and AMD (58) reflects that distinction: AMD is a genuine co-beneficiary but not the primary expression. The capital equipment names (KLAC at rank 3, AMAT at rank 4) are ranked below the semiconductor names because the DIR-002 mechanism transmits through an equipment-order lag of 6–18 months — the thesis's 5–6 week horizon to Q2 earnings does not give enough time for equipment revenue to move. They represent the longer-duration expression of the same thesis. AMKR ranks fifth as the most packaging-specific name with the clearest AI advanced packaging commitment from management, though the AI segment share is not yet a disclosed filing line. EQIX ranks last among the shortlisted names because the IND-002 mechanism is the furthest removed from the thesis event, and the REIT valuation framework is sensitive to interest rates, not just AI compute deployment.

---

## 4. Verdict

Verdict: 6 ranked, top = INTC (72/100)

Primary pair: PAIR-A (Long INTC / Short ARM) isolates x86 versus ARM architecture socket-share shift within GICS 45301020.

Prior coverage: 0 of 6 ranked names have prior analyses/ runs or data/ pools — all research handoffs require a full cold start.

Falsifier sensitivity: INTC is the highest-sensitivity name to M0.5 (Q2 2026 DC+AI segment revenue < $4.85B) and to the gross margin variant (Q2 non-GAAP gross margin printing at the guided 39% vs consensus models anchored at 40–42%). A Q2 miss simultaneously falsifies the long INTC thesis and confirms the PAIR-A short ARM leg's relative value. Monitor weekly per M0.4 cadence; shift to daily in the week of 2026-07-23.
