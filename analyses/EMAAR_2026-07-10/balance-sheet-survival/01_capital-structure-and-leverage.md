# Capital Structure & Leverage — EMAR

*Emaar Properties PJSC (DFM: EMAAR) — Dubai / UAE real-estate developer. Reporting standard **IFRS**; reporting currency **AED (UAE dirham), millions** unless stated; fiscal year ends **31 December**. The dirham is pegged to the US dollar at **AED 3.6725/USD**, so the group's large US-dollar sukuk carry effectively no dirham FX risk. Latest balance sheet: **Q1 2026 (as at 31 Mar 2026)**, filed 11 May 2026. Filings are in English — no translation gap.*

*Plain-English note (first use): **gross debt** = all interest-bearing borrowings plus leases; **net debt** = gross debt − cash (the strict §15 basis); **net cash** = the same figure when cash exceeds debt; **EBITDA** = rough proxy for operating cash profit before interest, tax and depreciation; **leverage** = debt ÷ EBITDA (how many years of profit the debt equals); **IFRS 16** = the accounting rule that puts leases on the balance sheet as a liability.*

---

## 1. Debt Stack

Amounts are the **Q1 2026 (31 Mar 2026)** totals by instrument type [CIQ Financials_Quarterly, Capital Structure Summary, Q1 2026 filed 2026-05-11]. Instrument-level detail (rate, seniority, security, maturity) is the **FY2025 audited as-reported** disclosure — the latest instrument-by-instrument breakdown available (Q1 discloses totals only); it ties exactly to the audited notes. Currency: AED millions.

| Instrument | Amount (Q1-26) | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Sukuk (Islamic bonds), 3 series | 6,424.7 | Emaar Sukuk Ltd (SPV); obligor = Emaar Properties PJSC (parent) | Unsecured | Senior | None | Series 3 AED 2,752.6 due **15 Sep 2026**; Series 4 AED 1,836.8 due 2029; Series 5 AED 1,834.5 due 2031 | **Fixed** — 3.64% / 3.875% / 3.70% (semi-annual) | FY2025 AR (IFRS), Note 25 (Sukuk) |
| Bank term loans | 2,150.3 | Overseas OpCos (Emaar India, Emaar Misr/Egypt) + UAE | Unsecured (a tiny AED 14.7 Lebanon-secured loan in FY2025 was repaid by Q1-26) | Senior | None (ex the repaid Lebanon loan) | AED loan 2027; INR loan (AED 1,694.3) 2028 | INR **fixed** 6.80–8.62%; AED **floating** 3M EIBOR+0.90% | FY2025 AR, Note 24 (Interest-bearing loans) |
| Revolving credit (drawn) | 711.4 | UAE parent (AED 3.7) + Egypt/Pakistan OpCos | Unsecured | Senior | None | EGP 2026/2027; PKR 2026; AED 2030 | EGP **fixed** 11.28–21%; PKR **floating** 3M KIBOR −0.15%; AED **floating** EIBOR+1.0% | FY2025 AR, Note 24 |
| Finance / capital leases (IFRS 16) | 778.0 | Group | Secured (on the leased asset) | Senior | Leased assets | Amortising (no bullet) | 4.0–8.0% | FY2025 AR, lease note; CIQ Cap. Structure |
| **Total gross debt** | **10,064.4** | | 92.3% unsecured | All senior | | WAM ~2.5y | ~90% fixed / ~10% floating | CIQ Cap. Structure, Q1-26; ties to AR Notes 24+25+leases |

**Memo — maturity split of the same total (not additive to the rows above):** current portion (due ≤12m) AED 1,996.2; long-term (incl. leases) AED 8,068.2 [CIQ Balance Sheet, Q1-26]. *Flag:* at FY2025 (Dec-25) the current portion was AED 5,314.6 (it then included Sukuk 3, due Sep-2026); at Q1-26 CIQ shows only AED 1,996.2 current even though Sukuk 3 (AED 2,752.6) still matures within 12 months — the vendor split appears not to have reclassified Sukuk 3 to current. The precise near-term schedule is resolved by `02_maturity-wall-and-refinancing`; this agent reports the instrument stack and totals.

**Ties to the audited balance sheet.** FY2025: bank loans & borrowings (Note 24) AED 3,382.2 + Sukuk (Note 25) AED 6,423.9 + lease liabilities AED 808.9 = **AED 10,615.0**, matching the CIQ FY2025 total debt of AED 10,615.0 [FY2025 AR, Notes 24–25]. Group has **complied with all applicable financial covenants** on its loans and borrowings [FY2025 AR, Note 24]; the covenant thresholds themselves are not quantified in the debt note — headroom is assessed by `04_coverage-and-covenants`.

**Structural reads (detail in §6A):** (i) **99.9% unsecured** — the only secured items are IFRS-16 leases (secured on the underlying asset) and, in FY2025, a AED 14.7 Lebanon-asset loan since repaid; there is **no revolver collateral shared** with other lenders. (ii) **Currency mix of debt:** ~64% USD sukuk (dirham-pegged, so no real FX risk), ~17% INR, and small EGP/PKR facilities at overseas subsidiaries. (iii) **Rate mix:** of the AED 10,615 FY2025 principal, ~AED 9,545 (90%) is fixed and ~AED 1,070 (10%) floating (AED/EGP-KIBOR/EIBOR facilities) [ciq_facts debt_maturity_wall; FY2025 AR Note 24].

---

## 2. Other Debt-Like Obligations

| Obligation | Amount (Q1-26) | Treatment | Source |
|---|---:|---|---|
| Operating leases | Already on-balance-sheet | **IFRS 16** capitalises leases: the AED 778.0 lease liability in §1 **is** the leases. There is **no separate off-balance-sheet operating-lease pool** to add. | FY2025 AR, lease note; CIQ Cap. Structure |
| Pension / end-of-service benefits (OPEB) | 210.7 (FY2025: 197.9) | **Unfunded** UAE end-of-service gratuity provision; small — ~0.2% of equity; not counted in gross debt above. Debt-like but immaterial. | FY2025 AR, Note 26 (End-of-Service Benefits); CIQ Pension/OPEB |
| Preferred equity | None | Capital is common equity + minority interest only; no preferred instrument disclosed. | CIQ Cap. Structure Summary; FY2025 AR, equity note |

*Not debt (flagged to prevent misreading the balance sheet):* the large **unearned-revenue** liability (non-current AED 43,689) is **customer presale advances**, settled by delivering completed homes, not by paying cash — it is self-liquidating operating float, not borrowing. RERA project performance guarantees (~AED 9.0bn) are a contingent/off-balance-sheet item handled by `05_off-balance-sheet-and-contingencies`, not funded debt [FY2025 AR, Note 30; business-model/11].

---

## 3. Cash & Liquid Assets

Currency: AED millions, at 31 Mar 2026 [CIQ Balance Sheet, Q1-26; reconciled to FY2025 AR Notes 10 & 14].

| Item | Amount (Q1-26) | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents (free / unrestricted) | 12,179.5 | No — free operating cash | CIQ "Cash And Equivalents"; = FY2025 AR Note 10 total **less** escrow |
| Short-term investments (bank fixed deposits >3m + some restricted cash) | 22,503.4 | **Partly** — the company's own line label is "fixed deposits with original maturities of three months or more, **and restricted cash**"; the restricted portion is not separately quantified | CIQ "Short Term Investments"; FY2025 AR Note 14 |
| Trading securities (FVTPL) | 350.7 | No | CIQ "Trading Asset Securities"; FY2025 AR Note 14 |
| **Total cash & short-term investments (broad)** | **35,033.6** | Partly (via the line above) | CIQ "Total Cash & ST Investments" |
| Restricted escrow cash (excluded) | 43,338.5 | **Yes — restricted.** Customer advances held in RERA escrow accounts, releasable only against construction milestones on those projects; "not under lien" but not available for debt service or general use | FY2025 AR, Note 10 ("cash and cash equivalents include AED 42,878,923 representing advances… deposited into escrow accounts") |
| Deposits under lien (excluded) | ~680 (FY2025) | **Yes — pledged** against guarantees | FY2025 AR, Note 14 / Note 30(a) |

**Key reconciliation (why the two cash worlds differ).** The audited FY2025 "Cash and cash equivalents" (Note 10) of **AED 52,632.9** is a blended figure: it **includes AED 42,878.9 of escrow** (customer advances) and only **AED 9,754.0 of free cash** (52,632.9 − 42,878.9) [FY2025 AR, Note 10]. CIQ correctly splits these — the escrow sits in a separate "Restricted Cash" line and is excluded from every net-debt figure below. **Caveat carried downstream:** the AED 22,503.4 "short-term investments" line the broad basis relies on is, by the company's own wording, part restricted; so truly-available liquidity is somewhere **between** the strict figure (§4) and the broad figure.

---

## 4. Gross & Net Debt

At 31 Mar 2026, AED millions. Emaar is **net cash on BOTH §15 bases** — it holds more cash than total borrowings even before counting any investments.

| Metric | Value | Source |
|---|---:|---|
| Gross debt (incl. IFRS-16 leases AED 778.0) | 10,064.4 | CIQ Cap. Structure, Q1-26 |
| − Cash & equivalents (free) | 12,179.5 | CIQ Balance Sheet, Q1-26 |
| **Net debt (strict, §15)** | **−2,115.1 → net CASH AED 2,115.1** | derived = 10,064.4 − 12,179.5 |
| − Short-term investments + trading securities | 22,854.1 | CIQ Balance Sheet, Q1-26 |
| **Net debt (broad, incl. investments)** | **−24,969.2 → net CASH AED 24,969.2** | CIQ "Net Debt"; ties to ciq_facts (−24,969.2) |

*Gross debt excluding IFRS-16 leases = AED 9,286.4 (borrowings + sukuk only).* The **strict** row (free cash only) is the module's conservative §15 default; the **broad** row nets in the short-term-investment line (mostly liquid bank deposits, but partly restricted per §3) and equals the AED 25bn "net cash" that the earnings and business-model modules headline. Both are shown so neither travels bare. The reconciliation to CIQ's sidecar is clean: ciq_facts pins Net Debt at −24,969.2 (broad/vendor basis) and Total Debt at 10,064.4 — both matched here; the strict figure is this agent's own §15 read and is the smaller, cleaner number.

---

## 5. Leverage Ratios

EBITDA basis: **CIQ standardized EBITDA** (= operating income + depreciation/amortisation, built from the audited IFRS statements) — this is the reported/GAAP-equivalent measure and foots across all periods. LTM to 31 Mar 2026 = **AED 25,200.7** [ciq_facts ltm_ebitda_m; earnings/01]. Emaar publishes a **company-defined non-IFRS EBITDA** (~AED 25.6bn FY2025) that runs ~AED 1.0–1.5bn higher because it adds net finance income and share of JV/associate results; using it would make leverage look *lower*, so the conservative standardized figure is used as the spine [earnings/01, §4]. Debt figures are Q1-2026 (31 Mar 2026), paired with LTM-to-Mar-2026 EBITDA (same as-of date).

| Ratio | On Reported (CIQ std) EBITDA | On Company adj. EBITDA | Source |
|---|---:|---:|---|
| Gross debt / EBITDA | **0.40x** (10,064.4 / 25,200.7) | ~0.41x (FY2025: 10,615 / 25,600) | CIQ; earnings/01 |
| Net debt / EBITDA — strict (net cash) | **−0.08x** (−2,115.1 / 25,200.7) | ~−0.03x (FY2025 strict) | derived |
| Net debt / EBITDA — broad (net cash) | **−0.99x** (−24,969.2 / 25,200.7) | ~−0.69x (FY2025 broad) | CIQ; ciq_facts (−0.99x) |
| Debt / capital | **8.9%** (10,064.4 / 113,656.5) | (n/a) | CIQ Cap. Structure |
| Debt / equity | **9.7%** (10,064.4 / 103,592.2 total equity; 11.2% on common equity 89,783.9) | (n/a) | CIQ Balance Sheet |

**Net-leverage basis:** the rows above show the strict-basis net-leverage figure (−0.08x, canonical) alongside the broad (−0.99x). Both are net cash. The adjusted-EBITDA column is shown for FY2025 (the only period with a clean company non-IFRS EBITDA); the difference is immaterial — every leverage read is trivially low or negative.

**Cyclical overlay (required — Emaar is a cyclical name).** `business-model/10_external-dependency` classifies Emaar as "mostly externally driven" (score 63/100, higher = worse): ~80% of revenue is off-plan Dubai residential (homes sold before built) into a boom-bust market (prior down-cycle 2015–2019; consensus long-term growth −14.8%). LTM/FY2025 EBITDA is therefore a **peak-cycle** figure. Leverage on a **normalised / mid-cycle EBITDA** (5-year average FY2021–FY2025 = **AED 14,647**, which spans the softer 2021–22 years and the boom) is shown beside the peak figure:

| Ratio | On LTM EBITDA (peak / latest, 25,201) | On mid-cycle EBITDA (normalised, 14,647) |
|---|---:|---:|
| Gross debt / EBITDA | 0.40x | **0.69x** |
| Net debt / EBITDA — strict (net cash) | −0.08x | **−0.14x** |
| Net debt / EBITDA — broad (net cash) | −0.99x | **−1.70x** |

Even at a normalised mid-cycle EBITDA ~42% below the LTM peak, gross leverage is 0.69x and the group stays **net cash on both bases** — the low-leverage read does not depend on peak earnings.

---

## 6. Leverage Trend

AED millions. FY0 = FY2025 (most recent full year); Latest = LTM / Q1-2026 (31 Mar 2026). Net-cash rows use the convention **positive = net cash**. Source: earnings/01 (reconciled to the audited annual reports and CIQ); ciq_facts.

| Metric | FY2023 | FY2024 | FY2025 | Latest (Q1-26) | Direction |
|---|---:|---:|---:|---:|---|
| Gross debt | 12,981 | 10,448 | 10,615 | 10,064 | Falling |
| Net cash — **broad** §15 basis | +1,853 | +8,835 | +17,640 | **+24,969** | Rising net cash |
| Net debt / EBITDA — broad (neg = net cash) | −0.13x | −0.50x | −0.73x | −0.99x | Falling (more net cash) |
| Net cash / (debt) — **strict** §15 basis | +1,596 | −2,571 (net debt) | −861 (net debt) | **+2,115** | Roughly net-flat* |
| Net debt / EBITDA — strict (neg = net cash) | −0.11x | +0.15x | +0.04x | −0.08x | Roughly net-flat* |

Leverage is **falling / net cash is rising** on the broad basis and **roughly net-flat around zero** on the strict basis. Gross debt has come down from AED 12,981 (FY2023) to AED 10,064 (Q1-26), helped by the FY2023 repayment of a maturing sukuk (Payment of Sukuk AED 2,750.8 in the FY2023 cash flow). The build in net cash is driven by strong operating cash flow (LTM CFO AED 31,973), customer presale advances self-funding development, low fixed capex (~AED 0.9–1.0bn/yr), a dividend held at ~50% of earnings, no buybacks and no debt-funded M&A [earnings/01; business-model/11]. **\*The strict series is distorted by a FY2024–FY2026 cash/term-deposit reclassification** — the group moved AED 11–22bn of bank deposits out of "cash & equivalents" into a "short-term investments" line — which depresses the strict figure while the underlying trend (broad basis) is a genuine, growing net-cash position [earnings/01, §1 footnote]. S&P upgraded to BBB+ and Moody's to Baa1 in 2025, consistent with the improving credit profile [Q4/FY2025 press release, 12 Feb 2026].

---

## 6A. HoldCo / OpCo & Structural Subordination

| Item | Evidence | Why It Matters |
|---|---|---|
| Where the debt sits | The **sukuk (AED 6,424, ~64% of debt)** is issued by **Emaar Sukuk Ltd**, an SPV, with **Emaar Properties PJSC (the parent) as obligor/guarantor** — so it is effectively parent-level debt. The **bank loans (Note 24, AED 3,382)** are almost entirely at **overseas OpCos**: "located… within UAE AED 3.7; outside UAE AED 3,378.5" (India, Egypt, Pakistan, Lebanon) [FY2025 AR, Note 24, "located"; Note 25]. | The overseas bank debt is structurally senior at those subsidiaries; the parent's claim on their assets ranks behind it. But the amounts are small (AED 3.4bn) and the group carries net cash, so structural subordination is a minor consideration, not a live risk. |
| Upstreaming constraints | Anchor owner is the **Government of Dubai** (via Emirates Power Investment / Dubai Holding, group stake ~29.7% after the May-2026 transfer from ICD). Dividends flow **pro-rata to all holders** and are covered ~2x by earnings; no dividend-blocker on the parent's own debt is disclosed [business-model/11]. Large **minority interest AED 13,808** (mainly listed subsidiary Emaar Development) means part of group cash is at partly-owned subs. | The parent services its own sukuk from its own cash and dividends; there is no evidence of an upstreaming block. The government-owner alignment caveat is a governance item (business-model/11), carried to synthesis, not a debt-service constraint today. |
| Material restricted / trapped cash | **AED 43,338 RERA escrow** (customer advances, releasable only against construction milestones) is excluded from net cash. The **AED 22,503 "short-term investments"** line is, by the company's own label, part restricted (amount not quantified). AED ~0.7bn deposits under lien back guarantees. | Correctly excluding escrow avoids overstating net cash. The unquantified restricted slice inside "short-term investments" is exactly why the **strict** basis is designated canonical (§7) — it does not rely on that ambiguous line. |

Not a classic HoldCo/OpCo leverage problem: the material debt (sukuk) is parent-obligated, the OpCo debt is small, and the group is net cash. Structural subordination is noted and de-risked, not a survival concern.

---

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

Use these verbatim. Currency **AED millions**, at **31 Mar 2026 (Q1-2026)** unless stated; IFRS.

- **Gross debt:** **AED 10,064.4** (incl. IFRS-16 leases AED 778.0; ex-leases AED 9,286.4). Falling trend.
- **Net debt / net cash — canonical basis = STRICT (§15 default):** **net CASH AED 2,115.1** (gross debt 10,064.4 − free cash & equivalents 12,179.5). *Reason strict is canonical:* the module's survival-first, conservative doctrine, and because the broader figure leans on a "short-term investments" line the company itself labels as partly restricted. **Also carried (broad basis): net CASH AED 24,969.2** (nets in AED 22,854 of short-term investments + trading securities) — this is the figure the earnings and business-model modules headline and the CIQ sidecar pins (−24,969.2). Downstream BSS agents should use the **strict AED 2,115.1** as the anchor and cite the broad figure only where a liquidity-inclusive view is explicitly wanted, labelled. **Emaar is net cash on BOTH bases.**
- **Cash & liquid investments:** free cash & equivalents **AED 12,179.5**; short-term investments (part restricted) **AED 22,503.4**; trading securities **AED 350.7**; broad total **AED 35,033.6**. Separately, **restricted escrow AED 43,338.5 is excluded** (not available for debt service).
- **EBITDA base used:** **AED 25,200.7** (LTM to 31 Mar 2026), **CIQ standardized / reported-IFRS basis** (operating income + D&A), **cycle position = PEAK / latest**. Company non-IFRS EBITDA is ~AED 1.0–1.5bn higher (would lower leverage). **Mid-cycle / normalised EBITDA = AED 14,647** (5-yr avg FY2021–25) for the cyclical cross-check.
- **Net debt / EBITDA (using canonical strict net cash):** **−0.08x** on reported/LTM EBITDA; ~**−0.03x** on company adjusted (FY2025). Gross debt / EBITDA **0.40x** (peak) / **0.69x** (mid-cycle). On the broad basis, net debt/EBITDA is **−0.99x**. Debt/capital **8.9%**; debt/equity **9.7%**.
- **Reporting currency:** **AED** (pegged USD 3.6725); large USD sukuk carry no real dirham FX risk.

**Caveats to propagate:** (1) The strict net-cash figure (AED 2.1bn) is far smaller than the AED 25bn broad figure other modules cite — the gap is a "short-term investments" line the company labels as partly restricted; do not headline AED 25bn "net cash" without this basis label. (2) EBITDA is peak-cycle; the mid-cycle figure (AED 14,647) is provided for stress and normalisation. (3) The Q1-26 current/non-current split understates near-term maturities (Sukuk 3, AED 2,752.6, due 15 Sep 2026, not reclassified to current) — `02` resolves the schedule. (4) Covenants exist and were complied with, but thresholds are unquantified in the debt note — `04` assesses headroom.

**Net-cash read (per MODULE_RULES core principle 8 / CLAUDE.md §24 Filter 3):** net cash on both bases, near-zero gross leverage, and interest cover of ~52x are treated as a **positive strategic-flexibility signal** — dry powder for counter-cyclical action (holding land/staff, buying assets cheap, funding launches) precisely when the Dubai property cycle turns — and as removal of refinancing dependence. It is **not** marked down as a "lazy" or "sub-optimal" balance sheet, and this module makes no "under-levered / add-debt to optimise cost of capital" argument. No solvency verdict is made here — that is the synthesizer's job (`99`).
