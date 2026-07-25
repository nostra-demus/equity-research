# Off-Balance-Sheet & Contingencies — TSLA

**Reporting currency:** US Dollar (USD), figures in millions unless stated otherwise. **Reporting standard:** US GAAP. **Period:** Jun-30-2026 (Q2 FY26 10-Q, filed Jul-23-2026), with Dec-31-2025 (FY2025, audited, carried forward) shown for comparison. No `ciq_facts.json` sidecar exists for this run. This module's `01_capital-structure-and-leverage.md` designates **net debt of $861M** (broad/lease-inclusive gross debt, strict/cash-only netting) as canonical — referenced below where relevant.

**Data-pool gap flagged up front:** the full FY2025 10-K (with its complete Notes to Financial Statements, including any annual purchase-obligation / capital-commitment table) is NOT in this data pool — only the FY2025 10-K/A (Part III only: governance, compensation, ownership) is present. The Q2 FY26 10-Q's own "Commitments and Contingencies" note (Note 11) does not carry a purchase-obligation or capital-commitment table this quarter (none found on a full-text search). Purchase/take-or-pay commitments and any letters-of-credit/surety-bond detail are therefore **not quantifiable from this pool** and are recorded as a gap below, not filled in.

---

## 1. Off-Balance-Sheet / Debt-Like Obligations

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debtstack? | Source |
|---|---:|---:|---|---|
| Operating leases | $6,738M total ($1,022M current + $5,716M LT), Jun-30-2026 (up from $6,343M, Dec-31-2025) | Same — undiscounted future minimum payments not separately re-disclosed this quarter; $6,738M is the discounted lease-liability balance | **Yes — flagged, not double-counted here.** `01`'s "Other Debt-Like Obligations" table (§2) already carries this figure and its broad/lease-inclusive gross-debt figure ($16,080M canonical) already includes it. Shown here only for completeness of the off-balance-sheet picture; do not re-add it to any total in this report | [Q2 FY26 10-Q, Consolidated Balance Sheets: "Operating lease liabilities, current portion" $1,022M; "Operating lease liabilities" $5,716M] |
| Pension / OPEB underfunding | Not material / not disclosed | Not material / not disclosed | N/A — `01` already confirms no defined-benefit plan | [Q2 FY26 10-Q, full-text search — no pension/OPEB note]; [CIQ Financials_Annual.xls, Pension-OPEB tab — blank] |
| Securitization / factoring (Automotive & Energy Asset-Backed Notes, China Working Capital Facility) | $9,078M unpaid principal (non-recourse to Tesla, Inc.'s general assets) | Same — these are on-balance-sheet, fully recognized debt instruments, not contingent exposures | **Yes — already in `01`'s debt stack** (narrow $9,342M figure includes these instruments; see `01` §1 for the full instrument table). Listed here only to confirm no additional off-balance-sheet securitization exists beyond what `01` already captures | [Q2 FY26 10-Q, Note 8 (Debt)] |
| Uncommitted Warehouse Agreement | $0 drawn as of Jun-30-2026 | Up to $1.50 billion (undrawn commitment), secured by financing receivables/leased-vehicle interests; draw window expires Mar-2027 | No — sits outside Note 8's debt table and outside `01`'s committed-liquidity figure (it is explicitly uncommitted, not usable liquidity per `01`) | [Q2 FY26 10-Q, "Warehouse Agreement" disclosure] |
| Purchase / take-or-pay commitments | Not disclosed in this pool | Not disclosed in this pool | N/A — genuine data gap, not filled in | See gap note above |

State the reporting currency: USD.

---

## 2. Guarantees & Letters of Credit

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Vehicle resale-value guarantees to commercial banking partners | "Immaterial" — not separately quantified in the note (recorded within "other liabilities," no dollar figure given) | $4.07 billion (Jun-30-2026), up from $3.45 billion (Dec-31-2025) | Commercial banking partners in vehicle-leasing programs — Tesla originates the lease, sells it and the vehicle to the bank, and guarantees a capped resale value if the bank cannot sell the vehicle at or above its contractual/determined residual value at lease end | [Q2 FY26 10-Q, Note (Guarantees), full text: "Our maximum exposure on the guarantees we provide ... was $4.07 billion and $3.45 billion as of June 30, 2026 and December 31, 2025, respectively"] |
| Standby letters of credit | Not disclosed in this pool | Not disclosed in this pool | Not disclosed | Not disclosed in the data pool |
| Financial guarantees to/for related parties (SpaceX, The Boring Company, Redwood Materials) | None disclosed — the SpaceX relationship in this pool is a $2.00 billion equity-method investment (approved Mar-2026, formerly structured as a preferred investment in xAI) and ordinary-course Megapack sales ($405M H1-2026 revenue / $307M cost of revenue), not a guarantee of SpaceX debt or obligations | N/A | N/A | [Q2 FY26 10-Q, Note 13 (Related Party Transactions)] |
| Performance / surety bonds | Not disclosed in this pool | Not disclosed in this pool | Not disclosed | Not disclosed in the data pool |

---

## 3. Litigation & Tax Contingencies

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) | Source |
|---|---:|---:|---|---|
| Benavides v. Tesla, Inc. (2019 Autopilot fatality — product liability) | "Immaterial accrual" (company states it disagrees with the verdict) | $329M combined ($129M compensatory + $200M punitive; jury found the driver 67% at fault, Tesla 33%) | **Active.** Post-trial motions denied Feb-19-2026; Tesla filed its opening appellate brief with the 11th Circuit Jul-2-2026 | [Q2 FY26 10-Q, Note 11 (Commitments and Contingencies), "Benavides v. Tesla, Inc."] |
| CRD (California Civil Rights Dept.) systemic race-discrimination/hostile-work-environment suit | Not quantified — "unable to reasonably estimate the possible loss or range of loss" | Not quantified; complaint seeks monetary damages and injunctive relief | **Active.** First trial phase set Sep-21-2026 | [Q2 FY26 10-Q, Note 11, "Litigation and Investigations Relating to Alleged Discrimination and Harassment"] |
| EEOC parallel race-harassment/retaliation suit | Not quantified — "unable to reasonably estimate" | Not quantified; seeks monetary and injunctive relief | **Active** — in discovery, no trial date set | [Q2 FY26 10-Q, Note 11] |
| Autopilot/FSD driver-assistance consumer class action (N.D. Cal., consolidated) | Not quantified — "unable to reasonably estimate" | Not quantified; damages and other relief sought on behalf of purchasers/lessees since Jan-1-2016 | **Active.** Class certified for a limited California-consumer subset (Aug-2025); Tesla's 9th Circuit appeal of certification fully briefed, oral argument set Aug-31-2026 | [Q2 FY26 10-Q, Note 11, "Other Litigation Related to Our Products and Services"] |
| Securities-fraud class action re: Autopilot/FSD/Robotaxi representations (W.D. Tex.) | Not quantified — no accrual disclosed | Not quantified; seeks monetary damages on behalf of purchasers Apr-19-2023 to Jun-22-2025 | **Active.** Amended complaint filed Feb-17-2026; Tesla's motion to dismiss filed Apr-20-2026; plaintiffs responded Jun-22-2026 | [Q2 FY26 10-Q, Note 11] |
| Delaware derivative suits (breach of fiduciary duty re: CEO/X Corp./xAI dealings) | Not quantified — case dismissed | Not quantified — unspecified damages sought | **Dormant at trial level, active on appeal.** Tesla's motions to dismiss granted Apr-13-2026; plaintiffs appealed to the Delaware Supreme Court in May-2026 | [Q2 FY26 10-Q, Note 11, "Certain Derivative Lawsuits in Delaware"] |
| Tariff refund (IEEPA ruling, Feb-2026) | Not recognized (contingent gain, not a liability) — "we will not recognize any receivable ... until such amounts are realized or realizable" | Not quantified | Active but this is a **contingent asset**, not a contingent liability — noted for completeness only, excluded from the liability totals in §4 | [Q2 FY26 10-Q, Note 11, "Tariffs"] |
| NHTSA / NTSB / SEC / DOJ and other regulatory information requests and investigations | No accrual disclosed | Not quantified; company states an enforcement action "exists the possibility of a material adverse impact" | **Active** — ongoing information requests; "no government agency ... has concluded that any wrongdoing occurred" per the company | [Q2 FY26 10-Q, Note 11, "Certain Investigations and Other Matters"] |
| Uncertain tax positions / tax-authority audits | Not disclosed in this pool (this quarter's 10-Q carries no unrecognized-tax-benefit rollforward) | Not disclosed | Not assessable from this pool | Data gap — the full FY2025 10-K (which typically carries this table) is not present |
| Warranty reserve (memo — recognized liability, not a gap between recorded and max) | $8,963M accrued warranty balance, Jun-30-2026 (up from $8,607M at Jan-1-2026; $1,121M provision less $972M costs incurred plus a $207M net revaluation, six months ended Jun-30-2026) | No separate "maximum" disclosed beyond the accrual itself — this is a routine, actuarially-estimated reserve, not an off-balance-sheet contingency | N/A — fully recognized on the balance sheet | [Q2 FY26 10-Q, Note (Warranties), accrued-warranty rollforward table] |

Use the company's own probability language: for every material litigation matter above except Benavides, Tesla states it is "unable to reasonably estimate the possible loss or range of loss" — the company's own probability disclosure stops at "reasonably possible" without a number, never "remote," for the discrimination, consumer, and securities suits. The Delaware derivative suits are the one matter dismissed at the trial level (now dormant there, live only on appeal).

---

## 4. Contingent Exposure Summary

| Metric | Value |
|---|---:|
| Total recognized contingent liabilities (resale-value guarantee + Benavides accrual) | "Immaterial" for both — not separately quantified by the company; treated as not meaningfully greater than $0 for this ratio |
| Total quantified maximum / gross exposure (resale-value guarantee $4.07B + Benavides $329M) | $4.40 billion |
| Max exposure ÷ recognized | Not computable precisely — the recognized-side inputs are disclosed only as "immaterial," not as a dollar figure; the ratio is directionally very large but this reflects standard ASC 460 guarantee accounting (expected-loss recording vs. contractual cap), not an escalating exposure |
| Max exposure ÷ total equity ($86,858M, per `01` §5) | 5.07% |

Most litigation matters (discrimination/harassment suits, the Autopilot/FSD consumer class action, the securities class action, and the regulatory investigations) carry **no disclosed dollar figure at all** — "unable to reasonably estimate" — so they are excluded from the $4.40B total above; the true aggregate contingent exposure is understated by an unquantified amount, not overstated.

---

## 5. Contingency Read

The largest off-balance-sheet exposure is the $4.07 billion maximum on Tesla's vehicle resale-value guarantees to leasing-bank partners — up 18% from $3.45 billion six months earlier as the leasing book grows — against a recorded liability the company calls only "immaterial"; this is a live, growing, ordinary-course program (not a legacy or distressed exposure), and at 4.7% of the $86,858M equity base it would not threaten solvency even in a downside where EV resale values fell meaningfully. The next-largest, most concrete exposure is the $329 million Benavides jury verdict (on appeal, immaterial accrual booked), a rounding error against Tesla's balance sheet. The bigger unresolved risk is qualitative, not quantitative: five active, unquantified litigation and regulatory matters (CRD/EEOC discrimination suits, the Autopilot/FSD consumer class action, the securities class action, and ongoing NHTSA/SEC/DOJ information requests) are all live and each carries the company's own "material adverse impact" caution language with no dollar estimate — undisclosed exposures on these specific matters cannot be ruled out from this pool.

Max exposure ÷ recognized is not computable ($0/"immaterial" denominator), and max exposure ÷ equity is 5.07% — below the module's 3x/15% co-trigger thresholds — so this report does **not** treat the resale-guarantee or litigation exposure as a contingent-liability spike; it is a monitorable, disclosed, and comparatively small exposure relative to Tesla's balance sheet, not a red flag under the module's own test.

**Partial data: the FY2025 10-K's full financial-statement notes (purchase/capital commitments table, letters-of-credit detail, uncertain-tax-position rollforward) are not in this data pool — only the Part III-only FY2025 10-K/A is present. Given Tesla's known-litigious profile (multiple active class actions and regulatory matters with unquantified exposure), undisclosed or unquantified exposures beyond the $4.40B identified here cannot be ruled out; this caps `01`'s solvency-strength score at 75 per MODULE_RULES.md's "off-balance-sheet exposures undisclosed for a known-litigious/levered name" cap, to be applied by `04`/`06`/`99` downstream.**
