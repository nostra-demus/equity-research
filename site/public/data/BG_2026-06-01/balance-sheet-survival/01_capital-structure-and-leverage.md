# Capital Structure & Leverage — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency:** US$ millions unless noted. **Fiscal year:** ends December 31. Latest annual = FY2025 10-K (year ended Dec 31, 2025). Latest interim = Q1 2026 10-Q (quarter ended Mar 31, 2026). Net debt = total interest-bearing debt − cash & equivalents (CLAUDE.md standard). EBITDA basis is stated at every use; Bunge does **not** report a GAAP EBITDA line, so GAAP-EBITDA is constructed as Total EBIT + D&A and labeled accordingly.

**One structural break dominates this whole report — flag once:** the all-of-Viterra combination closed July 2, 2025 ($10,617M total consideration: $4,201M cash + 65.6M shares; assumed/refinanced Viterra debt) [FY25 10-K, Note 2]. Total debt jumped from $6,238M (Dec-31-2024) to $14,051M (Dec-31-2025), and GAAP-EBITDA-based net leverage went from ~1.3x to ~5.8x in one year [FY25 10-K, Note 17 / MD&A, line 2906; earnings/01_historical-financials.md, Section 1]. Every leverage figure below is post-Viterra and is not like-for-like with FY2024.

**The central measurement issue (read before the tables):** there are two legitimate, very different leverage readings for this company, and the gap between them is the single most important fact in this report. On GAAP-built EBITDA, net debt / EBITDA is **~5.8x**. On management's RMI-adjusted basis it is **1.6x** (Q1 2026), because management nets ~70% of ~$11.4bn of readily marketable inventory (RMI) against debt and divides by adjusted EBITDA [Q1 2026 call, lines 181–183]. Both are shown. Neither is hidden. Section 5 reconciles them.

---

## 1. Debt Stack

Figures as of **Dec 31, 2025** (FY25 10-K, Note 17) with a Q1 2026 column where the instrument changed. "Entity" reflects that the public notes are issued by **BLFC** (Bunge Limited Finance Corp., a wholly-owned finance subsidiary) and unconditionally guaranteed by the parent, Bunge Global SA — see Section 6A.

| Instrument | Amount (YE2025) | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| **Short-term debt / current portion** | **5,220** | | | | | 2026 | | FY25 10-K, Note 17, line 7247 |
| — Revolving credit facilities (drawn) | 600 | Parent/finance subs | Unsecured | Senior | None | 2028 facility | Floating | FY25 10-K, Note 17, line 7244 |
| — Commercial paper program | 300 | BLFC (issuer) | Unsecured | Senior | None | <1yr | Floating | FY25 10-K, Note 17, line 7245 |
| — Other short-term debt (bilateral + local op-co lines + $30M ViOil deferred) | 2,983 | Op-cos / finance subs | Mostly unsecured ($535M secured by inventory) | Senior | Inventory (partial) | <1yr | Floating | FY25 10-K, Note 17, lines 7246, 2920, 2924 |
| — Current portion of long-term debt | 1,337 | Mixed | Mostly unsecured | Senior | — | 2026 | Mixed | FY25 10-K, Note 17, line 7248 |
| **Bonds / notes (BLFC Senior Notes, registered)** | **8,360** (face; carrying ~8,309) | BLFC, guaranteed by parent | **Unsecured** | Senior, unsubordinated; rank equally with other unsecured parent obligations | None | 2026–2035 (laddered) | **Fixed** (1.00%–5.25%) | FY25 10-K, Note 17, lines 7253–7266; guarantee lines 2953–2954 |
| **Term loans** | **1,800** | Bunge / BLFC | Unsecured | Senior | None | $250M 2027; $1,550M 2028 | **Floating** (SOFR +1.00% to +1.20%) | FY25 10-K, Note 17, lines 7249–7252 |
| **Revolver (drawn)** | **600** (in ST above) | Parent/finance subs | Unsecured | Senior | None | $3.5B facility due 2028 | Floating | FY25 10-K, Note 17, line 7244 |
| **Finance / capital leases** | **180** (23 current + 157 LT) | Op-cos | Secured by leased asset | — | Specific PP&E ($168M net) | 2026–thereafter | Implicit fixed | FY25 10-K, Note 25, lines 8244–8251 |
| Other long-term debt | 271 | Op-cos | Partly secured | Senior | Mixed | Various | Mixed | FY25 10-K, Note 17, line 7268 |
| Hedge-accounting fair-value adjustment | (128) | — | — | — | — | — | — | FY25 10-K, Note 17, line 7267 |
| **Total gross debt (YE2025)** | **14,051** | | | | | | | FY25 10-K, Note 17, line 7272; MD&A line 2906 |
| **Total gross debt (Q1 2026, Mar 31)** | **14,553** | | | | | | | Q1 2026 10-Q, Note 13, line 1393 |

**Notes on the stack:**
- **Secured vs unsecured:** Secured debt is small — **$1,024M secured at YE2025** (of which $535M collateralized by inventory), falling to **$987M at Q1 2026** ($476M inventory-collateralized) [FY25 10-K, Note 17 fn(3), line 7275; Q1 10-Q fn(2), line 1397]. The vast majority of the stack (the ~$8.4bn of BLFC notes, the $1.8bn term loans, the revolver, and CP) is **unsecured and senior unsubordinated**. There is no large secured tranche sitting ahead of the bonds.
- **Fixed vs floating:** The senior notes (~$8.4bn) are fixed-rate. The floating block is the four SOFR term loans ($1,800M), the drawn revolver ($600M), CP ($300M), and the ~$2,983M of other short-term debt. A hypothetical 100bp move in reference rates changes interest expense by **~$78M**, implying **~$7.8bn (~56% of gross debt) is variable-rate** at YE2025 [FY25 10-K, Item 7A, line 3582]. That is a material floating-rate share for a company this levered; Agent 02/04 should size the refi/rate step-up off it.
- **Q1 2026 change:** In March 2026 Bunge issued two new fixed-rate tranches — **4.80% Senior Notes due 2033 ($495M)** and **5.15% Senior Notes due 2036 ($694M)** — and used the proceeds to **repay revolver borrowings** (revolver drawn fell from $600M to $0; CP from $300M to $50M) [Q1 10-Q, Note 13, lines 1382–1386, 2229–2230]. This termed-out floating revolver debt into fixed bonds — a refinancing-risk-reducing move, but it lifted gross debt to $14,553M as the seasonal working-capital build was funded.
- **EUR exposure:** One tranche is a €700M 1.00% Senior Note due 2028 (carried ~$766–779M); the rest of the notes are USD. FX on EUR debt is one moving part in net debt (the company recorded a +$216M FX gain on net debt in FY2025 on a stronger BRL) [FY25 10-K, MD&A, line ~2880].

---

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| **Operating leases** (US GAAP) | PV of liabilities **$1,596M**; undiscounted minimum payments **$1,992M** | **US GAAP (ASC 842):** capitalized on the balance sheet as a right-of-use asset ($1,686M) and lease liability, but the operating-lease liability is **NOT included in the "debt" line or in total debt** above. Under IFRS 16 it would sit in debt; under US GAAP it does not. Shown here as a debt-like obligation. A further **$408M of operating leases have not yet commenced** (ocean freight / port rights, 2026–2027). | FY25 10-K, Note 25, lines 8275–8290; balance sheet line 4776 |
| **Finance leases** | PV $180M (already in gross debt above) | US GAAP: on the debt line. Counted in gross debt; listed here only to avoid double-counting. | FY25 10-K, Note 25, line 8251 |
| **Pension underfunding (DB)** | **$3M** net underfunded (PBO $663M vs plan assets $660M) | Near-fully funded after a large 2025 U.S. plan settlement (PBO fell from $849M to $663M; a $479M lump-sum/settlement was paid from plan assets). Aggregate of plans in deficit shows PBO $355M vs assets $204M (a $151M pocket of underfunding), offset by overfunded plans. **Not a material debt-like overhang.** | FY25 10-K, pension note, lines 7605–7618, 7654 |
| **OPEB (postretirement) underfunding** | **$57M** unfunded (no plan assets) | Pay-as-you-go; small. | FY25 10-K, pension note, line 7618 |
| **Preferred equity** | **None** | No preferred stock in the capital structure. | FY25 10-K, balance sheet / equity, line ~2960 |
| **Trade-receivables securitization (off-B/S funding)** | Program size $1.5B + $1.0B accordion | Consolidated bankruptcy-remote SPE (BSBV). A recurring funding-structure dependency that flatters reported DSO and CFO; flagged for Agent 05. Not in the debt line. | FY25 10-K, Note 17 (Program), lines 3003–3018; Note 4 |
| **Uncertain tax liabilities** | $77M (incl. interest/penalties) | Excluded from the contractual-obligations table (timing not estimable); flagged for Agent 05. | FY25 10-K, contractual obligations fn(5), line 3194 |

If operating leases were capitalized into debt (IFRS-16 view), gross debt would be **~$15.6bn** ($14,051M + $1,596M) at YE2025. The US-GAAP debt line excludes them; both views are stated per module rule.

---

## 3. Cash & Liquid Assets

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| **Cash & equivalents (YE2025)** | **1,135** | Predominantly unrestricted; cash equivalents are money-market funds, commercial paper, and U.S. government securities | FY25 10-K, balance sheet, line 4768; investment policy line 2809 |
| **Cash & equivalents (Q1 2026, Mar 31)** | **839** | Same | Q1 10-Q, balance sheet, line 187 |
| Restricted cash (YE2025) | ~31 (cash+restricted $1,166M vs cash $1,135M) | Restricted | Q1 10-Q cash reconciliation, lines 290–291 (beginning-of-period $1,166M total vs $1,135M cash) |
| Restricted cash (Q1 2026) | ~8 (cash+restricted $847M vs cash $839M) | Restricted | Q1 10-Q, lines 291, 387 |
| **Liquid short-term investments** | Not separately disclosed as a distinct balance-sheet line | — | FY25 10-K, balance sheet |

**Trapped-cash flag (do not silently net):** Bunge is a HoldCo whose cash sits across global operating subsidiaries, and the 10-K explicitly states subsidiaries' ability to upstream dividends/loans "may be restricted by … applicable laws, as well as agreements" [FY25 10-K, Note 17, lines 2956–2960]. Some operating cash funds daily futures-margin and working-capital settlement and is not freely deployable to HoldCo debt service. The $1,135M / $839M cash figures are the reported totals; net debt below uses them per the standard, but downstream agents should treat HoldCo-available cash as **lower** than the consolidated figure. Restricted cash itself is small (~$8–31M).

**Note on "RMI as quasi-cash":** management treats ~70% of its ~$11.4bn of readily marketable inventory as a debt offset (see Sections 1, 5). RMI is liquid and hedged, but it is **inventory, not cash**, and is **not** netted in the CLAUDE.md net-debt definition used in Section 4. Its role is quantified separately in Section 5.

---

## 4. Gross & Net Debt

Net debt = total interest-bearing debt − cash & equivalents (CLAUDE.md standard). RMI is **not** netted here.

| Metric | YE2025 (Dec-31-2025) | Q1 2026 (Mar-31-2026) | Source |
|---|---:|---:|---|
| Gross debt | 14,051 | 14,553 | FY25 10-K Note 17 line 7272; Q1 10-Q Note 13 line 1393 |
| − Cash & equivalents | (1,135) | (839) | FY25 10-K line 4768; Q1 10-Q line 187 |
| **Net debt** | **12,916** | **13,714** | Computed; ties to earnings/01_historical-financials.md Section 1 |

Net debt rose ~$798M from YE2025 to Q1 2026, driven by the seasonal Q1 cash outflow (CFO −$541M in Q1 2026, inventory build) funded with incremental debt, partly offset by the March bond-for-revolver swap [Q1 10-Q, cash flow line 265; earnings/01, Section 2].

---

## 5. Leverage Ratios

Bunge reports **no GAAP EBITDA**. GAAP-built EBITDA = Bunge "Total EBIT" + D&A. Adjusted EBITDA proxy = Capital-IQ-normalized (= company adjusted) EBIT + D&A. The two FY2025 bases:
- **GAAP-built EBITDA FY2025 = $2,236M** (Total EBIT $1,533M + D&A $703M) [earnings/01, Section 1, note a].
- **Adjusted-EBITDA proxy FY2025 ≈ $2,737M** (adjusted EBIT $2,034M + D&A $703M) [earnings/01, Section 4]. **Caveat:** Bunge does not publish an adjusted-EBITDA reconciliation in its filings; this proxy uses the CapIQ-normalized adjusted EBIT that upstream verified ties to company adjusted figures, and inherits the management-defined caveat from earnings/06.

Leverage on **YE2025 debt** (gross $14,051M / net $12,916M):

| Ratio | On Reported (GAAP-built) EBITDA | On Adjusted-EBITDA proxy | Source |
|---|---:|---:|---|
| Gross debt / EBITDA | **6.28x** (14,051 / 2,236) | 5.13x (14,051 / 2,737) | Computed; bases per earnings/01 |
| Net debt / EBITDA | **5.78x** (12,916 / 2,236) | 4.72x (12,916 / 2,737) | Computed; net-debt/GAAP-EBITDA ties to earnings/01 Section 1 (5.78x) |
| Debt / capital | **44.7%** (gross debt / (gross debt + total equity $17,369M)) | (n/a) | FY25 10-K equity line 7234 |
| Debt / equity | **0.81x** (gross / total equity $17,369M); 0.88x on Bunge-only equity $15,904M | (n/a) | FY25 10-K equity line 7234 |

**TTM cross-check (to Q1 2026):** net debt $13,714M / TTM GAAP-built EBITDA ~$2,354M = **~5.83x** [earnings/01, Section 2].

### The reconciliation: why management says 1.6x, not 5.8x

Management's headline is **adjusted net debt / adjusted EBITDA = 1.6x at Q1 2026 (1.9x at YE2025)** [Q1 2026 call, lines 182–183; business-model/11, Signal Table]. The 4.2-turn gap versus the ~5.8x GAAP-built net-leverage figure comes from **two** adjustments stacked on top of each other:

1. **RMI netting.** Management nets ~**70%** of readily marketable inventory against debt. RMI was ~$11.4bn at YE2025, so the credit is ~$8bn. Management states RMI **exceeded net debt by ~$400M** at Q1 2026 — i.e., on their measure the company is roughly **net-cash against RMI** [Q1 2026 call, lines 181, 713–721; earnings/06, line 67]. The 70% haircut is a management "rule of thumb"; each rating agency applies its own RMI credit, which the company says was raised after Viterra closed because Viterra's inventory carried a higher agency RMI credit [Q1 2026 call, lines 715–721].
2. **Adjusted (not GAAP) EBITDA** in the denominator (the higher of the two bases above).

Reverse-engineering the 1.6x: a TTM adjusted-EBITDA proxy of ~$3.2bn (adjusted EBIT TTM ~$2,233M + guided D&A ~$975M) implies adjusted net debt of ~$5.1bn at 1.6x — i.e., management is removing **~$8.6bn** from the $13,714M reported net debt, consistent with the ~70%-of-RMI credit. *(Inference on the exact bridge, not from filings; the components — RMI ≈$11.4bn, 70% credit, adjusted EBITDA — are all sourced.)*

**Reading for downstream agents:** both numbers are real and serve different questions. The ~5.8x GAAP-built net-leverage is the conservative, balance-sheet-literal figure and is the right anchor for a survival/stress lens. The 1.6x is defensible **only if** the RMI is genuinely liquid, hedged, and convertible to cash at carrying value in a stress — which is the assumption Agent 06 must stress-test (an RMI that cannot be monetized at mark, or a margin call against it, breaks the 1.6x story). Do not adopt 1.6x as the survival anchor without testing the RMI assumption.

---

## 6. Leverage Trend

| Metric | FY2023 | FY2024 | FY2025 | Latest (Q1 2026) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt | N/A [a] | 2,927 | 12,916 | 13,714 | Sharply rising (Viterra) |
| Net debt / EBITDA (GAAP-built) | N/A [a] | ~1.30x | ~5.78x | ~5.83x (TTM) | Sharply rising |
| Net debt / EBITDA (mgmt adjusted, incl. RMI credit) | N/A | N/A | 1.9x | 1.6x | Falling post-close |

[a] FY2023 year-end balance-sheet detail (cash, total debt) is not in the supplied data pool; the FY25 10-K balance sheet presents only Dec-31-2025 and Dec-31-2024 [earnings/01, Section 1, note d]. Marked N/A, not estimated.

**Direction and driver (2–3 sentences):** Leverage rose sharply in FY2025 — net debt went from $2,927M to $12,916M and GAAP-built net leverage from ~1.3x to ~5.8x — driven almost entirely by the July 2025 Viterra combination ($4.2bn cash consideration plus assumed/refinanced Viterra debt; FY2025 CFO also collapsed to $844M and FCF turned negative −$879M, so debt was not paid down) [earnings/01, Sections 1, 6; business-model/11, Signal Table]. On management's RMI-adjusted measure the same period reads 1.9x falling to 1.6x by Q1 2026, because the acquired Viterra inventory enlarged the RMI pool that management nets against debt [Q1 2026 call, lines 182, 715–721]. The two measures move in **opposite directions** across the deal — GAAP leverage up, adjusted leverage down — which is precisely why both must be carried forward; the March-2026 bond-for-revolver swap reduced refinancing (not absolute leverage) risk.

---

## 6A. HoldCo / OpCo & Structural Subordination

Applicable. Bunge has a HoldCo/finance-subsidiary structure.

| Item | Evidence | Why It Matters |
|---|---|---|
| Where the debt sits | The registered public senior notes (~$8.4bn) are issued by **BLFC (Bunge Limited Finance Corp.)**, a wholly-owned finance subsidiary, and **unconditionally guaranteed by the parent, Bunge Global SA**; the guarantee is unsecured, unsubordinated, and ranks equally with the parent's other unsecured obligations [FY25 10-K, Note 17, lines 2935, 2953–2954]. Term loans and revolver also sit at Bunge/BLFC level. Local working-capital lines (~$2,983M "other ST") sit at operating companies. | The bondholders rely on a parent guarantee, not direct OpCo claims. The notes "effectively rank junior to all liabilities of Bunge's subsidiaries (other than BLFC)" — i.e., structural subordination to OpCo-level trade and bank liabilities. |
| Upstreaming constraints | The 10-K explicitly states: "As a holding company, Bunge is dependent upon dividends, loans, or advances or other intercompany transfers of funds from its subsidiaries," and that subsidiaries' ability to pay "may be restricted by … applicable laws, as well as agreements" [FY25 10-K, Note 17, lines 2956–2960]. | The parent/BLFC must pull cash up from operating subs to service the guaranteed notes. In a stress where subsidiary liabilities rank ahead, upstreaming can be constrained — a real (if standard) structural-subordination risk. |
| Material restricted / trapped cash | Restricted cash is small (~$8–31M), but consolidated cash ($839M–$1,135M) is spread across global op-cos, some funding daily futures margin and local working capital [earnings/06, line 165; FY25 10-K investment policy]. | Consolidated net debt may **understate** HoldCo-level net leverage because not all cash is freely upstreamable to service parent/BLFC debt. Treat HoldCo-available cash as below the consolidated figure. |
| Rating / change-of-control triggers | "Our debt agreements do not have any credit rating downgrade triggers that would accelerate maturity of our debt" — but a downgrade **would** raise borrowing costs on syndicated facilities [FY25 10-K, Note 17, lines 2991–2996]. No change-of-control acceleration disclosed in the pool. | No hidden accelerant from a downgrade; but the ~56% floating book means a downgrade-driven spread widening would still raise cash interest. For Agent 04. |

Ratings (all investment grade, all stable, all affirmed post-Viterra): **S&P A- / A-2**, **Moody's Baa1 / P-2**, **Fitch BBB+ / F-2** [FY25 10-K, Note 17, lines 2966–2989]. No rating-agency report is in the data pool — these are the company-disclosed grades only.

---

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

Use these verbatim. **Currency: US$ millions.**

- **Gross debt:** **$14,051M** (YE2025, Dec-31-2025); **$14,553M** (Q1 2026, Mar-31-2026) [FY25 10-K Note 17 line 7272; Q1 10-Q Note 13 line 1393].
- **Net debt:** **$12,916M** (YE2025); **$13,714M** (Q1 2026) [computed; ties to earnings/01].
- **Cash & equivalents:** **$1,135M** (YE2025); **$839M** (Q1 2026). Restricted cash small (~$8–31M). HoldCo-available cash is **below** the consolidated figure (structural-subordination / op-co restriction flag).
- **EBITDA base used (FY2025):**
  - **Reported (GAAP-built) EBITDA = $2,236M** (Total EBIT $1,533M + D&A $703M). Bunge reports no GAAP EBITDA line; this is constructed.
  - **Adjusted-EBITDA proxy = $2,737M** (adjusted EBIT $2,034M + D&A $703M) — **management-defined, not in filings; carry the caveat** (earnings/06: usable profit is management-adjusted; MTM-timing dominated).
  - TTM (to Q1 2026) GAAP-built EBITDA ≈ **$2,354M**.
- **Net debt / EBITDA:**
  - **On reported (GAAP-built) EBITDA: 5.78x (YE2025); ~5.83x TTM.** ← **Use this as the conservative survival anchor.**
  - On adjusted-EBITDA proxy: 4.72x (YE2025).
  - **Management's reported figure: 1.6x (Q1 2026) / 1.9x (YE2025)** — but this nets ~70% of ~$11.4bn RMI against debt **and** uses adjusted EBITDA. **Do not use 1.6x as the survival anchor without stress-testing the RMI-monetization assumption** (Agent 06).
- **Gross debt / EBITDA (GAAP-built, YE2025):** 6.28x.
- **Debt / capital:** 44.7%. **Debt / equity:** 0.81x (total equity) / 0.88x (Bunge-only equity).
- **Fixed/floating:** ~56% of gross debt is variable-rate (~$7.8bn; 100bp = ~$78M interest). Senior notes (~$8.4bn) are fixed.
- **Secured debt:** small — $1,024M (YE2025) / $987M (Q1 2026); rest senior unsecured. No large secured tranche ahead of the bonds.
- **Operating leases:** US-GAAP treatment — **excluded** from the debt line (PV $1,596M). IFRS-16 view would add them, lifting gross debt to ~$15.6bn.

**Caveats to propagate:** (1) The adjusted-EBITDA proxy and the 1.6x management leverage both inherit a management-defined caveat (earnings/06 scored earnings quality 52/100; GAAP earnings dominated by MTM timing). (2) FY2023 net-debt history is N/A (not in pool). (3) HoldCo-available cash < consolidated cash. (4) The 1.6x-vs-5.8x gap is the defining leverage question for this name and must be carried into the synthesis, not averaged away.

No solvency verdict is rendered here — that is the synthesizer's job.
