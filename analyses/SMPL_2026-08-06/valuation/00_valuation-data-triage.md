# Valuation Data Triage — SMPL

## 1. File Inventory

Extraction ran clean: `_pool_extracts/manifest.md` reports 11 workbook(s) → 54 tab(s); 65 extract file(s); **0 failures**. Every multi-tab workbook below is listed tab-by-tab, reconciled against the manifest.

| Filename | Type | Period Covered (from inside doc) | Last Modified (file mtime) | Valuation Relevance |
|---|---|---|---|---|
| Annual Report on Form 10-K_2025.pdf | Annual filing (10-K) | FY2025, fiscal year ended Aug 30, 2025 (filed ~Oct 28, 2025) | 2026-08-06 | High |
| The_Simply_Good_Foods_Company_-_Form_10-K(Oct-28-2025).doc (mhtml) | Annual filing (10-K), duplicate export | FY2025, fiscal year ended Aug 30, 2025 | 2026-08-06 | High (duplicate of above) |
| The_Simply_Good_Foods_Company_-_Form_10-Q(Jul-09-2026).doc (mhtml) | Quarterly filing (10-Q) | FQ3 FY2026, quarter ended May 30, 2026 (filed Jul 9, 2026) | 2026-08-06 | High — most recent quarterly filing; carries the Q3 FY26 goodwill/intangible impairment |
| The_Simply_Good_Foods_Company_-_Form_10-Q(Apr-09-2026).doc (mhtml) | Quarterly filing (10-Q) | FQ2 FY2026, quarter ended Mar 1, 2026 (filed Apr 9, 2026) | 2026-08-06 | Medium — superseded by Jul-09 10-Q for balance sheet, useful for trend |
| Annual Meeting Proxy Statement_2026.pdf | Proxy / governance | FY2026 AGM notice | 2026-08-06 | Medium — share count / ownership context, not a primary valuation input |
| The Simply Good Foods Company, Q3 2026 Earnings Call, Jul 09, 2026.rtf | Transcript | FQ3 FY2026 (quarter ended May 30, 2026), call held Jul 9, 2026 | 2026-07-24 | Medium-High — most recent management guidance/commentary |
| The Simply Good Foods Company, Q2 2026 Earnings Call, Apr 09, 2026.rtf | Transcript | FQ2 FY2026 (quarter ended Mar 1, 2026), call held Apr 9, 2026 | 2026-06-25 | Medium |
| **Company Comparable Analysis The Simply Good Foods Company.xls** — tab: Financial Data | Peer/comps export (workbook tab) | As-of 2026-07-24; LTM/NTM figures for SMPL + 10 peers | 2026-07-24 | High — peer market cap, EV, LTM/NTM revenue/EBITDA/EPS |
| " — tab: Trading Multiples | Peer/comps export (workbook tab) | As-of 2026-07-24 | 2026-07-24 | High — LTM & NTM TEV/Rev, TEV/EBITDA, TEV/EBIT, P/E, P/TangBV for SMPL + 10 named peers |
| " — tab: Operating Statistics | Peer/comps export (workbook tab) | As-of 2026-07-24 | 2026-07-24 | Medium |
| " — tab: Business Description | Peer/comps export (workbook tab) | As-of 2026-07-24 | 2026-07-24 | Low |
| " — tab: Implied Valuation | Peer/comps export (workbook tab) | As-of 2026-07-24 | 2026-07-24 | High — CIQ's own implied-valuation output, useful cross-check |
| " — tab: Valuation Chart | Peer/comps export (workbook tab) | As-of 2026-07-24 | 2026-07-24 | Low |
| " — tab: Credit Health Panel | Peer/comps export (workbook tab) | As-of 2026-07-24 | 2026-07-24 | Low (solvency-module territory) |
| " — tab: Disclaimer | Peer/comps export (workbook tab) | — | 2026-07-24 | None |
| **The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls** — tab: Key Stats | Annual financials export (workbook tab) | FY2017–FY2025A, LTM May-30-2026, FY2026E | 2026-07-24 | High — current price ($10.28 as of extract date), shares out, market cap |
| " — tab: Income Statement | Annual financials export (workbook tab) | FY2017–FY2025A, LTM May-30-2026 | 2026-07-24 | High — revenue/EBITDA/EBIT/EPS base |
| " — tab: Balance Sheet | Annual financials export (workbook tab) | FY2017–FY2025A, LTM May-30-2026 | 2026-07-24 | High — capital structure |
| " — tab: Cash Flow | Annual financials export (workbook tab) | FY2017–FY2025A, LTM May-30-2026 | 2026-07-24 | High — CFO/capex for FCF |
| " — tab: Multiples | Annual financials export (workbook tab) | FY2017–FY2025A, LTM | 2026-07-24 | High — own-history multiple band |
| " — tab: Historical Capitalization | Annual financials export (workbook tab) | Quarterly, 2017-08 to 2026-05 | 2026-07-24 | High — historical share price, shares out, EV/TEV, book value time series |
| " — tab: Capital Structure Summary | Annual financials export (workbook tab) | FY2017–FY2025A, 3-mo May-30-2026 | 2026-07-24 | High — debt/equity mix |
| " — tab: Capital Structure Details | Annual financials export (workbook tab) | Current | 2026-07-24 | Medium |
| " — tab: Ratios | Annual financials export (workbook tab) | FY2017–FY2025A, LTM | 2026-07-24 | Medium |
| " — tab: Supplemental | Annual financials export (workbook tab) | FY2017–FY2025A, LTM | 2026-07-24 | Low |
| " — tab: Industry Specific | Annual financials export (workbook tab) | Current | 2026-07-24 | Low |
| " — tab: Pension OPEB | Annual financials export (workbook tab) | Current | 2026-07-24 | Low (not material — SMPL has no material pension) |
| " — tab: Segments | Annual financials export (workbook tab) | FY2017–FY2025A | 2026-07-24 | Medium — confirms single ASC 280 reportable segment, consolidated only |
| **The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls** — tab: Key Stats | Quarterly financials export (workbook tab) | Quarterly series through FQ3 FY2026 | 2026-07-24 | High — LTM build |
| " — tab: Income Statement | Quarterly financials export (workbook tab) | Quarterly series through FQ3 FY2026 | 2026-07-24 | High |
| " — tab: Balance Sheet | Quarterly financials export (workbook tab) | Quarterly series through FQ3 FY2026 | 2026-07-24 | High |
| " — tab: Cash Flow | Quarterly financials export (workbook tab) | Quarterly series through FQ3 FY2026 | 2026-07-24 | High |
| " — tab: Multiples | Quarterly financials export (workbook tab) | Quarterly series through FQ3 FY2026 | 2026-07-24 | High |
| " — tab: Historical Capitalization | Quarterly financials export (workbook tab) | Quarterly, 2017-08 to 2026-05 | 2026-07-24 | Medium (duplicate series of Annual workbook tab) |
| " — tab: Capital Structure Summary | Quarterly financials export (workbook tab) | Quarterly series | 2026-07-24 | High |
| " — tab: Capital Structure Details | Quarterly financials export (workbook tab) | Current | 2026-07-24 | Medium |
| " — tab: Ratios | Quarterly financials export (workbook tab) | Quarterly series | 2026-07-24 | Medium |
| " — tab: Supplemental | Quarterly financials export (workbook tab) | Quarterly series | 2026-07-24 | Low |
| " — tab: Industry Specific | Quarterly financials export (workbook tab) | Current | 2026-07-24 | Low |
| " — tab: Pension OPEB | Quarterly financials export (workbook tab) | Current | 2026-07-24 | Low |
| " — tab: Segments | Quarterly financials export (workbook tab) | Quarterly series | 2026-07-24 | Medium |
| **TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls** — tab: Consensus | Consensus/estimate export (workbook tab) | Target price / EPS / revenue / EBITDA estimates, FY2026E onward; "as of" data current to run window | 2026-08-06 | High — target price $14.88 mean, 8 estimates, current price $11.34/$11.33 embedded |
| " — tab: Recent Changes | Consensus/estimate export (workbook tab) | Recent estimate revisions | 2026-08-06 | Medium |
| " — tab: Guidance | Consensus/estimate export (workbook tab) | Company guidance ranges (revenue/EBITDA) | 2026-08-06 | High — company-issued guidance ranges |
| " — tab: Multiples | Consensus/estimate export (workbook tab) | NTM through FY2033/CY2032 forward multiples | 2026-08-06 | High — long-range forward multiple curve |
| " — tab: Surprise | Consensus/estimate export (workbook tab) | Historical estimate beats/misses | 2026-08-06 | Low-Medium |
| " — tab: Trends | Consensus/estimate export (workbook tab) | Estimate trend history | 2026-08-06 | Low-Medium |
| " — tab: Revisions | Consensus/estimate export (workbook tab) | Estimate revision history | 2026-08-06 | Low-Medium |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf | Current-price source / company profile (Capital IQ) | **Share price as of Aug-04-2026: $11.33 close / $11.34 last (delayed); holders as of Aug-05-2026** | 2026-08-06 | **High — the freshest pool-verified current price and full EV bridge** |
| The Simply Good Foods Company NasdaqCM SMPL Public Company Profile.rtf | Current-price source / company profile (Capital IQ), duplicate format | Same profile content as the PDF above | 2026-07-24 | High (older-dated duplicate; PDF above is fresher) |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — tab: Summary | Capital-structure/credit export (workbook tab) | Multi-year through LTM | 2026-08-06 | Medium (solvency-module primary; supports net-debt cross-check) |
| " — tab: Financials | Capital-structure/credit export (workbook tab) | Multi-year through LTM | 2026-08-06 | Medium |
| " — tab: Operational Metrics Charts | Capital-structure/credit export (workbook tab) | Chart data | 2026-08-06 | Low |
| " — tab: Solvency Metrics Charts | Capital-structure/credit export (workbook tab) | Chart data | 2026-08-06 | Low |
| " — tab: Liquidity Metrics Charts | Capital-structure/credit export (workbook tab) | Chart data | 2026-08-06 | Low |
| " — tab: Disclaimer | Capital-structure/credit export (workbook tab) | — | 2026-08-06 | None |
| Short_Interest_12m_SMPL.xls — tab: Chart 1 with Data | Other (short interest) | Trailing 12 months | 2026-08-06 | Low |
| " — tab: Attributions | Other | — | 2026-08-06 | None |
| The Simply Good Foods Company NasdaqCM SMPL Customers.xls — tab: Customers | Other (business-model input) | Current | 2026-07-24 | Low (relevant to business-model module, not valuation) |
| The Simply Good Foods Company NasdaqCM SMPL Suppliers.xls — tab: Suppliers | Other (business-model input) | Current | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Events Calendar.xls — tab: Events Calendar | Other (catalyst dates) | Forward calendar | 2026-08-06 | Low-Medium (catalyst dating, not fair-value input) |
| The Simply Good Foods Company NasdaqCM SMPL Key Developments.rtf | Other (news/deal log) | Multi-year news log | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership History.xls — tab: History | Other (ownership) | Multi-year | 2026-08-06 | Low (governance-module territory) |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership Insider Trading.xls — tab: Insider Trading | Other (insider trades) | Multi-year | 2026-08-06 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership Summary.rtf | Other (ownership) | Current | 2026-08-06 | Low |

No documents under `data/SMPL/external/`. No `ciq_facts.json` sidecar exists in `_pool_extracts/` for this run — vendor workbook figures are cited directly from the tab extracts (each cited with its exact tab name and "as of" date), per the note already carried in `earnings/00_earnings-data-triage.md` and `business-model/03_segment-map.md` for this run.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States (Nasdaq: SMPL, NasdaqCM tier) | 10-K cover page; CIQ profile header "NasdaqCM:SMPL" [Annual Report on Form 10-K_2025.pdf; TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf] |
| Filing regime | US SEC (domestic filer — 10-K / 10-Q / DEF 14A-equivalent proxy) | Filing types and dates on face of documents [Annual Report on Form 10-K_2025.pdf; Form 10-Q(Jul-09-2026).doc; Annual Meeting Proxy Statement_2026.pdf] |
| Reporting standard | US GAAP | Consensus workbook header "Acctg. Standard: US GAAP" [EstimatesReport.xls, Consensus tab]; 10-K consolidated statements prepared under US GAAP conventions [Annual Report on Form 10-K_2025.pdf] |
| Reporting currency (and scale) | USD, reported in millions (per-share items in whole dollars) | "In Millions of the reported currency, except per share items" [Financials_Annual.xls, Income Statement tab header] |
| Fiscal-year end | Last Saturday in August (FY2025 ended Aug 30, 2025; FY2026 will end ~Aug 29, 2026) | "Current Fiscal Year End: Aug-31-2026" [EstimatesReport.xls, Consensus tab]; fiscal period labels "Aug-30-2025" etc. throughout Financials_Annual.xls |
| Document language(s) | English (all documents) | All extracts observed in English; no translation flag required |

No local-equivalent substitution issue arises here — SMPL is a standard US domestic SEC filer, so 10-K/10-Q/proxy are the correct primary documents and are all present.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, from run date 2026-08-06) |
|---|---|---|---|
| Annual filing | Annual Report on Form 10-K_2025.pdf | FY2025, fiscal year ended Aug 30, 2025 (filed Oct 28, 2025) | ~9.3 months since FYE; ~9.3 months since filing |
| Quarterly filing | The_Simply_Good_Foods_Company_-_Form_10-Q(Jul-09-2026).doc | FQ3 FY2026, quarter ended May 30, 2026 (filed Jul 9, 2026) | ~2.2 months since quarter-end; ~1 month since filing |
| Capital structure / balance sheet | Financials_Quarterly.xls, Balance Sheet tab (cross-checked to the Jul-09-2026 10-Q) | Quarter ended May 30, 2026 | ~2.2 months |
| Consensus / estimate export | TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls, Consensus tab | Target price $14.88 mean (8 estimates); FY2026E/FY2027E EPS, revenue, EBITDA | Data embedded is current to the run window (file mtime 2026-08-06) |
| Multiples export | Financials_Annual.xls / Financials_Quarterly.xls, Multiples tabs; EstimatesReport.xls, Multiples tab | Own-history LTM through FY2033E/CY2032E forward curve | Current |
| Peer / comps export | Company Comparable Analysis The Simply Good Foods Company.xls, Trading Multiples & Financial Data tabs | As-of 2026-07-24 (10 named peers) | ~0.4 months (13 days) |
| Current price (Capital IQ) | TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf | Close $11.33 as of Aug-04-2026 (Last delayed $11.34) | 2 calendar days (~1-2 trading days) — fresh |
| Cash flow statement | Financials_Quarterly.xls, Cash Flow tab (LTM through May-30-2026); FQ3 FY26 10-Q | LTM ended May 30, 2026 | ~2.2 months |
| Segment data | Financials_Annual.xls, Segments tab; FY25 10-K Note 15; business-model/03_segment-map.md | FY2025 (brand-level revenue disaggregation); one GAAP reportable segment | ~9.3 months for the audited brand split; FQ3 FY26 10-Q Note 12 updates it to 9-months-ended May 30, 2026 |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf, close $11.33 as of Aug-04-2026; cross-checked to EstimatesReport.xls Consensus tab "Latest Price/Last Close Price: 11.34/11.33" | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | 10-K, Note on EPS: "Weighted average common shares – diluted 101,510,772" (FY2025); Public Company Profile: Shares Out. 88.46m (current, basic, cover-page count) — both bases present, must be reconciled by `01` | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y | 10-K, Note on stock-based compensation and EPS: stock options, RSUs, PSUs, treasury-stock-method language and options-outstanding table as of Aug 30, 2025 | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y — Operating (packaged/branded consumer nutrition) | 10-K business description; CIQ profile "Packaged Foods and Meats" industry classification | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | Y | Financials_Annual.xls / Financials_Quarterly.xls, Capital Structure Summary & Balance Sheet tabs; Public Company Profile EV bridge (Cash $123.88m, Total Debt $448.46m, no pref/minority) | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Financials_Annual.xls, Income Statement tab (FY2017–FY2025A + LTM May-30-2026); FY25 10-K; FQ3 FY26 10-Q | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Financials_Annual.xls / Financials_Quarterly.xls, Cash Flow tabs (LTM through May-30-2026); FY25 10-K; FQ3 FY26 10-Q | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | EstimatesReport.xls, Consensus tab (8 analysts, target price $14.88 mean, FY2026E/FY2027E EPS/revenue/EBITDA); Guidance tab (company-issued ranges) | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | Financials_Annual.xls / Financials_Quarterly.xls, Multiples tabs (FY2017–FY2025A + LTM); Historical Capitalization tab (quarterly share price/EV series back to 2017) | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis xls (10 named peers: UTZ, JJSF, HAIN, CPB, MZTI, BRBR, CAG, FRPT, KHC, JBSS), Trading Multiples & Financial Data tabs, as-of 2026-07-24 | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Partial — revenue Y, EBIT N | Financials_Annual.xls Segments tab (one GAAP reportable segment, no brand-level profit); FY25 10-K Note 15; business-model/03_segment-map.md (brand-level revenue disaggregation exists, profit share explicitly "Not disclosed" for every brand) | Sum-of-the-parts — revenue split exists but no segment/brand profit metric is disclosed anywhere in the pool |
| Dividend / buyback data | Y | Public Company Profile: "Dividend Yield % —" (no dividend); Financials_Annual.xls Cash Flow tab carries buyback/repurchase lines; FY25 10-K discloses share-repurchase program | Shareholder-yield read (SMPL pays no dividend; buybacks disclosed) |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/03_segment-map.md | Y |
| business-model/08_competitive-map.md | Y |
| business-model/07_business-quality.md | Y |
| business-model/09_moat.md | Y |
| business-model/10_external-dependency.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/04_guidance-consensus.md | Y |
| earnings/03_margin-drivers.md | Y |
| earnings/07_earnings-sensitivity.md | Y |
| earnings/06_earnings-quality.md | Y |

All ten upstream business-model and earnings outputs exist in this run root. Management-governance module outputs are also complete (`management-governance/99_management-governance-synthesis.md`) and confirm the §24 Filter 6 unaligned-owner test is **not triggered** (RF-OWN-004 = Not Applicable — no government, parent, or conglomerate control; largest holder BlackRock at ~14.8%, passive) [management-governance/04_ownership-and-insider-behavior.md, finding 04-012; 99_management-governance-synthesis.md]. This means the value-trap score cap tied to a misaligned controlling owner does not apply here, subject to the downstream valuation agents' own confirmation.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — a pool-verified Capital IQ price ($11.33 close, Aug-04-2026, ~2 calendar days old) exists | 01, 05, 07, 99 | Not applicable |
| No consensus / forward estimates | N — 8-analyst consensus with target price, FY2026E/FY2027E EPS/revenue/EBITDA, and a company guidance range all present | 02, 03, 04, 05 | Not applicable |
| No peer data | N — 10 named peers with LTM and NTM multiples as of 2026-07-24 | 03, 06 | Not applicable |
| No segment-level data | **Y (partial)** — brand-level revenue exists but brand-level profit/EBIT is explicitly not disclosed anywhere in the pool (one GAAP reportable segment; "Profit Share... Not disclosed" for every brand) | 06 | SOTP cannot be built on a genuine segment-EBIT × comparable-multiple basis; `06` should return the "single-segment — SOTP collapses to the consolidated read" note per the Segment/SOTP Rule (>85% of the one GAAP reportable segment is automatic here), while still flagging the brand-mix dispersion (Quest growing, Atkins in structural decline, OWYN newly acquired and lower-margin) as a qualitative read, not a quantified SOTP input |
| No balance sheet / capital structure | N — full balance sheet and capital-structure detail through FQ3 FY2026 (May 30, 2026) present | 01, 04, 06 | Not applicable |
| No cash flow statement | N — annual (FY2017–FY2025) and quarterly (through FQ3 FY2026) cash flow statements present | 04 | Not applicable |

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Financials_Annual.xls / Financials_Quarterly.xls Multiples tabs give an LTM-through-FY2025 own-history band, plus a Historical Capitalization series of quarterly share price/EV back to 2017 — but note LTM EPS/margins are distorted by the FQ3 FY2026 goodwill/intangible impairment (net loss of $198.8m LTM per Cash Flow tab "Net Income" row), so downstream agents must reconcile GAAP LTM multiples against CIQ's "Normalized Net Income" line (LTM $110.1m) and flag which basis each multiple uses |
| Peer relative valuation | Y | None | 10 named packaged-food peers (UTZ, JJSF, HAIN, CPB, MZTI, BRBR, CAG, FRPT, KHC, JBSS) with LTM and NTM TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E, P/TangBV, as-of 2026-07-24 |
| Intrinsic DCF (Operating FCFF) | Y | None | Full annual and quarterly cash flow statements (CFO, capex) support a `CFO − total capex` FCFF build; forward consensus (through FY2027E, and CIQ's own forward-multiple curve through FY2033/CY2032) supports a multi-year forecast path |
| Reverse DCF | Y (conditional on `04` running first per Calculation Standard 9) | None outright, but depends on `04`'s output existing | Pool-verified price and full cash-flow base support solving for implied growth once `04` sets the base-case WACC/horizon/FCF base |
| SOTP | **N** | No brand-level (or segment-level) profit/EBIT disclosure anywhere in the pool — SMPL reports one GAAP reportable segment; brand revenue is disclosed but brand profit is explicitly "Not disclosed" [business-model/03_segment-map.md] | Per the Segment/SOTP Rule, `06` should record "single-segment — SOTP collapses to the consolidated read" rather than fabricating brand-level margins; a qualitative brand-mix discussion (Quest growing/dominant, Atkins declining, OWYN newly integrated and lower-margin) can still inform the multiples/DCF forecast path even though it cannot feed a quantified SOTP |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A usable LTM/FY earnings and cash-flow base, full capital-structure data (balance sheet, debt schedule, no preferred/minority), a pool-verified current price (Capital IQ, $11.33 close as of Aug-04-2026, ~2 days old), an 8-analyst forward consensus with company guidance, and a 10-name peer comp set with LTM/NTM multiples are all present — clearing both the "usable earnings/cash-flow base" and "at least one forward-looking or relative input" legs of the Sufficient rule with a pool-verified price on top.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (Operating FCFF), reverse-DCF (once `04` runs). SOTP does not run as a quantified method — SMPL is a single GAAP reportable segment with no brand-level profit disclosure; `06` should log the single-segment collapse note rather than force a fabricated breakup.
- **Active partial-data caps:** None triggered from the Score-Cap Rules table — no-price, no-consensus, no-peer-data, no-balance-sheet, and no-cash-flow caps all fail to apply because each underlying input is present. The only structural limitation is SOTP non-readiness (Segment/SOTP Rule — "SOTP not possible for a multi-segment business" cap does not apply either, since SMPL is not a multi-segment business under GAAP; `06`'s output caps Overall usefulness at 80 only if it were a multi-segment business forced to skip SOTP, which is not the case here — flagged for `99` to confirm at synthesis time).
- **Critical missing items:** None blocking. One flag for downstream agents: LTM GAAP net income (−$198.8m) and diluted EPS (−$2.08) are impairment-distorted by the Q3 FY2026 goodwill and Atkins/OWYN intangible impairments triggered by the share-price decline [FQ3 FY26 10-Q, Impairment notes]; agents building multiples or a DCF FCF base off "reported" earnings must state whether they are using GAAP-reported or CIQ-normalized figures (Normalized Net Income LTM $110.1m) per CLAUDE.md §15's reported-vs-adjusted separation requirement, and must not silently mix the two.
