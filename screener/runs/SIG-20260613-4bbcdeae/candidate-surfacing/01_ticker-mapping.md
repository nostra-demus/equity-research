# Ticker Mapping — SIG-20260613-4bbcdeae

**Signal:** Intel BofA double-upgrade / server CPU TAM revision to >$170B by 2030
**Date:** 2026-06-14
**Thesis routing:** provisional (edge score 64)
**Blast radius geography:** Global (US-listed names first; Taiwan-listed where no US-accessible equivalent exists)

---

## 1. Carry-Forward Parties (inherited)

| Party ID | Industry | Tier | Side |
|---|---|---|---|
| DIR-001 | Semiconductors — Data Center / Server CPU (GICS 45301020) | Primary | Long |
| DIR-002 | Semiconductor Capital Equipment (GICS 45301010) | Primary | Long |
| IND-001 | Electronic Manufacturing Services / Server ODMs (GICS 45301010) | Secondary | Long |
| IND-002 | Data Center REITs and Colocation Operators (GICS 60108010) | Secondary | Long |
| IND-003 | Advanced Packaging / Substrate / PCB Makers (GICS 45301020) | Secondary | Long |
| HARM-001 | Semiconductor — ARM-based / RISC-V Server CPU Competing Architectures (GICS 45301020) | Secondary | Short |

HARM-002 (System Software / Workload Optimization Middleware) is parked (`carry_forward: false`) and is excluded.

---

## 2. Candidate Universe

### DIR-001 — Semiconductors: Data Center / Server CPU (Long)

| Ticker | Company | Exchange | Party (ref) | Side | Exposure mechanism (one line) | Exposure quantification | Investability |
|---|---|---|---|---|---|---|---|
| INTC | Intel Corporation | NASDAQ | DIR-001 | Long | The primary subject of the thesis: Intel's Data Center and AI segment is the direct beneficiary of the TAM revision from ~$125B to >$170B by 2030 (WC-005); its Xeon 6 platform captures server CPU sockets whose market is expanding | DC+AI segment revenue $5.1B in Q1 2026 (+22% YoY), representing approximately 37% of total Q1 revenue of $13.6B [Intel Q1 2026 8-K, SEC EDGAR, 2026-04-23; Manufacturing Dive, 2026-04-23, unverified secondary] | Large-cap; NASDAQ-listed; highly liquid; no suspension. S&P 500 / Nasdaq 100 constituent. Prior coverage: none in engine |
| AMD | Advanced Micro Devices | NASDAQ | DIR-001 | Long | AMD's EPYC server CPU competes in the same server CPU TAM whose expansion (WC-005) enlarges the addressable revenue pool for all server CPU makers; EPYC Venice holds approximately 27.4% server CPU unit share and is co-beneficiary of the expanding pie | Data Center segment revenue $16.6B for full-year 2025, representing the majority of AMD's total revenue; Q4 2025 Data Center revenue $5.4B (+39% YoY) [AMD FY2025 earnings release 8-K, SEC EDGAR, 2026-01-28, unverified secondary via ir.amd.com] | Large-cap; NASDAQ-listed; highly liquid; no suspension. S&P 500 constituent. Prior coverage: none in engine |
| ARM | Arm Holdings plc | NASDAQ | DIR-001 | Long | ARM licenses the architecture underlying approximately 17.7% of server CPU unit shipments in Q1 2026; royalty revenue expands as ARM-based server CPU socket count grows inside the same expanding TAM; the TAM revision (WC-005) lifts all socket types, including ARM-based designs from hyperscalers (Microsoft Cobalt, Google Axion, AWS Graviton) | ARM discloses royalty revenue by market end-use; server/cloud is a growing portion of its $939M royalty revenue in FY2025 (fiscal year ended March 2025), though ARM does not publicly break out server royalty as a standalone line — exposure not yet precisely quantified from filings [ARM Holdings FY2025 20-F, SEC EDGAR; Tom's Hardware, 2026, unverified secondary — server CPU royalty sub-segment not separately disclosed] | Large-cap; NASDAQ-listed; highly liquid (ADR structure; primary UK incorporation). No suspension. Prior coverage: none in engine |

*Note on Intel as both thesis subject and candidate: the thesis mechanism is not an Intel-specific buy thesis — it is a TAM-expansion event that reaches Intel (long), AMD (long), and ARM (long-with-caveat). Intel is the most-exposed pure expression of DIR-001 because 37% of its Q1 2026 revenue is directly in the affected segment. AMD is second-most-exposed (data center revenue is its largest segment). ARM's exposure is architecturally real but royalty-per-socket is smaller and not broken out as a server sub-line in public filings.*

---

### DIR-002 — Semiconductor Capital Equipment (Long)

| Ticker | Company | Exchange | Party (ref) | Side | Exposure mechanism (one line) | Exposure quantification | Investability |
|---|---|---|---|---|---|---|---|
| AMAT | Applied Materials, Inc. | NASDAQ | DIR-002 | Long | Applied Materials supplies CVD, PVD, etch, and CMP equipment for fabricating the advanced-node logic chips (including Intel Xeon and AMD EPYC) whose production must expand as server CPU TAM grows from ~$125B to >$170B | Semiconductor Systems segment (foundry/logic/DRAM/NAND equipment) represents approximately 73% of FY2025 net revenue of $28.37B; advanced packaging specifically identified as an AI-driven growth category [Applied Materials FY2025 earnings release, ir.appliedmaterials.com, 2025-11; The Globe and Mail, 2025-11, unverified secondary] | Large-cap; NASDAQ-listed; highly liquid. S&P 500 constituent. Prior coverage: none in engine |
| LRCX | Lam Research Corporation | NASDAQ | DIR-002 | Long | Lam Research is the leading supplier of etch and deposition equipment (~40% global etch market share); expanded wafer-start demand from server CPU production ramp directly drives incremental etch and CVD tool orders | FY2025 revenue $18.44B (+24% YoY); Systems (new equipment) revenue $11.49B = 62% of total; company explicitly tied AI to "new architectures and packaging approaches that are increasingly deposition- and etch-intensive" [Lam Research FY2025 annual results; WallStreetZen revenue history, unverified secondary; Futurum, 2025, unverified secondary] | Large-cap; NASDAQ-listed; highly liquid. S&P 500 constituent. Prior coverage: none in engine |
| KLAC | KLA Corporation | NASDAQ | DIR-002 | Long | KLA supplies process-control (inspection and metrology) equipment; every new fab node and capacity expansion requires KLA tools to identify defects, making it a near-mandatory spend item alongside any wafer-start increase | FY2025 (ended June 2025) total revenue $12.16B (+24% YoY); advanced packaging revenue expected to exceed $925M in calendar year 2025 (+70% YoY), directly tied to AI infrastructure build-out [KLA FY2025 Q4 earnings release, PR Newswire, 2025-08-06, unverified secondary; KLA 10-K FY2025, SEC EDGAR] | Large-cap; NASDAQ-listed; highly liquid. S&P 500 constituent. Prior coverage: none in engine |

---

### IND-001 — Electronic Manufacturing Services / Server ODMs (Long)

| Ticker | Company | Exchange | Party (ref) | Side | Exposure mechanism (one line) | Exposure quantification | Investability |
|---|---|---|---|---|---|---|---|
| 2317 | Hon Hai Precision Industry Co. (Foxconn) | TWSE (Taiwan Stock Exchange) | IND-001 | Long | Foxconn is Nvidia's primary AI server manufacturer and the largest EMS provider globally; expanded x86 server CPU volumes (from DIR-001 TAM expansion) flow directly into server board assembly demand at Foxconn's contract manufacturing operations | FY2025 total revenue NT$8.10 trillion (+18% YoY); AI server assembly is a primary growth driver; record EPS NT$13.61 for FY2025 [Hon Hai FY2025 annual results press release, honhai.com, 2026-03, unverified secondary; Digitimes, 2026-04-14, unverified secondary]. AI server revenue as standalone segment not separately disclosed in available public sources — exposure not yet precisely quantified | Large-cap; TWSE-listed (primary) at ticker 2317.TW; OTC pink-sheet ADR tickers HNHPF / HNHAF exist but are illiquid for institutional purposes. US investors access via ADR or Taiwan-market access. Liquidity in local shares: very high (one of TWSE's largest components). Prior coverage: none in engine |
| QCOM.TW / 2382 | Quanta Computer | TWSE | IND-001 | Long | Quanta assembles AI servers for Nvidia, AMD, and major hyperscalers; expanding server CPU TAM drives incremental board-level assembly volumes directly through Quanta's server ODM contracts | FY2025 total revenue NT$2.12 trillion (+51% YoY); AI server demand cited as primary growth driver; specific AI server revenue not broken out as a separate segment in available public disclosures — exposure not yet precisely quantified [Quanta Computer 2025 financials via StockAnalysis / Simply Wall St, unverified secondary; Wikipedia confirmed TWSE listing] | Large-cap; TWSE-listed at ticker 2382.TW; no liquid US ADR. TWSE-accessible for investors with Taiwan market access; limited direct US-listed expression. Prior coverage: none in engine |

*Investability note on IND-001: The primary server ODM names (Hon Hai, Quanta, Wiwynn, Wistron) are Taiwan-listed. US-accessible pure plays in this segment are limited — Jabil (NASDAQ: JBL) and Flex (NASDAQ: FLEX) have server EMS exposure but are diversified across consumer electronics, healthcare, and industrial (server share not quantified from available sources). Taiwan-listed names are noted here; the research swarm should confirm TWSE accessibility for the relevant account. No US-listed pure-play server ODM was identified with quantified server segment exposure above 30% of revenue.*

---

### IND-002 — Data Center REITs and Colocation Operators (Long)

| Ticker | Company | Exchange | Party (ref) | Side | Exposure mechanism (one line) | Exposure quantification | Investability |
|---|---|---|---|---|---|---|---|
| EQIX | Equinix, Inc. | NASDAQ | IND-002 | Long | Equinix is the largest global colocation REIT (270+ data centers across 77 markets); expanded AI compute server deployments from the TAM revision (WC-005) drive incremental rack-space, power, and interconnection revenue at Equinix facilities | Colocation revenue for nine months ended September 2025: $4,767M (annualised approximately $6.36B); 100% of revenue is data-center-derived (colocation + interconnection + managed services) — pure-play exposure [Equinix 10-Q, SEC EDGAR, Q3 2025 filing, 2025-11; Equinix 8-K filings FY2025] | Large-cap REIT; NASDAQ-listed; highly liquid. S&P 500 constituent. Prior coverage: none in engine |
| DLR | Digital Realty Trust, Inc. | NYSE | IND-002 | Long | Digital Realty operates 310 data centers globally, providing wholesale colocation to cloud providers; expanded AI server deployments require additional powered shell and colocation capacity, directly increasing Digital Realty's lease absorption | Q3 2025 revenue $1.6B (+10% YoY); as a pure-play data-center REIT (Nareit designation) all revenue is data-center-derived; full-year 2025 revenue approximately $6.2B annualised [Digital Realty Q3 2025 8-K, SEC EDGAR, 2025-10-23, unverified secondary; Wikipedia confirmed NYSE listing] | Large-cap REIT; NYSE-listed; highly liquid. S&P 500 constituent. Prior coverage: none in engine |

---

### IND-003 — Advanced Packaging / Substrate / PCB Makers (Long)

| Ticker | Company | Exchange | Party (ref) | Side | Exposure mechanism (one line) | Exposure quantification | Investability |
|---|---|---|---|---|---|---|---|
| AMKR | Amkor Technology, Inc. | NASDAQ | IND-003 | Long | Amkor provides outsourced semiconductor assembly and test (OSAT) services including advanced packaging (CoWoS-equivalent, HDFO) for server-class chips; expanding server CPU volumes (from the TAM revision) directly increase Amkor's advanced packaging throughput demand | FY2025 total revenue $6.7B; management guided AI advanced packaging portfolio to "triple in 2026"; advanced packaging TAM in server market estimated at ~$0.5B per gigawatt of AI install, growing at >20% CAGR 2025–2030 per management [Amkor FY2025 earnings release, ir.amkor.com, 2026; Amkor Q4 2025 investor presentation 8-K, SEC EDGAR, 2026] | Mid-cap; NASDAQ-listed; liquid. S&P 500 not a constituent (mid-cap). Prior coverage: none in engine |
| ASX | ASE Technology Holding Co., Ltd. | NYSE | IND-003 | Long | ASE Technology is the world's largest OSAT and advanced packaging provider; the server CPU volume ramp from WC-005 TAM expansion directly drives incremental flip-chip BGA and advanced packaging throughput at ASE's assembly-and-test (ATM) operations | Advanced packaging and testing revenue reached US$1.6B in 2025 (~10% of ATM revenues); forecast to double to $3.2B in 2026; FY2025 total revenue approximately NT$645B (+8% YoY) [ASE Technology 6-K, SEC EDGAR, 2025; Digitimes, 2026-02, unverified secondary; ASE Technology Q4 2025 earnings call, Yahoo Finance, unverified secondary] | Large-cap; NYSE-listed (ADR); liquid. No S&P 500 membership (foreign issuer). Prior coverage: none in engine |

---

### HARM-001 — ARM-based / RISC-V Server CPU Competing Architectures (Short)

| Ticker | Company | Exchange | Party (ref) | Side | Exposure mechanism (one line) | Exposure quantification | Investability |
|---|---|---|---|---|---|---|---|
| ARM | Arm Holdings plc | NASDAQ | HARM-001 | Short (pair leg only) | If x86 (Intel/AMD) re-captures server CPU socket share in AI workloads — the mechanism BofA's upgrade thesis asserts — ARM's royalty revenue from hyperscaler custom-silicon programs (Microsoft Cobalt, Google Axion, AWS Graviton) grows more slowly than its current 17.7% server unit-share trajectory implies; this is the short leg of the pair suggested in pair_trade_notes | ARM server royalty sub-segment not separately disclosed in 20-F; total royalty revenue $939M in FY2025; server/cloud is a growing contributor but not broken out — exposure not yet precisely quantified [ARM Holdings FY2025 20-F, SEC EDGAR; Tom's Hardware, 2026, unverified secondary] | Large-cap; NASDAQ-listed; highly liquid. **Conflict note: ARM also appears as a long candidate in DIR-001** (TAM expansion lifts all server socket types including ARM). The short leg applies only in the pair-trade framing where x86 wins socket share at ARM's expense — the TAM expansion alone is net positive for ARM too. Any short on ARM must be sized as a relative-value pair leg against INTC or AMD long, not a standalone short. |

*Note on HARM-001 unmappable names: Hyperscaler custom silicon (Microsoft Cobalt, Google Axion, AWS Graviton) is designed by hyperscalers internally and manufactured at TSMC (Taiwan-listed: 2330.TW; US ADR: TSM). There is no listed "ARM-architecture-server-CPU maker" pure play other than ARM Holdings itself. RISC-V names of commercial scale are not currently NYSE/NASDAQ-listed pure-plays (SiFive is private; Alibaba's T-Head XuanTie operates as a division within NYSE:BABA, which is a diversified ecommerce/cloud conglomerate — not a useful short instrument for this thesis).*

---

## 3. Unmappable Parties

| Party | Why no investable listed expression |
|---|---|
| IND-001 (server ODM — US-listed pure play) | No NYSE/NASDAQ-listed company derives more than a verifiable 30%+ of revenue from x86 server board assembly as a standalone segment. The pure-play names (Hon Hai 2317.TW, Quanta 2382.TW, Wiwynn — private spin-out, Wistron 3231.TW) are all Taiwan-listed with no liquid US ADR. US-listed EMS names (Jabil NASDAQ:JBL, Flex NASDAQ:FLEX) are diversified; server segment share not publicly quantified in available filings — flagged as "exposure not yet quantified" rather than fully unmappable, but no clean US-listed pure play exists |
| HARM-001 (RISC-V pure play, listed) | No commercially scaled RISC-V server CPU maker is listed on a recognised exchange. SiFive (the leading RISC-V IP vendor) is private. Alibaba's T-Head division (RISC-V designs) is subsumed within NYSE:BABA, a diversified conglomerate where RISC-V server CPU exposure is not a material or quantifiable revenue line |

---

## 4. Verdict

Verdict: 11 candidates across 6 parties (9 long / 1 short-pair-leg / 1 dual-sided)

**Long candidates (9):** INTC, AMD, ARM (long), AMAT, LRCX, KLAC, EQIX, DLR, AMKR, ASX, 2317.TW, 2382.TW
**Short/pair candidates (1):** ARM (short pair leg vs INTC long — only in pair-trade framing)
**Taiwan-listed only (no liquid US ADR):** 2317.TW (Hon Hai), 2382.TW (Quanta) — flag for access eligibility before research handoff

**Purest single exposure to the thesis mechanism:** INTC (Intel Corporation, NASDAQ) — the company whose segment (DC+AI, 37% of Q1 2026 revenue at $5.1B) is the direct subject of the BofA TAM revision and whose Q2 2026 gross margin print (guided 39% vs the 41% Q1 anchor) is the thesis's primary falsification/confirmation trigger on 2026-07-23.

**Pair trade hint (from pair_trade_notes):** Long INTC / Short ARM encodes the relative x86 vs ARM architecture socket-share-shift thesis most cleanly, within the same GICS sub-industry (45301020), keeping the trade sector-neutral at the semiconductor level.
