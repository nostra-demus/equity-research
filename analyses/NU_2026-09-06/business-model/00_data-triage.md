# Data Triage — NU

**Evidence binding (MODULE_PIPELINE Step 1.5).** `NOSTRA_FROZEN_EVIDENCE_ROOT` is set and the quartet is complete, so this run reads ONLY the supervisor-frozen capability. The canonical extractor was NOT run and live `data/NU/` was NOT read.

- `DATA_PATH` (filesystem) = `/Users/admin/.nostra-cockpit-ipc/frozen-evidence/chain-VsKLbE/pool/.extract-generations/f9081efa6e33b60af52e2eeb6b01c69e96872dbe70c60d9111ef0a504509f2be/raw/NU`
- `GENERATION_ROOT` = `/Users/admin/.nostra-cockpit-ipc/frozen-evidence/chain-VsKLbE/pool/.extract-generations/f9081efa6e33b60af52e2eeb6b01c69e96872dbe70c60d9111ef0a504509f2be`
- Generation digest: `f9081efa6e33b60af52e2eeb6b01c69e96872dbe70c60d9111ef0a504509f2be` (schema `pool-generation/v2`)
- Citation label for every source below: `data/NU/...`

**Manifest totals (`GENERATION_ROOT/manifest.json`):** 115 sources · 48 workbooks · 109 tabs · 174 extracts written · **0 failures**. Status counts: 113 `ok`, 2 `in-place`. There is no `fail`, no `fallback-text`, no `missing-dependency`, and no `gdrive-pointer` stub. Nothing in this pool is in a failure state, so no source is downgraded to "missing" under fix F03.

**Sidecars present:** `ciq_facts.json` (21 CIQ concepts resolved, currency USD, 7 duplicate-workbook conflicts logged) and `relationships.json` (`relationship-graph/v1`).

**Reading the "Last Modified" column.** Every file in the frozen copy carries the same filesystem timestamp (2026-09-06 20:17) because that is when the supervisor froze the pool — it is a sync/copy date, not the document's date. Per fix F23 it is therefore **not used** for any age judgement. Every "Period Covered" below is parsed from INSIDE the document (period-end line, "as of" line, cover date, or the CIQ export header).

---

## 1. File Inventory

Multi-tab workbooks are exploded: one row per tab, with the parent file named and rows×cols from the manifest. No workbook appears as a single opaque row.

| Filename | Type | Period Covered | Last Modified | Notes |
|---|---|---|---|---|
| `99The_Expectant_Father__th_Edition_.torrent` | Other | n/a | not used (sync date) | Unrelated to NU. Status `in-place`, kind `text`. Carries no company evidence — ignore downstream. |
| `Charting Excel Export Aug-29-2026 2_02 PM.xls` → **[Chart 1 with Data]** | Data export | Daily series 2025-08-29 → 2026-08-29 | not used | 284×2. CIQ short interest as % of shares outstanding. |
| `Charting Excel Export Aug-29-2026 2_02 PM.xls` → **[Attributions]** | Data export | as of 2026-08-29 | not used | 45×1. Source attributions for the chart. |
| `Company Comparable Analysis Nu Holdings Ltd .xls` → **[Financial Data]** | Data export | as of 2026-08-29, USD | not used | 50×17. Peer set financials. Holds `shares_outstanding_m` 4,830.7 and `current_price` USD 14.30 per `ciq_facts.json`. |
| `Company Comparable Analysis Nu Holdings Ltd .xls` → **[Trading Multiples]** | Data export | as of 2026-08-29, USD | not used | 50×9. Subject TEV/EBITDA unavailable (`peer_ev_ebitda` = unknown). |
| `Company Comparable Analysis Nu Holdings Ltd .xls` → **[Operating Statistics]** | Data export | as of 2026-08-29, USD | not used | 50×13. |
| `Company Comparable Analysis Nu Holdings Ltd .xls` → **[Business Description]** | Data export | as of 2026-08-29 | not used | 44×3. Peer business descriptions. |
| `Company Comparable Analysis Nu Holdings Ltd .xls` → **[Implied Valuation]** | Data export | as of 2026-08-29, USD | not used | 69×9. |
| `Company Comparable Analysis Nu Holdings Ltd .xls` → **[Valuation Chart]** | Data export | as of 2026-08-29, USD | not used | 32×2. |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` → **[IBKR - Tax Summary]** | Other (user's own brokerage record) | FY2025-26 (India tax year), INR | not used | 24×8. Personal account tax file, not NU company evidence. Same for all 25 tabs below. |
| same file → **[IBKR - Consolidated Events]** | Other | FY2025-26, INR | not used | 37×17. |
| same file → **[IBKR - Capital Gains Detail]** | Other | FY2025-26, INR | not used | 6×25. |
| same file → **[IBKR - Income and Taxes]** | Other | FY2025-26, INR | not used | 35×15. |
| same file → **[IBKR - Closing Holdings]** | Other | FY2025-26, INR | not used | 4×17. |
| same file → **[IBKR - Performance Summary]** | Other | FY2025-26, INR | not used | 4×15. |
| same file → **[IBKR - Cash Report]** | Other | FY2025-26 | not used | 4×5. |
| same file → **[IBKR - SBI FX Rates]** | Other | FY2025-26, INR | not used | 5×10. |
| same file → **[Audit & Reconciliation]** | Other | FY2025-26 | not used | 24×8. |
| same file → **[Source Statement Tables]** | Other | FY2025-26 | not used | 1037×27. |
| same file → **[IBKR - Unmapped Numeric Rows]** | Other | FY2025-26 | not used | 1136×8. |
| same file → **[IBKR - Source Totals]** | Other | FY2025-26 | not used | 60×7. |
| same file → **[Source Statement Text]** | Other | FY2025-26 | not used | 2122×4. |
| same file → **[README - IBKR Report]** | Other | FY2025-26, INR | not used | 12×2. |
| same file → **[LTCG]** | Other | FY2025-26 | not used | 146×18. |
| same file → **[STCG]** | Other | FY2025-26 | not used | 163×20. |
| same file → **[F&O]** | Other | FY2025-26 | not used | 51×10. |
| same file → **[Intraday]** | Other | FY2025-26 | not used | 46×12. |
| same file → **[Dividend]** | Other | FY2025-26 | not used | 68×10. |
| same file → **[Interest]** | Other | FY2025-26, INR | not used | 19×5. |
| same file → **[Bonds & SGB]** | Other | FY2025-26 | not used | 25×12. |
| same file → **[Schedule FA]** | Other | FY2025-26 | not used | 41×13. |
| same file → **[Schedule FSI]** | Other | FY2025-26, INR | not used | 33×10. |
| same file → **[Form 67]** | Other | FY2025-26 | not used | 27×13. |
| same file → **[Schedule TR]** | Other | FY2025-26 | not used | 28×8. |
| `Interactive_Brokers_FY2025-26_CA_Audit_Note.txt` | Other (user's own brokerage record) | FY2025-26 | not used | Status `in-place`. Empty on read — no content to use. Personal tax note, not NU evidence, so this is not a company-data gap. |
| `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` | User note (prior engine output) | Dated 30 Aug 2026; reference price USD 14.30 (28 Aug 2026 close) | not used | 24,731 chars. A prior Nostradamus decision memo with its own target and score. §4 tier 9 at best, and it is a **derived** view, not primary evidence — downstream agents must not treat its conclusions as a source and must re-derive from filings. |
| `Nu Holdings Ltd NYSE NU Analyst Coverage.xls` → **[Analyst Coverage]** | Data export | as of Aug-2026, USD | not used | 41×6. |
| `Nu Holdings Ltd NYSE NU Analyst Coverage (1).xls` → **[Analyst Coverage]** | Data export | as of Aug-2026, USD | not used | 41×6. **Duplicate** of the row above (same dims) — do not double-count. |
| `Nu Holdings Ltd NYSE NU Auditors.xls` → **[Auditors]** | Data export | as of Aug-2026 | not used | 18×5. |
| `Nu Holdings Ltd NYSE NU Board Members.xls` → **[Board Members]** | Data export | as of Aug-2026 | not used | 28×25. |
| `Nu Holdings Ltd NYSE NU Committees.xls` → **[Committees]** | Data export | as of Aug-2026 | not used | 35×2. |
| `Nu Holdings Ltd NYSE NU Comparable M A Transactions.xls` → **[Comparable M A Transactions]** | Data export | as of Aug-2026, USD | not used | 17×9. |
| `Nu Holdings Ltd NYSE NU Comparable M A Transactions (1).xls` → **[Comparable M A Transactions]** | Data export | as of Aug-2026, USD | not used | 17×9. **Duplicate**. |
| `Nu Holdings Ltd NYSE NU Competitors.xls` → **[Competitors]** | Data export | as of Aug-2026 | not used | 89×8. Named competitor set — primary input for `competitive-map`. |
| `Nu Holdings Ltd NYSE NU Corporate Timeline.xls` → **[Corporate Timeline]** | Data export | history to Aug-2026, USD | not used | 51×4. |
| `Nu Holdings Ltd NYSE NU Customers.xls` → **[Customers]** | **Business-relationship export** | Recently disclosed customers only (last ~2 years), current subsidiaries | not used | 16×8. 1 relationship row. Feeds `relationships.json` (see note under Section 1B). |
| `Nu Holdings Ltd NYSE NU Equity Listings.rtf` | Data export | as of Aug-2026 | not used | 1,678 chars. Listing lines and venues — needed for CLAUDE.md §16 "name the tradable line". |
| `Nu Holdings Ltd NYSE NU Equity Listings.xls` → **[Equity Listings]** | Data export | as of Aug-2026, reported + USD | not used | 25×11. |
| `Nu Holdings Ltd NYSE NU Events Calendar.xls` → **[Events Calendar]** | Data export | forward calendar from Aug-2026 | not used | 27×3. Catalyst dates for §17. |
| `Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls` → **[Balance Sheet]** | Data export | Annual, reported currency (USD), to FY2025 | not used | 89×7. Holds `total_debt_m` 5,896.7 and vendor `net_debt_m` −9,274.2. |
| `Nu Holdings Ltd NYSE NU Financials Capital Structure Details.xls` → **[Capital Structure Details]** | Data export | latest as-reported block, to Dec-31-2025 | not used | 29×10. Source of the debt maturity wall (nearest 2027-06-01). |
| `Nu Holdings Ltd NYSE NU Financials Capital Structure Summary.xls` → **[Capital Structure Summary]** | Data export | Annual, to FY2025 | not used | 60×7. |
| `Nu Holdings Ltd NYSE NU Financials Cash Flow.xls` → **[Cash Flow]** | Data export | Annual + LTM to Jun-30-2026 | not used | 72×7. `ltm_ocf_m` −10,304.8 (bank balance-sheet growth, not a distress signal on its own). |
| `Nu Holdings Ltd NYSE NU Financials Historical Capitalization.xls` → **[Historical Capitalization]** | Data export | Annual, trading currency | not used | 38×7. |
| `Nu Holdings Ltd NYSE NU Financials Income Statement.xls` → **[Income Statement]** | Data export | Annual, reported currency, to FY2025 | not used | 94×7. Bank template — **no EBITDA row**, so `ltm_ebitda_m` is `unknown`. |
| `Nu Holdings Ltd NYSE NU Financials Industry Specific.xls` → **[Industry Specific]** | Data export | Annual, to FY2025 | not used | 68×7. Bank-specific lines (NIM, asset quality). |
| `Nu Holdings Ltd NYSE NU Financials Key Stats.xls` → **[Key Stats]** | Data export | Annual, trading currency | not used | 80×9. |
| `Nu Holdings Ltd NYSE NU Financials Multiples.xls` → **[Multiples]** | Data export | to latest close, in millions | not used | 60×9. `pe_ltm_current_x` 19.5. |
| `Nu Holdings Ltd NYSE NU Financials Multiples (1).xls` → **[Multiples]** | Data export | to latest close, in millions | not used | 61×9. **Near-duplicate** (61 vs 60 rows) — manifest logs a conflict; reconcile before use. |
| `Nu Holdings Ltd NYSE NU Financials Ratios.xls` → **[Ratios]** | Data export | Annual, to FY2025 | not used | 149×7. |
| `Nu Holdings Ltd NYSE NU Financials Segments.xls` → **[Segments]** | Data export | Annual, to Dec-31-2025 | not used | 77×7. One reportable segment (Banking 100%); geography Brazil 91% / Mexico 7% / Other 2%. |
| `Nu Holdings Ltd NYSE NU Financials Segments (1).xls` → **[Segments]** | Data export | Annual, to Dec-31-2025 | not used | 77×7. **Duplicate**. |
| `Nu Holdings Ltd NYSE NU Financials Supplemental.xls` → **[Supplemental]** | Data export | Annual, to FY2025 | not used | 50×7. |
| `Nu Holdings Ltd NYSE NU Financials.xls` → **[Key Stats]** | Data export | Annual, trading currency | not used | 85×9. Combined 13-tab workbook; overlaps the single-sheet exports above (7 conflicts logged in `ciq_facts.json`). |
| same file → **[Income Statement]** | Data export | Annual, to FY2025 | not used | 94×7. |
| same file → **[Balance Sheet]** | Data export | Annual, to FY2025 | not used | 89×7. |
| same file → **[Cash Flow]** | Data export | Annual + LTM Jun-30-2026 | not used | 72×7. |
| same file → **[Multiples]** | Data export | to latest close | not used | 61×9. |
| same file → **[Historical Capitalization]** | Data export | Annual, trading currency | not used | 38×7. |
| same file → **[Capital Structure Summary]** | Data export | Annual, to FY2025 | not used | 60×7. |
| same file → **[Capital Structure Details]** | Data export | latest as-reported block | not used | 33×10. |
| same file → **[Ratios]** | Data export | Annual, to FY2025 | not used | 149×7. |
| same file → **[Supplemental]** | Data export | Annual, to FY2025 | not used | 50×7. |
| same file → **[Industry Specific]** | Data export | Annual, to FY2025 | not used | 68×7. |
| same file → **[Pension OPEB]** | Data export | Annual, to FY2025 | not used | 15×6. Only in the combined workbook. |
| same file → **[Segments]** | Data export | Annual, to Dec-31-2025 | not used | 77×7. |
| `Nu Holdings Ltd NYSE NU Fixed Income S P Global Ratings.xls` → **[S P Global Ratings]** | Data export | as of Aug-2026 | not used | 20×8. Rating-agency tier (§4 tier 8 content, delivered as a tier-5 export). |
| `Nu Holdings Ltd NYSE NU Fixed Income Securities Summary.xls` → **[Securities Summary]** | Data export | as of Aug-2026 | not used | 2299×24. Instrument-level debt list. |
| `Nu Holdings Ltd NYSE NU Industry Classifications.rtf` | Data export | as of Aug-2026 | not used | 910 chars. GICS / CIQ industry codes. |
| `Nu Holdings Ltd NYSE NU Investment Analysis Co Investors.xls` → **[Co-Investors]** | Data export | as of Aug-2026 | not used | 53×3. |
| `Nu Holdings Ltd NYSE NU Investment Analysis Direct Investments.xls` → **[Direct Investments]** | Data export | as of Aug-2026 | not used | 55×21. |
| `Nu Holdings Ltd NYSE NU Key Developments.rtf` | Data export | Event history to Aug-2026 | not used | 29,094 chars. Includes a "Potential Red Flags/Distress Indicators" category — direct input to `red-flags-sweep`. |
| `Nu Holdings Ltd NYSE NU Long Business Description.rtf` | Data export | as of Aug-2026 | not used | 36,428 chars. Longest vendor description of the product set — input to `business-identity`. |
| `Nu Holdings Ltd NYSE NU Private Ownership.rtf` | Data export | as of Aug-2026 | not used | 6,018 chars. |
| `Nu Holdings Ltd NYSE NU Products.xls` → **[Products]** | Data export | as of Aug-2026 | not used | 31×5. |
| `Nu Holdings Ltd NYSE NU Professionals.xls` → **[Professionals]** | Data export | as of Aug-2026 | not used | 29×24. |
| `Nu Holdings Ltd NYSE NU Public Company Profile.rtf` | Data export | as of Aug-2026 | not used | 18,760 chars. |
| `Nu Holdings Ltd NYSE NU Public Ownership Crossholdings.xls` → **[Crossholdings]** | Data export | as of Aug-2026 | not used | 1840×7. |
| `Nu Holdings Ltd NYSE NU Public Ownership Detailed.xls` → **[Detailed]** | Data export | position dates to 2026-06-30 | not used | 1346×15. |
| `Nu Holdings Ltd NYSE NU Public Ownership History.xls` → **[History]** | Data export | 2025-12-31 → 2026-06-30 | not used | 1499×5. Top holder David Vélez 905.8m shares; tracked institutional holdings +0.9% over the window. |
| `Nu Holdings Ltd NYSE NU Public Ownership Insider Trading.xls` → **[Insider Trading]** | Data export | events to 2026-08-26 | not used | 46×11. Open-market only: net −592,707 (0 buys / 4 sells) in trailing 12m. Routed to `capital-allocation-governance`. |
| `Nu Holdings Ltd NYSE NU Public Ownership Summary.rtf` | Data export | as of Aug-2026 | not used | 4,445 chars. |
| `Nu Holdings Ltd NYSE NU Strategic Alliances.xls` → **[Strategic Alliances]** | Data export | as of Aug-2026 | not used | 25×7. |
| `Nu Holdings Ltd NYSE NU Suppliers.xls` → **[Suppliers]** | **Business-relationship export** | Recently disclosed suppliers only (last ~2 years), current subsidiaries | not used | 25×8. 10 relationship rows. Feeds `relationships.json` (Section 1B). |
| `Nu Holdings Ltd NYSE NU Takeover Defenses.xls` → **[Corporate Governance]** | Data export | as of Aug-2026 | not used | 48×4. |
| same file → **[Takeover Defenses]** | Data export | as of Aug-2026 | not used | 26×4. |
| same file → **[Compare Defenses]** | Data export | as of Aug-2026 | not used | 36×8. |
| `Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls` → **[Nu Holdings Ltd NYSENU Corpor]** | Data export | as of Aug-2026, USD | not used | 53×17. Legal-entity tree — 34 entities. |
| same file → **[Filtered Count]** | Data export | as of Aug-2026 | not used | 22×4. |
| same file → **[Aggregates]** | Data export | as of Aug-2026 | not used | 22×4. |
| `Nu Holdings Ltd. Form 20-F filed on Apr-08-2026.pdf` | Annual filing (extract/index) | FY2025 (year ended Dec 31, 2025) | not used | Only 6,115 chars — a search-result index page over the 20-F, not the filing body. The full filing is the 1.67m-char PDF below; use that one. |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` → **[Consensus]** | Data export | Estimates as of Aug-2026 | not used | 397×30. Target price mean USD 18.78 / median USD 19.00; LT growth mean 34.0%. |
| same file → **[Recent Changes]** | Data export | Aug-2026 | not used | 265×10. |
| same file → **[Multiples]** | Data export | Aug-2026 | not used | 26×5. |
| same file → **[Surprise]** | Data export | FY2021–FY2025 | not used | 200×20. GAAP-EPS surprise FY2023 −5%, FY2024 −2%, FY2025 −2%. |
| same file → **[Trends]** | Data export | Aug-2026 | not used | 238×21. |
| same file → **[Revisions]** | Data export | last month to Aug-2026 | not used | 357×17. FY2026 EPS 8↑/0↓; revenue 5↑/2↓. |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` | **Annual filing** | FY2025 — fiscal year ended December 31, 2025 | not used | 1,671,934 chars. The current audited annual filing. Cover confirms Cayman Islands incorporation, NYSE, IFRS Accounting Standards, commission file 001-41129. |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).doc` | Annual filing (duplicate format) | FY2025 | not used | 1,573,413 chars, MHTML. Same filing as the PDF above. |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).pdf` | Annual filing (prior year) | FY2024 | not used | 2,378,433 chars. |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).doc` | Annual filing (duplicate format) | FY2024 | not used | 1,790,450 chars, MHTML. |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-19-2024).pdf` | Annual filing (prior year) | FY2023 | not used | 2,312,327 chars. |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-20-2023).pdf` | Annual filing (prior year) | FY2022 | not used | 2,168,186 chars. |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-21-2022).pdf` | Annual filing (prior year) | FY2021 | not used | 3,354,372 chars. First 20-F after the Dec-2021 IPO. |
| `Transaction Summary M A Private Placements.xls` → **[M A Private Placements]** | Data export | history to Aug-2026 | not used | 25×14. Deal history — input to the §24 filter-4 serial-acquirer test. |
| `Transaction Summary Public Offerings.xls` → **[Public Offerings]** | Data export | history to Aug-2026 | not used | 15×8. |
| `U21257060_20260331_20260331.pdf` | Other (user's own brokerage record) | Activity statement, 1 Apr 2025 – 31 Mar 2026 | not used | 77,975 chars. IBKR personal account statement, not NU company evidence. |
| `consolidated_tax_report_2025-26.xlsx` → **[LTCG]** | Other (user's own brokerage record) | FY2025-26 | not used | 146×18. Duplicate of 11 tabs inside the IBKR consolidated workbook above. |
| same file → **[STCG]** | Other | FY2025-26 | not used | 163×20. |
| same file → **[F&O]** | Other | FY2025-26 | not used | 51×10. |
| same file → **[Intraday]** | Other | FY2025-26 | not used | 46×12. |
| same file → **[Dividend]** | Other | FY2025-26 | not used | 68×10. |
| same file → **[Interest]** | Other | FY2025-26, INR | not used | 19×5. |
| same file → **[Bonds & SGB]** | Other | FY2025-26 | not used | 25×12. |
| same file → **[Schedule FA]** | Other | FY2025-26 | not used | 41×13. |
| same file → **[Schedule FSI]** | Other | FY2025-26, INR | not used | 33×10. |
| same file → **[Form 67]** | Other | FY2025-26 | not used | 27×13. |
| same file → **[Schedule TR]** | Other | FY2025-26 | not used | 28×8. |
| `Filings/Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` | Annual filing (duplicate) | FY2025 | not used | 1,671,934 chars — byte-identical size to the root copy. |
| `Filings/Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf` | **Annual filing (Portuguese)** | Consolidated financial statements, years ended 31 Dec 2025 and 2024 | not used | 371,517 chars. Free, unaudited **Portuguese translation** of the English financial statements (stated on p.03). Language is not a gap (§27) — figures are in thousands of US dollars, e.g. FY2025 interest income and net gains 13,434,683 vs FY2024 9,631,043. |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` | **Quarterly filing** | Unaudited interim condensed consolidated financial statements, **three and six months ended June 30, 2026** | not used | 297,047 chars. KPMG Auditores Independentes review report attached. The most recent audited-standard interim statements in the pool. |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf` | Quarterly filing | Three months ended March 31, 2026 | not used | 274,519 chars. |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(May-15-2026).pdf` | Quarterly filing (duplicate) | Three months ended March 31, 2026 | not used | 274,519 chars — identical size to the May-14 copy. |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf` | Material-event disclosure (Portuguese) | Notice dated 20 Aug 2026, points to the Q2'26 earnings release | not used | 341 chars. Banco Bradesco S.A. depositary notice for the **B3 BDR Level I programme**. Short but **complete and fully extracted** — a one-page notice, not a failed extraction. |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(May-20-2026).pdf` | Material-event disclosure (Portuguese) | Notice dated 20 May 2026, points to the Q1'26 earnings release | not used | 342 chars. Same Bradesco BDR notice format. |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf` | Material-event disclosure (Portuguese) | Notice dated 17 Nov 2025, points to the Q3'25 release | not used | 340 chars. Same format. |
| `Filings/Nu_Holdings_Ltd_-_(Aug-19-2025).pdf` | Material-event disclosure (Portuguese) | Notice dated 19 Aug 2025, points to the Q2'25 release | not used | 360 chars. Same format. |
| `Filings/Nu_Holdings_Ltd_-_(Aug-13-2026).pdf` | **Investor deck** | Q2'26 earnings presentation, 13 Aug 2026 | not used | 108,767 chars. Identical size to the "Preliminary Interim Report (Aug-13-2026)" copy — same document filed twice. |
| `Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` | **Investor deck** | Q2'26 earnings presentation, 13 Aug 2026 | not used | 108,767 chars. Cover names Rob Livingston as CFO (Guilherme Lago held the title through Q4'25) — a CFO change downstream should verify. |
| `Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf` | Investor deck | Q4 2025 earnings presentation, 25 Feb 2026 | not used | 117,921 chars. |
| `Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf` | Quarterly earnings release | Q1 2026 results, released 14 May 2026 | not used | 33,504 chars. Press release, São Paulo dateline. |
| `Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf` | Investor deck (Portuguese) | Q3 2025 earnings presentation, 13 Nov 2025 | not used | 126,011 chars. "Apresentação de Resultados 3T 2025". |
| `Filings 2/…` (13 files) | Duplicates of the whole `Filings/` folder | Same periods as above | not used | Every one of the 13 files in `Filings 2/` matches a `Filings/` file by name and char count: `(Aug-13-2026)` 108,767; `(Aug-19-2025)` 360; `20-F(Apr-08-2026)` 1,671,934; `Annual_Report(Feb-26-2026)` 371,517; `Interim(Aug-14-2026)` 297,047; `Interim(Aug-20-2026)` 341; `Interim(May-14-2026)` 274,519; `Interim(May-15-2026)` 274,519; `Interim(May-20-2026)` 342; `Interim(Nov-17-2025)` 340; `Prelim(Aug-13-2026)` 108,767; `Prelim(Feb-25-2026)` 117,921; `Prelim(May-14-2026)` 33,504; `Prelim(Nov-13-2025)` 126,011. A mirrored copy — adds no new evidence. |
| `Transcript Digest/Nu Holdings Ltd. - ShareholderAnalyst Call.pdf` | Earnings transcript (other) | Shareholder/Analyst Call, **Thursday, August 6, 2026, 12:00 PM GMT** | not used | 11,239 chars. S&P Global Market Intelligence transcript. |
| `Transcript Digest/Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026.pdf` | **Earnings transcript** | Q2 2026 call, 13 Aug 2026 | not used | 68,453 chars. Most recent earnings call in the pool. |
| `…, Q1 2026 Earnings Call, May 14, 2026.pdf` | Earnings transcript | Q1 2026 call, 14 May 2026 | not used | 67,336 chars. |
| `…, Q4 2025 Earnings Call, Feb 25, 2026.pdf` | Earnings transcript | Q4 2025 call, 25 Feb 2026 | not used | 67,805 chars. |
| `…, Q3 2025 Earnings Call, Nov 13, 2025.pdf` | Earnings transcript | Q3 2025 call, 13 Nov 2025 | not used | 64,333 chars. |
| `…, Q2 2025 Earnings Call, Aug 14, 2025.pdf` | Earnings transcript | Q2 2025 call, 14 Aug 2025 | not used | 62,750 chars. |
| `…, Q1 2025 Earnings Call, May 13, 2025.pdf` | Earnings transcript | Q1 2025 call, 13 May 2025 | not used | 62,884 chars. |
| `…, Q4 2024 Earnings Call, Feb 20, 2025.pdf` | Earnings transcript | Q4 2024 call, 20 Feb 2025 | not used | 83,661 chars. |
| `…, Q3 2024 Earnings Call, Nov 13, 2024.pdf` | Earnings transcript | Q3 2024 call, 13 Nov 2024 | not used | 73,393 chars. |
| `…, Q2 2024 Earnings Call, Aug 13, 2024.pdf` | Earnings transcript | Q2 2024 call, 13 Aug 2024 | not used | 71,851 chars. |
| `…, Q1 2024 Earnings Call, May 14, 2024.pdf` | Earnings transcript | Q1 2024 call, 14 May 2024 | not used | 88,138 chars. |
| `…, Q4 2023 Earnings Call, Feb 22, 2024.pdf` | Earnings transcript | Q4 2023 call, 22 Feb 2024 | not used | 90,725 chars. |
| `…, Q3 2023 Earnings Call, Nov 14, 2023.pdf` | Earnings transcript | Q3 2023 call, 14 Nov 2023 | not used | 85,421 chars. |
| `…, Q2 2023 Earnings Call, Aug 15, 2023.pdf` | Earnings transcript | Q2 2023 call, 15 Aug 2023 | not used | 88,530 chars. |
| `…, Q1 2023 Earnings Call, May 15, 2023.pdf` | Earnings transcript | Q1 2023 call, 15 May 2023 | not used | 92,253 chars. |
| `…, Q4 2022 Earnings Call, Feb 14, 2023.pdf` | Earnings transcript | Q4 2022 call, 14 Feb 2023 | not used | 82,774 chars. |
| `…, Q3 2022 Earnings Call, Nov 14, 2022.pdf` | Earnings transcript | Q3 2022 call, 14 Nov 2022 | not used | 88,154 chars. |
| `…, Q2 2022 Earnings Call, Aug 15, 2022.pdf` | Earnings transcript | Q2 2022 call, 15 Aug 2022 | not used | 90,039 chars. |
| `…, Q1 2022 Earnings Call, May 16, 2022.pdf` | Earnings transcript | Q1 2022 call, 16 May 2022 | not used | 87,978 chars. |
| `…, Q4 2021 Earnings Call, Feb 22, 2022.pdf` | Earnings transcript | Q4 2021 call, 22 Feb 2022 | not used | 85,745 chars. First call after the Dec-2021 IPO. |

Row count: 176 inventory rows = 67 non-workbook sources + 109 workbook tabs, reconciled against `GENERATION_ROOT/manifest.json` (115 sources, 48 workbooks, 109 tabs).

### 1A. External Data

**None.** There is no `external/` subfolder in the frozen `DATA_PATH`, and no manifest row carries `external: true` or a `provenance` object. Nothing in this pool is externally sourced research, so no external document affects the sufficiency verdict.

### 1B. Business-Relationship Export

`GENERATION_ROOT/relationships.json` (`relationship-graph/v1`) is present and reports 2 sources: `Nu Holdings Ltd NYSE NU Customers.xls` (1 row) and `Nu Holdings Ltd NYSE NU Suppliers.xls` (10 rows).

- **11 disclosed relationship rows** across **12 named counterparties**.
- **9 are genuine outside parties** (`third_party`); 3 are the company's own group entities (`group`); **0 `likely_group`**, 0 intra-group rows (`intragroup_row_share_pct` = 0.0).
- **3 of the third parties are listed** (2 suppliers, 1 customer) across ENXTPA, LSE and NYSE — e.g. Edenred SE (ENXTPA:EDEN), Wise Group plc, MasterCard International Incorporated.
- **Scope, quoted verbatim:** "Recently disclosed customers only (within the last two years)"; "Include Customers for:Current subsidiaries"; "Recently disclosed suppliers only (within the last two years)"; "Include Suppliers for:Current subsidiaries."
- This is a §4 tier-5 vendor export, not a filing. It proves a relationship exists; it never sizes one. It is enrichment only — it does not move the sufficiency verdict, and its absence would not have been a gap.

---

## 2. Most Recent Sources

Age is measured from today, 2026-09-06, using the date inside the document.

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | `data/NU/Filings/Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` | FY2025 — fiscal year ended 31 Dec 2025; filed 8 Apr 2026 | 5.0 from filing (8.2 from period-end) |
| Quarterly filing | `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` | Three and six months ended 30 Jun 2026; filed 14 Aug 2026 | 0.7 from filing (2.2 from period-end) |
| Earnings transcript | `data/NU/Transcript Digest/Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026.pdf` | Q2 2026 call, 13 Aug 2026 | 0.8 |
| Investor deck | `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` | Q2'26 earnings presentation, 13 Aug 2026 | 0.8 |
| Data export | `data/NU/Charting Excel Export Aug-29-2026 2_02 PM.xls` and the CIQ suite | Data as of 29 Aug 2026 (price USD 14.30, 4,830.7m shares) | 0.3 |

Also recent and not in the table above: a Shareholder/Analyst Call transcript dated 6 Aug 2026 (`data/NU/Transcript Digest/Nu Holdings Ltd. - ShareholderAnalyst Call.pdf`).

---

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States — NYSE, Class A ordinary shares. Incorporated in the Cayman Islands; principal executive contact and operations in São Paulo, Brazil. A secondary Brazilian **BDR Level I** programme trades on B3 with Banco Bradesco S.A. as depositary. | `FY25 Form 20-F, cover page` (Cayman Islands jurisdiction of incorporation; commission file 001-41129; Rua Capote Valente 39, Pinheiros – São Paulo); `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf` (Bradesco BDR Nível I depositary notice) |
| Filing regime | **US SEC — foreign private issuer.** Primary documents are Form 20-F (annual) and Form 6-K-equivalent interim/press material; the Brazilian BDR notices are secondary, B3-facing. Do NOT mark 10-K / 10-Q / DEF 14A "missing" — the 20-F is the local equivalent and it is present. | `FY25 Form 20-F, cover page` ("ANNUAL REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934", box checked) |
| Reporting standard | **IFRS Accounting Standards as issued by the IASB** (the 20-F cover ticks IFRS, not U.S. GAAP). Auditor: KPMG Auditores Independentes Ltda. | `FY25 Form 20-F, cover page` ("International Financial Reporting Standards - Accounting Standards"); `Q2 FY26 Interim Report (14 Aug 2026), Independent Auditors' Report` (KPMG) |
| Reporting currency + fiscal-year end | **US dollars**, presented in thousands (millions in the CIQ exports). Fiscal year ends **31 December**. Note: functional currencies of the operating subsidiaries are local (BRL, MXN, COP) and translate into a USD reporting currency — any cross-currency claim must carry its FX date and rate (§15/§27). | `FY25 Form 20-F, cover page` ("For the fiscal year ended December 31, 2025"); `FY25 Annual Report (Portuguese translation, Feb-26-2026), Demonstrações do Resultado Consolidadas` ("Em milhares de dólares"); `ciq_facts.json` currency: USD |
| Document language(s) | **English** (primary: all 20-Fs, all interim financial statements, all transcripts, Q1'26 and Q2'26 releases and decks) and **Portuguese** (the FY2025 Annual Report translation dated 26 Feb 2026, the Q3'25 earnings deck dated 13 Nov 2025, and four Bradesco BDR depositary notices). Per CLAUDE.md §27 the Portuguese documents are PRESENT at full source tier — read and translate them; language is not a data gap and must not lower any score. | Extracts under `GENERATION_ROOT`; e.g. "Demonstrações financeiras consolidadas para o exercício findo em 31 de dezembro de 2025 e 2024" |

Downstream agents: apply CLAUDE.md §27 with the US-SEC foreign-private-issuer map. The interim reporting basis here is **both** — the 14 Aug 2026 interim report carries a standalone three-month AND a cumulative six-month column, so any consensus figure must be restated onto whichever basis is being tested before it is used as a bar (§27).

---

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool holds an audited annual filing from within 18 months (Form 20-F for FY2025, filed 8 April 2026 — 5.0 months old) and three separate qualifying recent sources from within 6 months (interim financial statements for the six months ended 30 June 2026 filed 14 Aug 2026, the Q2 2026 earnings call transcript of 13 Aug 2026, and the Q2'26 investor deck of 13 Aug 2026), with zero extraction failures across all 115 sources.
- **Critical missing items:** None — the sufficiency rule is met on both legs.

**Caveats downstream agents must carry (none of these changes the verdict):**

1. **Heavy duplication.** The entire `Filings/` folder is mirrored as `Filings 2/` (13 identical files), five CIQ workbooks have "(1)" twin copies, the 13-tab `Financials.xls` overlaps eleven single-sheet exports (`ciq_facts.json` logs 7 conflicts), the two 20-F files exist as both `.pdf` and `.doc`, `consolidated_tax_report_2025-26.xlsx` duplicates 11 tabs of the IBKR workbook, and `Interim_Report(May-15-2026)` duplicates `(May-14-2026)`. The pool is smaller than 115 sources suggests. Never count a duplicate as corroboration (§16: "the methods agree" counts only if the sources are independent).
2. **No EBITDA line exists.** CIQ uses a Bank template, so `ltm_ebitda_m`, `net_debt_ebitda_x`, `interest_coverage_x`, `ev_ebitda_current_x` and `peer_ev_ebitda` are all `unknown` in `ciq_facts.json`. EV/EBITDA is not available for this name — do not manufacture it; use bank-appropriate methods.
3. **`net_debt_m` −9,274.2 is the CIQ vendor basis**, which may net short-term and liquid investments. It is not the strict total-debt-minus-cash figure. Label the basis every time it appears (§15) and prefer the 20-F's own numbers.
4. **`ltm_ocf_m` −10,304.8** is a lending balance-sheet growing, not cash burn. Do not read it as a distress signal without the 20-F cash-flow note.
5. **The 15-page deep-dive memo dated 30 Aug 2026 is a prior engine output**, not evidence. It already carries a target and a score. Treat it as a user note (§4 tier 9) and re-derive every conclusion from filings; do not let its verdict anchor this run.
6. **`Nu Holdings Ltd. Form 20-F filed on Apr-08-2026.pdf` (6,115 chars) is a search-index page**, not the filing. It extracted cleanly, but the substantive 20-F is the 1.67m-char PDF. Cite the full document.
7. **Four Portuguese Bradesco BDR notices are 340–360 chars each.** They extracted completely — they are one-page depositary notices, not failed extractions. They confirm the B3 BDR programme and the release dates; they carry no financial detail.
8. **Three files in the pool are not NU evidence at all:** an unrelated `.torrent` file, and the user's own Interactive Brokers activity statement and FY2025-26 tax workbooks. Exclude them from every company claim.
