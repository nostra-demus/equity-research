# Historical Financials — KAR

Karoon Energy Ltd (ASX: KAR) is an Australian-incorporated, ASX-listed upstream oil & gas producer (Baúna field, Santos Basin, Brazil — operated; Who Dat/Dome Patrol/Abilene, Gulf of America — non-operated). It reports under IFRS as adopted by the AASB (Australian equivalent of IFRS), in **US dollars** (despite the ASX/AUD listing), and changed its fiscal year end from 30 June to 31 December, with a **6-month transition year ("TY23", 1 July 2023 – 31 December 2023)** sitting between the last old-convention year (FY ended 30-Jun-2023) and the first new-convention year (FY ended 31-Dec-2024) [FY2025 Annual Report, Glossary, p.135 ("TY23 … beginning 1 July 2023 and ending on 31 December 2023")]. No `ciq_facts.json` or `relationships.json` sidecar exists for this run (confirmed absent per `00_earnings-data-triage.md`); every figure below is this agent's own sourced read, cross-checked between the Capital IQ workbook export and the primary filings.

**Data-quality finding carried through this whole report:** the Capital IQ Financials workbook labels its "Dec-31-2023" column "**12 months**", but the underlying transition period the company actually reported was **6 months** (Revenue US$412.9m, NPAT US$122.5m) [FY2024 Preliminary Final Report (Appendix 4E), 26-Feb-2025, p.1: "Previous corresponding period: 6 months ended 31 December 2023" / Revenue $412.9m / NPAT $122.5m]. CIQ's Dec-31-2023 column shows Revenue $825.8m and NPAT $245.0m — **almost exactly 2× the filed 6-month figures** (825.8/412.9 = 2.0002; 245.0/122.5 = 2.0000), which is consistent with CIQ mechanically doubling the 6-month stub rather than reporting an audited 12-month period. This is a bad-extraction risk on the vendor's side, not a filing problem, and it means the CIQ Dec-31-2023 column **must not** be used as a real annual data point. It is excluded from the Annual Financial Table below; the genuine 6-month TY23 figures are shown separately, sourced from the primary filing.

## 1. Annual Financial Table (5 years, US$ millions except per-share)

Currency: **US dollars** (company's own reporting currency, not AUD). Reporting standard: **IFRS (AASB)**. Because of the fiscal-year-end change, the table below uses five genuine **12-month** periods only — three under the old 30-June year end and two under the new 31-December year end. The 6-month TY23 transition period (1-Jul-2023 to 31-Dec-2023, Revenue $412.9m, NPAT $122.5m [Appendix 4E, 26-Feb-2025, p.1]) is **excluded from this table** to avoid mixing period lengths (CLAUDE.md §15) and is shown instead in the half-year trend table (§3). This means the FY2024(Dec) column's year-over-year comparison spans a structural gap — see the YoY row note.

| Metric | FY2021 (Jun) | FY2022 (Jun) | FY2023 (Jun) | FY2024 (Dec) | FY2025 (Dec) | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 170.8 | 385.1 | 566.5 | 776.5 | 628.6 | Inflecting |
| Revenue YoY % | N/A (first year shown) | +125.5% | +47.1% | N/A — FYE change, see note | -19.0% | Inflecting |
| Gross Profit | 58.9 | 193.4 | 284.9 | 379.1 | 241.3 | Inflecting |
| Gross Margin % | 34.5% | 50.2% | 50.3% | 48.8% | 38.4% | Inflecting |
| EBITDA (CIQ-standardized) | 84.3 | 206.3 | 332.0 | 498.3 | 364.7 | Inflecting |
| EBITDA Margin % (CIQ basis) | 49.3% | 53.6% | 58.6% | 64.2% | 58.0% | Volatile |
| EBIT (CIQ Operating Income) | 18.6 | 150.6 | 245.7 | 318.4 | 197.4 | Decelerating |
| EBIT Margin % | 10.9% | 39.1% | 43.4% | 41.0% | 31.4% | Decelerating |
| EPS (diluted) | $0.01 | $(0.12) | $0.29 | $0.1597 | $0.1678 | Volatile |
| CFO | 29.8 | 154.2 | 305.9 | 434.6 | 251.4 | Volatile |
| Capex | 172.9 | 114.1 | 355.3 | 218.6 | 288.5 | Volatile |
| FCF (CFO – Capex) | -143.1 | 40.1 | -49.4 | 216.0 | -37.1 | Volatile |
| Working Capital | 53.6 | -1.8 | -29.0 | 188.0 | 185.1 | Volatile |
| Net Debt | 179.6 | 158.3 | 200.9 | 170.0 | 132.7 | Decelerating |
| Net Debt / EBITDA | 2.13x | 0.77x | 0.61x | 0.34x | 0.36x | Decelerating |

Sources: FY2021–FY2023(Jun) figures from `Karoon Energy Ltd ASX KAR Financials.xls` (Income Statement / Balance Sheet / Cash Flow tabs, Capital IQ export; no primary annual filing for these periods exists in this data pool). FY2024(Dec) and FY2025(Dec) Revenue, Gross Profit, EBIT/EBITDA-basis lines cross-checked against the audited Consolidated Statement of Profit or Loss [FY2025 Annual Report, p.78] and Consolidated Statement of Financial Position [p.79]; CFO/Capex against the Consolidated Statement of Cash Flows [p.81]. EPS diluted for FY2024/FY2025 taken directly from the filing (15.97 / 16.78 cents) [FY2025 Annual Report, p.78, "Diluted earnings per ordinary share"], not the CIQ-rounded 0.16/0.17.

**Reconciliation notes (CLAUDE.md §5 — cite the source the number came from):**
- **Gross Profit, FY2025:** CIQ shows $258.1m; the audited Consolidated Statement of Profit or Loss shows **$241.3m** [FY2025 Annual Report, p.78]. A $16.8m gap. The filing wins by source hierarchy (§4); this table uses $241.3m. FY2024 gross profit matches exactly between CIQ and the filing ($379.1m both), so this is a FY2025-specific vendor reclassification, not a systemic issue.
- **EBITDA, FY2024/FY2025:** the CIQ-standardized figures used in this row ($498.3m / $364.7m) differ materially from the company's own non-IFRS "EBITDA" line ($450.3m / $380.7m) [FY2025 Annual Report, Financial Summary, p.48] — a $48.0m gap in FY2024 (~10.7% of the CIQ figure) and a $16.0m gap in FY2025. Both are legitimate under different construction rules; this table keeps one consistent (CIQ) basis across all five years so the row is internally comparable, and §4 below shows the company's own reported figure alongside it, labeled.
- **Net Debt — §15 basis label:** cash side is **strict** (cash & equivalents only; no short-term investments netted in). On the debt side, CIQ's "Total Debt" is **confirmed by direct reconciliation to the FY2025 Annual Report balance sheet** to equal Borrowings [Note 17] **plus** Lease liabilities [Note 14]: FY2025, $337.7m + $1.1m = $338.8m; FY2024, $333.5m + $177.7m = $511.2m [FY2025 Annual Report, p.79]. The company's own balance sheet reports Borrowings and Lease liabilities as **separate line items**, not one "debt" figure — so this table's Net Debt is **broader than borrowings alone**. The lease liability is almost entirely the Baúna FPSO (floating production storage) charter lease, which the company bought out during 2025 (lease liabilities fell from $177.7m to $1.1m, consistent with the $35.3m "Gain on disposal of FPSO right-of-use asset" recognised in FY2025 [p.78, Note 3(b)]) — a real, IFRS 16 lease-liability obligation tied to core operating infrastructure, not a discretionary office lease, but still a different thing from bank borrowings. Label for this table throughout: **strict basis (cash & equivalents only); total-debt figure = Borrowings + Lease liabilities per the filing's own Notes 14/17, confirmed by reconciliation — not borrowings-only.** For FY2021–FY2023(Jun), no primary balance sheet is in this pool to confirm the same composition; treat those three years' Net Debt as the CIQ aggregate, unconfirmed against a filing debt note. The `balance-sheet-survival` module builds the canonical, filing-verified net-debt figure for this ticker; it is not guaranteed to match this table exactly.

## 2. TTM Snapshot

Latest TTM = the 12 months ended 31-December-2025 (FY2025 itself, since the FY2025 Annual Report is the most recent full-year filing and no H1/FY2026 half-year result has yet landed in this data pool — see `00_earnings-data-triage.md` §0). Prior TTM = the 12 months ended 30-June-2025, built as FY2024(Dec) − H1 2024 + H1 2025.

| Metric | Latest TTM (to 31-Dec-2025) | Prior TTM (to 30-Jun-2025) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 628.6 | 675.4 | -6.9% | FY2025 Annual Report p.78; H1 2025/H1 2024 Half Year Audit Review p.18 |
| EBITDA (EBITDAX, company non-IFRS basis — see note) | 403.2 | 450.4 | -10.5% | FY2025 Annual Report, Financial Summary p.48; H1 2025 Half Year Audit Review, 1H25 Financial Summary p.[cover] |
| EBIT | Not available | Not available | — | The company does not disclose a line item called "EBIT" at half-year cadence, and CIQ's Financials export is annual-only, so no consistent-basis TTM EBIT can be built from this pool. |
| EPS diluted | $0.1678 | ~$0.1762 (derived) | -4.8% | FY2025 Annual Report p.78; derived as FY2024 diluted EPS (15.97c) − H1 2024 (7.66c) + H1 2025 (9.31c) = 17.62c [H1 2025/H1 2024 Half Year Audit Review, p.18]. Flagged as approximate: cents-based subtraction does not fully account for the weighted-average diluted share count moving (798.8m → 748.1m) across the periods being combined. |
| CFO | 251.4 | 291.9 | -13.9% | FY2025 Annual Report p.81; H1 2025/H1 2024 Half Year Audit Review p.21 |
| Capex | 288.5 | 301.8 | -4.4% | Same sources — capex = total cash used in investing activities (confirmed to equal the sum of the itemised investing lines, no residual) |
| FCF | -37.1 | -9.9 | Worsened by $27.2m (-274.7%) | CFO − Capex, both lines above |
| Net debt at latest period-end | 132.7 (31-Dec-2025) | 224.5 (30-Jun-2025) | -40.9% | FY2025 Annual Report p.79 (Borrowings $337.7m + Lease liabilities $1.1m − Cash $206.1m); H1 2025 Half Year Audit Review p.19-20 (Borrowings $335.5m + Lease liabilities $1.1m − Cash $112.1m) |

Note: Net debt is a point-in-time balance sheet metric, not a TTM flow metric — the two columns above are balance-sheet snapshots at the respective period-ends, not trailing-12-month sums. Net debt basis: strict (cash & equivalents only); total-debt figure = Borrowings + Lease liabilities per the filing's own notes, confirmed by reconciliation (see §1 note) — not borrowings-only.

The EBITDA row here uses the company's own disclosed **EBITDAX** (a different, company-defined non-IFRS measure that adds back exploration expense and includes FPSO lease depreciation/finance costs) rather than the CIQ-standardized EBITDA used in §1's annual table, because EBITDAX is the only EBITDA-family measure the company discloses at half-year cadence — CIQ's Financials export has no half-year columns. This is a **basis switch from §1**, stated here explicitly per CLAUDE.md §15 (no mixing of bases without reconciliation).

## 3. Latest Half-Year Trend Table (in place of quarterly — see basis note)

Karoon reports full audited/reviewed income statement, balance sheet, and cash flow **half-yearly**, not quarterly; the quarterly-cadence "Activities Reports" in this pool cover production volumes and cash only, not a full P&L [`00_earnings-data-triage.md` §0]. Per MODULE_RULES.md's regime-driven substitution, this table uses half-year-on-half-year (HoH) trend in place of the standard 8-quarter QoQ table. Five genuine half-year periods with full financials exist in this pool: the TY23 transition stub (H2 2023 only) plus H1/H2 2024 and H1/H2 2025 (H2 figures derived by subtracting the reported half from the reported full year).

| Metric | TY23 (H2'23, 6mo, reported) | H1'24 (reported) | H2'24 (derived) | H1'25 (reported) | H2'25 (derived) | HoH Trend | YoY vs Same Half |
|---|---:|---:|---:|---:|---:|---|---|
| Revenue | 412.9 | 409.4 | 367.1 | 308.3 | 320.3 | Decelerating | H1'25 vs H1'24: -24.7%; H2'25 vs H2'24: -12.8% |
| Gross Margin % | 60.2% | 50.9% | 46.6% | 36.5% | 40.2% | Decelerating | H1'25 vs H1'24: -1,440bps; H2'25 vs H2'24: -640bps |
| EBITDAX (company non-IFRS) | 253.2 | 246.9 | 223.3 | 227.1 | 176.1 | Decelerating | H1'25 vs H1'24: -8.0%; H2'25 vs H2'24: -21.1% |
| EBITDAX Margin % | 61.3% | 60.3% | 60.8% | 73.7% | 55.0% | Volatile | H1'25 vs H1'24: +1,340bps; H2'25 vs H2'24: -580bps |
| EPS (diluted) | $0.2003 | $0.0766 | $0.0831 (derived) | $0.0931 | $0.0747 (derived) | Decelerating | H1'25 vs H1'24: +21.5%; H2'25 vs H2'24: -10.1% |

Sources: TY23 and H1'24 from the H1 2024 Half Year Audit Review (Aug-27-2024), Condensed Consolidated Statement of Profit or Loss p.18-19 and 1H24 Financial Summary; H1'25 from the H1 2025 Half Year Audit Review (Aug-26-2025), same statement p.18 and 1H25 Financial Summary p.cover. H2'24 and H2'25 derived as (full-year FY2025 Annual Report figure) minus (reported H1 figure); flagged "derived" in the table.

**The H1'25 EBITDAX-margin spike (73.7%, +1,340bps YoY) does not track revenue or gross margin, both of which fell sharply over the same half** — this is the single-metric-disagrees case CLAUDE.md §3 requires naming. H1 2025 "Other income" included a $35.3m gain on disposal of the FPSO right-of-use asset and other one-off items not present in H1 2024's Other income of $4.4m [H1 2025 Half Year Audit Review, p.18, Note 3(b)], which flow into EBITDAX (built from profit before tax plus finance costs and D&A) but not into gross margin. Stripped of that one-off, H1 2025 EBITDAX margin would be materially lower and directionally in line with the gross-margin decline — see §6 for the full-year version of this same effect, shown with arithmetic.

## 4. Reported vs Adjusted Metrics

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA (FY2025) | $380.7m (company "EBITDA") | $388.8m (Underlying EBITDAX) | +$8.1m | EBITDAX adds back exploration & evaluation expense and costs of unsuccessful wells not in "EBITDA"; "Underlying" further removes non-recurring items (non-recurring FPSO transition costs +$2.9m; change in fair value of contingent consideration is REMOVED, i.e. the $21.2m gain is stripped out for the "Underlying" view) — net effect across all adjustments is a modest increase vs reported EBITDA | FY2025 Annual Report, Financial Summary p.48; adjustments note p.48-49 |
| EBIT | Not disclosed by the company as a line item | — | — | Company presents Gross profit / Other income / Finance costs / Other expenses, not a single "EBIT" subtotal; this report's EBIT row (§1) is CIQ's own standardized construction, not a company-reported figure | FY2025 Annual Report, Consolidated Statement of Profit or Loss, p.78 |
| NPAT/EPS (FY2025) | NPAT $125.5m / diluted EPS $0.1678 | Underlying NPAT $107.5m / derived underlying diluted EPS ~$0.1437 | -$18.0m / -$0.024 | Underlying NPAT **removes** net one-off gains embedded in the statutory result — principally the $35.3m gain on disposal of the FPSO right-of-use asset and the $21.2m positive change in fair value of contingent consideration (both pre-tax, in "Other income" and a separate P&L line respectively) — so statutory FY2025 NPAT is **higher** than Underlying NPAT, the reverse of the typical "underlying strips out losses" pattern | FY2025 Annual Report, Financial Summary p.48 ("Underlying net profit after tax 107.5" vs "Net profit/(loss) after income tax 125.5"); Consolidated Statement of Profit or Loss p.78 for the $35.3m and $21.2m line items. Underlying diluted EPS is this agent's own derivation ($107.5m ÷ 748.06m weighted-average diluted shares), not a company-disclosed figure — labeled "Inference, not from filings." |
| NPAT/EPS (FY2024, for contrast) | NPAT $127.5m | Underlying NPAT $214.0m | +$86.5m | In FY2024 the adjustment runs the other way — Underlying NPAT is **higher** than statutory, i.e. one-off items (the filing does not fully itemise all of them in the extracted pages read for this report) depressed the reported FY2024 result relative to underlying operating performance | FY2025 Annual Report, Financial Summary p.48 |

## 5. Quarterly Seasonality Table

*Insufficient quarterly history for seasonality analysis.* Karoon reports full financials half-yearly, not quarterly (§3 basis note), and even on a half-year basis this pool holds only 2.5 fiscal years of full-P&L history (TY23 stub + FY2024 + FY2025) — short of the 3 full fiscal years needed to distinguish genuine seasonality from a single company-specific FPSO/pricing event. What the half-year data does show (§3) — H1 consistently outweighing H2 in gross margin in three of the last three comparable half-pairs — looks more like production-timing and realized-price effects (a commodity business) than calendar seasonality, but that decomposition belongs to `02_revenue-drivers`, not this agent.

## 6. Key Trend Summary

Revenue is **inflecting negative**: three years of strong growth under the old fiscal-year convention (+125.5% FY22, +47.1% FY23) gave way to a -19.0% decline in FY2025 (Revenue $776.5m → $628.6m) [FY2025 Annual Report, p.78], with both halves of FY2025 down double digits year-on-year (H1 -24.7%, H2 -12.8%; §3). Margins are **genuinely compressing, not expanding, despite what the reported EBITDA line shows**: gross margin fell 1,043bps (48.8% → 38.4%) in FY2025, while the company's own reported EBITDA margin rose 257bps (58.0% → 60.6%) over the same year [FY2025 Annual Report, Financial Summary p.48] — a contradiction this report will not average away (CLAUDE.md §3). The arithmetic: FY2025 EBITDA of $380.7m included a $35.3m gain on disposal of the Baúna FPSO right-of-use asset and a $21.2m positive change in fair value of contingent consideration (both cited in §4); stripping both ($380.7m − $35.3m − $21.2m = $324.2m) drops the adjusted EBITDA margin to 51.6% of revenue, a **641bps compression** versus FY2024's 58.0% — directionally consistent with, and roughly 60% the size of, the gross-margin decline. The reported EBITDA-margin "expansion" is a one-off-driven artefact, not an improvement in the underlying business; a reader relying on the reported EBITDA margin alone would draw the wrong conclusion. There is no material calendar seasonality provable from this pool (§5); the swings observed are company-specific (the FYE transition, the FPSO buyout, and falling realized prices — the last two belong to `03_margin-drivers` and `02_revenue-drivers` to fully attribute). The clearest inflection point in the five-year window is FY2025 itself: revenue, gross margin, and (once one-offs are stripped) EBITDA margin all turned down together after three years of expansion, while leverage stayed low (Net Debt/EBITDA 0.34x FY2024 → 0.36x FY2025, both CIQ-basis) because the FPSO buyout was funded largely from cash on hand rather than new debt.

## 7. Citations

[1] FY2025 Annual Report (IFRS/AASB, filed 25-Feb-2026), Consolidated Statement of Profit or Loss, p.78
[2] FY2025 Annual Report, Consolidated Statement of Financial Position, p.79
[3] FY2025 Annual Report, Consolidated Statement of Cash Flows, p.81
[4] FY2025 Annual Report, Note 2 Segment Information (Brazil/USA/Corporate), p.85-87
[5] FY2025 Annual Report, Note 14 (Leases) and Note 17 (Borrowings), p.98-103 area
[6] FY2025 Annual Report, "RESULTS — Financial Summary" table, p.48
[7] FY2024 Preliminary Final Report (Appendix 4E — earnings press release), 26-Feb-2025, p.1 (TY23 six-month comparative: Revenue $412.9m, NPAT $122.5m, Underlying NPAT $144.7m)
[8] H1 2025 Half Year Audit Review (Appendix 4D reviewed interim financials), 26-Aug-2025 — Condensed Consolidated Statement of Profit or Loss p.18; Condensed Consolidated Statement of Financial Position p.19-20; Condensed Consolidated Statement of Cash Flows p.21; 1H25 Financial Summary (cover pages)
[9] H1 2024 Half Year Audit Review (Appendix 4D reviewed interim financials), 27-Aug-2024 — Condensed Consolidated Statement of Profit or Loss p.18-19; Condensed Consolidated Statement of Cash Flows p.[same section]; 1H24 Financial Summary
[10] Capital IQ export, `Karoon Energy Ltd ASX KAR Financials.xls` — Income Statement / Balance Sheet / Cash Flow tabs, annual periods Jun-2021 to Jun-2023 (no primary annual filing for these periods is present in this data pool; data as of the pool's Capital IQ sync)
[11] `analyses/KAR_2026-08-27/earnings/00_earnings-data-triage.md` — jurisdiction, fiscal-year-change, and data-availability findings this report relies on
