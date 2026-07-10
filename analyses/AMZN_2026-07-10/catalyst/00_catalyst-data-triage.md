# Catalyst Data Triage — AMZN

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | US SEC (NasdaqGS) | Form 10-K (FY2025, filed Feb 6, 2026); Form 10-Q (Q1 2026, filed Apr 30, 2026); Commission File No. 000-22513 [Q1 2026 10-Q, cover page] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | Capital IQ Estimates Consensus tab, Line 15: "Acctg. Standard: US GAAP"; Q1 2026 10-Q, cover page |
| Reporting currency (and fiscal year-end) | USD; fiscal year ends December 31 | FY2025 Annual Report (10-K), filed Feb 6, 2026; Q1 2026 10-Q: "For the quarterly period ended March 31, 2026" |
| Document language(s) | English | All pool documents in English; no non-English filing present |

All downstream agents should use US SEC document equivalents: 10-K (annual), 10-Q (quarterly), 8-K (material event), DEF 14A (proxy). No non-US document-equivalence mapping is required.

## Language is not a data gap (CLAUDE.md §27)

All pool documents are in English. No language-related data gap applies to this run.

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | **Y** | Q2 2026 earnings release: **July 31, 2026** (21 days from today). Q2 2026 guidance issued: revenue $194–199B; operating income $20–24B. Consensus: revenue $195.8B, EBIT $23.4B, EPS $1.81. | Capital IQ Estimates, Consensus tab, Line 17: "FQ2 2026 Earnings Release Date: Jul-31-2026"; Q1 2026 10-Q (filed Apr 30, 2026); earnings/04_guidance-consensus.md |
| Debt maturity / refinancing date | **Y — low urgency near-term; notable 2028 wall** | 2026 remainder: ~$2,752M in 2021 Notes maturing (1.00%–3.25% tranche). 2027: ~$8,832M in multi-tranche notes. Largest single maturity year: 2028 (~$11.9B estimated principal). WAM of entire portfolio: 14.2 years. Amazon issued $37.0B USD notes and €14.5B (~$16.8B) Euro notes in March 2026 — all maturing 2028+. No imminent refinancing pressure. | Q1 2026 10-Q, Note 5 (Debt, pp.17–18); FY2025 10-K, Note 6 maturity schedule; Capital IQ Capital Structure Details tab; balance-sheet-survival/02_maturity-wall-and-refinancing.md |
| AGM / EGM / record date | **Y — already completed** | 2026 Annual Meeting of Shareholders held **May 20, 2026** (past event). 11 director nominees stood (Keith Alexander did not stand for re-election). Say-on-pay: ~94% for / ~6% against. No outstanding proxy-contested votes. Next AGM expected May 2027 (not yet scheduled). | management-governance/03_incentives-and-compensation.md citing Web: Amazon 2026 8-K, May 2026 (web-sourced, unverified); management-governance/05_board-and-shareholder-rights.md; management-governance/04_ownership-and-insider-behavior.md |
| Scheduled regulatory / legal decision | **Y — ongoing, no hard dates** | FTC antitrust investigation into fulfillment network practices and Prime remains open. EU Digital Markets Act gatekeeper obligations are active. No specific hearing date or decision deadline is disclosed in pool documents. Globalstar acquisition regulatory approval required; expected close in **2027** per the merger agreement (Q1 2026 10-Q, Note 7). | Q1 2026 10-Q, Note 7 (Globalstar merger agreement: "expected to close in 2027, subject to regulatory approvals"); business-model/10_external-dependency.md (FTC/EU regulatory risk); FY2024 10-K, Item 1A |
| Policy / government decision date | **Y — live, no fixed date** | Tariff and trade policy: US tariff escalation on Chinese-origin goods is an active risk affecting 3P seller economics and advertising. No fixed decision date. Management cited "tariff and trade policies" explicitly in Q1 2026 forward-looking caveat. Not a scheduled calendar event. | Q1 2026 Earnings Call, Apr 29, 2026 (CFO forward-looking statement); FY2025 10-K, Risk Factors (tariff language); business-model/10_external-dependency.md |
| Operational event (launch / commissioning / contract) | **Y — dated** | (1) **Amazon Leo commercial service: Q3 2026** (July–September). CFO stated "Amazon Leo's commercial service is on track to launch in Q3, and we expect to begin capitalizing certain costs in Q4." (2) **Prime Day: Q2 2026 (June 2026)** in most large geographies including the US — management stated "Prime Day will take place in most countries in June." Prime Day in Q3 for Australia, Brazil, India, Japan. | Q1 2026 Earnings Call, Apr 29, 2026, CFO prepared remarks (Leo Q3 launch; Prime Day June); Q1 2026 10-Q, Note 4 (Leo cost discussion) |
| Capital-return event (dividend / buyback) | **Y — authorization exists; execution dormant** | Buyback: $10B program authorized March 2022; $6.1B remaining unused as of December 31, 2025. No buybacks in FY2023, FY2024, or FY2025. No dividend ever paid. No new capital-return announcement visible in the pool. | FY2025 10-K, Note 8 (Stock Repurchase Activity, p.62): "$6.1 billion remaining under the repurchase program"; management-governance/02_capital-allocation-scorecard.md |
| Market-structure event (index review / lock-up) | **N** | No index review, lock-up expiry, or material share-count event visible in pool or upstream modules. AMZN is already a large-cap S&P 500 and Nasdaq-100 constituent. No ADR or listing change flagged. | Pool review; no disclosure in 10-Q or 10-K; management-governance module does not flag any pending market-structure event |

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | **Y** — full suite present (`00` through `99` plus dossier) | Q2 2026 earnings event on July 31, 2026 (proven date); guidance vs consensus setup; beat/miss scenario triggers; Q3 2026 guidance to be issued at Q2 print |
| balance-sheet-survival | **Y** — full suite present (`00` through `99` plus dossier) | Near-term 2026 maturity ($2.75B — manageable); 2027 maturity ($8.8B — manageable given $140B+ liquid assets); no refinancing distress catalyst; March 2026 $54B issuance already completed |
| management-governance | **Y** — full suite present (`00` through `99` plus dossier, source log, red flags CSV) | AGM already completed (May 20, 2026); buyback dormancy and the $6.1B unused authorization as a potential future capital-return catalyst; succession plan confirmed; no activist involvement flagged |
| valuation | **Y** — full suite present (`00` through `99`) | Reverse-DCF implies 16.4% NOPAT CAGR priced in; re-rating trigger if AWS growth sustains above 28% or FCF trajectory normalizes earlier than expected; downside if growth disappoints the implied 16.4% bar |
| business-model | **Y** — full suite present (`00` through `99`) | Leo commercial launch (Q3 2026) as an operational catalyst; tariff/trade policy as a regulatory catalyst; FTC/EU antitrust as a regulatory risk catalyst; Globalstar acquisition (close expected 2027) |

All five cross-module inputs are present. No standalone raw-data only constraint applies. Overall usefulness cap from MODULE_RULES (max 75 when modules absent) does not apply.

## 3. Triage Verdict

**Sufficient**

The calendar has multiple dated, evidenced forward-looking events within the next 12 months:

1. **Q2 2026 earnings release: July 31, 2026 (21 days out)** — proven date, confirmed in the Capital IQ Estimates workbook. This is the most imminent catalyst and the highest-information event. The setup is asymmetric: consensus EBIT at $23.4B sits at the 86th percentile of management's own $20–24B guidance range. A miss toward the guidance floor is as possible as a beat above the range top. Both triggers are evidenced.

2. **Amazon Leo commercial service launch: Q3 2026** — management-committed date from CFO prepared remarks on April 29, 2026. The company incurs ~$1B year-over-year cost in Q2 from Leo satellite manufacturing; capitalization begins in Q4. The Q3 launch itself is an operational milestone with revenue backlog already committed from Delta Airlines, JetBlue, AT&T, Vodafone, and others. Bullish trigger: launches on schedule and initial customer take-up reported in Q3 earnings. Bearish trigger: delays, cost overruns, or regulatory block.

3. **Prime Day: June 2026 (Q2 2026)** — management-confirmed in the Q1 2026 call. This is a revenue and advertising demand event embedded in Q2 guidance. The Q2 earnings print on July 31 will reveal whether the Prime Day pull-forward delivered the uplift that is in the guidance bar.

4. **Debt maturity: ~$2.75B in 2026 (no distress catalyst)** — a scheduled maturity but not a stress event. The balance-sheet module confirms $140B+ in liquid assets against $11.6B in 2026–2027 combined maturities. This is a routine maturity, not a refinancing catalyst.

5. **Q3 2026 earnings guidance (to be issued July 31)** — the market will use the Q3 2026 operating income guide as a window into the holiday ramp and the trajectory of Leo capitalization beginning Q4. A soft Q3 guide would be a material bearish catalyst even on a clean Q2 print.

The calendar will carry **proven dates** (Q2 earnings July 31, Leo Q3 launch, Prime Day June) alongside vague windows (regulatory, tariff, buyback reactivation). The thematic story is well-supported by evidenced events. The overall verdict is Sufficient because there are at least two material dated catalysts with clear two-sided triggers within six months, and all five upstream modules are available to feed further detail to the calendar agent.
