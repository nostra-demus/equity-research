# Relative Valuation — Peers — GOOGL

Alphabet reports under U.S. GAAP in USD. The decision line is **GOOGL · Nasdaq Global Select Market · USD** at **$278.99** on 2026-11-03; EV-derived values use 12,368m fully diluted shares and the canonical bridge from `01`: $73,489m strict net debt, $6,900m non-controlling interest (NCI), and $18,023m preferred equity. [Capital IQ Comps → Financial Data, subject row, data as of 2026-11-03; `ciq_facts.json` `current_price` and `shares_outstanding_m`; Q3 FY2026 Form 10-Q, Note 12; Price & Capital Structure — GOOGL, §§4 and 7]

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Meta Platforms | META | Competes for consumer attention and advertising budgets through Family of Apps; this is an advertising-attention comparison, not pure Search. | [Competitive Map — GOOGL, §2; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Business Description, data as of 2026-11-03]
| Amazon.com | AMZN | Competes in retail media, commerce search, sponsored ads, display and video advertising; overlap is narrower than general Search. | [Competitive Map — GOOGL, §2; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Business Description, data as of 2026-11-03]
| Microsoft | MSFT | Bing, Copilot, Edge and Search Advertising make this the clearest public general-search rival; Azure also overlaps with Google Cloud. | [Competitive Map — GOOGL, §2; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Business Description, data as of 2026-11-03]

The set comes from `business-model/08_competitive-map.md`, not a self-selected screen. The broader Capital IQ export also lists Reddit, Pinterest, Netflix, DoorDash, Snap, The Trade Desk and Match; they are not used in the primary median because their scale, end markets, or business models are less comparable with Alphabet's combined search, advertising and cloud business. Private search/AI rivals have no public multiples in the frozen pool and are not assigned assumed values. [Competitive Map — GOOGL, §5; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples and Business Description, data as of 2026-11-03]

## 2. Peer Multiples & Operating Stats

All price multiples and operating statistics below are **LTM** and come from the frozen Capital IQ comparable workbook as of 2026-11-03. FCF yield is LTM CFO less capex divided by market capitalization; peer FCF yield is not supplied in the workbook, so it is not imputed. Net debt/EBITDA uses the workbook's vendor `LTM Net Debt` divided by LTM EBITDA, including its vendor cash/investment conventions; this is used only for like-for-like peer comparison, not for GOOGL's valuation bridge.

| Company | P/E | EV/EBITDA | EV/EBIT | EV/Sales | FCF Yield | Rev Growth | EBITDA Margin | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| GOOGL | 14.6x† | 17.4x† | 21.2x† | 7.1x† | 0.6%‡ | 22.2%† | 39.4%† | 15.6%§ | (0.62)x† | 2026-11-03 |
| Meta | 20.7x† | 13.1x† | 17.3x† | 6.6x† | N/A | 27.5%† | 48.1%† | N/A | 0.28x† | 2026-11-03 |
| Amazon | 19.9x† | 14.1x† | 27.4x† | 3.6x† | N/A | 15.4%† | 23.0%† | N/A | 1.04x† | 2026-11-03 |
| Microsoft | 26.5x† | 17.2x† | 22.2x† | 11.1x† | N/A | 17.9%† | 59.4%† | N/A | 0.34x† | 2026-11-03 |
| **Peer median** | **20.7x** | **14.1x** | **22.2x** | **6.6x** | **N/A** | **17.9%** | **48.1%** | **N/A** | **0.34x** | **2026-11-03** |

† [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples, Financial Data and Operating Statistics, data as of 2026-11-03]. The net-debt ratios are calculated from that workbook's LTM net-debt and EBITDA fields. The deterministic source-bound read confirms GOOGL's $185,516m LTM EBITDA, 17.4x LTM EV/EBITDA and (0.62)x vendor-basis net debt/EBITDA. [`ciq_facts.json`, `ltm_ebitda_m`, `ev_ebitda_current_x`, and `net_debt_ebitda_x`]

‡ GOOGL LTM FCF yield = $19,747m CFO less capex ÷ $3,424,603m market capitalization = 0.58%, rounded to 0.6%. [Historical Financials — GOOGL, §2; Price & Capital Structure — GOOGL, §3]

§ GOOGL's 15.6% is Capital IQ's LTM vendor-defined ROIC. The peer material in the competitive map has ROE rather than a matched ROIC definition, so peer ROIC is not comparable and remains N/A. [`ciq_facts.json`, `multi_year_trajectory`; Moat — GOOGL, §3]

Each bold peer-median cell is the numerical median of the three preceding selected-peer values, not the broader Capital IQ summary statistic.

The deterministic CIQ sidecar reports 17.4x GOOGL LTM EV/EBITDA against **15.5x** for the workbook's full ten-company set. This report's **14.1x** median is a deliberate three-peer calculation (META, AMZN and MSFT), not a conflicting workbook read. [`ciq_facts.json`, `peer_ev_ebitda`; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples, data as of 2026-11-03]

## 3. Premium / Discount to Peer Median

| Multiple | Company | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| LTM EV/Sales | 7.1x | 6.6x | +7.6% premium |
| LTM EV/EBITDA | 17.4x | 14.1x | +23.4% premium |
| LTM EV/EBIT | 21.2x | 22.2x | (4.5%) discount |
| LTM P/E | 14.6x | 20.7x | (29.5%) discount |
| LTM FCF yield | 0.6% | N/A | Not assessable — peer FCF yield is absent |

Premium / (discount) = `(GOOGL multiple − peer median) ÷ peer median`; the price-multiple signs above follow that formula. [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples and Financial Data, data as of 2026-11-03]

The forward read used for valuation points the same way but with smaller P/E separation: GOOGL is at a 3.7% premium on NTM EV/revenue (5.55x versus 5.35x), a 10.6% premium on NTM EV/EBITDA (11.78x versus 10.65x), and a 17.7% discount on NTM P/E (20.24x versus 24.59x). [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples, Financial Data and Implied Valuation, data as of 2026-11-03]

**Is the gap typical or unusual?** Not assessable — the admitted pool contains no 3-year history of this selected peer set's multiples. GOOGL's own 39-quarter EV/EBITDA history does not answer the relative-gap question. [`ciq_facts.json`, `range_position`; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples, data as of 2026-11-03]

## 4. Is the Gap Warranted?

**Conclusion: the forward P/E discount is too deep (relative upside), but the EV/revenue and EV/EBITDA premiums prevent an all-in relative-value conclusion.** GOOGL's 39.4% LTM EBITDA margin is 870bp below the selected-peer median of 48.1%, although its 22.2% LTM revenue growth is above the 17.9% median; lower margin is already reflected in EBITDA, EBIT and EPS denominators and is not used again as an earnings-multiple haircut. [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Operating Statistics, data as of 2026-11-03]

An extra risk discount is warranted for durability rather than current margin: business quality is 62/100, the moat is narrow and mixed, the rate-of-change score is 40/100, and capital spending rose from $91.4bn in FY2025 to $132.0bn in the first nine months of 2026. The ongoing AI infrastructure build, regulatory remedies, and uncertain returns on added capital can affect post-NTM earnings durability. [Business Quality — GOOGL, §§1–4; Moat — GOOGL, §5; data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Item 7; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, nine months 2026, Item 2]

The counterweight is real: NTM revenue implied by the same CIQ workbook grows 27.3% for GOOGL, versus a 19.6% median for the three peers, and vendor-basis net debt/EBITDA is (0.62)x versus 0.34x. These inputs do not establish that the P/E discount should disappear, but they support a narrower-than-current 17.7% discount as a judgment read. [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Financial Data and Trading Multiples, data as of 2026-11-03; `ciq_facts.json`, `net_debt_ebitda_x`]

## 5. Implied Value from Peer Multiples

The forward bases are matched: NTM peer multiples are applied to GOOGL's NTM CIQ revenue of $599,564.79m, EBITDA of $282,405.72m, and diluted EPS of $13.79. EV methods bridge as `implied EV − $73,489m strict net debt − $6,900m NCI − $18,023m preferred equity`, then divide by 12,368m fully diluted shares. [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Financial Data, Trading Multiples and Implied Valuation, data as of 2026-11-03; Price & Capital Structure — GOOGL, §§2, 4 and 7]

| Multiple | Applied Peer Multiple | Implied EV or Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| NTM EV/Revenue | 5.35x median → **4.55x** adjusted | EV $2,726,521m | $212.49 | (23.8%) |
| NTM EV/EBITDA | 10.65x median → **9.59x** adjusted | EV $2,706,856m | $210.90 | (24.4%) |
| NTM P/E | 24.59x median → **22.13x** adjusted | Equity $3,774,546m | $305.19 | +9.4% |

**Base-case implied value: $305.19 per GOOGL Class A share from the NTM P/E method.** The peer-method dispersion is **$210.90–$305.19** per share, a 44.7% high-to-low field relative to the low. That spread is material: the P/E result reflects a lower forward earnings denominator after the FY2026 non-operating EPS distortion, while the EV methods continue to put a lower value on the same operating earnings and revenue base. It should not be averaged into a false-precision figure. [Historical Financials — GOOGL, §§2–3; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Implied Valuation, data as of 2026-11-03]

**Quality-adjustment ledger**

| Multiple adjusted | Peer median | Adjusted to | Gap already in the denominator? | What the extra adjustment pays for | How it was sized |
|---|---:|---:|---|---|---|
| NTM EV/Revenue | 5.35x | 4.55x | No — revenue is margin-blind | GOOGL's 39.4% LTM EBITDA margin is below the 48.1% peer median, plus the AI-capacity/durability risk. | 15% judgment discount: less than the 18.1% margin shortfall because GOOGL's 27.3% NTM revenue growth is 7.7pp above the peer median. This is an inference, not from filings, not a mechanical margin-ratio formula. |
| NTM EV/EBITDA | 10.65x | 9.59x | Yes — current margin is already in GOOGL EBITDA | Earnings durability and the risk that AI infrastructure spending, depreciation and regulatory remedies reduce returns after the NTM period; **not** lower margin. | 10% judgment discount, not an empirical frequency. It is anchored to $195bn–$205bn FY2026 CapEx guidance versus $91.4bn FY2025 CapEx and the 40/100 rate-of-change score. [Guidance & Consensus — GOOGL, §2; Business Quality — GOOGL, §§1–4] |
| NTM P/E | 24.59x | 22.13x | Yes — current margin is already in GOOGL EPS | The same post-NTM durability, regulatory and return-on-new-capital risk; **not** lower margin or a `margin ÷ peer margin` formula. | 10% judgment discount, not an empirical frequency, matched to the evidence and rationale in the NTM EV/EBITDA row. [Business Quality — GOOGL, §§1–4; Moat — GOOGL, §5] |

The forward P/E point is the primary peer read because it values common equity after expected depreciation, interest and tax. It is not independent corroboration of any own-history method: `02_multiples-own-history` was not available at this stage, and an own-history multiple would record the market's past pricing rather than independently establish mispricing.

## 6. Sector Cycle Reality Test

Not assessable — no sector-level multiple history. The frozen Capital IQ comparable workbook provides only the 2026-11-03 snapshot, and the pool's price chart is GOOGL-only rather than a three-peer or sector-multiple history; no 3–5-year peer-group re-rating/de-rating can therefore be measured from admitted evidence. [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples, data as of 2026-11-03; data/GOOGL/Price_Charting Excel Export - Nov 3rd 2026 2_23_42 pm.xls, Pane 1]

## 7. Relative Read

GOOGL is 17.7% below the selected peers' NTM P/E median, but 3.7% and 10.6% above their NTM EV/revenue and EV/EBITDA medians, respectively. The P/E-led base point is $305.19, with a $210.90–$305.19 peer-method field; the field is too wide to portray as one clean relative-value signal. The peer anchor's sector-cycle status is not assessable, so the current peer median is a snapshot rather than a proven stable valuation anchor.
