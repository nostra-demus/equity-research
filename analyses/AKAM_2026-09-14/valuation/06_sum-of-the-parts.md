# Sum-of-the-Parts — AKAM

Akamai reports under U.S. GAAP in USD and has a 31 December fiscal year. **Effectively single-segment — SOTP collapses to the consolidated read.** The company has one operating and reportable segment, managed as one business; its CODM uses consolidated net income and the company does not accumulate discrete financial information for separate entities. The three solution categories are revenue disclosures, not profit-reporting segments. [Q2 FY2026 Form 10-Q, Note 1, p.10; Note 14 (Segment Information), p.25]

## 1. Segment Inventory

| Segment | Revenue | EBIT (or EBITDA) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Providing cloud services — AKAM's one reportable segment | $2,173.3m, H1 FY2026 | Not separately disclosed | Not disclosed | 100% of the one reportable business¹ | [Q2 FY2026 Form 10-Q, Note 14 (Segment Information), pp.25–26] |

¹This is not a calculated segment-EBIT share: Akamai discloses no separate segment EBIT or EBITDA. It means the sole reportable business contains all reported operations. The $2,173.3m revenue reconciles to the three solution-category revenues: Security $1,194.2m + Delivery and other cloud applications $785.1m + Cloud infrastructure services (CIS) $193.9m = $2,173.3m for H1 FY2026. [Q2 FY2026 Form 10-Q, Note 11 (Revenue from Contracts with Customers), p.23]

Security is the largest solution category by revenue ($604.4m, 55.0% of Q2 FY2026 revenue), followed by Delivery and other cloud applications ($395.9m, 36.0%) and CIS ($99.3m, 9.0%). These are not SOTP components: the company provides neither category costs, EBIT/EBITDA, margins, assets nor capital expenditure. [Q2 FY2026 Form 10-Q, Note 11, p.23; Note 14, pp.25–26]

There is no separate corporate or unallocated segment to capitalize and deduct. The reported one-segment cost stack already includes “other segment items,” which are marketing programmes, professional-service fees, non-income tax expense and other expenses; treating them as an additional corporate deduction would double count them. [Q2 FY2026 Form 10-Q, Note 14, pp.25–26]

## 2. Segment Multiples & Comparables

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| AKAM's one consolidated reportable segment | NTM consolidated EBITDA $1,868.8m, a Capital IQ estimate; not a solution-category metric | Not applied — SOTP collapsed | None used to set a SOTP multiple | N/A | [Capital IQ Estimates Report, Consensus worksheet, NTM EBITDA, data as of 2026-09-14] |

The available peers cannot support one defensible whole-company SOTP multiple. Cloudflare overlaps in security and delivery but its NTM EV/EBITDA is 127.66x; Fortinet is chiefly a security-and-networking vendor at 34.53x; Fastly overlaps in edge delivery/security at 25.08x. Each has a different product mix, capital needs and forward margin profile from Akamai's combined security, delivery and CIS operation. Applying any of them to all of AKAM would be an inference, not a comparable-based SOTP. [CIQ Company Comparable Analysis, Trading Multiples sheet, data as of 2026-09-14; CIQ Company Comparable Analysis, Business Description sheet, data as of 2026-09-14]

For a market-implied sanity check only, AKAM's own observed NTM EV/EBITDA is 10.74x. It is not an applied fair-value multiple: using the company's present trading multiple merely reproduces a market value rather than independently valuing the business. [Capital IQ Estimates Report, Multiples worksheet, NTM TEV/EBITDA, data as of 2026-09-14]

## 3. Segment Valuation

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| One consolidated reportable segment | $1,868.8m NTM EBITDA | Not applied | Not produced — no defensible segment multiple |
| Market-implied check only, not a SOTP valuation | $1,868.8m NTM EBITDA | 10.7396x current AKAM NTM EV/EBITDA (10.74x rounded) | $20,070.2m vendor TEV = $1,868.8m × 10.7396x |
| **Gross enterprise value (sum)** |  |  | **Not produced** |

The market-implied check reconciles, to rounding, to Capital IQ's $20,070.2m total enterprise value. It must not be bridged with the filing-based capital structure below: the vendor TEV nets a different, lease- and investment-inclusive net-debt figure of $4,722.7m, while the canonical equity bridge uses strict net debt of $6,082.6m. Combining those bases would manufacture a spurious SOTP equity value. [CIQ Company Comparable Analysis, Financial Data sheet, data as of 2026-09-14; `ciq_facts.json`, `net_debt_m`, present; Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; valuation/01_price-and-capital-structure.md, Anchor Summary]

## 4. Equity Bridge

| Step | Value |
|---|---:|
| Gross enterprise value | Not produced — SOTP collapsed to the consolidated read |
| − Capitalized unallocated corporate costs | Not separately deductible — costs are within the one reportable segment, not a separate corporate bucket |
| − Net debt | $6,082.6m strict basis; would be deducted once from a valid gross EV |
| − Minority / preferred | $0.0m / $0.0m |
| + Equity-method investments | $0.0m — none separately disclosed |
| − Conglomerate / holdco discount (if any) | None — AKAM is one operating/reportable business, not a holding company |
| **= Equity value** | **Not produced** |
| ÷ Diluted shares | 153.686m, latest disclosed Q2 diluted weighted-average; not used because no SOTP equity value exists |
| **= SOTP value per share** | **Not produced** |
| vs current price | Not assessable for SOTP; current AKAM price is $106.79 at 2026-09-14 |

The strict-basis net debt is $7,562.8m carrying-value debt less $1,480.3m cash and equivalents. This is the canonical downstream bridge; it excludes marketable securities and operating leases, which are reported separately. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; valuation/01_price-and-capital-structure.md, Anchor Summary]

No conglomerate or holdco discount is warranted because there is no separable collection of businesses to discount. This does not create a $0 corporate-cost assumption: it preserves the one-segment cost stack already included in the reported operation.

## 5. SOTP Read

No independent per-share breakup value is produced and this method should not be fed into `07_scenario-and-fair-value` as a weighted valuation method. AKAM's sole reportable segment carries 100% of disclosed business value; Security is the largest revenue category, but whether it carries most value is not proven because the filing does not disclose category profit or capital use. [Q2 FY2026 Form 10-Q, Note 11, p.23; Note 14, pp.25–26]

The core SOTP insight is negative: the evidence does not show a high-multiple component hidden inside a low-multiple consolidated business. A separate category SOTP is not possible — segment EBIT and matching segment comparables are unavailable.
