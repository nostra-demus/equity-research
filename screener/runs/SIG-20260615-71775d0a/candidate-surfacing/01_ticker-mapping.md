# Ticker Mapping — SIG-20260615-71775d0a

**Thesis:** Honeywell Aerospace spin-off (HONA) — market prices HONA at the peer-median aerospace multiple (~29x EV/EBITDA) without adjusting for 3% organic growth, implying ~27% downside from consensus for the new entity.
**Routing:** provisional (edge score 71) · Thesis ID: THS-SIG-20260615-71775d0a-v1
**Date:** 2026-06-15

---

## 1. Carry-Forward Parties (inherited)

| Party ID | Industry | Tier | Side |
|---|---|---|---|
| DIR-001 | Investment Banking & Financial Advisory (GICS 40201040) | Primary | long |
| DIR-002 | Aerospace & Defense Equipment Manufacturers — pure-play listed (GICS 20101010) | Secondary | long |
| IND-002 | Securities Brokers & Prime Brokers (GICS 40203010) | Secondary | long |
| HARM-001 | Diversified Multi-Segment Industrial Conglomerates (GICS 20106010) | Secondary | short |

Parked parties (IND-001, HARM-002) are excluded per MODULE_RULES — only `carry_forward: true` parties are mapped.

---

## 2. Candidate Universe

| Ticker | Company | Exchange | Party (ref) | Side | Exposure mechanism (one line) | Exposure quantification | Investability |
|---|---|---|---|---|---|---|---|
| EVR | Evercore Inc. | NYSE | DIR-001 | long | Evercore earns advisory fees on M&A separations and restructurings; as a pure-play advisory firm it captures the largest share of incremental advisory fee income from the Honeywell Aerospace spin-off cycle and any peer separations it triggers. | Advisory fees were 84% of total net revenues of $3.87B in FY2025 [Evercore FY2025 Form 8-K, SEC EDGAR, Q1 FY2026 8-K, SEC EDGAR, retrieved 2026-06-15]. Revenue share directly attributable to this specific transaction not publicly disclosed — exposure not yet quantified at deal level. | Large-cap (~$15B market cap [stockanalysis.com, 2026-06-15, web unverified]); NYSE listed; actively traded; no known suspension or pending corporate action. Prior engine coverage: none. |
| GS | Goldman Sachs Group Inc. | NYSE | DIR-001 | long | Goldman Sachs is the confirmed lead advisor on the Honeywell Aerospace separation and the co-lead representative on HONA's $16B debt offering; advisory and underwriting fees from this transaction book directly to its Global Banking & Markets segment. | GS earned $4.6B in pure advisory fees in FY2025 [Goldman Sachs 2025 Annual Report / FY2025 10-K, SEC EDGAR, retrieved 2026-06-15]; advisory fee income from the HONA transaction itself is not separately disclosed — exposure not yet quantified at deal level. | Mega-cap (~$175B+ market cap); NYSE listed; Dow Jones component; high liquidity. Prior engine coverage: none. |
| LAZ | Lazard Inc. | NYSE | DIR-001 | long | Lazard is a pure-play financial advisory and asset management firm; its advisory franchise covers M&A, restructuring, and spin-off separations — the type of transaction the Honeywell spin-off represents — and earns fees when comparable deals close across the market. | Record FY2025 Financial Advisory adjusted net revenue of $1.8B [Lazard FY2025 Form 8-K, SEC EDGAR, retrieved 2026-06-15]; share attributable to any single transaction not disclosed — exposure not yet quantified at deal level. | Mid-cap; NYSE listed; liquid; no known suspension. Prior engine coverage: none. |
| GE | GE Aerospace | NYSE | DIR-002 | long | GE Aerospace is a listed pure-play aerospace and defense company (jet engines, propulsion systems, defense) that becomes a direct comparable-company benchmark for HONA; a re-rating of HONA peers reinforces GE Aerospace's own valuation as the largest pure-play aerospace entity. | Q1 FY2026 adjusted revenue +29% YoY ($8.9B) and total orders +87% YoY ($23B) [GE FY2026 Q1 Form 10-Q, SEC EDGAR, March 31, 2026, retrieved 2026-06-15]; 100% of revenue is aerospace-segment. Organic revenue guidance 4–6% for FY2026 [GE FY2025 Form 8-K, SEC EDGAR, Q4 2025 earnings release, retrieved 2026-06-15]. | Mega-cap (~$350B market cap [investing.com, 2026-06-15, web unverified]); NYSE listed; S&P 500 component; very high liquidity. Prior engine coverage: none. |
| HEI | HEICO Corporation | NYSE | DIR-002 | long | HEICO makes FAA-approved replacement parts and electronics for aerospace aftermarket; it is a direct listed peer HONA will be benchmarked against, and a re-rating event in large-cap aerospace comparables lifts the sector's reference multiples for high-growth suppliers like HEICO. | Flight Support Group (aerospace aftermarket) achieved 16% organic growth in Q4 FY2025 and 13%+ growth across multiple quarters [HEICO FY2025 Form 8-K filings, SEC EDGAR, retrieved 2026-06-15]; 100% of revenue is aerospace/defense. Market cap ~$40B [Investing.com, 2026-06-15, web unverified]. | Large-cap (~$40B market cap); NYSE listed; two share classes (HEI and HEI.A — both NYSE-traded); no suspension. Prior engine coverage: none. |
| TDG | TransDigm Group Incorporated | NYSE | DIR-002 | long | TransDigm makes highly engineered aerospace components with proprietary sole-source contracts; with 11% organic growth in Q2 FY2026 it sits in the top tier of the aerospace peer set and trades at ~21x EV/EBITDA — the same set consensus uses to value HONA — making it a direct expression of the comparable-company multiple that the thesis challenges. | Organic sales growth 11.0% in Q2 FY2026 [TransDigm FY2026 Q2 Form 8-K/press release, PR Newswire, retrieved 2026-06-15]; EV/EBITDA ~21x [GuruFocus, 2026-06-15, web unverified]; 100% of revenue is aerospace-segment. | Large-cap (~$70B market cap); NYSE listed; high liquidity. Prior engine coverage: none. Note: TransDigm carries substantial financial leverage (serial-acquirer model) — flag for research swarm per §24 filter 3–4. |
| MS | Morgan Stanley | NYSE | IND-002 | long | Morgan Stanley is a confirmed co-lead representative on HONA's $16B debt offering and earns prime brokerage and equities revenues from elevated trading volumes and event-driven positioning around the Honeywell spin-off. | Q1 FY2026 equities trading revenue of $5.15B (record, +25% YoY) includes prime brokerage flows [Morgan Stanley Q1 FY2026 Form 8-K, SEC EDGAR, April 2026, retrieved 2026-06-15]; FY2025 investment banking net revenue $2.41B [Morgan Stanley FY2025 Form 10-K, SEC EDGAR, retrieved 2026-06-15]; incremental revenue from this single transaction not separately disclosable — exposure not yet quantified at deal level. | Mega-cap; NYSE listed; Dow component; very high liquidity. Prior engine coverage: none. |
| ITW | Illinois Tool Works Inc. | NYSE | HARM-001 | short | Illinois Tool Works operates seven industrial segments with no single segment exceeding one-fifth of revenue; as a high-quality diversified industrial it faces the same investor pressure the Honeywell spin-off benchmarks — that diversified industrials carry a conglomerate discount versus focused pure-plays. | Revenue ~$16.0B TTM across 7 segments [Illinois Tool Works investor data, stockanalysis.com, 2026-06-15, web unverified]; FY2026 organic growth guidance only 1–3% [Q1 FY2026 earnings, 2026, web unverified]; exposure is sentiment-and-multiple driven — exposure not yet quantified in basis-point terms. | Large-cap (~$72B market cap [Investing.com, 2026-06-15, web unverified]); NYSE listed; S&P 500 component; high liquidity. Prior engine coverage: none. |
| MMM | 3M Company | NYSE | HARM-001 | short | 3M operates across Safety & Industrial, Transportation & Electronics, and Consumer segments; despite having spun off Solventum in 2024 it remains a diversified multi-segment manufacturer and faces continued pressure from investors who benchmark it against focused peers — the Honeywell transaction intensifies that comparison class. | Revenue ~$16B; stock down ~18% from March 2026 peak [StockStory, 2026-06-15, web unverified; Yahoo Finance, 2026-06-15, web unverified]; FY2026 adjusted EPS guidance narrowed downward [StockStory, 2026-06-15, web unverified]; exposure is sentiment-and-multiple driven — exposure not yet quantified in basis-point terms. | Large-cap; NYSE listed; S&P 500 component; high liquidity. Prior engine coverage: none. Caveat: 3M has been partially de-conglomeratized since the Solventum spin-off, which weakens the HARM-001 mechanism for this name specifically — flag for research swarm. |

---

## 3. Unmappable Parties

| Party | Why no investable listed expression |
|---|---|
| IND-001 (Passive Index Management & ETF Sponsors) | Parked (carry_forward: false) — not mapped per MODULE_RULES. |
| HARM-002 (Derivatives Dealers & Options Market Makers) | Parked (carry_forward: false) — not mapped per MODULE_RULES. |

No carry-forward party was left without a listed candidate. The four carry-forward parties map cleanly to nine named companies across NYSE.

---

## 4. Verdict

Verdict: 9 candidates across 4 parties (5 long / 4 short — 3 DIR-001 long, 3 DIR-002 long, 1 IND-002 long, 2 HARM-001 short)

**Geography note:** All candidates are US-listed on NYSE. The thesis is a US corporate event (Honeywell International, HONA Nasdaq listing); NYSE/Nasdaq-first mapping follows the blast-radius rule.

**Pair-leg alignment from M0.3:**
- Pair 1 (advisory long / conglomerate short): EVR or GS vs ITW or MMM — fees earned regardless of HONA's post-spin performance; diversified industrials pressured by the same spin-off benchmark.
- Pair 2 (aerospace pure-play long / diversified industrial short): GE or HEI vs ITW — the thesis mechanism is that HONA's listing benchmarks pure-play multiples favorably against conglomerates; GE Aerospace and HEICO sit on the long side of that re-rating.

**Biggest finding:** Evercore (EVR) has the purest advisory-fee exposure in the DIR-001 universe: 84% of its $3.87B FY2025 revenue comes from advisory fees [Evercore FY2025 Form 8-K, SEC EDGAR], it has no capital-markets or balance-sheet risk from the Honeywell transaction itself, and it operates in exactly the large-complex-deal advisory market the HONA separation represents. GS has confirmed deal participation but advisory is a smaller share of its $58B total revenue, diluting exposure.

**Caveats:**
- Transaction-level advisory fees are never disclosed by the banks; quantification at deal level is structurally impossible from public sources and is marked "not yet quantified" for all DIR-001 names.
- TransDigm (TDG) carries high financial leverage as a serial acquirer — the research swarm should apply the §24 filter 3–4 review before sizing.
- 3M (MMM) has already spun off its largest non-core business (Solventum); the HARM-001 mechanism applies with lower force to 3M than to ITW, which remains more fully diversified.
- No India-listed candidates are identified: the blast radius is a US corporate event with US exchange implications only.
- Prior engine coverage: none of these names have a `data/<TICKER>/` pool or a prior `decision_record.json`; all would require full research runs.
