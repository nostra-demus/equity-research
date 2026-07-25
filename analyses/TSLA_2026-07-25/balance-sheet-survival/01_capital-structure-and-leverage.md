# Capital Structure & Leverage — TSLA

**Reporting currency:** US Dollar (USD), figures in millions unless stated otherwise. **Reporting standard:** US GAAP. **Period:** balance-sheet figures as of Jun-30-2026 (latest, per Q2 FY26 10-Q filed Jul-23-2026), with Dec-31-2025 (FY2025, audited) shown for comparison [Form 10-Q, Jul-23-2026, Note 8 (Debt) and Consolidated Balance Sheets]. No `ciq_facts.json` sidecar exists for this run; all Capital IQ (CIQ) figures below are read directly from the vendor workbook exports in `_pool_extracts/` and cited as such — never mislabeled as filing figures (CLAUDE.md §5).

**Basis note carried through this report (CLAUDE.md §15 / MODULE_RULES §Calculation Standards #2–3):** Tesla's Note 8 debt table (interest-bearing debt + finance leases) excludes operating lease liabilities, consistent with US GAAP (operating leases are not "debt" on the face of the balance sheet). Capital IQ's own "Total Debt" field, and `earnings/01_historical-financials.md`'s existing net-debt series, both use a **lease-inclusive** definition that adds operating lease liabilities back in. Both views are shown below; §4 and §7 state explicitly which is canonical.

---

## 1. Debt Stack

Debt Stack basis: Note 8 (Debt), interest-bearing debt + finance leases only (operating leases excluded here and shown separately in §2, per US GAAP treatment). All amounts are **net carrying value** as of June 30, 2026 unless noted; unpaid principal shown in parentheses where it differs.

| Instrument | Amount ($M) | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| RCF Credit Agreement (revolver, drawn) | $0 drawn / $5,000 committed | Tesla, Inc. (recourse — general assets) | No (unsecured) | Senior | None disclosed | Jan-2028 | Floating (SOFR-based benchmark; rate n/a, undrawn) | [Q2 FY26 10-Q, Note 8]; [CIQ Financials_Annual, Capital Structure Details tab] |
| Solar Bonds / Other recourse | $2 | Tesla, Inc. (recourse) | No (unsecured, per CIQ FY2025 read) | Senior | None disclosed | Mar-2030 – Jan-2031 | Fixed, 5.45%–5.75% | [Q2 FY26 10-Q, Note 8]; [CIQ Capital Structure Details tab, FY2025 "Solar Bonds" row] |
| Automotive Asset-Backed Notes | $2,366 ($2,366 unpaid principal: $1,240 current + $1,121 LT) | Subsidiary SPE (non-recourse to Tesla, Inc.) | Yes | Senior | Financing receivables / leased-vehicle collateral | Jun-2027 – Jun-2035 | Fixed, 2.82%–5.82% | [Q2 FY26 10-Q, Note 8] |
| China Working Capital Facility | $5,888 (fully drawn; $0 unused as of Jun-30-2026, vs $1,429 unused at Dec-31-2025) | Subsidiary (Tesla China, non-recourse) | No (per CIQ FY2025 read) | Senior | Not disclosed | Sep-2026 – Mar-2027 | Floating, 2.01%–2.11% ("New Benchmark"); repayment currency CNY | [Q2 FY26 10-Q, Note 8]; [CIQ Capital Structure Details tab] |
| Energy Asset-Backed Notes | $708 | Subsidiary SPE (non-recourse; SPE "wholly owned by us and consolidated," no recourse to Tesla's other assets) | Yes | Senior | Energy-storage financing receivables | Jun-2050 – May-2052 | Fixed, 5.08%–6.35% | [Q2 FY26 10-Q, Note 8, incl. SPE recourse language] |
| Cash Equity Debt | $116 | Subsidiary (non-recourse) | Yes | Senior | Solar/cash-equity project assets | Jul-2034 | Fixed, 5.25% | [Q2 FY26 10-Q, Note 8] |
| Finance leases | $281 ($78 current + $203 LT) | Tesla, Inc. and subsidiaries | Yes | Senior | Leased equipment/assets | Various (no single date disclosed) | Fixed, ~4.70% | [Q2 FY26 10-Q, Note 8]; [CIQ Capital Structure Details tab, "Finance Lease" row] |
| **Total gross debt (debt + finance leases, narrow/GAAP basis)** | **$9,342** ($1,418 current + $7,924 LT) | — | Mixed (see rows) | Mixed | Mixed | Various through 2052 | Mixed | [Q2 FY26 10-Q, Consolidated Balance Sheets: "Current portion of debt and finance leases" $1,418 + "Debt and finance leases, net of current portion" $7,924] |

Ties out: the total above reconciles exactly to the two balance-sheet lines cited (no gap). Unpaid principal balance (before discounts/issuance-cost adjustments) totals $9,080M for debt alone [Q2 FY26 10-Q, Note 8]. As of June 30, 2026, "we were in material compliance with all financial debt covenants" — a binary compliance statement with no threshold or covenant-EBITDA definition disclosed [Q2 FY26 10-Q, Note 8] (headroom is not quantifiable from this pool — see `04_coverage-and-covenants`).

**Recourse vs. non-recourse split (structural priority):** Total recourse debt (Tesla, Inc.'s general assets) is just $2M — effectively immaterial. Non-recourse debt — recourse only to specific subsidiary/SPE assets, with "no recourse to our other assets" for creditors of those SPEs — totals $9,078M in unpaid principal, i.e. ~99.98% of Tesla's on-balance-sheet debt (ex. finance leases and the undrawn RCF) [Q2 FY26 10-Q, Note 8]. This means Tesla, Inc.'s own general-corporate-credit exposure to funded debt is close to zero; nearly all of it sits in ring-fenced financing vehicles (auto/energy ABS SPEs) or an offshore working-capital facility (China).

**Undrawn committed liquidity:** $5,000M unused committed under the RCF Credit Agreement as of Jun-30-2026 (down from $6,429M total unused committed at Dec-31-2025, which included $1,429M of then-unused China facility capacity, since fully drawn) [Q2 FY26 10-Q, Note 8; MD&A]. A separate $1,500M **uncommitted** Warehouse Agreement (entered Q1 2026, secured by financing receivables/leased-vehicle interests, $0 drawn as of Jun-30-2026) exists outside Note 8's debt table and is NOT committed liquidity [Q2 FY26 10-Q, "Warehouse Agreement"].

---

## 2. Other Debt-Like Obligations

| Obligation | Amount ($M) | Treatment | Source |
|---|---:|---|---|
| Operating leases | $6,738 total ($1,022 current + $5,716 LT) as of Jun-30-2026, up from $6,343 ($954 + $5,389) at Dec-31-2025; contractual rate 5.00% per CIQ | US GAAP (ASC 842): recognized as a right-of-use asset ($6,386M) and lease liability, kept OFF the "debt" line on the face of the balance sheet and excluded from Note 8's debt table. Capital IQ's own "Total Debt" and "Total Lease Liabilities" fields DO fold this in (treated as "Capital Lease" type, "Senior," "Secured: Yes" in the CIQ schema) — a lease-inclusive convention, not a GAAP reclassification. Material: at $6,738M this is ~42% the size of the narrow $9,342M debt-and-finance-lease figure it would sit alongside if added in | [Q2 FY26 10-Q, Consolidated Balance Sheets: "Operating lease liabilities, current portion" $1,022M (in Note 6/Accrued liabilities) and "Operating lease liabilities" $5,716M (Note 7/Other Long-Term Liabilities)]; [CIQ Financials_Annual, Capital Structure Details tab, "Operating Lease" row] |
| Pension / OPEB underfunding | Not disclosed / not material | No defined-benefit pension or OPEB note found in the 10-Q; CIQ's "Pension OPEB" tab is blank across all periods, consistent with no material plan | [Q2 FY26 10-Q, full-text search]; [CIQ Financials_Annual.xls, Pension-OPEB tab — blank] |
| Preferred equity | $0 | 100 million shares of $0.001 par-value preferred stock authorized; none issued and outstanding | [Q2 FY26 10-Q, Consolidated Balance Sheets, "Preferred stock ... no shares issued and outstanding"] |

---

## 3. Cash & Liquid Assets

| Item | Amount ($M) | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | $15,219 (Jun-30-2026); $16,513 (Dec-31-2025) | No (this line already excludes restricted cash — see below) | [Q2 FY26 10-Q, Consolidated Balance Sheets] |
| Short-term investments | $28,305 (Jun-30-2026); $27,546 (Dec-31-2025) | $286M of the $28,305M is "held and restricted for our insurance business" (Jun-30-2026; $254M at Dec-31-2025) — flagged, not netted out below given its small size (~1.0% of the ST-investments balance) | [Q2 FY26 10-Q, Consolidated Balance Sheets; Note 5 disclosure on insurance-restricted balances] |
| Restricted / trapped cash (flag) | $1,206 total ($496M in prepaid expenses/other current assets + $710M in other non-current assets), as of Jun-30-2026 ($389M + $714M = $1,103M at Dec-31-2025) | Yes — explicitly disclosed as restricted, held in separate balance-sheet line items, and already EXCLUDED from the $15,219M "cash and cash equivalents" headline figure (not silently netted in) | [Q2 FY26 10-Q, "Restricted Cash" note, reconciliation table] |

Foreign-currency cash: $3.80 billion of the cash/investments balance (USD-equivalent) is held in foreign currencies, primarily euros and Chinese yuan [Q2 FY26 10-Q, MD&A Liquidity section] — a currency-translation exposure, not a restriction, but relevant to how "usable" onshore-USD liquidity reads; not quantified further in this pool.

---

## 4. Gross & Net Debt

Two gross-debt definitions are shown because operating leases are material (§2). **Narrow** = Note 8 debt + finance leases (GAAP "debt" line). **Broad (lease-inclusive)** = narrow + operating lease liabilities, matching Capital IQ's own "Total Debt" field and the figure already used in `earnings/01_historical-financials.md`.

| Metric | Narrow (debt + finance leases) | Broad (+ operating leases, CIQ convention) | Source |
|---|---:|---:|---|
| Gross debt | $9,342 | $16,080 | [Q2 FY26 10-Q, Note 8 + balance sheet]; [CIQ Financials_Annual, Capital Structure Summary tab, "Total Debt," Jun-30-2026 column] |
| − Cash & equivalents | $15,219 | $15,219 | [Q2 FY26 10-Q, balance sheet] |
| **Net debt (strict, §15)** | **$(5,877)** → net CASH of $5,877 | **$861** → net DEBT of $861 | Computed; broad figure ties exactly to `earnings/01_historical-financials.md` §2 ("Total Debt $16,080M − Cash & Equivalents $15,219M = $861M net debt (strict)") |
| − Liquid short-term investments | $28,305 | $28,305 | [Q2 FY26 10-Q, balance sheet] |
| **Net debt (broad, incl. investments)** | **$(34,182)** → net CASH of $34,182 | **$(27,444)** → net CASH of $27,444 | Computed; broad-basis/broad-debt figure ties exactly to `earnings/01_historical-financials.md` and to CIQ's own "Net Debt" field (-27,444, Jun-30-2026 column, Capital Structure Summary tab) |

**Which figure is canonical:** see §7. Short version — the module designates the **broad-debt (lease-inclusive), strict-cash (§15) net debt of $861M (net debt, not net cash)** as canonical, because (a) it is the more conservative reading where two legitimate conventions disagree (CLAUDE.md §4's conservative-default rule), (b) Tesla's own vendor data (CIQ) and `earnings/01_historical-financials.md` already use this convention, so this avoids a cross-module contradiction on a load-bearing number, and (c) operating leases are large, senior, and effectively fixed financial commitments (Supercharger network, retail/office/factory space) even though US GAAP keeps them off the "debt" line. The narrow, GAAP-only figures are shown alongside for full transparency, since MODULE_RULES.md explicitly requires showing both views where leases are material.

---

## 5. Leverage Ratios

EBITDA bases: **Reported (GAAP) EBITDA** = Operating Income + D&A, TTM ended Jun-30-2026 = $10,849M [`earnings/01_historical-financials.md`, §2]. **Adjusted EBITDA (non-GAAP, company-defined)** = net income before interest, taxes, D&A, stock-based compensation, digital-assets gains/losses and the SpaceX equity-investment unrealized gain, TTM ended Jun-30-2026 = $15,322M (sum of Q3'25 $4,227M + Q4'25 $4,154M + Q1'26 $3,668M + Q2'26 $3,273M) [TSLA-Q2-2026-Update.pdf, p.24, "Adjusted EBITDA – TTM (non-GAAP)" row].

| Ratio | On Reported (GAAP) EBITDA ($10,849M TTM) | On Adjusted EBITDA ($15,322M TTM) | Source |
|---|---:|---:|---|
| Gross debt / EBITDA — narrow ($9,342M) | 0.86x | 0.61x | Computed |
| Gross debt / EBITDA — broad, lease-incl. ($16,080M) | 1.48x | 1.05x | Computed. (CIQ's own "Total Debt/EBITDA" field shows 1.635x LTM Jun-30-2026 [CIQ Capital Structure Summary tab] — the ~11% gap versus the 1.48x above is because CIQ's own denominator EBITDA differs slightly from the company-figure-built $10,849M used here; see the Q3/Q4-2025 operating-income reconciliation flag in `earnings/01_historical-financials.md` for the source of that gap.) |
| Net debt / EBITDA — canonical (broad debt, strict cash: net debt $861M) | 0.08x | 0.06x | Computed |
| Net debt / EBITDA — broad debt, broad cash (net cash $27,444M) | Not meaningful (net cash) | Not meaningful (net cash) | Computed |
| Net debt / EBITDA — narrow debt, strict cash (net cash $5,877M) | Not meaningful (net cash) | Not meaningful (net cash) | Computed |
| Debt / capital — narrow | 9.7% ($9,342M / $96,200M) | (n/a) | Computed; capital = gross debt + total stockholders' equity $86,858M [Q2 FY26 10-Q, balance sheet] |
| Debt / capital — broad | 15.5% ($16,080M / $103,599M) | (n/a) | [CIQ Capital Structure Summary tab, "Total Debt" % of "Total Capital," Jun-30-2026 column: 15.52%] |
| Debt / equity — narrow | 10.8% ($9,342M / $86,858M) | (n/a) | Computed |
| Debt / equity — broad | 18.5% ($16,080M / $86,858M) | (n/a) | Computed |

**Cyclicality overlay (required — automotive flagged "High" consumer-cycle exposure):** `business-model/10_external-dependency.md` flags automotive (~86.5% of FY2025 revenue) as "High" consumer-cycle exposure [business-model/10_external-dependency.md, §Consumer cycle row]. Per MODULE_RULES.md, leverage is also shown on a normalized/mid-cycle EBITDA:

| Basis | GAAP EBITDA used | Gross debt (broad) / EBITDA | Net debt (canonical, $861M) / EBITDA | Label |
|---|---:|---:|---:|---|
| Latest TTM (Jun-30-2026) | $10,849M | 1.48x | 0.08x | Latest |
| 5-year average, FY2021–FY2025 (mid-cycle/normalised) | $12,751M (= average of $9,434M, $17,235M, $13,558M, $13,027M, $10,503M) [`earnings/01_historical-financials.md`, §1 Annual Financial Table] | 1.26x | 0.07x | Mid-cycle / normalised |

**Note on direction:** Tesla's FY2022 EBITDA ($17,235M) was the actual cyclical peak in this five-year window, not the latest period. The latest TTM EBITDA ($10,849M) sits *below* the 5-year average, not above it — so unlike the usual warning that a "latest/peak" EBITDA flatters leverage, here leverage computed on the latest TTM figure is already the *more conservative* (higher) of the two reads. Both remain low in absolute terms (under 1.5x gross, near-zero net) given the debt stack's small size relative to EBITDA either way.

---

## 6. Leverage Trend

Basis: net debt (canonical — broad/lease-inclusive gross debt, strict/cash-only netting, §15) and reported GAAP EBITDA, reconciled to `earnings/01_historical-financials.md`.

| Metric | FY2023 | FY2024 | FY2025 | Latest (Jun-30-2026, TTM EBITDA) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, broad-debt basis) | $(6,825)M net cash | $(2,516)M net cash | $(1,794)M net cash | $861M net **debt** | Rising (net cash cushion shrinking, flipped to net debt) |
| Net debt / EBITDA | (0.50x) | (0.19x) | (0.17x) | 0.08x | Rising |

Memo — broad-cash basis (netting in short-term investments) for contrast: net cash of $19,521M (FY2023) → $22,940M (FY2024) → $29,340M (FY2025) → $27,444M (latest) — still deeply net cash on this view, though it too has narrowed slightly from the FY2025 peak [`earnings/01_historical-financials.md`, §1 basis-labels paragraph; CIQ Capital Structure Summary tab].

Leverage is rising on the strict (cash-only) basis, driven by three visible factors: (1) the China Working Capital Facility going from $2,740M drawn (Dec-31-2024) to $4,288M (Dec-31-2025) to fully drawn at $5,888M (Jun-30-2026), funding Chinese-subsidiary working capital [Q2 FY26 10-Q, Note 8; CIQ Capital Structure Details tab]; (2) operating lease liabilities growing from $6,343M (Dec-31-2025) to $6,738M (Jun-30-2026) as the Supercharger/retail/office footprint expands; and (3) cash & equivalents alone declining slightly ($16,513M → $15,219M) even as a capex ramp (Q2 2026 capex $5,789M, +142% QoQ per `earnings/01_historical-financials.md`) was partly financed rather than fully self-funded — the 10-Q's financing-activities line shows a swing to a $1.21B net inflow (from a $554M outflow a year earlier), "primarily due to a $1.63 billion increase in proceeds from issuances of debt" [Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources]. None of this is large in absolute terms — Tesla remains net cash on every basis that either excludes leases or nets in short-term investments — but the direction is unambiguous.

---

## 6A. HoldCo / OpCo & Structural Subordination

Not applicable in the classic holding-company sense — Tesla, Inc. is the single consolidated registrant and no material HoldCo-level debt or structural-subordination disclosure exists in this pool [Solvency Data Triage, §3]. However, a related structural point is material and worth flagging for downstream agents:

| Item | Evidence | Why It Matters |
|---|---|---|
| Recourse vs. non-recourse split within Tesla's own debt stack | Just $2M of debt is recourse to Tesla, Inc.'s general assets; ~$9,078M (unpaid principal, ex. finance leases/undrawn RCF) is non-recourse — issued by subsidiary SPEs (Automotive/Energy Asset-Backed Notes) or an offshore subsidiary (China Working Capital Facility), each of which explicitly has "no recourse to our other assets" for its creditors [Q2 FY26 10-Q, Note 8] | Tesla, Inc.'s parent-level exposure to funded debt is close to zero; the debt is ring-fenced against specific receivables/collateral pools, which is a source of resilience for the parent but means those asset pools are not available to satisfy other creditors |
| Upstreaming constraints | Not disclosed in the data pool for the China Working Capital Facility or the SPE structures | Cannot assess whether cash generated offshore/in the SPEs can be freely upstreamed; flagged as a gap, not assumed benign |
| Material restricted / trapped cash | $1,206M restricted cash disclosed separately (§3), already excluded from the headline cash figure | Net debt figures above are not overstated by this — restricted cash was never included in the $15,219M cash balance netted out above |

---

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Gross debt:** $16,080M (broad, lease-inclusive — canonical). Memo: $9,342M on a narrow, GAAP-only debt-and-finance-lease basis. [Q2 FY26 10-Q, Note 8 + balance sheet; CIQ Capital Structure Summary tab]
- **Net debt:** **$861M net debt (canonical basis: broad/lease-inclusive gross debt minus cash & equivalents only — the §15 strict basis).** Reason for using the broad debt definition as canonical: it is the more conservative reading (CLAUDE.md §4) and matches the convention already established in `earnings/01_historical-financials.md` and Capital IQ's own fields, avoiding a cross-module contradiction. Also shown, broad-cash basis (netting in $28,305M of short-term investments): **net cash of $27,444M** — label this "broad" whenever quoted; it is NOT the canonical figure. Memo (narrow debt, strict cash): net cash of $5,877M.
- **Cash & liquid investments:** Cash & equivalents $15,219M + short-term investments $28,305M = $43,524M combined (of which $286M of the investments is restricted for the insurance business). Restricted cash of $1,206M is separate and already excluded from all figures above.
- **EBITDA base used:** Reported (GAAP) EBITDA, TTM ended Jun-30-2026 = $10,849M (Operating Income + D&A), the **latest** period figure, which in Tesla's case sits *below* its own 5-year average (mid-cycle/normalised GAAP EBITDA = $12,751M, FY2021–FY2025 average) — i.e., latest is not the cyclical peak here; FY2022 ($17,235M) was. Adjusted (non-GAAP) EBITDA, TTM = $15,322M, is also shown throughout for the reported-vs-adjusted comparison required by CLAUDE.md §15.
- **Net debt / EBITDA (canonical net debt of $861M):** 0.08x on reported GAAP EBITDA ($10,849M); 0.06x on adjusted EBITDA ($15,322M); 0.07x on mid-cycle/normalised GAAP EBITDA ($12,751M). All three reads are near-zero.
- **Reporting currency:** USD.

**Net-cash framing (CLAUDE.md §24, Filter 3; MODULE_RULES.md Core Principle 8):** Despite the canonical net-debt figure just tipping positive ($861M) on the strictest cash-only, lease-inclusive basis, Tesla remains overwhelmingly net cash on every other defensible reading — $5,877M net cash excluding leases, and $27,444M–$34,182M net cash once short-term investments are netted in. This is a strategic-flexibility asset, not a "lazy balance sheet": it funds Tesla's stated intent to "manage the business such that we maintain a strong balance sheet and sufficient liquidity" while ramping AI/Optimus/semiconductor capex [Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources], and it removes near-term refinancing dependence. This module does not editorialize that Tesla is "under-levered" or should add debt to lower its cost of capital — that framing is rejected per CLAUDE.md §24.

**Caveats propagated downstream:**
- Covenant thresholds and covenant-EBITDA definitions are not disclosed anywhere in this pool — only a binary "in material compliance" statement exists. `04_coverage-and-covenants` should treat headroom as "Not assessable" numerically.
- The 5-year mid-cycle/normalised EBITDA of $12,751M is a straightforward arithmetic average of the company's own reported figures — a computed reference point, not a company-disclosed "mid-cycle" estimate; treat as directional.
- Adjusted EBITDA (non-GAAP) figures above are the company's own non-GAAP measure (excludes SBC, digital-assets gains/losses, SpaceX equity-investment unrealized gain, certain tax items) — always shown alongside the GAAP figure per CLAUDE.md §15, never used alone.
- The credit rating on file (S&P Global Ratings, Issuer Credit Rating BBB, Stable) is a single agency with a rating action dated Oct-06-2022 — ~45 months old as of this report's date; only the CIQ data-feed pull (2026-07-24) is current, not the rating action itself [`Tesla Inc NasdaqGS TSLA Public Company Profile.rtf`, S&P Global Ratings block]. Peer benchmarking (CIQ Credit Health Panel, 31 automotive peers, LTM Jun-30-2026) scores Tesla "Top" overall, "Top" on Solvency, "Top" on Liquidity, and "Above Average" on Operational among the peer set [`Tesla Inc NasdaqGS TSLA Credit Health Panel.xls`, Summary tab].
