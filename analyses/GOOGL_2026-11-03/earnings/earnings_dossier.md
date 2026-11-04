# earnings Module Dossier — GOOGL

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `earnings_memo.md`.

- Generated: 2026-11-03T12:34:31Z
- Module folder: `earnings`
- Contents: 1 module synthesis + 9 specialist outputs = 10 files

## Table of Contents

- [earnings — module synthesis](#earnings-module-synthesis) — `99_earnings-synthesis.md`
- [earnings / 00_earnings-data-triage.md](#earnings-00-earnings-data-triage-md) — `00_earnings-data-triage.md`
- [earnings / 01_historical-financials.md](#earnings-01-historical-financials-md) — `01_historical-financials.md`
- [earnings / 02_revenue-drivers.md](#earnings-02-revenue-drivers-md) — `02_revenue-drivers.md`
- [earnings / 03_margin-drivers.md](#earnings-03-margin-drivers-md) — `03_margin-drivers.md`
- [earnings / 04_guidance-consensus.md](#earnings-04-guidance-consensus-md) — `04_guidance-consensus.md`
- [earnings / 05_beat-miss-setup.md](#earnings-05-beat-miss-setup-md) — `05_beat-miss-setup.md`
- [earnings / 06_earnings-quality.md](#earnings-06-earnings-quality-md) — `06_earnings-quality.md`
- [earnings / 07_earnings-sensitivity.md](#earnings-07-earnings-sensitivity-md) — `07_earnings-sensitivity.md`
- [earnings / 08_earnings-red-flags.md](#earnings-08-earnings-red-flags-md) — `08_earnings-red-flags.md`


---

## earnings — module synthesis

_Source: `99_earnings-synthesis.md`_

# Earnings Module — GOOGL (Synthesis)

## Abstract

Alphabet's earnings setup is mixed: revenue is accelerating, but operating margin, GAAP EPS, and free cash flow do not point in the same direction. Cloud supplied 15.20 points of Q3's 24.65% growth (0.00-point bridge residual); Search remains the largest earnings lever. The Q4 revenue bar is demanding at $142.319 billion, requiring 25.0% year-on-year growth as revenue estimates rise and profit estimates fall. The risk is that AI-capacity costs and a harder Search comparison prevent that growth from converting into operating profit; TTM free cash flow fell to $19.747 billion. The verdict is Mixed earnings setup, with the next quarter favoring a miss. [Q3 FY2026 Form 10-Q, Item 2; Capital IQ Estimates Report, FQ4 2026, frozen snapshot 2026-11-03]

## 1. Earnings Verdict

- **Verdict:** Mixed earnings setup
- **Earnings clarity /100:** 66 — the primary data are complete, but Cloud's 103% growth is not split among recurring consumption, TPU-system sales, or acquired revenue, and the main operating sensitivities are inferred. [Q3 FY2026 Form 10-Q, Item 2—Google Cloud; 07_earnings-sensitivity, §§2 and 7]
- **Earnings quality /100:** 68 — from `06_earnings-quality`; operating cash conversion is intact, but GAAP profit is distorted by investment gains and free cash flow after total capex has fallen sharply.
- **Consensus setup /100 (higher = more beatable):** 35 — the Q4 revenue bar requires 25.0% year-on-year growth after upward revenue revisions, despite a harder Search comparison and greater FX pressure. [Capital IQ Estimates Report, FQ4 2026 Consensus and Trends, frozen snapshot 2026-11-03; Q3 FY2026 earnings call, prepared remarks]
- **Earnings volatility /100 (higher = worse; inverted):** 57 — from `07_earnings-sensitivity`; confidence in the operating-impact estimates is Low.
- **Data quality /100:** 90 — the frozen pool has the latest filing, cash-flow statement, segment P&L, verbatim transcript, consensus, and revision history, with zero extraction failures. [Frozen generation manifest, 2026-11-03; 00_earnings-data-triage, §§1–5]
- **Overall usefulness /100:** 80 — the module establishes the direction conflict and the next-print tests, while leaving the Cloud mix and incremental margin unresolved.
- **Next-quarter setup:** Favors miss
- **Biggest earnings driver:** In the fully reconciled reported-category bridge, Cloud conversion drove 15.20 percentage points, or 61.6%, of Q3's 24.65% revenue growth; the residual was 0.00pp, but the split among recurring consumption, TPU systems, and acquired revenue is not disclosed. [Q3 FY2026 Form 10-Q, Item 2—Revenue by type and Google Cloud]
- **Biggest earnings risk:** Q4 must clear $142.319 billion of revenue, or 25.0% year-on-year growth, while Search faces a tougher comparison and AI-capacity costs weigh on profit conversion. [Capital IQ Estimates Report, FQ4 2026 Consensus; Q3 FY2026 earnings call, prepared remarks]
- **Earnings red-flag severity verdict:** Material concerns

## 1A. Module Disconfirmation

- **Strongest bear point:** The Q4 revenue bar requires 25.0% year-on-year growth while management expects a larger FX drag, a harder Search comparison, and near-term Cloud-margin pressure. [Capital IQ Estimates Report, FQ4 2026 Consensus; Q3 FY2026 earnings call, prepared remarks]
- **Strongest bull point:** Q3 revenue rose 24.7%, Cloud revenue rose 103% to $30.709 billion, and TTM cash from operations remained 96.8% of calculated EBITDA. [Q3 FY2026 Form 10-Q, Item 2—Google Cloud; CIQ Financials, LTM ended 2026-09-30]
- **Single killer risk:** Capacity cost arrives before usable demand: nine-month capex rose to $132.0 billion from $63.6 billion and depreciation rose to $22.0 billion from $15.1 billion, while backlog recognition still depends on delivery and customer use. [Q3 FY2026 Form 10-Q, Item 2—Capital Expenditures and Leases; Note 1—Revenue Backlog]
- **Disconfirming evidence already visible:** The cautious verdict is challenged by Q3's 129bp year-on-year EBIT-margin gain, but 241bp came from G&A, mainly the absence of the prior-year EC fine accrual, while R&D intensity cost 137bp; the accounting bridge residual was 0.01bp. [Q3 FY2026 Form 10-Q, Item 2—R&D and G&A; 03_margin-drivers, §7]

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| earnings-data-triage | Sufficient | All core filings, quarterly history, cash flow, segment P&L, verbatim transcript, consensus, revisions, and current price are available; no named data cap applies. [00_earnings-data-triage, §§3–6] |
| historical-financials | Revenue accelerating; margins volatile; cash intensity worsening | TTM revenue grew 22.2% and calculated EBITDA grew 29.1%, but CFO-minus-total-capex free cash flow fell 73.2% to $19.747 billion. [01_historical-financials, §§2 and 6] |
| revenue-drivers | Search is the largest recurring revenue sensitivity; Cloud drove the latest acceleration | Cloud supplied 15.20 percentage points of Q3's 24.65% revenue growth in a bridge with a 0.00pp residual, while Search was 49.7% of Q3 revenue. [02_revenue-drivers, §§6–7] |
| margin-drivers | Margins: AI technical-infrastructure cost (Headwind) | Q3 EBIT margin rose 129bp in a bridge with a 0.01bp residual, but a 241bp G&A comparison, mainly the prior-year EC fine accrual, more than offset a 137bp R&D-intensity drag. [03_margin-drivers, §§7–8] |
| guidance-consensus | Bar is high | Q4 consensus of $142.319 billion requires 25.0% revenue growth; revenue estimates rose while GAAP EPS estimates and revision breadth fell. [04_guidance-consensus, §§4–7] |
| beat-miss-setup | Setup favors miss | A beat requires timely Cloud and TPU delivery plus resilient Search despite FX and comparison pressure; any one weak link can cause a miss. [05_beat-miss-setup, §§2–3 and 8] |
| earnings-quality | 68/100 — Mostly clean but some working-capital or adjustment noise | Cash from operations remains backed by operating earnings, but 9M equity-security gains of $127.282 billion distort GAAP EPS and TTM free cash flow fell to $19.747 billion. [06_earnings-quality, §§2, 5, 9–10] |
| earnings-sensitivity | 57/100 — higher = worse; Low confidence | Search is the largest recurring lever: a 10% revenue move maps to a static $2.576 billion EBIT move, but that is inference using the current Services margin. [07_earnings-sensitivity, §§2, 4 and 7] |
| earnings-red-flags | Material concerns | Fourteen flags fired, including six classified High; revenue acceleration, reported margin, GAAP EPS, and free cash flow give conflicting signals. [08_earnings-red-flags, §§3–6] |

## 3. Reconciliation

1. **Transcript availability:** `03_margin-drivers` said the Q3 call text was unavailable, while triage, revenue, guidance, and beat/miss agents identified and used a verbatim transcript. The reconciled view follows the broader evidence map: the transcript is available for forward cost and timing commentary; the filing remains authoritative for reported margin arithmetic. [00_earnings-data-triage, §2; 03_margin-drivers, §1; 08_earnings-red-flags, §1]
2. **Net debt definition:** The filing-based measure is $69.784 billion of strict net debt—debt less cash equivalents—while Capital IQ reports $114.767 billion of broad-basis net cash after netting marketable securities against lease-inclusive vendor debt. These are different definitions; this report uses the strict filing basis and never treats them as interchangeable. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 6; CIQ facts sidecar, `net_debt_m`, 2026-09-30]
3. **Q3 diluted EPS:** `01_historical-financials` shows vendor EPS of $2.14, while the filed Q3 result is $2.12. The filing wins under the source hierarchy; Section 6 uses $2.12 and treats the vendor difference as a source-definition or rounding conflict. [Q3 FY2026 Form 10-Q, Item 2—Executive Overview; CIQ Financials, Q3 FY2026]
4. **Direction of earnings:** Historical revenue and calculated EBITDA are accelerating, but the red-flag agent rejects a clean acceleration label because the margin comparison includes a prior-year fine, GAAP EPS includes large investment gains, and free cash flow fell. These measures are not averaged: the operating direction is adjudicated as mixed. [01_historical-financials, §6; 06_earnings-quality, §10; 08_earnings-red-flags, §2.10]

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No quarterly data | N | Earnings clarity | max 60 not applied |
| No consensus / estimate data | N | Consensus setup | max 30 not applied |
| No cash flow statement | N | Earnings quality | max 45 not applied |
| No revision history | N | Consensus setup | max 60 not applied |
| No verbatim transcript AND no sell-side proxy | N | Earnings clarity | max 70 not applied |
| Transcript role filled ONLY by a sell-side proxy (no verbatim) | N | Earnings clarity | max 70 not applied |
| No segment-level P&L for a multi-segment business | N | Earnings clarity | max 70 not applied |
| Only inferred sensitivities | Y | Earnings volatility confidence | Low; the disclosed FX sensitivity is an OI&E measure, while the main Search, Cloud, infrastructure, and R&D operating sensitivities are inferred |
| Conflicting sources not reconcilable | N | Overall usefulness | max 65 not applied; the transcript, EPS, and net-debt conflicts are reconciled in Section 3 |

No numeric score cap applies. The only mandatory limitation is Low confidence in the operating sensitivity magnitudes. [07_earnings-sensitivity, §§2 and 7]

## 5. Earnings Setup Summary

### Revenue Setup

The current trajectory is not proven sustainable at Q3's reported pace because Cloud supplied 15.20 percentage points of the 24.65% growth in a reported-category bridge with a 0.00pp residual, yet the company does not split recurring consumption, TPU-system sales, or acquired revenue from Wiz. The single factor that would flip the direction is weaker Cloud conversion: backlog is large, but revenue recognition still depends on delivery and customer use. Search remains the largest absolute revenue lever and its growth already slowed to 12% from 17% in Q2. Reported and underlying organic revenue cannot be reconciled from available disclosure because the Wiz contribution and TPU-system revenue are not quantified; the gap is **not proven from available data**. [Q3 FY2026 Form 10-Q, Item 2—Google Cloud and Acquisitions; Note 1—Revenue Backlog; Q3 FY2026 earnings call, Q&A]

### Margin Setup

Q3's 31.81% EBIT margin is not a clean run-rate peak or trough: the fully reconciled bridge had a 0.01bp residual, and the 129bp year-on-year gain included a 241bp G&A benefit, mainly from the prior-year EC fine accrual, while R&D intensity cost 137bp. Search is the largest 10–20% adverse-move lever; a 10% Search-revenue decline maps to a static $2.576 billion EBIT decline at the current Services margin, but this is inference, not a filed incremental margin. AI infrastructure is the main cost risk because capex, depreciation, R&D, and capacity operating costs are rising before the return is measurable. Alphabet discloses no automatic cost escalator or measured realised recovery rate for these costs; that contractual absence does not mean zero mitigation through pricing, mix, sourcing, or spending choices. [Q3 FY2026 Form 10-Q, Item 2—R&D, G&A, and Capital Expenditures; 07_earnings-sensitivity, §2; business-model/06_value-chain, §2]

### Quality Check

The largest gap between reported and economic earnings widened: equity-security gains rose from $24.1 billion in FY2025 to $127.282 billion in the first nine months of FY2026, of which $116.316 billion was unrealised, so GAAP net income and EPS are not a repeatable operating base. Alphabet does not publish an adjusted earnings measure, so normalized next-year earnings should start from GAAP EBIT and cash from operations, not GAAP net income or a vendor non-GAAP figure; total capex must then be deducted separately because TTM free cash flow fell to $19.747 billion. [FY2025 Form 10-K, Item 7; Q3 FY2026 Form 10-Q, Note 3 and Consolidated Statements of Cash Flows]

### Consensus Bar

A material beat requires Cloud and TPU capacity to convert on time, Search to remain resilient through the harder comparison and FX drag, and the resulting mix to absorb rising infrastructure costs. The revenue bar looks too high rather than too low: $142.319 billion requires 25.0% year-on-year growth, while the GAAP-EPS bar has already been partly reset by a 4.2% one-month estimate cut and 2-up/44-down FY revision breadth. How much consensus is anchored to Q3's 103% Cloud growth or TPU timing is not disclosed, so the one-off or recent-tailwind share cannot be quantified. [Capital IQ Estimates Report, FQ4/FY2026 Consensus, Trends and Revisions, frozen snapshot 2026-11-03; Q3 FY2026 earnings call, prepared remarks]

## 5b. Leverage & Capital Structure

Trigger B fires: strict net debt was $69.784 billion at 30 September 2026 and 0.38x calculated LTM EBITDA, versus $3.512 billion and roughly 0.02x one year earlier; the $66.272 billion increase is more than two times, although the prior-year debt composition comes from the vendor and is not confirmed against that quarter's filing note. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 6; 01_historical-financials, §2] Filing debt rose from $48.543 billion at FY2025 to $126.118 billion at Q3 FY2026, but the specialist reports do not prove one single use of the added debt: they identify the Wiz close and the AI-capacity build, including $132.0 billion of nine-month capex, without allocating the financing between them. [FY2025 Form 10-K, Note 6; Q3 FY2026 Form 10-Q, Note 6 and Item 2—Capital Expenditures] The 0.38x ratio uses calculated GAAP-basis EBITDA—operating income plus depreciation and amortisation—not adjusted EBITDA, so there is no separate adjusted-to-GAAP leverage bridge. Only $1.016 billion of the $126.118 billion filing debt is current, but the upstream reports do not provide the fraction maturing within 24 months or a weighted-average interest rate relative to current market rates; both are **not proven from available data**. No upstream evidence shows that leverage has paused buybacks, constrained dividends, deferred capex, or caused a negative rating action; capital-allocation constraint is therefore **not proven from available data**, and the absolute leverage ratio remains below Trigger A's 3.0x threshold.

## 6. Key Numbers

- **Revenue growth rate:** Q3 revenue was $127.577 billion, up 24.65% year on year; TTM revenue grew 22.2%. [Q3 FY2026 Form 10-Q, Consolidated Statements of Income; CIQ Financials, LTM ended 2026-09-30]
- **EBITDA margin:** Q3 calculated EBITDA margin was 38.66%, and LTM margin was 39%; Alphabet does not report adjusted EBITDA. [CIQ Financials, Q3 and LTM ended 2026-09-30; CIQ facts sidecar, `ltm_ebitda_m` and `margin_trend`]
- **EPS:** Filed Q3 GAAP diluted EPS was $2.12; it is not a clean operating measure because 9M equity-security gains were $127.282 billion. [Q3 FY2026 Form 10-Q, Item 2—Executive Overview; Note 3]
- **CFO / EBITDA:** TTM cash from operations was 96.8% of calculated EBITDA, but CFO-minus-total-capex free cash flow fell to $19.747 billion from $73.552 billion. [CIQ facts sidecar, `ltm_ocf_m` and `ltm_ebitda_m`; CIQ Financials, LTM ended 2026-09-30]
- **Biggest driver current level:** Search was $63.350 billion, or 49.7% of Q3 revenue; Cloud supplied 15.20 percentage points of Q3 growth in a reported-category bridge with a 0.00pp residual. [Q3 FY2026 Form 10-Q, Item 2—Revenue by type]
- **Consensus gap:** There is no numeric company revenue guide; the standalone Q4 consensus is $142.319 billion, requiring 25.0% year-on-year growth. [Capital IQ Estimates Report, FQ4 2026 Consensus; Q3 FY2026 earnings call, prepared remarks]
- **Estimate revision direction:** Q4 revenue rose 1.0% over three months, while Q4 GAAP EPS fell 4.2% in one month; FY2026 EPS breadth was 2 up and 44 down. [Capital IQ Estimates Report, Trends and Revisions, frozen snapshot 2026-11-03]
- **Earnings volatility score:** 57/100, where higher is worse; confidence in the main operating sensitivities is Low. [07_earnings-sensitivity, §7]

## 7. What Would Change The Earnings Verdict?

| Current Verdict | What Would Upgrade It | What Would Downgrade It | Data Needed |
|---|---|---|---|
| Mixed earnings setup | Q4 revenue above $143.742 billion—1% above consensus and 26.3% above Q4 FY2025's $113.828 billion—together with Cloud operating-profit conversion after the stated capacity costs and without a new one-off margin benefit. | Q4 revenue below $140.895 billion—1% below consensus but still 23.8% above Q4 FY2025—or a result near the bar accompanied by weaker Cloud timing, higher depreciation, and lower underlying EBIT conversion. | One company disclosure bridging Cloud revenue and operating profit among recurring consumption, TPU-system sales, and acquired revenue, on the same Q4 basis. |

The 1% thresholds come from the beat/miss specialist's working materiality test; they are judgment, not company guidance or an empirical frequency. [Capital IQ Estimates Report, FQ4 2025–FQ4 2026 Consensus and Surprise; 05_beat-miss-setup, §4]

## 8. Note To The Final Synthesizer

- **Dominant trend and driver:** Revenue is accelerating because Cloud supplied 15.20 percentage points of Q3 growth, but the earnings verdict is mixed because margin quality, GAAP EPS, and free cash flow do not confirm the same direction.
- **Cash quality:** Core operating earnings remain cash-backed at 96.8% TTM CFO/calculated EBITDA; GAAP net income is not clean because 9M equity-security gains were $127.282 billion, mostly unrealised, and TTM free cash flow after total capex fell to $19.747 billion.
- **Consensus bar:** Q4 revenue consensus requires 25.0% growth; revenue estimates rose while GAAP-EPS estimates and revision breadth fell. This is a hard revenue bar with a partly reset profit bar.
- **Next quarter and look-ahead:** The next-quarter setup favors miss. FQ1 FY2027 lacks a proven numeric bar; TPU revenue can ramp, but depreciation, inventory, and capacity costs remain the second-quarter risk.
- **Top sensitivity:** Search is the largest recurring operating lever. The $2.576 billion EBIT impact for a 10% revenue move is static-margin inference and carries Low confidence.
- **Partial-data caps:** No numeric score cap applies. Low confidence in operating sensitivities is mandatory because Search, Cloud, infrastructure, and R&D coefficients are inferred.
- **Biggest missing point:** Alphabet does not split Cloud growth and profit among recurring consumption, TPU-system sales, Wiz, and other acquired revenue.
- **What changes the verdict:** Clean Cloud operating-profit conversion after capacity costs would upgrade it; a revenue miss or in-line revenue with weaker underlying EBIT and Cloud timing would downgrade it.
- **Earnings red-flag severity verdict:** Material concerns.
- **High red flag — margin comparison:** Q3's 129bp EBIT-margin gain is not a clean run-rate improvement because the 241bp G&A benefit mainly reflects the absence of a prior-year EC fine accrual, while R&D intensity cost 137bp; the accounting bridge residual was 0.01bp. [03_margin-drivers, §§7–8]
- **High red flag — AI cost and commitments:** Capex, depreciation, R&D, and maximum-basis infrastructure, inventory, energy, and content commitments are rising before returns are measurable; partial reduction rights mean the commitment disclosure is a bound, not a cash-spending forecast. [08_earnings-red-flags, §2.4; Q3 FY2026 Form 10-Q, Item 2—Purchase Commitments and Other Contractual Obligations]
- **High red flag — revision divergence:** Revenue estimates are rising while EPS estimates and breadth are falling, so faster sales do not imply better profit conversion. [04_guidance-consensus, §§4–5]
- **High red flag — beat conjunction:** A Q4 beat requires timely Cloud and TPU delivery, resilient Search through FX and a harder comparison, and adequate cost absorption at the same time. [05_beat-miss-setup, §§2–3]
- **High red flag — GAAP EPS quality:** Mostly unrealised equity-security gains make GAAP EPS unsuitable as the primary operating test. [06_earnings-quality, §§5 and 10]
- **High red flag — conflicting direction:** Revenue acceleration, reported margin, GAAP EPS, and free cash flow point in different directions; do not shorten this to “earnings accelerating.” [08_earnings-red-flags, §2.10]
- RF-EQ-001 (rising accruals divergent from cash earnings)

## 9. Simple Summary

- Revenue is accelerating, led by Cloud, but the Cloud growth mix is not disclosed.
- Search remains the largest recurring earnings lever.
- The reported margin gain is flattered by a prior-year legal-charge comparison.
- Operating cash conversion is sound; free cash flow after total capex is much lower.
- GAAP EPS is noisy because investment gains are large and mostly unrealised.
- The Q4 revenue bar is hard to beat, so the next-quarter setup favors miss.
- Earnings volatility is moderate, but the operating sensitivity estimates have Low confidence.
- This module is useful for the master synthesizer; no numeric data cap applies, but the verdict must remain mixed.



---

## earnings / 00_earnings-data-triage.md

_Source: `00_earnings-data-triage.md`_

# Earnings Data Triage — GOOGL

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | [Alphabet Form 10-Q, Q3 2026, cover] |
| Exchange | Nasdaq Global Select Market (NasdaqGS:GOOGL) | [Capital IQ Estimates—Consensus, FY2026, header] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | [Alphabet Form 10-Q, Q3 2026, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | [Alphabet Form 10-Q, Q3 2026, Note 1—Basis of Presentation] |
| Reporting currency | USD | [Capital IQ Financials—Quarterly Income Statement, Q3 2026, header] |
| Fiscal-year end | December 31 | [Alphabet Form 10-K, FY2025, cover] |
| Document language(s) | English | [Alphabet Form 10-Q, Q3 2026, cover and financial statements] |

Alphabet files standalone US quarterly reports, so the next interim disclosure is a standalone three-month Form 10-Q, not a cumulative half-year report. The latest available report covers the three months ended September 30, 2026 [Alphabet Form 10-Q, Q3 2026, cover].

## 1. File Inventory

The frozen generation manifest records 27 raw sources, 15 workbooks, 60 separately extracted workbook tabs, 72 extracts, and zero extraction failures. Every raw source is therefore usable for this triage. The `Last Modified` timestamp below is the frozen-snapshot timestamp, not a freshness signal; the period column comes from the document content. No `data/GOOGL/external/` directory is present. [Frozen generation manifest, 2026-11-03, totals and source status]

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| Alphabet Inc NasdaqGS GOOGL Auditors.xls — Auditors (47KB; 159×6) | Other — auditor/governance export | Historical auditor records; not an earnings period | 2026-11-03 16:04 | Low |
| Alphabet Inc NasdaqGS GOOGL Board Members.xls — Board Members (93KB; 28×25) | Other — governance export | Current snapshot; not an earnings period | 2026-11-03 16:04 | Low |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Summary (234KB; 42×11) | Data export — credit health | LTM ended 2026-09-30 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Financials (234KB; 40×13) | Data export — credit health | LTM ended 2026-09-30 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Operational Metrics Charts (234KB; 21×19) | Data export — credit health | LTM ended 2026-09-30 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Solvency Metrics Charts (234KB; 18×19) | Data export — credit health | LTM ended 2026-09-30 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Liquidity Metrics Charts (234KB; 15×19) | Data export — credit health | LTM ended 2026-09-30 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Disclaimer (234KB; 26×1) | Other — disclaimer | No financial period | 2026-11-03 16:04 | Low |
| Alphabet Inc NasdaqGS GOOGL Customers.rtf (2.49MB) | Data export — customers | Recently disclosed relationships; two-year graph scope | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Events Calendar.xls — Events Calendar (30KB; 8×1) | Data export — event calendar | November 2026; no events listed | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Key Stats (298KB; 100×12) | Data export — annual financials | FY2016–FY2025 | 2026-11-03 16:04 | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Income Statement (298KB; 115×11) | Data export — annual financials | FY2016–FY2025 | 2026-11-03 16:04 | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Balance Sheet (298KB; 98×11) | Data export — annual financials | FY2016–FY2025 | 2026-11-03 16:04 | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Cash Flow (298KB; 77×11) | Data export — annual financials | FY2016–FY2025 | 2026-11-03 16:04 | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Multiples (298KB; 91×42) | Data export — valuation history | FY2016–FY2025 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Historical Capitalization (298KB; 39×40) | Data export — capitalisation history | FY2016–FY2025 | 2026-11-03 16:04 | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Capital Structure Summary (298KB; 117×21) | Data export — annual capital structure | FY2016–FY2025 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Capital Structure Details (298KB; 47×10) | Data export — annual capital structure | FY2016–FY2025 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Ratios (298KB; 161×11) | Data export — annual ratios | FY2016–FY2025 | 2026-11-03 16:04 | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Supplemental (298KB; 55×10) | Data export — annual supplemental data | FY2016–FY2025 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Industry Specific (298KB; 24×10) | Data export — industry data | FY2016–FY2025 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Pension OPEB (298KB; 21×10) | Data export — pension/OPEB | FY2016–FY2025 | 2026-11-03 16:04 | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Segments (298KB; 67×10) | Data export — annual segments | FY2016–FY2025 | 2026-11-03 16:04 | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Key Stats (489KB; 100×12) | Data export — quarterly financials | Q1 2017–Q3 2026 | 2026-11-03 16:04 | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Income Statement (489KB; 113×40) | Data export — quarterly financials | Q1 2017–Q3 2026 | 2026-11-03 16:04 | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Balance Sheet (489KB; 98×40) | Data export — quarterly financials | Q1 2017–Q3 2026 | 2026-11-03 16:04 | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Cash Flow (489KB; 76×40) | Data export — quarterly financials | Q1 2017–Q3 2026 | 2026-11-03 16:04 | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Multiples (489KB; 91×42) | Data export — valuation history | Q1 2017–Q3 2026 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Historical Capitalization (489KB; 39×40) | Data export — capitalisation history | Q1 2017–Q3 2026 | 2026-11-03 16:04 | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Capital Structure Summary (489KB; 79×79) | Data export — quarterly capital structure | Q1 2017–Q3 2026 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Capital Structure Details (489KB; 47×10) | Data export — quarterly capital structure | Q1 2017–Q3 2026 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Ratios (489KB; 161×40) | Data export — quarterly ratios | Q1 2017–Q3 2026 | 2026-11-03 16:04 | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Supplemental (489KB; 38×40) | Data export — quarterly supplemental data | Q1 2017–Q3 2026 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Industry Specific (489KB; 24×40) | Data export — industry data | Q1 2017–Q3 2026 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Pension OPEB (489KB; 15×6) | Data export — pension/OPEB | Quarterly history through Q3 2026 | 2026-11-03 16:04 | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Segments (489KB; 70×40) | Data export — quarterly segments | Q1 2017–Q3 2026 | 2026-11-03 16:04 | High |
| Alphabet Inc NasdaqGS GOOGL Key Developments.xls — Key Developments (1.03MB; 520×7) | Data export — developments | One-year window through 2026-11-02 | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Professionals.xls — Professionals (75KB; 34×24) | Other — people data | Current snapshot; not an earnings period | 2026-11-03 16:04 | Low |
| Alphabet Inc NasdaqGS GOOGL Public Company Profile.rtf (277KB) | Other — company profile | Current snapshot; not an earnings period | 2026-11-03 16:04 | Low |
| Alphabet Inc NasdaqGS GOOGL Public Ownership History.xls — History (930KB; 8,319×6) | Data export — ownership history | Historical series; not an earnings period | 2026-11-03 16:04 | Low |
| Alphabet Inc NasdaqGS GOOGL Public Ownership Insider Trading.xls — Insider Trading (7.1MB; 48,134×11) | Data export — insider trades | Historical transactions; not an earnings period | 2026-11-03 16:04 | Low |
| Alphabet Inc NasdaqGS GOOGL Public Ownership Summary.rtf (319KB) | Other — ownership summary | Current snapshot; not an earnings period | 2026-11-03 16:04 | Low |
| Alphabet Inc NasdaqGS GOOGL Strategic Alliances.xls — Strategic Alliances (535KB; 368×7) | Data export — relationships | Recently disclosed relationships; two-year graph scope | 2026-11-03 16:04 | Medium |
| Alphabet Inc NasdaqGS GOOGL Suppliers.rtf (2.24MB) | Data export — suppliers | Recently disclosed relationships; two-year graph scope | 2026-11-03 16:04 | Medium |
| Alphabet Inc., Q2 2026 Earnings Call, Jul 22, 2026.rtf (271KB) | Verbatim transcript — CIQ/company call record | Q2 2026; July 22, 2026 | 2026-11-03 16:04 | High |
| Alphabet Inc., Q3 2026 Earnings Call, Oct 28, 2026.rtf (291KB) | Verbatim transcript — CIQ/company call record | Q3 2026; October 28, 2026 | 2026-11-03 16:04 | High |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Consensus (9.0MB; 886×101) | Consensus / estimate export | FY2026–FY2035 estimates; current FY ends Dec. 31, 2026 | 2026-11-03 16:04 | High |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Recent Changes (9.0MB; 265×10) | Estimate-change export | FY2026 and quarterly estimate history | 2026-11-03 16:04 | High |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Guidance (9.0MB; 125×17) | Guidance data export | Historical guidance through FY2026 | 2026-11-03 16:04 | High |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Multiples (9.0MB; 25×7) | Data export — valuation multiples | Current / forward estimates | 2026-11-03 16:04 | Medium |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Surprise (9.0MB; 463×92) | Beat/miss data export | Quarterly and annual history through FY2025 | 2026-11-03 16:04 | High |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Trends (9.0MB; 414×20) | Estimate-trend export | Quarterly and FY2026–FY2027 trends | 2026-11-03 16:04 | High |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Revisions (9.0MB; 595×20) | Estimate-revision export | Quarterly and FY2026–FY2027 revisions | 2026-11-03 16:04 | High |
| Alphabet_Inc-Annual_Report_2024.pdf (1.28MB) | Annual filing | FY2024 | 2026-11-03 16:04 | High |
| Alphabet_Inc-Annual_Report_2025.pdf (1.19MB) | Annual filing | FY2025 | 2026-11-03 16:04 | High |
| Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc (3.13MB) | Audited annual filing — Form 10-K | FY2025, ended 2025-12-31 | 2026-11-03 16:04 | High |
| Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc (2.53MB) | Quarterly filing — Form 10-Q | Q3 2026, ended 2026-09-30 | 2026-11-03 16:04 | High |
| Alphabet_Inc_-_Form_DEFA14A(Jun-05-2026).doc (241KB) | Other — proxy-related filing | 2026 proxy communication | 2026-11-03 16:04 | Low |
| Company Comparable Analysis Alphabet Inc.xls — Financial Data (147KB; 50×17) | Data export — comparable financials | Current/LTM vendor snapshot | 2026-11-03 16:04 | Medium |
| Company Comparable Analysis Alphabet Inc.xls — Trading Multiples (147KB; 50×9) | Data export — comparable multiples | Current/LTM vendor snapshot | 2026-11-03 16:04 | Medium |
| Company Comparable Analysis Alphabet Inc.xls — Operating Statistics (147KB; 50×13) | Data export — comparable operating data | Current/LTM vendor snapshot | 2026-11-03 16:04 | Medium |
| Company Comparable Analysis Alphabet Inc.xls — Business Description (147KB; 44×3) | Other — business descriptions | Current snapshot | 2026-11-03 16:04 | Low |
| Company Comparable Analysis Alphabet Inc.xls — Implied Valuation (147KB; 69×9) | Data export — implied valuation | Current/forward vendor snapshot | 2026-11-03 16:04 | Low |
| Company Comparable Analysis Alphabet Inc.xls — Valuation Chart (147KB; 32×2) | Data export — valuation chart | Current/forward vendor snapshot | 2026-11-03 16:04 | Low |
| Company Comparable Analysis Alphabet Inc.xls — Credit Health Panel (147KB; 48×10) | Data export — peer credit health | LTM through 2026-09-30 | 2026-11-03 16:04 | Medium |
| Company Comparable Analysis Alphabet Inc.xls — Disclaimer (147KB; 26×1) | Other — disclaimer | No financial period | 2026-11-03 16:04 | Low |
| ICEGATEPayment_007000BEINDEL40211471233439453.pdf (16KB) | Other — unrelated payment record | No earnings period | 2026-11-03 16:04 | Low |
| Price_Charting Excel Export - Nov 3rd 2026 2_23_42 pm.xls — Pane 1 (184KB; 1,290×3) | Data export — price history | Price series through 2026-11-03 | 2026-11-03 16:04 | Medium |
| Price_Charting Excel Export - Nov 3rd 2026 2_23_42 pm.xls — Raw (184KB; 0×0) | Data export — empty tab | No data | 2026-11-03 16:04 | Low |
| Price_Charting Excel Export - Nov 3rd 2026 2_23_42 pm.xls — Attributions (184KB; 80×2) | Other — chart attribution | 2026-11-03 chart export | 2026-11-03 16:04 | Low |
| Short_Interest_Charting Excel Export Nov-03-2026 3_45 AM.xls — Chart 1 with Data (100KB; 284×2) | Data export — short-interest history | Series through 2026-11-03 | 2026-11-03 16:04 | Medium |
| Short_Interest_Charting Excel Export Nov-03-2026 3_45 AM.xls — Attributions (100KB; 45×1) | Other — chart attribution | 2026-11-03 chart export | 2026-11-03 16:04 | Low |

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc | FY2025, ended 2025-12-31 [Alphabet Form 10-K, FY2025, cover] | 10.1 |
| Quarterly filing | Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc | Q3 2026, ended 2026-09-30 [Alphabet Form 10-Q, Q3 2026, cover] | 1.1 |
| Earnings transcript | Alphabet Inc., Q3 2026 Earnings Call, Oct 28, 2026.rtf | Q3 2026; verbatim prepared remarks and Q&A [Alphabet Q3 2026 Earnings Call transcript, 2026-10-28, call participants through Q&A] | 0.2 |
| Investor deck | None in the frozen raw pool | Not available | — |
| Consensus / estimate export | AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Consensus / Recent Changes / Trends / Revisions | FY2026–FY2027 current estimates and revision history [Capital IQ Estimates—Consensus, FY2026, header; Capital IQ Estimates—Revisions, FY2026, last-month breadth] | Current evidence snapshot; report as-of date not printed |
| Cash flow data | Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc; Financials_Quarterly.xls — Cash Flow | Q3 2026 and quarterly history through 2026-09-30 [Alphabet Form 10-Q, Q3 2026, Consolidated Statements of Cash Flows; Capital IQ Financials—Quarterly Cash Flow, Q3 2026, period headers] | 1.1 |
| Guidance data | AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Guidance; Q3 call transcript | FY2026 guidance, including an October 28, 2026 guidance date [Capital IQ Estimates—Guidance, FY2026, guidance-date row] | 0.2 |

The Q3 call file is a verbatim S&P Global Market Intelligence transcript: it contains named call participants, prepared remarks, and an analyst Q&A. It is not a sell-side verdict-bearing proxy. [Alphabet Q3 2026 Earnings Call transcript, 2026-10-28, table of contents and call participants]

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | [Alphabet Form 10-Q, Q3 2026, Consolidated Statements of Income] | Needed for revenue, margin, EPS |
| Balance sheet | Y | [Alphabet Form 10-Q, Q3 2026, Consolidated Balance Sheets] | Needed for working capital and leverage |
| Cash flow statement | Y | [Alphabet Form 10-Q, Q3 2026, Consolidated Statements of Cash Flows] | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | [Alphabet Form 10-Q, Q3 2026, cover] | Needed for trend and setup |
| Last 8 quarters | Y | [Capital IQ Financials—Quarterly Income Statement, Q3 2026, period headers Q1 2017–Q3 2026] | Needed for seasonality and inflection |
| Consensus estimates | Y | [Capital IQ Estimates—Consensus, FY2026, header] | Needed for market bar |
| Estimate revisions | Y | [CIQ facts sidecar, 2026-11-03, Revenue/EPS Revisions source refs] | Needed for revision momentum |
| Earnings transcript | Y | [Alphabet Q3 2026 Earnings Call transcript, 2026-10-28, prepared remarks and Q&A] | Needed for management tone and driver detail |
| Segment P&L | Y | [Alphabet Form 10-Q, Q3 2026, Note 15—Information about Segments and Geographic Areas] | Needed for mix shift |
| Current price | Y | [CIQ facts sidecar, 2026-11-03, Current Price source ref] | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y |
| 06_value-chain.md | Y |
| 10_external-dependency.md | Y |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N | 04, 05, 99 | None |
| No quarterly data | N | 01, 02, 03, 06 | None |
| No VERBATIM transcript, sell-side proxy present | N | 02, 03, 04 | None — verbatim Q2 and Q3 transcripts are present |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | None |
| No segment-level P&L | N | 02, 03, 99 | None |
| No cash flow statement | N | 06, 99 | None |
| No current price | N | 99 | None |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The frozen pool contains a recent audited FY2025 Form 10-K, a Q3 2026 Form 10-Q, primary income statement, balance sheet, and cash-flow statements, more than eight quarters of quarterly history, verbatim earnings-call transcripts, segment P&L, and current consensus/revision/guidance data.



---

## earnings / 01_historical-financials.md

_Source: `01_historical-financials.md`_

# Historical Financials — GOOGL

Alphabet reports under U.S. GAAP in USD and has a 31 December year-end. Unless stated otherwise, figures below are reported USD millions; EBITDA (earnings before interest, tax, depreciation and amortisation) is calculated as operating income plus depreciation and amortisation, not a company-adjusted measure. Free cash flow (FCF) means cash from operations (CFO) less purchases of property and equipment (capex). Working capital is total current assets less total current liabilities.

## 1. Annual Financial Table (3–5 years)

**Reported USD millions, except per-share data and ratios.** Net debt uses the **strict** basis: filing debt excluding operating-lease liabilities, less cash and cash equivalents (not marketable securities). A negative number denotes net cash.

| Metric | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---|
| Revenue [1] | 307,394 | 350,018 | 402,836 | Accelerating |
| Revenue YoY % [1] | 8.7% | 13.9% | 15.1% | Accelerating |
| Gross Profit [1] | 174,062 | 203,712 | 240,301 | Accelerating |
| Gross Margin % [1] | 56.6% | 58.2% | 59.7% | Accelerating |
| EBITDA (calculated; not company-adjusted) [1] | 96,239 | 127,701 | 150,175 | Accelerating |
| EBITDA Margin % [1] | 31.3% | 36.5% | 37.3% | Accelerating |
| EBIT / income from operations [1] | 84,293 | 112,390 | 129,039 | Accelerating |
| EBIT Margin % [1] | 27.4% | 32.1% | 32.0% | Stable |
| EPS (diluted) [1] | $5.80 | $8.04 | $10.81 | Accelerating |
| CFO [1] | 101,746 | 125,299 | 164,713 | Accelerating |
| Capex [1] | 32,251 | 52,535 | 91,447 | Accelerating |
| FCF (CFO − capex) [1] | 69,495 | 72,764 | 73,266 | Stable |
| Working capital [1][5] | 89,716 | 74,589 | 103,293 | Volatile |
| Net debt — **strict basis** [1][5] | (11,178) | (9,284) | 17,835 | Inflecting |
| Net Debt / EBITDA — **strict basis** [1][5] | (0.12)x | (0.07)x | 0.12x | Inflecting |

The strict-debt build is reconstructable from filed components. FY2023 debt was $12.870bn ($11.870bn long-term debt plus $1.000bn current portion), less $24.048bn cash; FY2024 debt was $14.182bn ($10.883bn long-term debt, $2.300bn commercial paper and $0.999bn current portion), less $23.466bn cash; FY2025 debt was $48.543bn ($46.547bn long-term debt plus $1.996bn current portion), less $30.708bn cash. Operating-lease liabilities are excluded. [FY2024 Form 10-K, Note 6 (Debt); FY2025 Form 10-K, Consolidated Balance Sheets p.48 and Note 6 p.71]

**Calculation check (executed Bash/AWK; USD millions):**

```text
$ awk 'BEGIN { print 164713-91447, 179551-159804, (402836-350018)/350018*100 }'
73266 19747 15.0904
```

The complete executed check produced FY2023/FY2024/FY2025 FCF of $69,495m/$72,764m/$73,266m; FY2025 gross, EBITDA and EBIT margins of 59.65%/37.28%/32.03%; and FY2025 strict net debt/EBITDA of 0.12x. The same calculation produced TTM September 2026 CFO of $179,551m, capex of $159,804m and FCF of $19,747m.

## 2. TTM Snapshot

**TTM ended 30 September 2026; USD millions, except EPS and ratios.** “Prior TTM” is the four quarters ended 30 September 2025. Net debt is a period-end balance rather than a TTM flow.

| Metric | Latest TTM | Prior TTM | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 471,098 | 385,477 | +22.2% | [2][3] |
| EBITDA (calculated; not company-adjusted) | 185,516 | 143,753 | +29.1% | [3][4] |
| EBIT / income from operations | 156,976 | 124,077 | +26.5% | [2][3] |
| EPS diluted | $19.17 | $10.13 | +89.2% | [2][3] |
| CFO | 179,551 | 151,424 | +18.6% | [2][3][4] |
| Capex | 159,804 | 77,872 | +105.2% | [2][3] |
| FCF (CFO − capex) | 19,747 | 73,552 | −73.2% | [2][3] |
| Net debt at latest period-end | 69,784 **(strict basis)** | 3,512 **(strict basis; vendor total-debt figure; composition unconfirmed against the FY2025 Q3 filing debt note)** | +66,272 | [2][3] |

At 30 September 2026, filing-clean debt is $126.118bn ($125.102bn long-term debt plus $1.016bn current portion; no commercial paper), less $56.334bn cash and cash equivalents, yielding $69.784bn strict net debt and 0.38x TTM EBITDA. [Q3 2026 Form 10-Q, Consolidated Balance Sheets; Note 6 (Debt), p.26]

This is deliberately different from the CIQ sidecar’s vendor figure: CIQ reports $150.331bn total debt and **net debt of negative $114.767bn** because its $150.331bn aggregate includes $24.213bn operating-lease liabilities and its net-debt convention nets $265.098bn cash **plus marketable securities**. This is net cash on the **broad basis** (cash plus marketable securities, net of vendor debt), not strict net debt. The filing-clean strict calculation above is therefore used. [CIQ Financials → Balance Sheet, Q3 2026; CIQ facts sidecar, `total_debt_m` and `net_debt_m`, 2026-09-30]

The CIQ facts sidecar’s authoritative workbook read for LTM EBITDA is $185.516bn. The four quarterly CIQ EBITDA fields sum to $185.891bn, a $0.375bn (0.2%) mismatch. This report uses the sidecar’s $185.516bn figure; the small cross-workbook restatement/definition difference is not overridden silently. [CIQ facts sidecar, `ltm_ebitda_m`, 2026-09-30; CIQ Financials → Quarterly Income Statement, Q4 2025–Q3 2026]

## 3. Latest Quarterly Trend Table (up to 8 quarters)

**Reported USD millions, except per-share data and margins.** Gross and EBITDA margins are calculated from the quarterly data; EBITDA remains a calculated, not company-adjusted, measure.

| Metric | Q4 FY24 | Q1 FY25 | Q2 FY25 | Q3 FY25 | Q4 FY25 | Q1 FY26 | Q2 FY26 | Q3 FY26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue [2][3] | 96,469 | 90,234 | 96,428 | 102,346 | 113,829 | 109,896 | 119,796 | 127,577 | Accelerating; +6.5% | +24.7% |
| Gross Margin % [2][3] | 57.9% | 59.7% | 59.5% | 59.6% | 59.8% | 62.5% | 61.6% | 59.7% | Volatile; −195bp | +12bp |
| EBITDA [3] | 35,177 | 35,215 | 36,393 | 36,968 | 41,974 | 46,356 | 48,241 | 49,320 | Accelerating; +2.2% | +33.4% |
| EBITDA Margin % [3] | 36.5% | 39.0% | 37.7% | 36.1% | 36.9% | 42.2% | 40.3% | 38.7% | Volatile; −161bp | +254bp |
| EPS (diluted) [2][3] | $2.14 | $2.81 | $2.31 | $2.87 | $2.81 | $5.11 | $9.11 | $2.14 | Volatile; −76.5% | −25.4% |

Q3 FY2026 revenue and operating income agree to the filed 10-Q ($127.577bn and $40.576bn, respectively). EPS is not a clean operating trend: Q2 FY2026 included a $98.999bn gain on sale of investments in the vendor quarterly series, while Q3 FY2026 included $8.221bn of other expense in the filed income statement. These disclosed/non-operating movements explain why TTM EPS growth is much faster than the revenue and EBIT trends. [Q3 2026 Form 10-Q, Consolidated Statements of Income; CIQ Financials → Quarterly Income Statement, Q2–Q3 2026]

## 4. Reported vs Adjusted Metrics

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA | Not reported by Alphabet; CIQ calculated Q3 FY2026 EBITDA is 49,320 | Not disclosed | N/A | Alphabet does not provide an adjusted-EBITDA reconciliation in the reviewed filing. | [2][3] |
| EBIT | Q3 FY2026 operating income 40,576 | Not disclosed | N/A | Alphabet reports income from operations; no adjusted EBIT was disclosed. | [2] |
| EPS | Q3 FY2026 diluted EPS $2.14 | Not disclosed | N/A | Alphabet reports GAAP diluted EPS; no adjusted EPS was disclosed. | [2] |

*Company does not disclose adjusted metrics in the reviewed 10-K and Q3 2026 10-Q.*

## 5. Quarterly Seasonality Table (last 3 fiscal years)

**Actual quarterly CIQ data; revenue shares are calculated against filed annual revenue.** EBITDA margins use the calculated EBITDA convention described above.

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Margin | FY2024 EBITDA Margin | FY2025 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 [1][3] | 22.7% | 23.0% | 22.4% | 22.7% | 28.7% | 35.9% | 39.0% |
| Q2 [1][3] | 24.3% | 24.2% | 23.9% | 24.1% | 33.1% | 36.7% | 37.7% |
| Q3 [1][3] | 25.0% | 25.2% | 25.4% | 25.2% | 32.0% | 36.8% | 36.1% |
| Q4 [1][3] | 28.1% | 27.6% | 28.3% | 28.0% | 31.3% | 36.5% | 36.9% |

Q4 is consistently the largest revenue quarter, but no quarter takes more than 30% or less than 20% of annual revenue in this three-year history. The revenue pattern is therefore present but does not breach the report’s material-seasonality flags. [CIQ Financials → Quarterly Income Statement, FY2023–FY2025]

## 6. Key Trend Summary

Revenue growth is accelerating: it rose from 8.7% in FY2023 to 15.1% in FY2025, and TTM September 2026 revenue grew 22.2% year on year. Gross margin expanded from 56.6% in FY2023 to 59.7% in FY2025, while Q3 FY2026 gross margin was broadly flat year on year (+12bp) but fell 195bp sequentially; the latest quarter therefore does not establish continued quarterly expansion. EBITDA margin improved over the multi-year period, but the Q3 FY2026 margin of 38.7% was below Q1 FY2026’s 42.2%, so the quarterly pattern is volatile rather than a straight line. Q4 is the largest seasonal revenue quarter at roughly 28% of annual revenue, but it is not dominant. The important financial inflection is cash intensity: TTM CFO rose $28.127bn year on year, but capex rose $81.932bn, leaving FCF down $53.805bn to $19.747bn. [1][2][3][4]

## 7. Citations

[1] `data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc`, FY2025 Form 10-K, Consolidated Balance Sheets p.48, Consolidated Statements of Income p.49, Consolidated Statements of Cash Flows p.51, and Note 6 (Debt) p.71 — audited FY2023–FY2025 income/cash-flow history and FY2024–FY2025 balance-sheet/debt data.

[2] `data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc`, Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, Consolidated Statements of Income and Cash Flows, and Note 6 (Debt) p.26 — Q3 FY2026 primary reported figures, nine-month cash flow, cash and debt composition.

[3] `data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls`, CIQ Financials → Quarterly Income Statement, Cash Flow and Balance Sheet, actual quarterly columns Q1 FY2023–Q3 FY2026; vendor export, data as of 2026-11-03 — intervening quarter, prior-TTM and seasonal-history data. Q3 FY2026 revenue and operating income were cross-checked to [2].

[4] `ciq_facts.json`, `ltm_ebitda_m` and `ltm_ocf_m`, source references CIQ Financials → Income Statement / Cash Flow, LTM ended 2026-09-30 — deterministic source-bound CIQ workbook read: EBITDA $185.516bn and CFO $179.551bn.

[5] `data/GOOGL/Alphabet_Inc-Annual_Report_2024.pdf`, FY2024 Form 10-K, Consolidated Balance Sheets p.52 and Note 6 (Debt) — FY2023 working-capital and strict-debt components.



---

## earnings / 02_revenue-drivers.md

_Source: `02_revenue-drivers.md`_

# Revenue Drivers — GOOGL

Alphabet reports under U.S. GAAP in USD and has a 31 December year-end. All figures below are reported USD millions unless noted. The latest interim report is a standalone three-month Form 10-Q for the quarter ended 30 September 2026. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 2026 Form 10-Q, cover and Note 1]

## 1. Segment Decomposition Status

Segment decomposition applied — 3 reportable segments from business-model module. Google Services and Google Cloud are the material revenue pools; Other Bets is 0.3% of Q3 2026 revenue. Google Services was 75.5% of Q3 revenue, Google Cloud 24.1%, Other Bets 0.3%, and revenue hedging 0.2%. [Q3 2026 Form 10-Q, Note 15—Information about Segments and Geographic Areas pp. 41–42]

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Multi-segment | Sum of segment revenue drivers |

**Alphabet revenue =** (Search user activity × paid-click monetisation + YouTube viewing/advertiser spend + Network impressions × realised pricing + subscriptions/Play/devices) + (Google Cloud consumption and subscriptions + TPU-system sales) + Other Bets + revenue-related hedging. Cost per click (CPC) is the average advertiser payment per paid click. Google discloses paid clicks and CPC for Search, and impressions and cost per impression for Network; it does not disclose comparable unit-price detail for Cloud or YouTube. [FY2025 Form 10-K, Item 7—Google Services and Google Cloud revenue drivers pp. 29–30; Q3 2026 Form 10-Q, Item 2—Monetization Metrics p. 49]

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand | Improving, but uneven by pool | Q3 Google advertising rose 11% and Cloud 103%; Search growth was led by retail then finance, while YouTube was led by brand advertising. [Q3 2026 earnings call, Oct. 28, 2026, CFO prepared remarks] | 95 |
| Company market share | Unknown | No company or market-share series is disclosed in the reviewed filing or transcript. Revenue growth must not be called share gain. [Q3 2026 Form 10-Q, Item 2—Financial Results and Monetization Metrics pp. 48–49] | 75 |
| Price / realisation | Improving for Search; not separately disclosed for Cloud | Search paid clicks rose 8% and CPC rose 4% year on year. CPC also reflects mix, geography, advertiser spend, product changes and FX, so it is a realised-price proxy rather than pure price. [Q3 2026 Form 10-Q, Item 2—Monetization Metrics p. 49] | 90 |
| Product / customer / geography mix | Shifting toward Cloud | Cloud grew from 14.8% of Q3 2025 revenue ($15.157bn / $102.346bn) to 24.1% in Q3 2026 ($30.709bn / $127.577bn): a 9.3pp shift. This is a reported-segment mix change, not proof of customer-market-share gain. [Q3 2026 Form 10-Q, Item 2—Revenue by type pp. 48–49] | 95 |
| FX translation | Mild headwind to operations | Q3 consolidated reported and constant-currency growth were both 25% when rounded, but management said FX was the largest reason Search growth slowed versus Q2 and expects a somewhat larger consolidated FX headwind in Q4, chiefly Search and YouTube ads. [Q3 2026 earnings call, Oct. 28, 2026, prepared remarks and Q&A] | 45 |
| M&A / divestitures | Unknown contribution; do not label Cloud growth fully organic | Wiz closed on 11 March 2026 and its results are included in Google Cloud, but the filing gives no acquired-revenue contribution. Intersect is also included in consolidated results. [Q3 2026 Form 10-Q, Item 2—Acquisitions and Divestitures; Note 8—Business Combinations] | 40 |

**Cycle position:** Not assessable from the available primary evidence. The business-model dependency review identifies advertising spending as high consumer-cycle exposure and Cloud as mid industrial-cycle exposure, but the pool has no broad advertiser-spend or cloud-demand cycle series that identifies a peak, mid-cycle, or trough. Q3's 25% growth is therefore not treated as a normalised run rate. [business-model/10_external-dependency.md, §§1 and 3; Q3 2026 Form 10-Q, Item 2—Financial Results]

## 4. Revenue Driver Table (consolidated)

| Driver | Current Level | Direction (Improving / Stable / Deteriorating / Unknown) | Magnitude (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Search advertiser demand, traffic and monetisation | Search & other revenue $63.350bn, +12% YoY; paid clicks +8%, CPC +4% | Improving, but growth slowed from Q2's 17% | High | Q3 growth came from query growth, advertiser spend, and ad-format/delivery improvements. [Q3 2026 Form 10-Q, Item 2—Financial Results and Monetization Metrics pp. 48–49; Q3 2026 earnings call, Oct. 28, 2026, Q&A] |
| Cloud consumption, subscriptions and AI demand | Cloud revenue $30.709bn, +103% YoY; $560.8bn Cloud backlog | Improving | High | Growth was led by Google Cloud Platform infrastructure and platform services plus TPU-system sales; 55%+ of total $567.7bn backlog is expected over 24 months, subject to delivery and customer use. [Q3 2026 Form 10-Q, Item 2—Financial Results p. 49; Note 1—Revenue Backlog] |
| Consumer subscriptions, platforms and devices | $14.290bn, +11% YoY | Improving | Mid | Paid YouTube and Google One subscriptions grew; Pixel sales also increased. [Q3 2026 Form 10-Q, Item 2—Google Subscriptions, Platforms, and Devices p. 49] |
| YouTube advertising | $11.207bn, +9% YoY | Improving | Low | Brand advertising was the first driver, followed by direct response. [Q3 2026 Form 10-Q, Item 2—YouTube ads p. 49] |
| Google Network | $7.455bn, +1% YoY | Stable | Low | AdMob growth partly offset lower AdSense; impressions fell 14% while cost per impression rose 14%. [Q3 2026 Form 10-Q, Item 2—Google Network and Monetization Metrics p. 49] |
| FX and revenue hedging | Hedging gain $0.194bn versus $0.207bn loss a year earlier; operating FX expected to be a larger Q4 headwind | Deteriorating for Q4 outlook | Low | The hedge-line swing helped reported Q3 revenue, but it is not a measure of operating FX translation; management expects the operating headwind to increase in Q4. [Q3 2026 Form 10-Q, Item 2—Revenue by type p. 48; Q3 2026 earnings call, Oct. 28, 2026, prepared remarks] |

Magnitude uses a 10–20% driver move against Q3's $127.577bn revenue. Search is about half of revenue and can move total revenue by roughly 5–10%; Cloud and subscriptions have mid-sized total-revenue sensitivity; YouTube, Network, hedging and Other Bets are below 2% at a 20% move. The size labels are inference from the reported revenue base, not from a filed sensitivity. [Q3 2026 Form 10-Q, Item 2—Revenue by type pp. 48–49]

## 5. Revenue Drivers By Segment (if applicable)

### Segment: Google Services (75.5% of Q3 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Search traffic and advertiser spend | $63.350bn, +12% YoY; clicks +8%, CPC +4% | Improving, with slower growth than Q2 | High | Retail was the largest contributor, followed by finance. FX, APAC retail effects from the EU de-minimis change, post-World-Cup media normalisation, and lower AI-Mode monetisation moderated Q3 growth. [Q3 2026 earnings call, Oct. 28, 2026, CFO prepared remarks and Q&A; Q3 2026 Form 10-Q, Item 2—Monetization Metrics p. 49] |
| YouTube advertising | $11.207bn, +9% YoY | Improving | Low | Brand advertising led, with notable living-room strength. [Q3 2026 earnings call, Oct. 28, 2026, CFO prepared remarks] |
| Subscriptions, platforms and devices | $14.290bn, +11% YoY | Improving | Mid | YouTube Music/Premium and Google One AI plans drove subscriptions; Pixel sales also rose. [Q3 2026 Form 10-Q, Item 2—Google Subscriptions, Platforms, and Devices p. 49; Q3 2026 earnings call, Oct. 28, 2026, CFO prepared remarks] |
| AI Search formats | AI-Mode queries are growing, but monetisation is lower than traditional Search; ads are expanding to more AI Overview/AI Mode users and queries | Unknown | High | The company reports similar click-through rates for sponsored and organic product-list items in AI Mode, but does not disclose its revenue contribution. [Q3 2026 earnings call, Oct. 28, 2026, prepared remarks and Q&A] |

### Segment: Google Cloud (24.1% of Q3 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| GCP consumption and subscriptions | Segment revenue $30.709bn, +103% YoY | Improving | High | Google Cloud Platform generated the large majority of Cloud revenue; management cited both AI and core GCP demand. [Q3 2026 earnings call, Oct. 28, 2026, CFO and Google Cloud CEO prepared remarks] |
| TPU-system sales | Meaningful Q3 contributor; exact revenue not disclosed | Improving | Mid | The filing says Q3 Cloud growth included TPU-system sales; product revenue is recognised on hardware-control transfer, while support and warranty revenue is recognised over time. [Q3 2026 Form 10-Q, Note 1—Revenue Recognition; Item 2—Google Cloud p. 49] |
| Backlog and delivery capacity | $560.8bn Cloud backlog; third-party bridging capacity arrived at the end of Q3 and ramps in Q4 | Improving, but capacity remains binding | High | Recognition depends on contract delivery and customer use. The $16.8bn Crux AI related-party backlog is part of the disclosed total, so it should not be treated as fully arm's-length third-party demand. [Q3 2026 Form 10-Q, Note 1—Revenue Backlog; Q3 2026 earnings call, Oct. 28, 2026, CFO prepared remarks] |

Other Bets is immaterial to the current revenue read: Q3 revenue was $0.372bn, up $0.028bn year on year. [Q3 2026 Form 10-Q, Item 2—Revenue by type p. 48]

## 6. Revenue Growth Decomposition

The most recent complete bridge is Q3 2026 versus Q3 2025. Total reported revenue increased from $102.346bn to $127.577bn: ($127.577bn − $102.346bn) / $102.346bn = **24.65%**. This is a reported-revenue-category bridge, not an atomic volume/price bridge: Alphabet does not disclose the dollar split between Cloud consumption, TPU sales, acquired revenue, or Search traffic, price and mix.

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Google Cloud | 15.20 | $30.709bn less $15.157bn, principally GCP infrastructure/platform services and TPU-system sales. [Q3 2026 Form 10-Q, Item 2—Revenue by type and Google Cloud pp. 48–49] |
| Google Search & other | 6.63 | $63.350bn less $56.567bn; filing attributes the growth to queries, advertiser spending, and ad formats/delivery. [Q3 2026 Form 10-Q, Item 2—Google Search & other pp. 48–49] |
| Google subscriptions, platforms and devices | 1.39 | $14.290bn less $12.870bn, led by subscriptions and devices. [Q3 2026 Form 10-Q, Item 2—Google Subscriptions, Platforms, and Devices pp. 48–49] |
| YouTube ads | 0.92 | $11.207bn less $10.261bn, led by brand then direct response. [Q3 2026 Form 10-Q, Item 2—YouTube ads pp. 48–49] |
| Google Network | 0.10 | $7.455bn less $7.354bn; AdMob growth partly offset by AdSense. [Q3 2026 Form 10-Q, Item 2—Google Network pp. 48–49] |
| Other Bets | 0.03 | $0.372bn less $0.344bn. [Q3 2026 Form 10-Q, Item 2—Revenue by type p. 48] |
| Revenue hedging gains/(losses) | 0.39 | $0.194bn gain less a $0.207bn loss. This is a reported hedge-line swing, not an FX-translation measurement. [Q3 2026 Form 10-Q, Item 2—Revenue by type p. 48] |
| **Total revenue growth** | **24.65** | **$25.231bn increase / $102.346bn Q3 2025 revenue. [Q3 2026 Form 10-Q, Item 2—Revenue by type pp. 48–49]** |

M&A and FX translation are not separately measured components: Wiz is within Cloud and management gives no acquired-revenue dollar contribution; the hedge row is not a substitute for translation FX. These effects remain inside the relevant reported category rather than being called organic demand. [Q3 2026 Form 10-Q, Item 2—Acquisitions and Divestitures; Revenue by type p. 48]

## 6a. Decomposition Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

Every pp component is a reported same-period revenue change divided by the same Q3 2025 consolidated-revenue base of $102.346bn; no volume, price, or mix ratio is applied across a different basis.

```text
Reported revenue categories: ($15,552m Cloud + $6,783m Search + $1,420m subscriptions/platforms/devices
  + $946m YouTube + $101m Network + $28m Other Bets + $401m hedging) / $102,346m Q3 2025 total revenue
  = 24.65pp of Q3 2026 total revenue growth
  → basis matches: standalone Q3 2026 versus standalone Q3 2025, reported USD revenue.
  → Asserted from disclosure, no ratio applied.
```

The components sum to $25.231bn, which equals the stated $127.577bn less $102.346bn total-revenue increase: **24.65pp reconciled, 0.00pp residual**. The bridge does not prove an organic price/volume split inside its components; Cloud's TPU, acquired-revenue and consumption contributions and Search's traffic/price/mix contribution remain undisclosed.

RF-EARN-001: revenue decomposition reconciled — explained 24.65pp, residual 0.00pp, total 24.65pp

## 7. The Single Biggest Revenue Driver

**Search advertiser demand and monetisation is the single largest revenue sensitivity.** Search & other was $63.350bn, or 49.7% of Q3 revenue; a 10% change is $6.335bn, or **4.97% of total revenue** (and a 20% change is 9.93%). This is inference from the reported revenue base, not a filed sensitivity. Its current direction is positive — Q3 revenue rose 12%, supported by paid-click and CPC growth — but it slowed from 17% in Q2 because of FX, vertical-specific effects and lower AI-Mode monetisation. Google Cloud was the largest *observed* Q3 growth contributor at 15.20pp (61.6% of total growth), so Cloud usage, capacity and TPU recognition are the main reason the latest quarter accelerated; Search remains the larger absolute revenue lever for the next 3–12 months. [Q3 2026 Form 10-Q, Item 2—Revenue by type and Monetization Metrics pp. 48–49; Q3 2026 earnings call, Oct. 28, 2026, Q&A]



---

## earnings / 03_margin-drivers.md

_Source: `03_margin-drivers.md`_

# Margin Drivers — GOOGL

Alphabet reports under U.S. GAAP in USD and has a 31 December year-end. Unless noted, figures are reported USD millions. EBITDA means earnings before interest, tax, depreciation and amortisation; Alphabet does not report it, so the EBITDA figures below are a vendor calculation. EBIT is Alphabet's reported income from operations, or profit before interest and tax. One basis point (bp) is 0.01 percentage points.

## 1. Segment Decomposition Status

Segment decomposition is available. Google Services accounted for 85.1% of FY2025 revenue and Google Cloud 14.6%; in Q3 FY2026 the mix shifted to 75.5% and 24.1%, respectively, because Cloud revenue grew faster. Alphabet discloses revenue and operating income for Google Services, Google Cloud, and Other Bets, but does not disclose segment capex or assets. Alphabet-level activities also carry shared AI research and development (R&D) costs without revenue, so reported segment margins do not capture all group AI spending. [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025 Form 10-K, Note 15, pp. 86–87; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 15, pp. 41–42]

Sector overlay applied: **no sector overlay for advertising-led global consumer-internet platform with enterprise cloud services and early-stage technology bets — generic cost stack applies.** [analyses/GOOGL_2026-11-03/business-model/02_business-identity.md, §3a]

Cycle-position check: advertising demand is consumer-cycle sensitive, but the frozen pool does not supply a like-for-like history of advertiser budgets, ad pricing, or volume versus a prior peak and trough. Peak / mid / trough is therefore **not assessable**. Q3 revenue grew 25% year on year, but that is not evidence that the current margin is a normalised run rate; no policy tailwind is used in this report. [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025 Form 10-K, Item 1A — Advertising Revenue Risk; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2]

Limitation: the supplied Q2 and Q3 call files are compound-document binaries labelled `.rtf` with no recoverable transcript text in the frozen pool. This report therefore uses filing commentary rather than call-derived colour.

## 2. Cost Stack

| Cost Line | % of Revenue or Amount | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|
| Cost of revenues | $51,419; 40.3% of Q3 revenue, versus $41,369; 40.4% | Dollar cost +24% YoY; ratio fell 12bp | The increase included TPU-system inventory, depreciation, TAC, and YouTube content acquisition. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Results of Operations / Cost of Revenues] | High — this is the largest expense pool. |
| Other cost of revenues | +$8,600 YoY in Q3; total component amount not separately stated in the MD&A bridge | Rising | Driven by TPU-system inventory, depreciation, YouTube content, and technical-infrastructure operations. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Cost of Revenues] | High — costs are not split into a usable sensitivity. |
| Traffic-acquisition costs (TAC) | +$1,500 YoY in Q3; TAC rate 20.0% of advertising revenue versus 20.1% | Dollar cost rising; rate modestly lower | The rate change reflected a mix shift from Google Network properties to Search; Search TAC rate was substantially unchanged. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Cost of Revenues] | High — rate is tied to a large advertising base, though no consolidated sensitivity is disclosed. |
| R&D | $20,640; 16.2% of Q3 revenue, versus $15,151; 14.8% | Rising | Q3 increase of $5,489, including $3,500 employee compensation and $802 depreciation. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Research and Development] | High — ratio increased 137bp YoY. |
| Sales and marketing | $8,804; 6.9% of Q3 revenue, versus $7,205; 7.0% | Rising in dollars; modest ratio leverage | Increase included $722 advertising and promotion and $715 employee compensation. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Sales and Marketing] | Mid. |
| General and administrative (G&A) | $6,138; 4.8% of Q3 revenue, derived as total operating expense less reported R&D and sales and marketing; versus $7,393; 7.2% | Lower | The filing says G&A fell about $1.3bn, mainly because Q3 FY2025 included the effect of a $3.5bn EC fine accrual. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — General and Administrative] | High for the comparison; not a recurring efficiency assumption. |
| Depreciation | $22.0bn in the first nine months of FY2026, versus $15.1bn; Q3 amount not separately reported | Rising | Property-and-equipment depreciation starts when assets are ready for use and is mainly technical infrastructure. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Capital Expenditures and Leases] | High — cost recognition follows the infrastructure build. |
| Energy / equipment / network capacity | Not separately disclosed | Unknown | Included in technical-infrastructure operations costs; no stand-alone expense or sensitivity is disclosed. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Cost of Revenues] | High — it is part of the AI capacity cost stack. |
| Interest expense | $967 in Q3, versus $143 | Rising | Below EBIT, so it does not affect the operating-margin bridge. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Income] | Net-margin risk only. |

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | Latest | Prior Year | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 59.70% | 59.58% | +12 | Revenue grew 25% while cost of revenues grew 24%; the filing does not separately attribute the small improvement among price, volume, and cost drivers. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Income; Item 2 — Cost of Revenues] |
| EBITDA margin (calculated, not company-adjusted) | 38.66% | 36.12% | +254 | EBIT margin expanded and the calculated D&A charge grew as a share of revenue. | [data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls, CIQ Financials → Quarterly Income Statement, actual Q3 FY2025–Q3 FY2026 columns; vendor export, data as of 2026-11-03; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Income] |
| EBIT / operating margin | 31.81% | 30.51% | +129 | Lower G&A, largely a legal-cost comparison, outweighed higher R&D intensity. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Income; Item 2 — R&D and G&A] |

The CIQ sidecar's source-bound LTM read reports EBITDA of $185.516bn and a 39% LTM EBITDA margin at 30 September 2026. That is a trailing-four-quarter measure, not a substitute for the Q3 margin above; the Q3 calculated EBITDA amount is $49.320bn in the source workbook. [ciq_facts.json, `ltm_ebitda_m` and `margin_trend`, source references CIQ Financials → Income Statement, LTM ended 2026-09-30; data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls, CIQ Financials → Quarterly Income Statement, actual Q3 FY2026]

Pass-through lag is **not measurable**. The value-chain review found no disclosed automatic cost escalator and no disclosed pre-mitigation input shock from which realised recovery can be calculated. The 12bp gross-margin improvement is therefore an outcome, not proof that Alphabet passed higher infrastructure costs to customers. [analyses/GOOGL_2026-11-03/business-model/06_value-chain.md, §2]

## 4. Margin Walk — Which Margin Level Matters Most?

**EBIT margin matters most.** Gross margin misses the fast-rising R&D and G&A costs, while EBITDA adds back depreciation just as Alphabet's AI infrastructure build is making that charge economically important. Q3 EBITDA margin rose 254bp, but calculated D&A rose from $5.740bn to $8.744bn, or by 125bp of revenue; EBIT margin, at 31.81%, keeps that cost in the measure. This is an inference from the reported EBIT and vendor-calculated EBITDA, not a filing-defined margin metric. [data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls, CIQ Financials → Quarterly Income Statement, actual Q3 FY2025–Q3 FY2026 columns; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Income]

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction (Tailwind / Neutral / Headwind / Unknown) | Magnitude (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| AI technical infrastructure: depreciation, energy, equipment, and network capacity | Raises cost of revenues and R&D as new capacity enters service. | Headwind | High | Nine-month capex rose to $132.0bn from $63.6bn and P&E depreciation to $22.0bn from $15.1bn; infrastructure costs are named in cost of revenues. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Cost of Revenues; Capital Expenditures and Leases] |
| Google Cloud scale | More revenue can absorb fixed infrastructure and R&D, but the filing does not quantify the incremental margin. | Tailwind | High | Cloud revenue rose $15.6bn, or 103%, and Cloud operating income rose $7.5bn YoY despite higher TPU inventory and infrastructure usage costs. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Google Cloud] |
| TPU-system inventory and related costs | Increases other cost of revenues and moderates Cloud operating-income conversion. | Headwind | Mid | TPU inventory and related costs were a stated reason for higher other cost of revenues and higher Cloud costs. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Cost of Revenues / Google Cloud] |
| TAC and Search/Network mix | Higher revenue subject to TAC raises expense; mix reduced the total TAC rate by 10bp. | Neutral | High | Q3 TAC rose $1.5bn but the total rate fell from 20.1% to 20.0% as mix shifted toward Search. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Cost of Revenues] |
| R&D employee compensation and depreciation | Reduced EBIT margin by 137bp in the Q3 accounting bridge. | Headwind | High | R&D grew $5.489bn; $3.5bn came from employee compensation and $0.802bn from depreciation. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Research and Development] |
| Legal and other matters in G&A | Lifted the Q3 year-on-year operating-margin comparison, but the effect is not a recurring cost programme. | Tailwind | High | G&A fell about $1.3bn, mainly because Q3 FY2025 reflected a $3.5bn EC fine accrual. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — General and Administrative] |
| Advertiser spending | Revenue changes affect fixed-cost absorption across the advertising business; direct margin sensitivity is not disclosed. | Unknown | High | Online advertising supplied more than 70% of FY2025 revenue and advertiser expenditure tends to correlate with economic conditions. [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025 Form 10-K, Item 1A — Advertising Revenue Risk] |

## 6. Margin Drivers By Segment (if applicable)

### Segment: Google Services (75.5% of Q3 revenue; 40.7% FY2025 operating margin)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Advertising growth versus TAC | Revenue growth lifted operating income, while TAC rose with revenue subject to TAC. | Neutral | High | Q3 operating income increased $5.6bn, primarily from higher revenue and lower legal/other costs, partly offset by higher TAC. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Google Services] |
| Search/Network mix | A larger Search mix reduced the total TAC rate; Search's own TAC rate was substantially unchanged. | Tailwind | High | Total TAC rate fell 10bp to 20.0% of advertising revenue. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Cost of Revenues] |
| Legal-cost comparison | Boosted the reported year-on-year operating-income comparison but is not a persistent service-margin driver. | Tailwind | High | The filing identifies lower legal and other expenses in the Google Services profit change and describes the prior EC accrual in G&A. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Google Services / G&A] |

### Segment: Google Cloud (24.1% of Q3 revenue; 23.7% FY2025 operating margin)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Revenue scale | Higher Cloud revenue added operating income despite cost growth. | Tailwind | High | Q3 Cloud revenue rose $15.6bn, or 103%, and operating income rose $7.5bn. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Google Cloud] |
| TPU inventory and related costs | Compresses the incremental profit from TPU-system sales. | Headwind | Mid | The filing identifies inventory and related TPU-system costs as an offset to the Cloud operating-income increase. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Google Cloud] |
| Technical-infrastructure usage cost | Adds cost to serve Cloud demand and is not separately quantified by segment. | Headwind | High | Higher usage costs for technical infrastructure partly offset Cloud operating-income growth. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Google Cloud] |

### Segment: Other Bets (0.3% of Q3 revenue; loss-making)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Employee compensation and third-party services | Expands the segment operating loss and reduces consolidated EBIT. | Headwind | Mid | Q3 operating loss increased $621m, primarily from employee compensation; the nine-month loss increase also included third-party service fees. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Other Bets] |

### Alphabet-level activities (unallocated cost pool; no revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Shared AI R&D and infrastructure usage | Reduces consolidated EBIT but is not captured in operating-segment revenue margins. | Headwind | High | Alphabet-level activities primarily reflect shared AI R&D, including employee compensation and technical-infrastructure usage costs for general AI models. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 15] |

## 7. Margin Bridge — Latest Period

This is an **EBIT-margin accounting bridge** for Q3 FY2026 versus Q3 FY2025. It uses the same consolidated three-month basis throughout. The filing does not permit a causal split of gross margin between volume, price, input costs, and mix, so the cost-of-revenue row remains combined rather than guessed.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Cost-of-revenue ratio | +11.64 | Cost of revenues was $51,419 on $127,577 revenue versus $41,369 on $102,346 revenue. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Income] |
| R&D ratio | -137.48 | $20,640 versus $15,151. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Research and Development] |
| Sales and marketing ratio | +13.89 | $8,804 versus $7,205. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Sales and Marketing] |
| G&A ratio, including legal-cost comparison | +241.23 | $6,138 versus $7,393; the current amount is reconstructed from reported total operating expense less reported R&D and sales and marketing and agrees with the filing's description of lower G&A. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Income; Item 2 — General and Administrative] |
| Other / rounding residual | +0.01 | Exact bridge reconciliation; not a separate operating driver. |
| **Total EBIT-margin change** | **+129.29** | Operating margin: 31.8051% versus 30.5122%. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Income] |

## 7a. Bridge Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

All calculations use Q3 consolidated revenue and expense on the same reported basis; these are reported cost ratios, not price, volume, or elasticity sensitivities.

```text
Cost-of-revenue ratio: [1 − ($51,419 / $127,577)] − [1 − ($41,369 / $102,346)]
  = +0.1164 percentage points = +11.64bps of the +129.29bps observed EBIT-margin change
  → basis matches: consolidated Q3 FY2026 versus consolidated Q3 FY2025

R&D ratio: ($15,151 / $102,346) − ($20,640 / $127,577)
  = −1.3748 percentage points = −137.48bps of the +129.29bps observed change
  → basis matches: consolidated Q3 FY2026 versus consolidated Q3 FY2025

Sales and marketing ratio: ($7,205 / $102,346) − ($8,804 / $127,577)
  = +0.1389 percentage points = +13.89bps of the +129.29bps observed change
  → basis matches: consolidated Q3 FY2026 versus consolidated Q3 FY2025

G&A ratio: [($29,749 − $15,151 − $7,205) / $102,346] − [($35,582 − $20,640 − $8,804) / $127,577]
  = +2.4123 percentage points = +241.23bps of the +129.29bps observed change
  → basis matches: consolidated Q3 FY2026 versus consolidated Q3 FY2025
```

The first four components sum to **+129.28bp**. Against the reported +129.29bp total, the **+0.01bp residual** is rounding, not an attributed operating factor. The bridge fully reconciles the accounting change, but it does not establish that the G&A comparison will repeat: the filing ties it mainly to a prior-year EC fine accrual.

RF-EARN-002: margin bridge reconciled — explained 129.28bps, residual 0.01bps, total 129.29bps

## 8. The Single Biggest Margin Driver

**Verdict: Margins: AI technical-infrastructure cost (Headwind).** For the next 3–12 months, the single biggest adverse driver is the cost of building and running AI capacity: depreciation, energy, equipment, network capacity, and related usage costs. The current direction is adverse because nine-month capex more than doubled to $132.0bn and P&E depreciation rose $6.9bn to $22.0bn. The filing does not disclose a margin sensitivity, so the magnitude is a risk assessment, not a quantified forecast. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Cost of Revenues; Capital Expenditures and Leases]

For clarity on the latest quarter, the largest **accounting-bridge** contribution was instead the +241bp G&A ratio effect, which exceeds half of the +129bp total because higher R&D offset it. That effect is mainly a prior-year legal-cost comparison and should not be mistaken for underlying margin expansion. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — General and Administrative]

## 9. Investment Spend — Both Signs (only when capex/opex is running well above its own history)

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future **COST** | New servers, network equipment, and data centres become depreciable when ready for use; cost of revenues and R&D already include technical-infrastructure depreciation and usage cost. | Nine-month capex was $132.0bn versus $63.6bn, while P&E depreciation was $22.0bn versus $15.1bn. Assets under construction can take months to years to enter service, creating a recognition lag. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Capital Expenditures and Leases] |
| Spend as a **DEMAND signal** | Contracted Cloud demand and current utilisation growth can support capacity before all spend enters service. | Google Cloud revenue rose $15.6bn, or 103%, in Q3. At 30 September 2026, Alphabet reported $567.7bn revenue backlog, $560.8bn of it Cloud; just over 55% is expected to be recognised in the next 24 months. The filing cautions that timing still depends on delivery and customer utilisation. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Google Cloud; Note 1 — Revenue Backlog] |

**Current read:** the evidence favours neither a cost-only nor a demand-only interpretation. Contracted Cloud backlog and current Cloud profit growth show real demand support, while the timing and cost of the capacity build remain material. The one observable that would flip this balanced read is a fall in Cloud backlog conversion or Cloud revenue growth while technical-infrastructure depreciation and usage costs keep rising; the filing does not provide a published numeric threshold for that test.



---

## earnings / 04_guidance-consensus.md

_Source: `04_guidance-consensus.md`_

# Guidance & Consensus — GOOGL

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ Estimates Report: Consensus, Guidance, Trends, Revisions and Surprise sheets (direct pool export) |
| Data as of date | Frozen snapshot supplied for 2026-11-03. The Q3 call's embedded estimate panel was timestamped 2026-10-28 13:50 GMT; its figures differ from the export's current Trends-sheet values. [Capital IQ Estimates Report — Trends and Q3 2026 call estimate panel, data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls and data/GOOGL/Alphabet-Inc.-Q3-2026-Earnings-Call-Oct-28-2026.txt] |
| Fiscal year basis | December year-end; US GAAP; USD; consolidated. FY2026 is the year ending 31 December 2026. [Capital IQ Estimates Report — Consensus, data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls, header] |
| Analyst count | Vendor display for FQ4 2026: revenue 36/43, GAAP EPS 40/45, EBITDA 26/30. The export does not define the two-count convention, so it is preserved rather than converted into a single analyst count. [Capital IQ Estimates Report — Consensus, FQ4 2026, data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls] |
| Currency | USD millions except per-share figures; US GAAP. [Capital IQ Estimates Report — Consensus, header] |
| Calendarization issue? | No. Alphabet's next earnings period is its standalone FQ4 2026 (three months to 31 December), while the subsequent Form 10-K reports the full year. The bar below is labelled accordingly. [Capital IQ Estimates Report — Consensus, fiscal-quarter labels] |

## 1A. Reporting-Basis Reconciliation

| Field | Value |
|---|---|
| Next period the company will actually FILE | FY2026 Form 10-K for the year to 31 December 2026; the associated FQ4 results release is expected on 2 February 2027. The market's next earnings bar is the standalone FQ4 results release, not a nine-month cumulative interim report. [Capital IQ Estimates Report — Consensus, header] |
| Expected filing date + source for that date | FY2026 earnings release: 2 February 2027. The 10-K filing date is not supplied in the pool. [Capital IQ Estimates Report — Consensus, header] |
| What that filing contains | The 10-K contains the annual period; the earnings release conventionally presents the standalone Q4 result alongside the full year. This report compares the vendor's FQ4 estimates with that standalone Q4 bar and separately reconciles them to the FY presentation. |
| Vendor estimate as pulled (period label + value) | FQ4 2026 standalone: revenue $142.319bn, GAAP EPS $3.205, EBITDA $64.047bn. FY2026 direct consensus: revenue $499.429bn and GAAP EPS $19.710. [Capital IQ Estimates Report — Consensus, FQ4 and FY2026, data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls] |
| Already-reported stub inside the annual period | 9M 2026 actual: revenue $357.269bn and diluted GAAP EPS $16.33. [Q3 2026 Form 10-Q, Consolidated Statements of Income, p.5] |
| **Consensus restated onto the filing basis** — show the arithmetic | Revenue FY2026 bar derived from the Q4 estimate = $357.269bn + $142.319bn = **$499.588bn**, versus the export's direct FY2026 consensus of **$499.429bn** (a $0.159bn / 0.03% difference). Use the direct FY figure for an annual read. EPS arithmetic is $16.33 + $3.205 = $19.535, but quarterly EPS cannot be cleanly added because weighted average shares differ by period; use the direct FY GAAP EPS consensus of $19.710 instead. [Q3 2026 Form 10-Q, Consolidated Statements of Income, p.5; Capital IQ Estimates Report — Consensus, FQ4 and FY2026] |
| Basis-restated bar vs the same period a year earlier | Q4 revenue bar: $142.319bn versus reported Q4 2025 revenue of $113.828bn, or **+25.0% YoY**. FY revenue bar: $499.588bn derived / $499.429bn direct consensus versus FY2025 $402.836bn, or roughly **+24.0% YoY**. [Capital IQ Estimates Report — Consensus and Surprise, FQ4 2025/FQ4 2026/FY2025/FY2026] |

The annual-revenue check is $499.588bn / $357.269bn = **1.40x**. With nine months already reported, a valid full-year bar must be meaningfully above 1.00x; this is consistent with a standalone-Q4 estimate being added to a nine-month stub. The EPS difference is a denominator issue, not a basis to replace the vendor's direct annual EPS consensus. [Q3 2026 Form 10-Q, Consolidated Statements of Income, p.5; Capital IQ Estimates Report — Consensus, FQ4 and FY2026]

## 2. Management Guidance

Alphabet does not provide formal revenue, EBITDA/EBIT, or EPS guidance. Its formal numeric guide is FY2026 capital expenditure (CapEx, spending on long-lived infrastructure); the Q3 call also gave directional Q4 colour.

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| Revenue | FQ4 2026 | A slightly larger FX drag than in Q3, mainly in Search and YouTube Ads; lapping the prior year's Search acceleration will pressure Q4 revenue growth. | Qualitative | [Q3 2026 earnings call, prepared remarks] |
| EBITDA / EBIT | FQ4 2026 | No numeric guide. Management expects near-term Cloud-margin pressure as it ramps third-party compute capacity, and said higher depreciation and data-centre operating costs will weigh on profit and loss. | Qualitative | [Q3 2026 earnings call, prepared remarks] |
| EPS | FQ4 2026 | No formal guidance. | Qualitative | [Q3 2026 earnings call, prepared remarks] |
| CapEx | FY2026 | **$195bn–$205bn; midpoint $200bn.** The range was unchanged at Q3. | Range | [Q3 2026 earnings call, prepared remarks] |
| Google Cloud / TPU systems | FQ4 2026 / FY2027 | TPU-system sales are expected to scale in Q4, followed by a meaningful revenue ramp in 2027. This is directional, not a revenue target. | Qualitative | [Q3 2026 earnings call, prepared remarks] |

## 3. Guidance vs Consensus Table

Gap = consensus minus management guidance midpoint. A positive spending gap means expected CapEx is above the midpoint.

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | FQ4 2026 | No formal numeric guide; qualitative revenue-growth pressure | $142.319bn | N/A | Not comparable to a numeric guide |
| EBITDA | FQ4 2026 | No formal numeric guide; near-term Cloud-margin headwind | $64.047bn | N/A | Not comparable to a numeric guide |
| GAAP EPS | FQ4 2026 | No formal guidance | $3.205 | N/A | Not comparable to a numeric guide |
| CapEx | FY2026 | $195bn–$205bn; $200bn midpoint | $201.207bn | +$1.207bn | Street above midpoint but **inside** the guided range |

FQ4 revenue, EBITDA, and GAAP-EPS consensus are direct reads of the CIQ Consensus sheet; the CapEx estimate is its FY2026 cash-outflow entry, shown above as positive spend. [Capital IQ Estimates Report — Consensus, FQ4 and FY2026, data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls]

The CapEx consensus uses the absolute value of the vendor's cash-outflow convention. Management's range and the vendor's $201.207bn estimate are therefore on the same spending basis. [Capital IQ Estimates Report — Guidance and Consensus, FY2026; Q3 2026 earnings call, prepared remarks]

## 4. Estimate Revision Momentum Table

The export supplies 1-, 2-, and 3-month points rather than exact 30-, 60-, and 90-calendar-day observations. They are shown as the closest available revision intervals.

| Estimate | 90 Days Ago (3 months) | 60 Days Ago (2 months) | 30 Days Ago (1 month) | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (next Q: FQ4 2026, $m) | 140,966.86 | 141,095.55 | 141,724.32 | 142,318.56 | Rising |
| GAAP EPS (next Q: FQ4 2026, $/share) | 3.33 | 3.33 | 3.35 | 3.21 | Falling |
| Revenue (FY2026, $m) | 497,686.10 | 498,042.57 | 498,627.56 | 499,429.25 | Rising |
| GAAP EPS (FY2026, $/share) | 20.58 | 20.60 | 20.63 | 19.71 | Falling |

[Capital IQ Estimates Report — Trends, FQ4 2026 and FY2026, data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls, frozen snapshot 2026-11-03]

Revenue revisions are modestly positive: the FQ4 revenue estimate is 1.0% above its three-month-ago level, and FY2026 revenue is 0.4% higher. EPS moved the other way: FQ4 GAAP EPS is 4.2% below one month ago and FY2026 GAAP EPS is 4.5% lower. This divergence matters because management explicitly flagged near-term Cloud-margin pressure; revenue momentum does not establish an unchanged profit bar. [Capital IQ Estimates Report — Trends, FQ4 2026 and FY2026; Q3 2026 earnings call, prepared remarks]

## 5. Revision Breadth

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue FY2026 | 30 | 14 | +16 | Last month |
| EBITDA FY2026 | 7 | 22 | -15 | Last month |
| GAAP EPS FY2026 | 2 | 44 | -42 | Last month |

The revenue and EPS breadth values reconcile to the deterministic sidecar: FY2026 revenue revisions were 30 up / 14 down and GAAP EPS revisions were 2 up / 44 down. [CIQ Estimates→Revisions (Last-Month breadth, FY; `ciq_facts.json` source reference); Capital IQ Estimates Report — Revisions, FY2026]

## 6. Historical Beat / Miss Pattern

| Period | Revenue Beat/Miss | EPS Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| FQ4 2025 | Beat | Beat | Revenue +2.10%; GAAP EPS +6.82% | Actual revenue $113.828bn; EPS $2.82. |
| FQ1 2026 | Beat | Beat | Revenue +2.67%; GAAP EPS +91.39% | Actual GAAP EPS $5.11 versus $2.67 estimate; the size means this result is not a clean operating run-rate signal. |
| FQ2 2026 | Beat | Beat | Revenue +2.41%; GAAP EPS +214.14% | Actual GAAP EPS $9.11 versus $2.90 estimate; similarly, do not extrapolate the percentage surprise. |
| FQ3 2026 | Miss | Miss | Revenue -0.26%; GAAP EPS -29.57% | Actual revenue $127.577bn; GAAP EPS $2.12 versus $3.01 estimate. |

[Capital IQ Estimates Report — Surprise, FQ4 2025 through FQ3 2026, data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls; Q3 2026 earnings call, estimate panel]

## 7. Bar Assessment

**Bar is high.** This is not because Street revenue is above a formal company revenue target—Alphabet gave none. It is because the FQ4 revenue bar remains $142.319bn, requiring 25.0% year-on-year growth, after a 1.0% three-month increase; FY2026 revenue breadth is also +16. [Capital IQ Estimates Report — Consensus, Trends and Revisions, FQ4/FY2026]

The counterweight is material: FQ4 and FY2026 GAAP EPS estimates have both been cut, and EPS breadth is -42, which partly lowers the profit hurdle. That does not make the setup easy: management also warned that FX, Search comparisons and third-party compute will pressure Q4 revenue growth or Cloud margins. The correct read is a demanding revenue bar with a reduced, but still uncertain, GAAP-EPS bar—not a claim that management has provided a numerical earnings target. [Capital IQ Estimates Report — Trends and Revisions, FQ4/FY2026; Q3 2026 earnings call, prepared remarks]



---

## earnings / 05_beat-miss-setup.md

_Source: `05_beat-miss-setup.md`_

# Beat / Miss Setup — GOOGL

## 1. Next Reporting Period Context

Alphabet will next file its FY2026 Form 10-K for the year ending 31 December 2026. The associated earnings release, expected on 2 February 2027, will present the standalone FQ4 result; it is not a cumulative interim-reporting basis. [Capital IQ Estimates Report — Consensus, header, `data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls`]

The FQ4 2026 standalone bar is revenue of **$142.319bn**, GAAP diluted EPS of **$3.205**, and EBITDA of **$64.047bn** (vendor-calculated EBITDA; Alphabet does not give EBITDA guidance). The direct FY2026 consensus read is revenue of **$499.429bn** and GAAP EPS of **$19.710**; the revenue check is $357.269bn of reported nine-month revenue plus the $142.319bn FQ4 estimate = $499.588bn, only $0.159bn above the direct FY number. The FQ4 revenue bar requires 25.0% growth from Q4 2025 revenue of $113.828bn. [Capital IQ Estimates Report — Consensus, FQ4 and FY2026; Q3 2026 Form 10-Q, Consolidated Statements of Income]

The Capital IQ facts sidecar reconciles to the workbook revision read used here: FY2026 revenue has 30 upward and 14 downward revisions in the last month, while GAAP EPS has 2 upward and 44 downward revisions. [CIQ facts sidecar, `revenue_revisions` and `eps_revisions`, source: CIQ Estimates→Revisions (Last-Month breadth, FY)]

## 2. Beat Scenarios

Likelihood labels are **judgment**, not measured frequencies. They reflect the latest reported operating data, the disclosed backlog, and management's Q4 commentary; they are not a statistical forecast.

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Cloud capacity converts into Q4 revenue | Cloud consumption, subscriptions and TPU-system sales | Third-party bridging capacity has to ramp on time, customer use has to convert, and Cloud/TPU-system revenue must offset the tougher Search comparison sufficiently to clear the $142.319bn total-revenue bar. | Mid | Q3 Cloud revenue was $30.709bn, up 103% year on year; Cloud backlog was $560.8bn, though recognition remains conditional on delivery and customer use. [Q3 2026 Form 10-Q, Item 2 — Google Cloud; Note 1 — Revenue Backlog] |
| Search traffic and realised monetisation remain resilient | Search advertiser demand, paid clicks and CPC | Query growth, advertiser spending and ad delivery must keep Search near its Q3 pace despite FX and a tougher prior-year comparison. | Mid | Q3 Search & other revenue was $63.350bn, up 12%; paid clicks rose 8% and CPC 4%. This had already slowed from Q2's 17% growth. [Q3 2026 Form 10-Q, Item 2 — Financial Results and Monetization Metrics; Q3 2026 earnings call, Q&A] |
| Revenue mix is better than the cost burden | Cloud scale versus AI-infrastructure and TPU-system costs | High-margin Services revenue and Cloud scale must absorb third-party compute, depreciation, TPU inventory and R&D more effectively than the lowered EPS bar assumes. | Low | Cloud operating income rose with revenue in Q3, but the filing identifies TPU inventory and infrastructure-usage costs as offsets; management also flagged near-term Cloud-margin pressure. [Q3 2026 Form 10-Q, Item 2 — Google Cloud; Q3 2026 earnings call, prepared remarks] |

## 3. Miss Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Search and YouTube growth decelerate more than the Cloud uplift can cover | FX, difficult Search comparison, advertiser demand and AI-Search monetisation | A larger-than-Q3 FX drag, the prior-year Search comparison, or slower advertiser spending would need to reduce Services growth while the Street still requires 25.0% consolidated revenue growth. | High | Management said Q4 would face a somewhat larger FX headwind, chiefly Search and YouTube ads, and would lap prior-year Search acceleration. [Q3 2026 earnings call, prepared remarks] |
| Backlog conversion and TPU-system delivery arrive later than the bar assumes | Capacity, customer use and TPU-system recognition | Capacity availability or customer deployment would need to slip. A large backlog is support for demand, not booked Q4 revenue. | Mid | The filing says Cloud revenue depends on customer usage, demand and supply availability; it also says the significant majority of revenue from the limited TPU-system agreements will be recognised in 2027. [Q3 2026 Form 10-Q, Item 2 — Google Cloud] |
| AI capacity costs drive an EBIT/EPS miss despite an in-line revenue print | Third-party compute, depreciation, TPU inventory and R&D | Third-party capacity ramp, data-centre costs and depreciation would need to rise faster than incremental gross profit and Services cost leverage. | High | Nine-month capex was $132.0bn versus $63.6bn a year earlier and depreciation was $22.0bn versus $15.1bn. Management said higher depreciation and data-centre operating costs would weigh on profit and loss. [Q3 2026 Form 10-Q, Item 2 — Capital Expenditures and Leases; Q3 2026 earnings call, prepared remarks] |

## 4. What Magnitude Matters?

| Metric | Consensus / Bar | Material Beat Threshold | Material Miss Threshold | Why |
|---|---:|---:|---:|---|
| Revenue | $142.319bn, standalone FQ4 | Working threshold: at least 1% / about $1.423bn above bar | Working threshold: at least 1% / about $1.423bn below bar | This is a judgmental materiality scale, not a company threshold. It is below the prior three revenue beats (+2.10%, +2.67%, +2.41%) but above the Q3 miss (−0.26%). [Capital IQ Estimates Report — Consensus and Surprise, FQ4 2025–FQ3 2026] |
| EBITDA | $64.047bn, standalone FQ4 | Not assessable from evidence; 1% equals about $0.640bn | Not assessable from evidence; 1% equals about $0.640bn | Alphabet does not report or guide EBITDA and the pool has no historical quarterly EBITDA-surprise series. Treat it as a vendor-calculated cross-check, not a management target. [Capital IQ Estimates Report — Consensus, FQ4 2026] |
| GAAP EPS | $3.205, standalone FQ4 | No evidence-based fixed threshold | No evidence-based fixed threshold | GAAP EPS has been distorted by non-operating items: the vendor series records a $98.999bn Q2 investment-sale gain, while Q3 included $8.221bn other expense. Any EPS result needs an EBIT and cash-spend check. [CIQ Financials → Quarterly Income Statement, Q2–Q3 2026; Q3 2026 Form 10-Q, Consolidated Statements of Income] |
| Guidance | No formal Q4 revenue, EBIT/EBITDA or EPS guidance; FY2026 capex range $195bn–$205bn | Clear evidence that Cloud conversion or margin pressure is better than the stated qualitative caution | A final capex result outside $195bn–$205bn, or worse Cloud-margin/capacity commentary | Alphabet's only numeric guide is annual capex; its $201.207bn consensus spend is inside the guided range, so the qualitative Cloud/FX commentary matters more to the next print. [Q3 2026 earnings call, prepared remarks; Capital IQ Estimates Report — Guidance and Consensus, FY2026] |

## 5. In-Line Print But Bad Guidance Risk

| Risk | Evidence | Why It Matters |
|---|---|---|
| In-line Q4 revenue but a weaker 2027 Cloud timing read | The filing says the significant majority of revenue from disclosed TPU-system agreements is expected in 2027, while recognition depends on delivery and customer use. [Q3 2026 Form 10-Q, Item 2 — Google Cloud] | A Q4 print can meet the bar while the timing of the main next-year revenue ramp becomes less certain. |
| Beat current-quarter revenue but guide to lower Cloud margins | Management expects near-term Cloud-margin pressure as third-party compute capacity ramps and says higher depreciation and data-centre operating costs will weigh on profit and loss. [Q3 2026 earnings call, prepared remarks] | This would challenge earnings quality even if a high-revenue print looks favorable. |
| Beat GAAP EPS due to one-offs, but miss operating quality | Q2's vendor series contains a $98.999bn investment-sale gain and Q3 had $8.221bn of other expense. [CIQ Financials → Quarterly Income Statement, Q2–Q3 2026; Q3 2026 Form 10-Q, Consolidated Statements of Income] | GAAP EPS alone is not a clean operating gauge; EBIT and cost trends need to support it. |
| Beat revenue but cash conversion remains weak | TTM CFO was $179.551bn, but capex was $159.804bn, leaving CFO minus capex FCF of $19.747bn versus $73.552bn a year earlier. [CIQ facts sidecar, `ltm_ocf_m`; CIQ Financials → Cash Flow, LTM ended 2026-09-30; CIQ Financials → Quarterly Cash Flow, Q4 2025–Q3 2026] | The capacity build can make a revenue beat less valuable if cash spending continues to outpace operating cash generation. This is capex-driven cash-conversion risk, not a claim about working-capital deterioration. |

## 6. Seasonality Read

Seasonality increases the importance of FQ4: it averaged 28.0% of annual revenue in FY2023–FY2025, above Q3's 25.2% and the other quarters. That gives a large seasonal revenue base, but it does not lower the hurdle because the FQ4 2026 consensus bar still requires 25.0% year-on-year growth. [CIQ Financials → Quarterly Income Statement, FY2023–FY2025; Capital IQ Estimates Report — Consensus and Surprise, FQ4 2025/FQ4 2026]

## 7. Historical Pattern

The last four reported quarters show three revenue/EPS beats followed by an FQ3 2026 revenue and EPS miss. This is not a systematic beat pattern: the sample has only four observations, and the two unusually large EPS beats were affected by non-operating items. It is judgment informed by that short sample, not an empirical frequency; the synthesizer should give the series limited weight. [Capital IQ Estimates Report — Surprise, FQ4 2025–FQ3 2026; CIQ Financials → Quarterly Income Statement, Q2–Q3 2026]

## 8. Setup Verdict

**Setup favors miss.** The single most important factor is whether Search and YouTube can sustain enough growth, after the stated FX and comparison pressure, for Alphabet to clear a 25.0% consolidated revenue bar; Cloud demand is real, but its conversion cannot be assumed from backlog alone. The biggest factor that could flip this verdict is faster-than-expected Q4 Cloud/TPU delivery, which would need to overcome both the Services slowdown risk and the stated near-term Cloud-cost pressure. [Q3 2026 earnings call, prepared remarks; Q3 2026 Form 10-Q, Item 2 — Google Cloud; Capital IQ Estimates Report — Consensus, FQ4 2026]

## 9. Second-Quarter Look-Ahead

Visibility for the quarter after FQ4 is limited because the provided consensus setup is for FQ4, not FQ1 2027. Directionally, revenue could improve if the TPU-system agreements begin to supply the 2027 revenue ramp described in the filing, but the same transition keeps depreciation, infrastructure usage and inventory costs in focus; no FQ1 numerical bar is proven from available data. [Q3 2026 Form 10-Q, Item 2 — Google Cloud and Cost of Revenues]

## 10. Pre-Mortem

If this setup fails, the likely error is treating management's Q4 caution and the difficult revenue hurdle as decisive while Cloud capacity, TPU-system deliveries and Search monetisation convert faster than disclosed data can show. The opposite error is also plausible: the report may understate how much the Q4 bar relies on timely conversion of Cloud demand and on cost absorption that Alphabet does not quantify; the February 2027 results release will resolve both tests. [Q3 2026 Form 10-Q, Item 2 — Google Cloud; Q3 2026 earnings call, prepared remarks]



---

## earnings / 06_earnings-quality.md

_Source: `06_earnings-quality.md`_

# Earnings Quality — GOOGL

Alphabet reports under U.S. GAAP in USD and has a 31 December year-end. All figures below are USD millions unless stated otherwise. EBITDA (earnings before interest, tax, depreciation and amortisation) is calculated as income from operations plus depreciation; Alphabet does not report company-adjusted EBITDA.

## 1. EBITDA → CFO → FCF Bridge (3–5 years)

| Item | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---|
| EBITDA (calculated; not company-adjusted) | 96,239 | 127,701 | 150,175 | Improving |
| Working-capital cash-flow change | (3,845) | (8,406) | 618 | Improving |
| Cash tax paid *(memo; already embedded in CFO)* | (19,164) | (27,353) | (21,526) | Volatile |
| Interest paid | Not separately disclosed | Not separately disclosed | Not separately disclosed | Not assessable |
| Other cash-flow reconciliation residual *(includes SBC, deferred taxes, investment gains/losses and other non-working-capital items)* | 9,352 | 6,004 | 13,920 | Volatile |
| **CFO** | **101,746** | **125,299** | **164,713** | **Improving** |
| Maintenance capex | Not disclosed | Not disclosed | Not disclosed | Not assessable |
| Growth capex | Not disclosed | Not disclosed | Not disclosed | Not assessable |
| Total capex *(used)* | (32,251) | (52,535) | (91,447) | Rising rapidly |
| **FCF (CFO − total capex)** | **69,495** | **72,764** | **73,266** | **Stable annually** |
| **CFO / EBITDA %** | **105.7%** | **98.1%** | **109.7%** | **Healthy, volatile** |

The bridge reconciles as CFO = EBITDA + working-capital cash-flow change + other residual; cash tax paid is shown as a memorandum item rather than added again. For example, FY2025 is $150,175m + $618m + $13,920m = $164,713m. The residual includes non-cash and non-operating reconciliation items, so it should not be read as recurring operating profit. [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025 Form 10-K, Consolidated Statements of Income p.49, Cash Flows p.51 and Note 14 p.85]

Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow. No disclosed one-off cash receipt can be quantified and removed from annual CFO, so normalised operating FCF is the reported CFO-minus-total-capex figure above; the filing says the 2025 tax-law changes affected operating cash flow but does not quantify the cash effect. [FY2025 Form 10-K, Item 7 and Note 14]

The latest run-rate is materially different: TTM September 2026 CFO was $179,551m and total capex $159,804m, producing FCF of $19,747m. The deterministic CIQ facts read confirms the same CFO and LTM EBITDA of $185,516m; CFO/EBITDA is therefore 96.8%. [CIQ Financials → Cash Flow / Income Statement, LTM ended 2026-09-30; ciq_facts.json; CIQ Financials → Cash Flow, LTM ended 2026-09-30]

## 2. Cash Conversion Assessment

CFO tracked calculated EBITDA well over FY2023–FY2025: conversion was 105.7%, 98.1%, and 109.7%, each above the 70% healthy threshold. The 96.8% TTM conversion remains cash-backed, so there is no cash-conversion breakdown. [FY2025 Form 10-K, Consolidated Statements of Cash Flows p.51; CIQ Financials → Cash Flow / Income Statement, LTM ended 2026-09-30; ciq_facts.json]

The caution is free cash flow, not collection: annual FCF held near $69.5bn–$73.3bn through FY2025, but TTM FCF fell to $19.7bn because capex rose to $159.8bn. This is an investment-intensity change rather than evidence that historical CFO was fictitious. [FY2025 Form 10-K, Consolidated Statements of Cash Flows p.51; CIQ Financials → Cash Flow, LTM ended 2026-09-30]

## 3. Working Capital Trends

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 52.4 | 52.3 | 52.2 | Stable | Low |
| Inventory days (DIO) | Not assessable | Not assessable | Not assessable | Inventory became material in FY2026 | Medium |
| Payable days (DPO) | 17.3 | 19.3 | 22.7 | Rising | Medium |
| Cash conversion cycle (DSO + DIO − DPO) | Not assessable | Not assessable | Not assessable | Not assessable | Not assessable |

DSO uses average receivables divided by revenue; DPO uses average accounts payable divided by cost of revenues. FY2023–FY2025 DSO calculations use average receivables of $44,111m, $50,152m and $57,613m; DPO uses average payables of $6,311m, $7,740m and $10,094m. DIO and the cash-conversion cycle cannot be calculated on a comparable three-year basis because inventory was not separately disclosed in the FY2023 and FY2024 year-end balance sheets. [FY2024 Form 10-K, Consolidated Balance Sheets p.52 and Statements of Income p.53; FY2025 Form 10-K, Consolidated Balance Sheets p.48 and Statements of Income p.49]

Closing receivables rose faster than revenue in FY2023 (19.1% versus 8.7%) and FY2025 (20.1% versus 15.1%), which is why the accrual screen below is conservatively flagged. That signal does not establish weaker collection: the average-balance DSO series is flat at about 52 days. [FY2024 Form 10-K, Consolidated Balance Sheets p.52 and Statements of Income p.53; FY2025 Form 10-K, Consolidated Balance Sheets p.48 and Statements of Income p.49]

Inventory is the current watch item. It rose from $2,439m at 31 December 2025 to $13,308m at 30 September 2026, while nine-month cost of revenues rose 18.7% year on year; Alphabet attributes higher costs partly to TPU-system inventory and related costs. The balance-sheet stock and the nine-month cost flow are not a clean matched-basis ratio, so this is a flag for verification, not evidence of channel stuffing. [Q3 2026 Form 10-Q, Consolidated Balance Sheets p.4, Statements of Income p.5 and Item 2 — Cost of Revenues]

## 4. Non-GAAP Adjustments

| Adjustment | Amount | Recurring? (Y/N) | Concern Level (Low / Mid / High) | Evidence |
|---|---:|---|---|---|
| Company-adjusted EBITDA, EBIT, net income or EPS | Not disclosed | N/A | Low | Alphabet presents GAAP income from operations, net income and EPS; no company-adjusted reconciliation was identified in the reviewed FY2025 10-K or Q3 FY2026 10-Q. [FY2025 Form 10-K, Consolidated Statements of Income p.49; Q3 2026 Form 10-Q, Consolidated Statements of Income p.5] |

Stock-based compensation was a $24,953m GAAP expense in FY2025 and is added back in the cash-flow statement; it is not an adjustment that Alphabet excluded from a disclosed adjusted-earnings measure. It remains economically relevant because it is settled in shares, but the filings do not present an adjusted metric that removes it. [FY2025 Form 10-K, Consolidated Statements of Cash Flows p.51 and Note 1 — Stock-Based Compensation]

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification (Genuine / Suspicious / Recurring "one-off") | Evidence |
|---|---|---:|---|---|
| Net gains on equity securities, primarily unrealised gains on non-marketable securities | FY2025 | 24,100 | Recurring non-operating category, but volatile rather than repeatable | Included in FY2025 OI&E; cash flow reverses the broader $24,620m debt-and-equity-security gain. [FY2025 Form 10-K, Item 7 — Executive Overview; Consolidated Statements of Cash Flows p.51] |
| EC fine and separate legal accrual identified by the filing | FY2025 | 4,900 | Genuine discrete operating charge; amount identified is partial | The filing identifies a $3.5bn EC fine and $1.4bn legal accrual within a $6.2bn year-on-year rise in legal and other matters. [FY2025 Form 10-K, Item 7 — General and Administrative] |
| U.S. tax-law change allowing immediate R&D expensing and accelerated depreciation | FY2025 | Not quantified | Genuine, but cash and income-statement effect cannot be normalised | The filing says the change affected FY2025 results and operating cash flow but gives no itemised dollar effect. [FY2025 Form 10-K, Item 7; Note 14] |
| Net gain on equity securities, mostly unrealised non-marketable-security gains | 9M FY2026 | 127,282 | Recurring non-operating category, highly volatile | $116,316m of the nine-month total was unrealised gain on non-marketable securities; the total exceeded nine-month operating income of $121,042m. [Q3 2026 Form 10-Q, Note 3 — Gains and Losses on Equity Securities; Consolidated Statements of Income p.5] |

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | N | Revenue grew 8.7%, 13.9% and 15.1% in FY2023–FY2025, versus CFO growth of 11.2%, 23.1% and 31.5%. [FY2025 Form 10-K, Consolidated Statements of Income p.49 and Cash Flows p.51] |
| Receivables growing faster than revenue | Y | Closing receivables outgrew revenue in FY2023 and FY2025, though DSO was stable at 52.4, 52.3 and 52.2 days. [FY2024 Form 10-K, Consolidated Balance Sheets p.52; FY2025 Form 10-K, Consolidated Balance Sheets p.48 and Statements of Income p.49] |
| Inventory growing faster than COGS | Y | Inventory increased 445.6% from 31 December 2025 to 30 September 2026, against 18.7% growth in nine-month cost of revenues. This is a balance-flow comparison and the filing attributes costs to TPU-system inventory, so causality is not proven. [Q3 2026 Form 10-Q, Consolidated Balance Sheets p.4, Statements of Income p.5 and Item 2 — Cost of Revenues] |
| Deferred revenue declining (if subscription/contract business) | N | Total deferred revenue rose from $6.0bn at FY2024 to $8.6bn at FY2025 and $12.6bn at 30 September 2026. [FY2025 Form 10-K, Note 2 — Deferred Revenues; Q3 2026 Form 10-Q, Note 2 — Deferred Revenues] |
| Capitalized costs growing as % of revenue | N | Software-development costs meeting capitalization criteria were not material for the periods presented. [FY2025 Form 10-K, Note 1 — Software Development Costs] |
| Frequent accounting policy changes | N | No frequent accounting-policy change was identified in the reviewed FY2025 10-K or Q3 FY2026 10-Q. [FY2025 Form 10-K, Note 1; Q3 2026 Form 10-Q, Note 1] |

RF-EQ-001 (rising accruals divergent from cash earnings)

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | Not reported by Alphabet | Not disclosed | N/A | N/A | N/A | Alphabet reports operating income, not company EBITDA or adjusted EBITDA. [Q3 2026 Form 10-Q, Consolidated Statements of Income p.5] |
| EBIT / income from operations | 40,576 (Q3 FY2026) | Not disclosed | N/A | N/A | N/A | [Q3 2026 Form 10-Q, Consolidated Statements of Income p.5] |
| Net income available to common stockholders | 26,170 (Q3 FY2026) | Not disclosed | N/A | N/A | N/A | [Q3 2026 Form 10-Q, Item 2 — Executive Overview] |
| Diluted EPS | $2.12 (Q3 FY2026) | Not disclosed | N/A | N/A | N/A | [Q3 2026 Form 10-Q, Item 2 — Executive Overview] |

Alphabet does not disclose adjusted metrics in the reviewed filings. The absence of a company-defined adjustment does not make GAAP net income a clean measure of operating run-rate because OI&E includes investment gains and losses.

## 8. Accounting Trap Checklist

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | N | No company-adjusted earnings metric was disclosed; FY2025 SBC was recorded as GAAP expense. [FY2025 Form 10-K, Consolidated Statements of Cash Flows p.51] | 10 |
| Restructuring costs recur every year | N | No recurring restructuring charge was identified in the reviewed filings. [FY2025 Form 10-K, Consolidated Statements of Income p.49; Q3 2026 Form 10-Q, Consolidated Statements of Income p.5] | 5 |
| Capitalized costs rising faster than revenue | N | Capitalized software-development costs were not material. [FY2025 Form 10-K, Note 1 — Software Development Costs] | 5 |
| Receivable factoring / supplier finance disclosed | N | Not disclosed in the reviewed 10-K or 10-Q. [FY2025 Form 10-K, Note 1; Q3 2026 Form 10-Q, Note 1] | 10 |
| Inventory write-downs or reserve releases | N | No write-down or reserve release was identified; inventory build is separately flagged in Section 6. [Q3 2026 Form 10-Q, Note 1 — Inventory; Consolidated Balance Sheets p.4] | 30 |
| Revenue recognized before cash-collection risk is clear | N | Payment terms are not significant, and Alphabet evaluates customer credit and limits credit extended; this does not remove normal credit risk. [FY2025 Form 10-K, Note 1 — Accounts Receivable] | 15 |
| Change in useful life / depreciation assumptions | N | No change was identified; depreciation begins when assets are ready for use. [FY2025 Form 10-K, Item 7 — Capital Expenditures and Leases] | 5 |
| Tax rate unusually low or boosted by one-off | N | FY2025 effective tax rate was 16.8%, up from 16.4%; tax-law effects were disclosed but not quantified. [FY2025 Form 10-K, Item 7 and Note 14] | 20 |
| Large fair-value / mark-to-market gains | Y | FY2025 net gains on equity securities were $24.1bn; 9M FY2026 equity-security gains were $127.3bn, primarily unrealised. [FY2025 Form 10-K, Item 7; Q3 2026 Form 10-Q, Note 3] | 80 |

## 9. Earnings Quality Score

**68 /100 — Mostly clean but some working-capital or adjustment noise.** Operating cash conversion is consistently high, and the filings do not show a company-adjusted metric that removes normal costs. The score is held below the upper band because GAAP net income and EPS are materially distorted by volatile, largely unrealised investment gains, while current AI infrastructure capex has sharply reduced CFO-minus-capex FCF. [FY2025 Form 10-K, Consolidated Statements of Cash Flows p.51 and Item 7; Q3 2026 Form 10-Q, Note 3 and Consolidated Statements of Cash Flows]

## 10. The Single Biggest Quality Concern

The biggest risk is treating GAAP net income or EPS as a repeatable operating earnings run-rate. In the first nine months of FY2026, $127.3bn of equity-security gains in other income exceeded the $121.0bn of income from operations, and $116.3bn of that gain was unrealised on non-marketable securities. The cash-flow statement reverses $126.8bn of debt-and-equity-security gains, which is consistent with the gain not being operating cash generation. This is not evidence of fabricated revenue: annual CFO/EBITDA remains near 100%. It does mean investors should anchor on operating profit and CFO, then recognise that TTM FCF after total capex was only $19.7bn as infrastructure spending increased. [Q3 2026 Form 10-Q, Note 3 — Gains and Losses on Equity Securities; Consolidated Statements of Income p.5 and Cash Flows; CIQ Financials → Cash Flow, LTM ended 2026-09-30]



---

## earnings / 07_earnings-sensitivity.md

_Source: `07_earnings-sensitivity.md`_

# Earnings Sensitivity — GOOGL

## 1. Variable Selection

Seven variables were selected from the highest-magnitude revenue and margin drivers: Search advertiser demand, Google Cloud revenue conversion, technical-infrastructure cost intensity, R&D intensity, traffic-acquisition costs (TAC), legal and regulatory charges, and FX. Consumer-cycle exposure, regulation, and FX were also identified in the business-model external-dependency review. The common operating measure below is reported EBIT (income from operations, or profit before interest and tax), not EBITDA: Alphabet does not report adjusted EBITDA, and adding back depreciation would hide a cost that is rising with the AI infrastructure build. All operating impacts are pre-tax, for a Q3 FY2026-sized quarter, and are sensitivities rather than forecasts. Q3 reported EBIT was $40.576bn. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Income]

## 2. Sensitivity Table

No company-disclosed operating sensitivity exists for Search, Cloud, AI infrastructure, R&D, TAC, or regulatory charges. Static-margin and rate calculations below are therefore labelled inference, not from filings; they are useful stress arithmetic, not predicted earnings outcomes. A zero-mitigation assumption is a bound, not an expected outcome.

| Variable | Base Case | Move Basis | Bull Case | EPS/EBITDA Impact (bull) | Bear Case | EPS/EBITDA Impact (bear) | Mitigation assumed | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|---|
| Search advertiser demand and monetisation | Q3 Google Search & other revenue $63.350bn; Google Services reported operating margin 40.66% ($39.157bn / $96.302bn). | ±10% of Search revenue: the upstream driver table uses a 10–20% revenue move to distinguish high-magnitude drivers. This is inference, not from filings. | +$6.335bn Search revenue. | **+$2.576bn reported EBIT** at the static Q3 Google Services margin: $6.335bn × 40.66%. This is not a disclosed incremental margin. | −$6.335bn Search revenue. | **−$2.576bn reported EBIT** on the same static-margin basis. | N/A — revenue/margin proxy; it holds the current segment margin fixed rather than assuming an unmitigated input-cost shock. | Low | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Revenue by Type; Note 15 — Segments] |
| Google Cloud consumption, subscriptions, and TPU-system sales | Q3 Cloud revenue $30.709bn; reported Cloud operating margin 36.21% ($11.121bn / $30.709bn). | ±10% of Cloud revenue, below the 103% year-on-year rise but not a company-provided sensitivity. Static margin is inference, not from filings. | +$3.071bn Cloud revenue. | **+$1.112bn reported EBIT** at the static Q3 Cloud margin: $3.071bn × 36.21%. Product mix, TPU-system sales, and central-cost allocations can make the actual conversion different. | −$3.071bn Cloud revenue. | **−$1.112bn reported EBIT** on the same static-margin basis. | N/A — revenue/margin proxy; capacity, pricing, and cost response are not modelled. | Low | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Revenue by Type; Note 15 — Segments; Note 1 — Revenue Recognition] |
| Technical-infrastructure cost intensity, including depreciation, energy, equipment, and network capacity | Q3 cost of revenues $51.419bn, 40.30% of revenue. Nine-month P&E depreciation was $21.955bn, up from $15.096bn; infrastructure costs are not separately disclosed. | ±100bp of consolidated cost of revenues as a share of fixed Q3 revenue. This is a bounded all-cost-of-revenue stress, not an AI-only sensitivity. | Cost ratio 100bp lower. | **+$1.276bn reported EBIT**: $127.577bn × 1.00%. | Cost ratio 100bp higher. | **−$1.276bn reported EBIT**: $127.577bn × 1.00%. | **0% — bound; realised offset not computable from the pool.** The filings show no pre-mitigation infrastructure-cost shock from which price, mix, or sourcing recovery can be measured. | Low | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Income; Item 2 — Capital Expenditures and Leases] |
| R&D intensity, including employee compensation and depreciation | Q3 R&D $20.640bn, 16.18% of revenue, up from 14.80% a year earlier. | ±100bp of R&D as a share of fixed Q3 revenue. The latest reported year-on-year movement was +137.48bp, so this is within the observed quarterly change. | R&D ratio 100bp lower. | **+$1.276bn reported EBIT**: $127.577bn × 1.00%. | R&D ratio 100bp higher. | **−$1.276bn reported EBIT**: $127.577bn × 1.00%. | N/A — this is the all-in reported spending rate, a management and operating-mix lever rather than a separately measurable external input shock. | Medium | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Income; Item 2 — Research and Development] |
| Legal and regulatory charge accruals | Q3 G&A $6.138bn. The comparable Q3 FY2025 included the effect of a $3.5bn European Commission fine accrual. | Historical disclosed one-off charge; it is a discrete stress, not a recurring run-rate assumption. | No incremental charge relative to the current Q3 base. | $0 incremental reported-EBIT effect. | A charge equal to the Q3 FY2025 $3.5bn accrual. | **−$3.500bn reported EBIT**. This is a one-way historical stress, not a claim that another charge will occur. | **0% — bound.** A legal accrual cannot be assumed to be offset in the same period through pricing, hedging, or a cost programme. | Medium | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — General and Administrative] |
| TAC rate and Search/Network mix | Q3 Google advertising revenue $82.012bn; total TAC rate 20.0%, 10bp below the prior-year rate. | ±10bp of the TAC rate, equal to the latest reported year-on-year rate movement. | TAC rate 10bp lower. | **+$0.082bn reported EBIT**: $82.012bn × 0.10%. | TAC rate 10bp higher. | **−$0.082bn reported EBIT**: $82.012bn × 0.10%. | N/A — this is the observed post-mix TAC rate; it is not a contractual pass-through or separate mitigation estimate. | Medium | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Cost of Revenues; Revenue by Type] |
| FX remeasurement of foreign-denominated monetary assets and liabilities | FY2025 market-risk analysis: a hypothetical adverse 10% exchange-rate move, after derivatives. | Company-disclosed 10% adverse FX sensitivity as of 31 December 2025. | A symmetric favourable impact was not disclosed. | Impact: not quantifiable from the filing on a symmetric basis. | Adverse 10% exchange-rate move. | **−$0.671bn in other income (expense), net (OI&E), after derivatives; not an EBIT or EBITDA impact.** | Derivatives are already reflected in the disclosed sensitivity; no further realised operating offset is computable from the pool. | High | [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025 Form 10-K, Item 7A — Foreign Currency Exchange Risk] |

## 3. Sensitivity Ranking

The ranking uses the average absolute bull/bear impact from the table where the measures are comparable. The FX result is shown separately because it is an after-derivatives OI&E sensitivity, not EBIT. Search and Cloud results are static-margin stress arithmetic, not disclosed incremental margins.

| Rank | Variable | Absolute Impact (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | Search advertiser demand and monetisation | $2.576bn reported EBIT per Q3-sized ±10% revenue stress | Revenue rising 12% year on year in Q3; the filing does not provide a forward sensitivity. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Revenue by Type] |
| 2 | Legal and regulatory charge accruals | $1.750bn reported EBIT average; $3.500bn one-way adverse historical stress | Current-quarter comparison benefited from absence of the prior-year EC fine accrual; not a recurring operating trend. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — General and Administrative] |
| 3 | Technical-infrastructure cost intensity | $1.276bn reported EBIT per Q3-sized ±100bp cost-rate stress | Adverse: nine-month capex and P&E depreciation rose year on year. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Capital Expenditures and Leases] |
| 4 | R&D intensity | $1.276bn reported EBIT per Q3-sized ±100bp spend-rate stress | Adverse: R&D intensity rose 137.48bp year on year. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Income] |
| 5 | Google Cloud revenue conversion | $1.112bn reported EBIT per Q3-sized ±10% revenue stress | Revenue rose 103% year on year; backlog conversion still depends on delivery and customer use. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Revenue by Type; Note 1 — Revenue Backlog] |
| 6 | FX remeasurement | $0.336bn average only if the adverse 10% OI&E effect were mechanically symmetric; this symmetry is not disclosed, so not comparable to EBIT ranks | Management hedges part of the exposure; the disclosed adverse sensitivity is after derivatives. [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025 Form 10-K, Item 7A — Foreign Currency Exchange Risk] |
| 7 | TAC rate and advertising mix | $0.082bn reported EBIT per Q3-sized ±10bp TAC-rate stress | Total TAC rate fell 10bp year on year, while dollar TAC increased with advertising revenue. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Cost of Revenues] |

## 4. The Single Highest-Sensitivity Variable

**Search advertiser demand and monetisation** is the largest recurring operating earnings lever on the available evidence. It is partly external: Alphabet can improve product performance and ad delivery, but it cannot control aggregate advertiser budgets or the consumer cycle. At the current Q3 Google Services operating margin, a 10% move in $63.350bn of Search revenue produces a static $2.576bn reported-EBIT sensitivity. The adverse case would require weaker query or advertiser demand, lower realised monetisation, or a less favourable revenue mix; the filing does not disclose which of those would dominate or the margin response. The separate $3.5bn historical legal-accrual stress is larger in a single adverse event, but it is a discrete regulatory risk rather than the primary recurring operating driver. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Revenue by Type; Note 15 — Segments; Item 2 — General and Administrative]

## 5. Interaction Effects

The sensitivities should not be added together. Search demand and TAC co-move: weaker advertising revenue may reduce TAC dollars but can also reduce fixed-cost absorption, while the TAC rate itself changes with Search/Network mix. Cloud growth, technical-infrastructure cost, and R&D also move together: capacity enables Cloud revenue, but depreciation and shared AI costs can rise before assets generate revenue. The static Cloud-margin calculation holds cost intensity constant, whereas the infrastructure stress holds revenue constant; combining them would double count the same capacity cycle. Backlog is evidence of contracted demand, but Alphabet says recognition still depends on delivery and customer utilisation. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 1 — Revenue Backlog; Note 15 — Segments; Item 2 — Cost of Revenues]

## 6. Non-Linear Or Asymmetric Risks

AI infrastructure creates a timing asymmetry. Capex was $132.0bn in the first nine months of 2026 and assets may take months to years to enter service; depreciation begins when they are ready. A slowdown in Cloud demand or delayed customer use can therefore hurt before the capacity-cost response is visible, while the upside is capped by delivery capacity and backlog conversion. Legal and regulatory charges are also discrete: the historical $3.5bn fine accrual demonstrates a step-change risk rather than a smooth cost curve. The pool does not provide a measured operating-deleveraging coefficient for advertising or a separated power/TPU-cost sensitivity, so the size of those nonlinear effects is not proven from available data. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Capital Expenditures and Leases; Item 2 — General and Administrative; Note 1 — Revenue Backlog]

## 7. Earnings Volatility Score

**57/100 — higher = worse.** Earnings have material sensitivity to a very large advertising revenue pool and to a rapidly growing, cost-intensive Cloud and AI-capacity build; a historical legal charge adds a discrete downside. The score is not higher because Alphabet has diversified revenue pools, disclosed FX hedging, and no filing-based evidence of a direct commodity or interest-rate operating-profit sensitivity. Confidence in the operating sensitivity magnitudes is **Low** because the company does not disclose operating coefficients for Search, Cloud, infrastructure cost, or R&D. [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025 Form 10-K, Item 7A — Foreign Currency Exchange Risk; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Revenue by Type; Item 2 — Capital Expenditures and Leases]



---

## earnings / 08_earnings-red-flags.md

_Source: `08_earnings-red-flags.md`_

# Earnings Red Flags — GOOGL

## 1. Upstream Evidence Map

The earnings module has all eight required upstream outputs. The business-model module is also available. The evidence set includes the FY2025 audited Form 10-K, Q3 FY2026 Form 10-Q, a verbatim Q3 call transcript, cash-flow statements, segment disclosure, and current Capital IQ consensus and revision history; no missing-data score cap applies. [00_earnings-data-triage output, §§2–5]

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | Revenue growth accelerated to 22.2% in the TTM ended September 2026. | TTM revenue was $471.098bn, up from $385.477bn; Q3 revenue was $127.577bn, up 24.7% year on year. [01_historical-financials output, §§2–3] | High |
| 02_revenue-drivers | Cloud was the largest observed Q3 growth contributor. | Cloud revenue rose $15.552bn year on year, contributing 15.20 percentage points of Alphabet's 24.65% Q3 revenue growth. [02_revenue-drivers output, §6] | High |
| 03_margin-drivers | Q3 reported operating margin improved year on year. | Reported EBIT margin rose 129.29bp to 31.81%. [03_margin-drivers output, §§3 and 7] | High |
| 06_earnings-quality | Operating cash conversion remains intact. | TTM CFO was $179.551bn against calculated LTM EBITDA of $185.516bn, or 96.8%. [06_earnings-quality output, §§1–2; CIQ facts sidecar, `ltm_ocf_m` and `ltm_ebitda_m`, LTM September 2026] | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 04_guidance-consensus | Revenue estimates are rising while profit estimates are falling. | FQ4 revenue consensus increased 1.0% over three months, but FQ4 GAAP EPS fell 4.2% in one month; FY2026 EPS revision breadth was 2 up / 44 down. [04_guidance-consensus output, §§4–5; CIQ facts sidecar, `eps_revisions`, FY2026] | High |
| 05_beat-miss-setup | The next-quarter revenue bar is demanding. | FQ4 revenue consensus is $142.319bn, requiring 25.0% year-on-year growth, while management flagged a larger FX drag and a harder Search comparison. [05_beat-miss-setup output, §§1 and 3] | High |
| 03_margin-drivers | Reported margin improvement includes a non-recurring comparison. | The +241.23bp G&A ratio effect, mainly the absence of the prior-year EC fine accrual, outweighed a -137.48bp R&D ratio effect in the Q3 EBIT-margin bridge. [03_margin-drivers output, §§7–8] | High |
| 06_earnings-quality | GAAP profit and free cash flow do not give one clean operating signal. | 9M FY2026 included $127.282bn of equity-security gains, $116.316bn of them unrealised, while TTM CFO-minus-capex FCF fell to $19.747bn from $73.552bn. [06_earnings-quality output, §§1, 5 and 10] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| Separately disclosed Cloud consumption, TPU-system sales, acquired revenue, and their margins | 02_revenue-drivers; 03_margin-drivers | The reported 103% Cloud growth rate cannot be converted into a recurring, like-for-like demand or profit rate. [02_revenue-drivers output, §§3 and 5; 03_margin-drivers output, §6] |
| Incremental Search contribution profit and realised recovery of AI-infrastructure costs | business-model/06_value-chain; 07_earnings-sensitivity | A revenue beat cannot be translated reliably into incremental EBIT, and no measured cost-recovery rate supports a margin forecast. [business-model/06_value-chain output, §2; 07_earnings-sensitivity output, §§2 and 7] |
| Company-disclosed operating sensitivities for Search, Cloud, infrastructure cost, or R&D | 07_earnings-sensitivity | Stress magnitudes are static-margin or zero-mitigation bounds, not company-provided operating coefficients. [07_earnings-sensitivity output, §§2 and 7] |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 03_margin-drivers | The Q2/Q3 call files had no recoverable text, so it used filing commentary only. | 00_earnings-data-triage; 02_revenue-drivers; 04_guidance-consensus | The pool contains a verbatim Q3 transcript and the other agents use its prepared remarks and Q&A. | Y | The transcript is available as `data/GOOGL/Alphabet-Inc.-Q3-2026-Earnings-Call-Oct-28-2026.txt`; use it with the filing. The margin agent's filing-based arithmetic remains usable, but its stated source limitation is incorrect. [03_margin-drivers output, §1; 00_earnings-data-triage output, §2] |
| 01_historical-financials | Strict net debt was $69.784bn at 30 September 2026. | CIQ facts sidecar | CIQ reports net debt of negative $114.767bn. | Y | The figures use different definitions: CIQ nets marketable securities and lease-inclusive vendor debt, whereas the filing-based measure is strict debt less cash. Neither should be quoted as an unqualified "net debt" figure. [01_historical-financials output, §2; CIQ facts sidecar, `net_debt_m`, Q3 September 2026] |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status (Triggered / Not Triggered / Unclear / Unavailable) | Severity (Critical / High / Medium / Low) | Probability (High / Medium / Low / Unknown) | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No flags triggered in this category. | Not Triggered | Low | Low | Latest quarter, cash flow, segment disclosure, transcript, consensus, revision history and primary filings are available. [00_earnings-data-triage output, §§2–5] | No missing-data cap applies. |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Reported Q3 EBIT-margin expansion is not a clean run-rate improvement. | Triggered | High | High | Q3 EBIT margin rose 129.29bp, but the G&A ratio added 241.23bp mainly because Q3 FY2025 carried an EC fine accrual; R&D intensity subtracted 137.48bp. [03_margin-drivers output, §§7–8] | A claim that margins are simply accelerating would overstate the underlying operating trend. |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Cloud's reported 103% growth is not split between recurring consumption, TPU-system sales, Wiz acquisition revenue, and other drivers. | Triggered | Medium | High | Q3 Cloud revenue was $30.709bn, but the company does not disclose TPU-system revenue or acquired-revenue contribution; recognition also depends on delivery and customer use. [02_revenue-drivers output, §§3 and 5; Q3 FY2026 Form 10-Q, Note 1 — Revenue Backlog] | Do not treat the reported growth rate as a pure recurring-cloud-demand run rate or infer its margin. |
| Part of reported Cloud backlog is related-party rather than arm's-length third-party demand. | Triggered | Medium | Medium | The $560.8bn Cloud backlog includes $16.8bn related to Crux AI; it is unrecognized backlog, not reported revenue. [02_revenue-drivers output, §5; business-model/12_red-flags-sweep output, §1] | The full backlog should not be described as third-party contracted demand. |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| AI capacity costs are rising before their return is measurable. | Triggered | High | High | Nine-month FY2026 capex was $132.0bn versus $63.6bn, P&E depreciation was $22.0bn versus $15.1bn, and management flagged near-term Cloud-margin pressure from third-party capacity. [03_margin-drivers output, §§5, 8–9; 04_guidance-consensus output, §2] | Revenue growth can coexist with lower incremental EBIT if depreciation, data-centre costs, TPU inventory and R&D rise faster than gross profit. |
| Large purchase commitments make the AI cost base less adjustable if demand or utilisation weakens. | Triggered | High | Medium | The filing discloses $802.1bn of maximum-basis technical-infrastructure, inventory, energy and content commitments; partial volume reductions and maximum-price/volume assumptions apply. [business-model/12_red-flags-sweep output, §§2–4; Q3 FY2026 Form 10-Q, Item 2 — Purchase Commitments and Other Contractual Obligations] | This is an execution and return-on-capital risk, not a forecast of cash spending or evidence of a liquidity shortfall. |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Consensus has become less favorable to profit despite higher revenue estimates. | Triggered | High | High | FQ4 revenue consensus rose from $140.967bn to $142.319bn over three months, while FQ4 GAAP EPS fell from $3.35 to $3.205 over one month; FY EPS breadth was 2 up / 44 down. [04_guidance-consensus output, §§4–5] | The lower EPS bar does not validate the revenue setup; it instead signals that the market is allowing for cost or other-profit pressure. |
| Alphabet gives no formal FQ4 revenue, EBIT, or EPS guide. | Triggered | Medium | High | The only numeric FY2026 guide is $195bn–$205bn of capex; Q4 revenue and margin remarks are qualitative. [04_guidance-consensus output, §§2–3] | Beat/miss confidence must remain limited because the Street bar cannot be directly measured against a company midpoint. |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| A revenue beat needs several conditions at once: timely Cloud and TPU delivery, continued Search resilience despite a harder comparison and FX, and enough mix to clear a 25.0% growth bar. | Triggered | High | High | FQ4 consensus is $142.319bn; Search had already slowed to 12% growth from 17% in Q2, while backlog recognition depends on delivery and customer use. [05_beat-miss-setup output, §§1–3; 02_revenue-drivers output, §§4 and 7] | The upside is a conjunction; a miss can arise from any one of Services deceleration, delivery timing, or cost absorption. |
| An in-line revenue result can still disappoint on margin or forward Cloud timing. | Triggered | Medium | High | Management expects near-term Cloud-margin pressure; recognised TPU-system sales are expected to ramp further in 2027, and cost pressure can persist even if revenue meets consensus. [05_beat-miss-setup output, §5; Q3 FY2026 earnings call, prepared remarks and Q&A] | The next result must be judged on EBIT, cost trajectory, and 2027 timing, not revenue alone. |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| GAAP net income and EPS are materially affected by volatile equity-security gains. | Triggered | High | High | 9M FY2026 equity-security gains were $127.282bn, including $116.316bn unrealised gains on non-marketable securities, versus $121.042bn of operating income. [06_earnings-quality output, §§5 and 10; Q3 FY2026 Form 10-Q, Note 3 — Gains and Losses on Equity Securities] | GAAP EPS cannot be used as a clean operating run rate or as standalone beat/miss evidence. |
| Cash investment and TPU inventory have compressed free cash flow. | Triggered | Medium | High | TTM FCF (CFO less total capex) was $19.747bn versus $73.552bn; inventory rose from $2.439bn at FY2025 to $13.308bn at 30 September 2026. The inventory comparison is a stock-versus-flow warning, not proof of channel stuffing. [06_earnings-quality output, §§1–3] | Operating cash conversion remains sound, but a revenue beat has less cash support while capacity is being built. |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The largest operating sensitivities are inferred, and the important variables can move together. | Triggered | Medium | High | Search, Cloud, infrastructure and R&D stresses use static Q3 margins or zero-mitigation bounds; the sensitivity agent rates the operating magnitudes Low confidence and warns against adding them because capacity, Cloud demand and costs interact. [07_earnings-sensitivity output, §§2, 5 and 7] | A single-variable sensitivity table understates the risk of lower advertiser demand coinciding with poor capacity absorption. |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The margin report incorrectly treats the verbatim call transcript as unavailable. | Triggered | Medium | High | The triage identifies a usable Q3 verbatim transcript, and the revenue and guidance agents cite its prepared remarks and Q&A; the margin report says the same file was unrecoverable. [00_earnings-data-triage output, §2; 02_revenue-drivers output, §§3–5; 03_margin-drivers output, §1] | The filing-based margin calculations remain valid, but the synthesis must use the transcript's Q4 cost and timing caution rather than inherit the margin report's source limitation. |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| “Earnings accelerating” would collapse distinct and conflicting measures into one phrase. | Triggered | High | High | Revenue is accelerating, but Q3 EBIT-margin expansion is dominated by a legal-cost comparison, GAAP EPS is distorted by investment gains, and TTM FCF fell 73.2%. [01_historical-financials output, §§2–3 and 6; 03_margin-drivers output, §7; 06_earnings-quality output, §§1 and 10] | The evidence supports a mixed setup, not a clean operating-earnings acceleration claim. |
| The setup is partly a consumer-cycle and technology-capacity bet, not only an execution story. | Triggered | Medium | High | Advertising is the largest revenue pool and moves with advertiser spending; the business-model synthesis also flags fast AI-led industry change and unproven returns on committed capacity. [business-model/10_external-dependency output, §§1 and 5; business-model/99_business-model-synthesis output, §1] | Forecast confidence should be lower because advertiser budgets, regulator outcomes, supplier capacity and Cloud utilisation are not fully controlled by Alphabet. |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Historical Trend | Q3 EBIT-margin gain mainly reflects a prior-year legal-cost comparison. | Triggered | High | High | The reported margin gain is not a clean run-rate efficiency signal. |
| 2 | Margins | AI capex, depreciation, R&D and less-flexible commitments are rising before returns are measured. | Triggered | High | High | Cost absorption can lag revenue growth. |
| 3 | Guidance / Consensus | Revenue estimates rise while EPS estimates and breadth fall. | Triggered | High | High | The Street is already pricing some profit pressure into the next result. |
| 4 | Beat / Miss Setup | A Q4 beat requires several favorable events at once. | Triggered | High | High | One weak link in Services, delivery, or margin can break the setup. |
| 5 | Earnings Quality / Accounting | GAAP EPS is distorted by volatile, mostly unrealised equity-security gains. | Triggered | High | High | EPS cannot be the primary operating test. |
| 6 | Narrative / Framing | Revenue acceleration, reported margin, EPS and FCF point in different directions. | Triggered | High | High | “Earnings accelerating” would overstate the evidence. |
| 7 | Revenue | Cloud growth is not split into recurring consumption, TPU sales, and acquired revenue. | Triggered | Medium | High | The 103% growth rate is not a like-for-like operating run rate. |
| 8 | Revenue | $16.8bn of Cloud backlog is related-party and unrecognized. | Triggered | Medium | Medium | Do not present all backlog as arm's-length third-party demand. |
| 9 | Guidance / Consensus | No formal Q4 revenue, EBIT, or EPS guide exists. | Triggered | Medium | High | The market bar cannot be directly compared with a company midpoint. |
| 10 | Beat / Miss Setup | An in-line revenue print can still carry weak margins or weaker 2027 timing. | Triggered | Medium | High | Revenue alone is an inadequate result test. |
| 11 | Earnings Quality / Accounting | FCF has fallen and inventory has risen during the TPU build. | Triggered | Medium | High | Cash conversion after investment is materially lower, though CFO remains cash-backed. |
| 12 | Sensitivity / External Variables | Search, Cloud and AI-cost stresses are inferred and correlated. | Triggered | Medium | High | Isolated sensitivity cases may understate downside. |
| 13 | Source Conflicts | The margin agent incorrectly classified a usable transcript as unavailable. | Triggered | Medium | High | Synthesis must restore the call's qualitative Q4 caution. |
| 14 | Narrative / Framing | The next 3–12 months depend partly on advertising and AI-capacity cycles. | Triggered | Medium | High | The setup has material external-variable exposure. |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 14 |
| Critical flags | 0 |
| High flags | 6 |
| Medium flags | 8 |
| Low flags | 0 |
| Unclear flags | 0 |
| Unavailable checks (data missing) | 0 |

## 5. Red-Flag Severity Verdict

**Material concerns**

The next-quarter setup is fragile: a 25.0% revenue hurdle relies on timely Cloud and TPU conversion while Search faces FX and comparison pressure, and margins face a much higher AI-cost base. The single most dangerous red flag is treating reported Cloud growth and margin expansion as durable operating earnings when Cloud mix, cost conversion, and the legal-cost comparison are not separately clean. This concern would ease if Q4 shows Cloud growth and operating profit conversion after the stated capacity costs, with a clearer split of TPU-system sales and recurring consumption.

## 6. What The Synthesis Agent Should Know

- 14 flags triggered: 0 Critical, 6 High, and 8 Medium; no required data set is missing.
- The highest-value concern is the conjunction between the 25.0% FQ4 revenue bar, Search/FX pressure, timely Cloud delivery, and rising infrastructure costs.
- The earnings verdict should be **Mixed earnings setup**, not Earnings accelerating, unless synthesis demonstrates that EBIT and cash results improve after excluding legal comparisons and non-operating investment gains.
- No named missing-data score cap applies under MODULE_RULES; however, the synthesis should not score earnings clarity, consensus setup, or earnings quality in the highest band without resolving the Cloud-margin and EPS-quality limitations.
- Reconcile the margin agent's transcript-unavailable statement against the usable Q3 verbatim transcript; filing arithmetic wins for reported amounts, while the transcript supplies management's forward cost and timing caution.
- Treat the $802.1bn commitment figure as a maximum-basis execution and return-risk bound, with partial-reduction rights; do not add it to separate lease, guarantee, or backstop categories.
- The setup is dirtier than the revenue-growth headline suggests: operating cash conversion is intact, but FCF, incremental margin visibility, and GAAP EPS quality are weaker signals.

## 7. Pre-Mortem — If The Earnings Setup Fails

If the earnings setup turns out to be wrong, the most likely failure mode is that the analysis treated the 103% reported Cloud growth rate as enough to offset a slowing Services comparison without proving what portion converts into recurring, profitable revenue after TPU delivery, inventory, depreciation, and third-party-capacity costs. The filing and transcript support real demand, but recognition still depends on delivery and customer use, while the cost base is already rising; a revenue result near consensus could therefore still fail to produce the operating-profit and cash outcome implied by a bullish reading. [02_revenue-drivers output, §5; 03_margin-drivers output, §§8–9; 05_beat-miss-setup output, §§3 and 5]
