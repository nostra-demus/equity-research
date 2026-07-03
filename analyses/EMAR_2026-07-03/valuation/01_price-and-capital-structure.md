# Price & Capital Structure — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS
**Reporting currency:** AED (UAE Dirham), AED millions unless stated
**Fiscal year end:** 31 December
**Jurisdiction:** United Arab Emirates — Dubai Financial Market (DFM)
**Business type track:** Operating real estate developer with recurring income streams

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price (primary anchor) | AED 12.20 | Capital IQ Comps export ("Company Comparable Analysis Emaar Properties PJSC.xls", Financial Data tab) + Capital IQ standalone consensus export ("01_Consensus.xlsx") — two independent pool sources agree at AED 12.20 | Jun-28-2026 (comps export As-of date: Excel serial 46201 = 2026-06-28; confirmed by 01_Consensus.xlsx showing identical price) |
| Current price (secondary context) | AED 12.96 | Capital IQ EstimatesReport ("EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls", Consensus tab, row 31: "Latest Price/Last Close Price: 12.96/12.96") | Pool-sourced; precise session date not separately stamped in the export. The export is labeled Jun-28-2026 by the data triage but the stated price reflects a different DFM trading session than the comps. |
| Currency | AED (UAE Dirham) | All Capital IQ exports; AED is the DFM listing currency for EMAAR (ISIN AEE0003010111) | — |
| Price basis (primary) | Last close / end-of-day close | Capital IQ "Day Close Price Latest" and "Latest Price/Last Close Price" fields | Jun-28-2026 |
| USD equivalent (primary) | USD 3.32 | Capital IQ Comps export Financial Data tab (USD-denominated); AED 12.20 / AED 3.6725 per USD (UAE peg) = USD 3.320 — consistent within rounding | Jun-28-2026 |
| 52-week range | AED 10.15 – AED 17.25 | Capital IQ EstimatesReport, Consensus tab (row 32) | Jun-28-2026 |
| Historical Cap tab price (prior period) | AED 12.14 | Capital IQ Quarterly Financials ("Emaar Properties PJSC DFM EMAAR Financials_Quarterly.xls"), Historical Capitalization tab — Q1-2026 balance sheet pricing date 2026-05-11 | 2026-05-11 |

**Price-source note — two pool sources, six-point spread.** The primary anchor (AED 12.20) is confirmed by two independent Capital IQ exports (the comps workbook with an explicitly stamped as-of date of Jun-28-2026, and the standalone 01_Consensus.xlsx). The EstimatesReport shows AED 12.96 — a 6.2% higher close from a different DFM trading session. Per the partial-data rule for a corroborated band exceeding 1%, the lower, most-precisely-dated close (AED 12.20) is the canonical anchor. The AED 12.96 figure is shown for context; the corroborated price band is AED 12.20–12.96. Jun-28-2026 falls on a Sunday; DFM is closed on weekends, so both prices are prior-session closes (Fri Jun-27 or earlier). The comps export states the as-of date explicitly via its date serial.

**Price-state: pool-verified.** Both the AED 12.20 and AED 12.96 figures come from Capital IQ pool exports. The as-of date for the anchor is confirmed from the comps export serial (Jun-28-2026). Price-state tag: **`pool-verified`**.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as of Q1-2026 filing, Mar-31-2026) | 8,838.790 million | Capital IQ Quarterly Financials Balance Sheet tab, row "Total Shares Out. on Balance Sheet Date" — Q1-2026 column; consistent with Capital IQ Annual Balance Sheet ("Total Shares Out. on Filing Date" for FY-2025 and Q1-2026: both 8,838.789849 million) |
| Basic shares outstanding (as of FY-2025, Dec-31-2025) | 8,838.790 million | Same source; unchanged since Q4-2022 (increased from 8,179.739M via bonus issue in FY-2022) |
| Diluted weighted-average shares | Not separately disclosed | Capital IQ exports flag "Dilution: Basic" throughout all tabs. EPS in the consensus report (AED 1.99 FY-2025) = Net profit AED 17,602M (attributable) / 8,838.790M shares — confirmed at the basic level. No dilutive instruments identified. |
| Options / RSUs | Not identified in pool | Capital IQ exports do not break out option or RSU detail for EMAR. Emaar is a UAE PJSC; management compensation is primarily cash-based per the Compensation Summary export. No dilutive option programme identified. |
| Convertibles / potential shares | None identified | Capital IQ Capital Structure details show no convertible bonds or equity warrants. All outstanding debt is fixed-rate bonds, term loans, and revolving credit. |
| **Fully diluted shares (TSM + if-converted)** | **8,838.790 million (estimated = basic)** | **No dilution instruments identified. Treated as equal to basic outstanding. This is a labelled limitation — if EMAR has undisclosed phantom-share or long-term incentive plans, the true diluted count may be marginally higher, but the gap is not quantifiable from the data pool.** |
| Share count used for market cap | 8,838.790 million | Latest filing count (Q1-2026 balance sheet date), per MODULE_RULES §2 (Fully Diluted Equity Rules rule 1: use most recent shares outstanding for market cap) |
| Share count used for per-share fair value | 8,838.790 million | Treated as fully diluted = basic (no identified dilution); labelled limitation above applies |

**Share count note.** The share count has been fixed at 8,838.789849 million since Q4-2022 (following a bonus share issue that increased it from 8,179.739 million). There has been no buy-back or new issuance since then. The basic count is used as the best available proxy for fully diluted; the gap, if any, is not material based on available data.

---

## 3. Market Capitalization

`Market cap = shares outstanding × current price`

`Market cap = 8,838.790 million shares × AED 12.20 = AED 107,833 million (AED 107.8 billion)`

| Calculation input | Value | Source |
|---|---:|---|
| Price (primary anchor) | AED 12.20 | Capital IQ Comps export + 01_Consensus.xlsx, Jun-28-2026 |
| Shares outstanding | 8,838.790 million | Capital IQ Q1-2026 Balance Sheet |
| **Market cap (primary)** | **AED 107,833 million** | **Computed** |
| Market cap at AED 12.96 (secondary) | AED 114,551 million | Using EstimatesReport price as context |
| Market cap in USD (primary, AED 12.20) | USD 29,368 million | AED 107,833M / 3.6725 (AED/USD peg); cross-check vs comps USD 29,358M — confirmed within rounding |

The Capital IQ Historical Capitalization tab (Q1-2026, priced as of May-11-2026, AED 12.14) shows a market cap of AED 107,303 million — broadly consistent with the Jun-28-2026 anchor.

---

## 4. Enterprise Value Bridge

The canonical EV bridge uses the Capital IQ standard (broad cash basis: unrestricted cash + short-term investments + trading asset securities = Total Cash & ST Investments per CIQ). This is the most relevant basis for comparing EV-based multiples across the peer set. A strict-cash EV is also shown because the cash-quality assessment below concludes that the short-term investments are genuine liquid financial assets (not trapped or restricted), making the broad basis appropriate — but both are shown for transparency. Operating leases and pensions are separately noted.

**Balance sheet date: Q1-2026 (Mar-31-2026).** This is the most recent available balance sheet in the data pool, sourced from Capital IQ Quarterly Financials.

### EV Bridge (primary — CIQ broad basis)

| Component | AED Mn (Q1-2026) | Source |
|---|---:|---|
| Market capitalization (at AED 12.20, Jun-28-2026) | 107,833 | Computed: 8,838.790M shares × AED 12.20 |
| + Total debt (short + long term, incl. lease liabilities) | 10,064 | Capital IQ Quarterly Financials, Capital Structure Summary tab, Q1-2026: AED 10,064.379M |
| + Minority / non-controlling interest | 13,808 | Capital IQ Quarterly Balance Sheet, Minority Interest row, Q1-2026: AED 13,808.302M |
| + Preferred equity | — | None. Capital IQ confirms no preferred equity outstanding. |
| + Operating lease liabilities (within Total Debt) | (AED 778M already included) | Capital Structure Summary: Lease Liabilities AED 778.026M is a component of Total Debt AED 10,064M. No additional adjustment. |
| + Underfunded pension / OPEB | Not added | Capital IQ Pension OPEB tab: Pension & OPEB balance AED 210.681M at Q1-2026 — immaterial (<0.2% of EV). Not added to standard bridge; noted here per self-check. |
| − Cash & equivalents | (12,180) | Capital IQ Q1-2026 Balance Sheet, Cash And Equivalents: AED 12,179.522M |
| − Short-term investments | (22,503) | Capital IQ Q1-2026 Balance Sheet, Short Term Investments: AED 22,503.367M |
| − Trading asset securities | (351) | Capital IQ Q1-2026 Balance Sheet, Trading Asset Securities: AED 350.710M (included in CIQ Total Cash & ST Investments = AED 35,033.599M) |
| **= Enterprise value (EV, broad / CIQ standard basis)** | **96,672** | **Computed; reconciles to CIQ Net Debt of −AED 24,969.2M: EV = Market cap + Total Debt + Minority − CIQ Total Cash = 107,833 + 10,064 + 13,808 − 35,034 = 96,671 (rounding)** |

### EV Bridge (strict cash basis — for reference)

| Component | AED Mn |
|---|---:|
| Market capitalization | 107,833 |
| + Total debt | 10,064 |
| + Minority interest | 13,808 |
| − Cash & equivalents only | (12,180) |
| **= EV (strict, cash only)** | **119,526** |

The strict-basis EV (AED 119,526M) is AED 22,854M higher than the broad-basis EV (AED 96,672M). The difference equals short-term investments plus trading securities (AED 22,854M). Both figures are valid; the canonical EV for this report is **AED 96,672 million (broad / CIQ standard)** because the cash-quality assessment below confirms the short-term investments are genuine liquid financial assets.

### Cash Quality Assessment

**"Cash" here is not all operating cash — quality matters.** Three layers of cash-like items appear on EMAR's balance sheet:

1. **Unrestricted Cash & Equivalents: AED 12,180M.** This is ordinary corporate cash available for general use. Capital IQ classifies it as Cash And Equivalents. This nets without qualification.

2. **Short-Term Investments: AED 22,503M.** Capital IQ classifies these separately from cash. From the FY-2025 Preliminary Annual Report and the historical context, these are short-term bank deposits and liquid financial assets placed by the corporate treasury — not investments held by a financial subsidiary, not mark-to-market long-tenor securities, and not operating-restricted funds. They are genuine liquid instruments with near-term maturities. The broad basis is therefore defensible and is the canonical choice. The CIQ "Total Cash & ST Investments" of AED 35,034M includes these.

3. **Restricted Cash (Project Escrow): AED 43,338M.** This is COMPLETELY EXCLUDED from both the strict and broad cash figures. Capital IQ correctly separates it as "Restricted Cash" on the balance sheet. These funds are cash collected from off-plan property buyers and held in DFM-mandated project escrow accounts, ring-fenced by regulation for project delivery. They are not available for general corporate use. The company's own "Net Cash" of AED 61,655M (FY-2025, from the Preliminary Annual Report) includes approximately AED 43Bn of this escrow cash — that figure is not comparable to the strict or broad net cash figures and must not be presented as free corporate liquidity. [Source: FY-2025 Preliminary Annual Report, Slide 14]

4. **Trading Asset Securities: AED 351M.** Included by CIQ in Total Cash & ST Investments. These are minor in scale; they are not long-tenor mark-to-market securities. Included in the canonical (broad) EV.

**Canonical cash decision: broad basis (cash + ST investments + trading securities = AED 35,034M) is netted, giving EV of AED 96,672M.** Restricted cash (AED 43,338M) is NOT netted — netting it would materially understate EV and flatflatter apparent leverage.

### Adjustments NOT Made

- **Additional operating lease adjustment:** Operating lease liabilities (AED 778M) are already inside CIQ's Total Debt figure. No further add-back is needed.
- **Pension / OPEB:** AED 210.681M at Q1-2026 — immaterial (<0.2% of EV). Not added.
- **Equity-method investments:** AED 7,529M at Q1-2026. Capital IQ does not subtract equity-method investments in its standard EV bridge, and they are not separately liquid. No deduction made; noted here for SOTP agent (which may treat them as a separate asset in a sum-of-the-parts build). If an SOTP agent adds their value independently, EV should be reduced by this amount to avoid double-counting.
- **Contingent claims:** No material contingent liabilities identified in the data pool at this stage.

---

## 5. Net Debt & Leverage Snapshot

Per CLAUDE.md §15, net debt must carry its basis label at every appearance.

| Metric | Value (AED Mn) | Basis | Source |
|---|---:|---|---|
| Total debt (incl. lease liabilities) | 10,064 | Gross; includes revolving credit AED 711M, term loans AED 2,150M, senior bonds AED 6,425M, lease liabilities AED 778M | Capital IQ Capital Structure Summary tab, Q1-2026 |
| Cash & equivalents (unrestricted) | 12,180 | Unrestricted operating cash only | Capital IQ Q1-2026 Balance Sheet |
| Short-term investments | 22,503 | Bank deposits / liquid instruments, corporate treasury | Capital IQ Q1-2026 Balance Sheet |
| Trading asset securities | 351 | Included in CIQ Total Cash & ST Investments | Capital IQ Q1-2026 Balance Sheet |
| Restricted cash (project escrow) | 43,338 | NOT a liquidity resource; buyer funds ring-fenced by regulation | Capital IQ Q1-2026 Balance Sheet |
| **Net debt (strict basis: total debt − cash & equiv)** | **−2,115 (net cash)** | **§15 strict** | **Computed: 10,064 − 12,180 = −2,115** |
| **Net debt (broad basis: total debt − cash − STI − trading sec)** | **−24,969 (net cash)** | **§15 broad** | **Computed: 10,064 − 35,034 = −24,970 (rounds to CIQ stated −24,969)** |
| Total Debt / LTM EBITDA (CIQ) | 0.40x | Gross leverage | 10,064 / 25,201 (LTM EBITDA, earnings/01_historical-financials.md) |
| Net Debt (strict) / LTM EBITDA | −0.08x (net cash) | §15 strict | −2,115 / 25,201 |
| Net Cash (broad) / LTM EBITDA | 0.99x | §15 broad; net cash is 0.99x EBITDA | 24,969 / 25,201 |

**Net debt basis label rule (§15).** Every figure above is labelled. The strict basis (debt − cash only) gives net cash of AED 2,115M. The broad basis (debt − cash − STI − trading securities) gives net cash of AED 24,969M. The company's own "Net Cash" of AED 61,655M is a gross-liquidity figure including AED 43Bn of project escrow that is not freely available — it is not shown here as it is incomparable to both strict and broad bases and must not be presented as bare "net cash" without qualification.

**Debt maturity note.** Of total debt AED 10,064M: current portion AED 1,996M (due within 12 months of Mar-31-2026); long-term portion AED 8,068M. Senior bonds AED 6,425M are the largest component (63.8% of total). Undrawn revolving credit available: AED 7,342M (unused). [Source: Capital IQ Capital Structure Summary tab, Q1-2026]

---

## 6. Per-Share Reference Values

All computed using 8,838.790 million shares (basic = fully diluted per available data).

| Metric | Per Share (AED) | Source |
|---|---:|---|
| Current price (primary) | 12.20 | Capital IQ Comps + 01_Consensus, Jun-28-2026 |
| Book value per share | 10.16 | Capital IQ Q1-2026 Balance Sheet: Total Common Equity AED 89,784M / 8,838.790M shares = AED 10.157; stated as AED 10.158 in Capital IQ BV/Share row |
| Tangible book value per share | 10.11 | Capital IQ Q1-2026: Tangible Book Value AED 89,341M / 8,838.790M = AED 10.108; Capital IQ states AED 10.108 |
| Net cash (strict basis) per share | 0.24 | AED 2,115M / 8,838.790M shares |
| Net cash (broad basis) per share | 2.82 | AED 24,969M / 8,838.790M shares |
| Equity-method investments per share | 0.85 | AED 7,529M / 8,838.790M shares (informational; not deducted from EV) |

**Price-to-book reference.** At AED 12.20, price-to-book = 12.20 / 10.16 = 1.20x (vs Capital IQ's stated P/BV close of 1.28x for the period ending Jun-19-2026 using the Q4-2025 balance sheet). At AED 12.96, P/BV = 1.28x. The slight difference reflects the Q1-2026 vs Q4-2025 balance sheet used for book value.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

### Anchor Block (copy-forward)

- **Price:** AED 12.20 (primary anchor, pool-verified; Jun-28-2026 close, two independent CIQ sources) / AED 12.96 (secondary context, single CIQ export, different session)
- **Price-state: pool-verified** — two independent Capital IQ pool sources confirm AED 12.20 for the Jun-28-2026 session; the EstimatesReport AED 12.96 is also pool-sourced from a different session. The canonical anchor is AED 12.20. The price-state tag is `pool-verified`; agents `05`/`07`/`99` do NOT apply the no-price Score-Cap row. Margin of safety, downside-to-bear, observed up/down, and valuation attractiveness are all assessable.
- **Currency:** AED (UAE Dirham). Reporting standard: IFRS. AED is pegged to USD at approximately AED 3.6725/USD.
- **FX:** No cross-currency conversion needed for EMAR financial data (AED throughout). USD 3.32 (comps) converts to AED 12.20 at the peg.
- **Shares (market cap):** 8,838.790 million (basic shares outstanding as of Q1-2026 / Mar-31-2026; per MODULE_RULES §2 rule 1, use most recent outstanding for market cap). Source: Capital IQ Q1-2026 Balance Sheet.
- **Shares (per-share fair value):** 8,838.790 million (basic = estimated fully diluted; no dilution instruments identified in the data pool — labelled limitation, immaterial gap expected for a UAE PJSC). Source: same.
- **Market cap:** AED 107,833 million (AED 107.8 billion) at AED 12.20. At secondary price AED 12.96: AED 114,551 million.
- **Net debt (§15 strict basis: debt − cash & equivalents):** −AED 2,115 million (net cash). Source: Capital IQ Capital Structure Summary tab + Balance Sheet, Q1-2026.
- **Net debt (§15 broad basis: debt − cash − STI − trading sec):** −AED 24,969 million (net cash). Source: same; consistent with CIQ stated Net Debt.
- **Canonical net debt for downstream EV bridges:** §15 broad basis (−AED 24,969M) — this is the CIQ standard and aligns with the peer-set comps. Any downstream agent using a different basis must state it explicitly; silent substitution is not allowed.
- **EV (canonical, broad/CIQ standard basis):** AED 96,672 million at AED 12.20. At AED 12.96: AED 103,390 million.
- **EV (strict, cash only):** AED 119,526 million at AED 12.20 (for reference only; the broad basis is canonical).
- **Minority interest:** AED 13,808 million (included in EV bridge above). Source: Capital IQ Q1-2026 Balance Sheet.
- **Preferred equity:** None.
- **Equity-method investments:** AED 7,529 million (not deducted from EV; available for SOTP agent to treat as a separate asset line).
- **Restricted cash (project escrow):** AED 43,338 million — completely excluded from all cash netting; not available for general corporate use.
- **Balance sheet date:** Q1-2026 (Mar-31-2026) — most recent in pool. Price date: Jun-28-2026. The balance sheet is approximately 3 months older than the price; no material capital events are flagged in this window.

**Key caveats:**
1. Price band AED 12.20–12.96 (6.2% spread) across two pool exports from the same reporting window. AED 12.20 is the canonical anchor (two-source corroboration, explicitly dated). The spread is shown, not hidden.
2. Dilution data (options, RSUs, long-term incentives) is not broken out in the Capital IQ exports ("Dilution: Basic" throughout). Basic count used as best available proxy for fully diluted. The gap is expected to be immaterial for a UAE PJSC with no disclosed equity-settled compensation programmes, but it is unconfirmed.
3. The Q1-2026 balance sheet is a preliminary (unaudited) filing. The FY-2025 audited statutory annual report (IFRS) is not in the data pool as of the analysis date; the most recent audited balance sheet is FY-2024 (Dec-31-2024). Capital structure figures are therefore from an unaudited Q1-2026 interim filing.
4. Restricted cash (AED 43,338M) is buyer-escrowed and not freely available. The company's own "Net Cash" of AED 61,655M (FY-2025) includes this escrow — that figure must not be used in EV multiples or leverage comparisons.
5. Equity-method investments (AED 7,529M) are in long-term investments on the balance sheet. SOTP agent should treat these separately to avoid double-counting.

No valuation judgment is made here. Downstream agents take the Anchor Block numbers verbatim.
