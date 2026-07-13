# Liquidity Runway — EMAR

*Emaar Properties PJSC (DFM: EMAAR) — Dubai / UAE real-estate developer. Reporting standard **IFRS**; reporting currency **AED (UAE dirham), millions** unless stated; fiscal year ends **31 December**. The dirham is pegged to the US dollar at **AED 3.6725/USD**. Balance-sheet figures are **Q1 2026 (31 Mar 2026)**; cash-flow / FCF figures are **LTM to 31 Mar 2026**. Filings are in English — no translation gap.*

*Plain-English note (first use): **liquidity runway** = how many months the company could keep paying what is due if it lived off committed cash and its own cash generation; **committed facility** = a loan line the bank cannot cancel at will (as opposed to an uncommitted line it can pull); **FCF** (free cash flow) = cash from operations minus capital spending — the recurring cash the business throws off; **restricted / escrow cash** = cash the company holds but is legally barred from using for debt or general purposes (here, homebuyer advances locked in RERA construction-escrow accounts); **coverage multiple** = liquidity divided by a full year's obligations (2.0x = two years covered, i.e. 24 months).*

*Upstream inputs read: `01_capital-structure-and-leverage.md` (cash, debt), `02_maturity-wall-and-refinancing.md` (next-12-month maturities), cross-module `earnings/01_historical-financials.md` (CFO/FCF/capex) and `earnings/06_earnings-quality.md` (is the cash real?), plus `business-model/11_capital-allocation-governance.md` (dividend). No partial-data cap applies — committed revolver availability is disclosed and a full cash-flow statement exists (see §3).*

---

## 1. Liquidity Sources (committed only)

Currency AED millions, at 31 Mar 2026 (revolver detail FY2025 audited). Reporting currency: **AED**.

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents (free / unrestricted) | 12,179.5 | **Y** | Free operating cash; escrow already stripped out | CIQ Balance Sheet Q1-26; = FY2025 AR Note 10 free cash [`01` §3] |
| Liquid short-term investments (bank fixed deposits >3m) | 22,503.4 | **Partly** | Company's own label: "fixed deposits… **and restricted cash**"; restricted slice **not quantified** — so excluded from the conservative headline | CIQ "Short Term Investments"; FY2025 AR Note 14 [`01` §3] |
| Trading securities (FVTPL) | 350.7 | **Y** | Liquid, no restriction | CIQ "Trading Asset Securities"; FY2025 AR Note 14 |
| Revolver / facility (commitment) | 3,673.0 | — | Syndicated UAE revolver; committed; matures **2030**, EIBOR+0.95% | FY2025 AR, Note 24 [`02` §4] |
| Revolver **availability** (undrawn, committed) | **3,669.3** | **Y** | Only AED 3.7m drawn ⇒ availability = 3,673.0 − 3.7; not a borrowing-base facility, so availability is **known** | FY2025 AR, Note 24 [`02` §4] |
| **Total usable liquidity — conservative** (free cash + trading + committed revolver availability) | **16,199.5** | | Excludes the part-restricted ST-investment line | derived: 12,179.5 + 350.7 + 3,669.3 |
| **Total usable liquidity — broad** (adds ST investments) | **38,702.9** | | Leans on the part-restricted ST-investment line — labelled | derived: 16,199.5 + 22,503.4 |

**Excluded from usable liquidity (restricted):** **RERA escrow cash AED 43,338.5m** — homebuyer advances releasable only against construction milestones, "not available for debt service or general use" [FY2025 AR Note 10; `01` §3]; and **deposits under lien ~AED 680m** pledged against guarantees [FY2025 AR Note 14 / 30(a)].

**Listed separately (NOT counted as usable):** an unused **USD 2.0bn sukuk programme** with ~AED 0.9bn undrawn headroom — this is issuance capacity, not a committed drawable facility, so it is excluded from the headline [FY2025 AR Note 25].

**Rule applied:** the revolver IS included because its availability is known (committed syndicated line, drawn amount disclosed) — the "availability unknown → exclude revolver" cap does **not** bite here. The conservative total (AED 16,199.5m) is used as the headline; the broad total (AED 38,702.9m) is shown because the earnings/business-model modules headline the ~AED 35bn cash pile, but it relies on a line the company itself labels part-restricted. **No minimum-liquidity covenant is disclosed** to subtract [`01` §1; `04`].

---

## 2. Near-Term Uses (next 12 months)

Currency AED millions.

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from `02`) | **3,776.2** | `02` §1–2: 2026 bucket by ultimate maturity (35.6% of debt). The only hard capital-markets bullet is **Sukuk 3, AED 2,752.6m, due 15 Sep 2026** (3.64%); the rest is small EGP/PKR revolvers that roll. *IFRS current-portion basis is higher at ~AED 5,314.6m* (adds rolling EM lines + term-loan amortisation) — shown as a conservative sensitivity in §3. |
| Cash interest (finance costs paid) | **1,093** | earnings/06 §1 memo — LTM finance costs paid. **Booked in *financing*, not in CFO** — so it is NOT already inside FCF (see §3). |
| Maintenance capex | **~991** | earnings/01 §1 / earnings/06 §1 — total PP&E capex LTM (maintenance not split out; PP&E capex is small because real development outlay runs through operating cash, not capex). Used as the maintenance proxy. |
| Committed dividends / buybacks | **8,838.8** | Cash dividend AED 1.00/share × 8,838.8m shares, held flat FY2023–FY2025; **no buybacks** [business-model/11 §1; FY2025 AR Note 32]. |
| **Total near-term uses (gross)** | **14,699.0** | derived: 3,776.2 + 1,093 + 991 + 8,838.8 |

Note: the dividend (AED 8,838.8m) is the single largest "use" and it is **discretionary** — covered ~2x by earnings and cuttable in a downturn — whereas the debt maturities (AED 3,776.2m) are the only hard, non-deferrable calls.

---

## 3. Runway

FCF is strongly positive and cash-backed (earnings-quality 81/100; normalised CFO/EBITDA 94% LTM, above 70% every year for five years [earnings/06 §2, §9]), so the **Net-of-FCF basis** is the correct primary basis.

**FCF figure used (§15 lead = the conservative, normalised number):**
- **Normalised operating FCF = AED 22,635m** (LTM) — reported FCF minus the customer-advance build; this is the recurring cash the operations throw off. **Lead figure** [earnings/06 §1, §9].
- Reported FCF (CFO − capex) = AED 30,982m (LTM) — flattered ~27% by the cyclical customer-advance inflow (~AED 8.3bn) and a corporate-tax payment lag (~AED 2.5bn); shown, not headlined [earnings/06 §10].
- CIQ "Levered Free Cash Flow" = AED 3,066.7m — a **different** definition (after interest AND after netting real-estate + securities investment); not the CFO−capex figure, not used as the headline [ciq_facts; earnings/01 §2].

**Emaar-specific adjustment (stated so the reader can reproduce it):** the default §8 net-of-FCF formula omits cash interest and capex "because FCF already carries both." That holds only when interest sits in CFO. **Emaar books interest paid in *financing*, so it is NOT inside this FCF** [earnings/06 §1] — therefore cash interest (AED 1,093m) is added back as a separate obligation. Capex **is** inside FCF (CFO − total capex), so capex is **not** re-added.

| Metric | Value |
|---|---:|
| Total committed liquidity — conservative | **AED 16,199.5m** (broad: AED 38,702.9m) |
| Annual FCF (lead = normalised operating FCF) | **AED 22,635m** (reported FCF AED 30,982m) |
| Basis used | **Net-of-FCF** (FCF meaningful & cash-backed), + cash interest added back (interest is in financing, not CFO) |
| Annual net cash burn (on the stated basis) | **NEGATIVE — a surplus.** = (maturities 3,776.2 + dividends 8,838.8 + cash interest 1,093) − FCF 22,635 = 13,708.0 − 22,635 = **−8,927** |
| Monthly net cash burn | **None — monthly *surplus* ≈ AED 744m** (8,927 ÷ 12) |
| **Liquidity runway (months) = liquidity ÷ monthly net burn** | **No finite runway — FCF surplus.** Annual surplus ≈ **AED 8,927m** on normalised FCF; ≈ **AED 17,274m** on reported FCF |

**Formula shown:** runway (months) = liquidity ÷ **monthly** net burn. Here the monthly net burn is negative (a surplus), so there is no finite runway to compute: a single year's normalised operating cash covers **all** debt maturities, **all** cash interest, **and** the entire AED 8.8bn dividend, and still adds ~AED 8.9bn to the AED 16.2bn+ committed-liquidity pile. (Dividing liquidity by an *annual* burn would give a coverage multiple, not months; there is no positive burn to divide by.)

**Stress sensitivity — if operations generated ZERO cash for a full year (gross-obligations basis, FCF ignored):**
- Full uses incl. the discretionary dividend: AED 14,699.0m ⇒ conservative liquidity 16,199.5 ÷ (14,699.0/12) = **~13.2 months** (1.10x coverage). The dividend is what pulls this near one year.
- Non-discretionary uses only (maturities + interest + maintenance capex = AED 5,860.2m; dividend cut, as it would be in a stress): conservative liquidity ⇒ **~33 months** (2.76x); broad liquidity ⇒ **~79 months** (6.6x).
- Hard debt maturities alone (AED 3,776.2m): **free unrestricted cash of AED 12,179.5m covers them 3.2x**, and Sukuk 3 alone 4.4x — before any FCF, revolver, or ST investments [`02` §4].

Even the harshest cut — IFRS current-portion maturities (AED 5,314.6m) instead of AED 3,776.2m, on normalised FCF — still leaves an annual **surplus** of ~AED 7,389m. The runway conclusion does not depend on which maturity basis is used.

### Seasonality / Peak Liquidity Need (Hard Check)

**Revenue and EBITDA are seasonal** — Q4 takes ~32–33% of annual revenue every year, Q1/Q2 are the light quarters (~21% each) [earnings/01 §5]. **But operating working capital does not create a seasonal cash *drain*:** Emaar runs on **negative operating working capital** — homebuyer advances (AED 40.7bn) exceed development inventory and receivables, so customers pre-fund the build rather than the company building inventory ahead of a selling season [earnings/06 §3]. There is therefore no inventory-build peak that draws down cash the way a retailer's would. The one dated hard call, Sukuk 3, matures 15 Sep 2026 (Q3) and is covered 4.4x by free cash on hand.

**Peak intra-year working-capital cash need is not separately disclosed** — so, per the hard-check rule: *peak working-capital need not disclosed — the runway could in principle be overstated by an intra-quarter swing.* However, because free unrestricted cash (AED 12,179.5m) alone covers the entire annual maturity bucket 3.2x and the single largest bullet 4.4x, a plausible seasonal swing does not change the conclusion.

---

## 4. Sources & Uses Bridge

Internal sources cover the next 12 months many times over, with no external access required. **In-hand liquidity does the heavy lifting for debt service:** free unrestricted cash of AED 12,179.5m alone covers all next-12-month debt maturities (AED 3,776.2m) **3.2x** and the only capital-markets bullet (Sukuk 3, AED 2,752.6m) **4.4x** — so debt repayment depends on neither FCF materialising nor refinancing markets being open (confirmed by `02`'s 12-month market-closure test, which Emaar clears comfortably). FCF is needed only to fund the discretionary AED 8.8bn dividend *on top of* maturities — and even the conservative, advance-stripped normalised FCF (AED 22.6bn) covers that plus maturities plus interest with ~AED 8.9bn to spare. **Split: the runway is overwhelmingly already-in-hand liquidity, not must-materialise FCF** — hard obligations (debt service) are pre-funded by cash on the balance sheet; FCF only has to hold up to keep the dividend whole, and the dividend is cuttable.

---

## 5. Liquidity Read

There is **no finite runway** — a single year's normalised operating cash (AED 22.6bn) covers every debt maturity, all cash interest, and the entire AED 8.8bn dividend and still throws off a ~AED 8.9bn surplus, while committed liquidity of AED 16.2bn (conservative) to AED 38.7bn (broad) sits on top; even assuming zero operating cash for a year, committed liquidity funds all non-discretionary obligations for ~33 months. Debt service is **already-in-hand**, not FCF-dependent: free cash alone covers the next-12-month maturities 3.2x and the Sukuk 3 bullet 4.4x, with no reliance on refinancing. The single biggest liquidity risk is not a shortfall but **composition and cyclicality** — the FCF surplus and the broad cash figure both lean partly on cyclical tailwinds (the ~AED 8.3bn/yr homebuyer-advance build and a part-restricted AED 22.5bn short-term-investment line the company does not fully quantify); if the Dubai off-plan cycle turns and advances fade, the surplus narrows and the AED 8.8bn dividend becomes the pressure point — but debt service itself stays covered by in-hand cash regardless.
