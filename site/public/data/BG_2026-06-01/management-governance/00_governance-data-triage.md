# Governance Data Triage — BG

**Company:** Bunge Global SA (NYSE: BG) | **Jurisdiction:** Switzerland (Geneva) | **Sector:** Agribusiness / Agricultural Commodities | **Triage date:** 2026-06-01

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Governance Relevance |
|---|---|---|---|---|
| bunge_10k.txt | Annual filing (10-K, full text) | FY2025 (ended Dec 31, 2025) | 2026-05-11 | High |
| bunge-2025-annual-report.pdf | Annual filing (10-K, PDF; CEO letter + financials) | FY2025 | 2026-05-11 | High |
| bunge_10q.txt | Quarterly filing (10-Q, full text) | Q1 FY2026 (ended Mar 31, 2026) | 2026-05-11 | Medium |
| bunge 10q.pdf | Quarterly filing (10-Q, PDF) | Q1 FY2026 | 2026-05-11 | Medium |
| q1_call.txt | Earnings transcript (text) | Q1 FY2026 call, Apr 29, 2026 | 2026-05-11 | Medium |
| q1-2026-bunge-limited-earnings-conference-call.pdf | Earnings transcript (PDF) | Q1 FY2026 | 2026-05-11 | Medium |
| q1-2026-earnings-release.pdf | Earnings release / press release | Q1 FY2026 | 2026-05-11 | Low |
| Consensus.xlsx | Analyst consensus export (data vendor) | As of 2026-05-09 | 2026-05-09 | Low |
| Guidance.xlsx | Guidance export (data vendor) | As of 2026-05-09 | 2026-05-09 | Low (candor: guidance-vs-delivery) |
| Surprise.xlsx | Beat/miss surprise history (data vendor) | As of 2026-05-09 | 2026-05-09 | Low (candor: track record) |
| Revisions.xlsx | Estimate-revisions export (data vendor) | As of 2026-05-09 | 2026-05-09 | Low |
| Trends.xlsx | Estimate-trends export (data vendor) | As of 2026-05-09 | 2026-05-09 | Low |
| Recent Changes.xlsx | Estimate recent-changes export (data vendor) | As of 2026-05-09 | 2026-05-09 | Low |
| Multiples.xlsx | Valuation multiples export (data vendor) | As of 2026-05-09 | 2026-05-09 | Low |

Notes: PDF and .txt pairs (10-K, 10-Q, transcript) are the same source documents in two formats. No proxy/DEF 14A, no dedicated compensation export, no ownership/insider-transaction export, and no shareholder letter beyond the CEO letter embedded in the 10-K are present.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Proxy / DEF 14A | **NONE IN POOL** — 10-K defers all Part III to the "definitive proxy statement for 2026 Annual Meeting" (held May 20, 2026), not provided [FY25 10-K, Items 10–14, lines 3803–3845] | — | — |
| Annual filing | bunge_10k.txt / bunge-2025-annual-report.pdf | FY2025 (ended Dec 31, 2025); filed Feb 19, 2026 | ~3.4 |
| Compensation disclosure | **NONE** — Item 11 deferred to the 2026 proxy [FY25 10-K, line 3815] | — | — |
| Ownership / insider-transaction data | **NONE** — Item 12 deferred to the 2026 proxy [FY25 10-K, line 3823]; no Form 4 / Capital IQ insider export | — | — |
| Shareholder letter | CEO letter (Greg Heckman) embedded in the FY2025 annual report [lines 1–48] | FY2025 | ~3.4 |
| Transcript | q1_call.txt / Q1 FY2026 call PDF | Q1 FY2026 call, Apr 29, 2026 | ~1.1 |
| 8-K (management changes) | **NONE** — exec changes (COO Garros sole COO Dec-2025; CSO change) narrated in the 10-K [lines 812–875] | — | — |

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A | **N** | Deferred to 2026 proxy, not in pool [lines 3803–3845] | Comp, ownership, board, related-party |
| Compensation disclosure (metrics/weights) | **N** | Item 11 deferred [line 3815]; only HR & Compensation Committee existence [line 673] + clawback policy [line 121] | Incentive alignment |
| Beneficial ownership table | **N** | Item 12 deferred [line 3823]. Partial substitute: ~34% Viterra-seller bloc (Glencore ~17%, CPP ~14%, BCI ~3%) [Risk Factors / Note 2] | Skin in the game, control |
| Insider-transaction data | **N** | No Form 4 / Section 16 / Capital IQ insider export; insider-trading policy referenced only [line 800] | Conviction signal |
| Board composition / independence | **Partial / N** | Committee structure named (Audit; Corporate Governance & Nominations; Enterprise Risk Mgmt; HR & Comp; Sustainability) [lines 802–805]; independence (Item 13) deferred [line 3834] | Board quality, entrenchment |
| Related-party disclosure | **Y** | Note 19: purchases ~9% or less of COGS; sales ~2% or less; receivables ~4% [Note 19, lines 7765–7786] | Value leakage |
| Control structure | **Y** | Single class (NYSE: BG) [line 93]; ~34% Viterra-seller bloc with board-nomination rights; 2/3 supermajority thresholds [Risk Factors; Note 2] | Minority-shareholder rights |
| Prior letters / guidance | **Partial** | One CEO letter (FY2025) [lines 1–48]; Guidance.xlsx + Surprise.xlsx give a quantitative series (2026-05-09) | Promise-vs-delivery |
| M&A / buyback / dividend history | **Y** | $551M buybacks (2025) vs $502M (2024); $459M dividends 2025 ($2.80/sh vs $2.72); treasury 15.1M (2025) vs 21.3M (2024); Viterra $10.6B close Jul-2025; repurchase expanded Nov 13, 2024 [lines 10, 2002, 3033, 3050, 3060] | Capital-allocation scorecard |
| Management tenure / turnover | **Y** | CEO Heckman since Jan-2019, CFO Neppl since May-2019, COO Garros (sole COO Dec-2025) [lines 812–875] | Stability and competence |
| Transcripts | **Y (one)** | Q1 FY2026 call only [q1_call.txt] | Candor and tone |

## 4. Cross-Module Availability

At triage time the current run path `analyses/BG_2026-06-01/` was not yet populated with business-model or earnings outputs. Within this `/research:full` run those modules complete first, so their outputs become available at the current-run path before this module's Layer 1.

| Cross-Module Output | Available? (Y/N) at triage |
|---|---|
| business-model/11_capital-allocation-governance.md | N at triage (populated before MG Layer 1) |
| business-model/01_disqualifier-scan.md | N at triage (same) |
| business-model/12_red-flags-sweep.md | N at triage (same) |
| business-model/02_business-identity.md | N at triage (same) |
| earnings/06_earnings-quality.md | N at triage (same) |
| earnings/04_guidance-consensus.md | N at triage (same) |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | **Y** | 03, 99 | Incentive alignment max 50; Overall usefulness max 70 |
| No ownership / insider-transaction data | **Y** | 04, 99 | Shareholder friendliness max 60 |
| No board disclosure | **Y (partial)** | 05, 99 | Director roster/independence deferred to proxy → board read capped |
| No multi-year history | **N** | 02 | Multi-year capital-allocation history IS available; capital-allocation cap (max 65) does NOT bind |
| No transcripts / prior letters | **Y (partial)** | 01, 06 | Only one transcript + one CEO letter → Disclosure candor max 65 (Guidance/Surprise partially mitigate) |

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (issuer domiciled in Switzerland) | [lines 79–93] |
| Exchange | NYSE (symbol BG, Section 12(b)) | [line 93] |
| Filing regime | **US SEC** (domestic filer: 10-K / 10-Q / 8-K / DEF 14A) | [line 64; Part III deferral lines 3803–3845] |
| Issuer domicile | Switzerland, 1206 Geneva (Bunge Global SA) | [lines 79–83] |
| Sector | Agribusiness / agricultural commodities | [lines 1–48] |
| Sector overlay required? | **Y — Holding company / conglomerate + commodity-trading overlay** (capital allocation between segments, guarantees, cross-holdings, intercompany loans, trapped cash e.g. Ukraine [line 969], unconsolidated-investee RPTs [Note 19]; commodity-trader lens: counterparty/credit, hedging/derivatives governance, concentrated-bloc control rights post-Viterra). NOT bank/NBFC/IT/pharma. | [Note 19; Note 2; Risk Factors] |

Downstream guidance: US-SEC domestic filer. The proxy-equivalent IS the US DEF 14A — genuinely missing from the pool (not a jurisdiction mismatch). Swiss-law features (second-trading-line repurchase, 2/3 supermajority, statutory auditor Deloitte SA Geneva) appear in the 10-K under a Swiss overlay; disclosure regime is US.

## 6. Sufficiency Verdict

- **Verdict:** **Partial**
- **Reason:** Audited multi-year filings (FY2025 10-K, Q1 FY2026 10-Q) plus a transcript let management track record, the capital-allocation scorecard, related-party/leakage, and control structure be assessed in full — but the 2026 proxy/DEF 14A is absent, so compensation metrics, the beneficial-ownership table, formal board independence, and insider-transaction data cannot be assessed.
- **Specialists that can run:** 01 Management track record — YES; 02 Capital allocation — YES; 03 Incentives/compensation — LIMITED (cap); 04 Ownership/insider — LIMITED (cap); 05 Board/shareholder rights — LIMITED (cap); 06 Candor/disclosure — YES, LIMITED (cap).
- **Hard disqualifier already flagged by business-model/01_disqualifier-scan?** To be confirmed by the current-run scan (do not import prior runs silently).
- **Active partial-data caps:** Incentive alignment max 50; Overall usefulness max 70; Shareholder friendliness max 60; Disclosure candor max 65; board read capped. Capital-allocation cap (max 65) does NOT bind.
- **Critical missing items:** 2026 DEF 14A (CD&A, beneficial-ownership table, board independence, Item 13 director RPT, Item 14 audit fees); insider-transaction data; 8-K Item 5.07 AGM voting results (2026 AGM held May 20, 2026).
- **Single highest-value missing document:** the **2026 DEF 14A** — it alone unlocks compensation, ownership, board independence, director RPT, audit fees, and (via the related 8-K) AGM voting, lifting four of the five caps at once.