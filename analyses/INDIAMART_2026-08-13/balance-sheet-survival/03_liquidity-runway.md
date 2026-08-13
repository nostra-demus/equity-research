# Liquidity Runway — INDIAMART

**Reporting currency: INR (₹ millions), consolidated, Ind AS. Fiscal year ends 31 March.** Figures below use the latest disclosed balance sheet (30-Jun-2026, Q1 FY27) as the liquidity base and the FY26 Annual Report's lease-maturity note (carried forward from `02_maturity-wall-and-refinancing.md`) for the next-12-month debt use. No `ciq_facts.json` sidecar exists for this pool run; all figures are this agent's own sourced read, cross-checked against `01` and `02`.

**Reconciliation flag, stated up front (material — flagged, not silently absorbed):** `01_capital-structure-and-leverage.md` §6 attributes the FY26-end-to-30-Jun-2026 cash decline (₹804.13mn → ₹368.11mn) to the FY26 dividend (₹60/share, final ₹30 + special ₹30, ~₹3.6bn) having been "paid out of the narrow cash-and-equivalents bucket" during that quarter. The Q1 FY27 Interim Report's own notes contradict this: as at 30-Jun-2026, "Other payable" jumped from ₹8.92mn to ₹3,245.59mn, explicitly because it "includes unclaimed dividend of INR 0.48 (31 March 2026: INR 0.48) and **unpaid dividend of INR 3,236.66 for FY 25-26 paid subsequent to quarter end**" [`IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf`, Note 15(b) — Other financial liabilities]. This is confirmed independently by the Key Developments log: the dividend's record/ex-date was 19-Jun-2026 but its **payment date was 29-Jul-2026** [`IndiaMART-InterMESH-Limited-NSEI-INDIAMART-Key-Developments.txt`, entries dated 2026-04-30 and 2026-06-29] — i.e. the dividend was still unpaid at the 30-Jun-2026 balance-sheet date and was paid roughly four weeks **after** it, not during the Apr–Jun quarter. The quarter's cash decline is better explained by the ₹3,140.42mn rotation into the Trading Asset Securities book (₹30,294.05mn → ₹33,434.47mn over the same quarter, per `01` §3) than by the dividend. This module carries the corrected reading forward: **the FY26 dividend was unpaid liquidity at 30-Jun-2026 and left the company on 29-Jul-2026 — before today (13-Aug-2026) but after the last balance sheet in the pool.** That means the pool's most recent balance sheet overstates *today's* effective liquidity by the dividend amount; Section 1 adjusts for this explicitly, sourced to the interim filing's own note, not inferred.

---

## 1. Liquidity Sources (committed only)

| Source | Amount (30-Jun-2026) | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | ₹368.11mn | Y | No restriction on this line itself. A separate "earmarked balances with banks" note (unclaimed dividend ₹0.48mn + EBT-trust balance ₹2.73mn + lien deposit ₹0.09mn ≈ ₹3.30mn at FY26-end) sits outside this line, immaterial (~0.9% of this line, ~0.01% of total liquidity) | [`01_capital-structure-and-leverage.md` §3; FY26 Annual Report (Ind AS), Note 11] |
| Liquid short-term investments (bank deposits >3 months) | ₹84.00mn | Y | No restriction disclosed | [`01_capital-structure-and-leverage.md` §3; Capital IQ export, Balance Sheet tab] |
| Trading Asset Securities (treasury book: short-duration mutual funds, bonds, ETFs, AIF units, funded by the customer-prepayment float) | ₹33,434.47mn | Y, with one caveat | Composition is not broken out by sub-instrument in the pool; AIF (Alternative Investment Fund) units can carry lock-in periods that the filing does not separately quantify — treated as usable because the book is disclosed as a whole as short-duration, but this sub-component is flagged, not assumed instantly liquid | [`01_capital-structure-and-leverage.md` §3; FY26 Annual Report, Note 8 — Investments] |
| Revolver / facilities (commitment) | ₹0 — **no facility of any kind exists** | N/A | This is a confirmed fact (zero bank borrowings, zero revolver, zero term loans in every period FY22–LTM Jun-2026, "Total Debt Issued" = nil), not an "availability unknown" gap — the MODULE_RULES exclusion for undisclosed-availability revolvers does not apply here because there is no revolver to exclude | [`01_capital-structure-and-leverage.md` §1] |
| Revolver availability (if disclosed) | N/A | N/A | No facility exists | — |
| **Total usable liquidity (as reported, 30-Jun-2026)** | **₹33,886.58mn** | | | [`01_capital-structure-and-leverage.md` §3, matches CIQ "Total Cash & ST Investments"] |
| **Less: FY26 dividend paid subsequent to quarter-end (already-executed cash outflow, not yet reflected above)** | **−₹3,236.66mn** | | Recorded as an unpaid current liability ("Other payable") at 30-Jun-2026; actually paid 29-Jul-2026 — i.e. before today (13-Aug-2026) but after the last balance sheet in the pool | [`IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf`, Note 15(b); Key Developments log, 2026-04-30 / 2026-06-29 entries] |
| **Effective total usable liquidity, adjusted to today (13-Aug-2026)** | **≈ ₹30,649.92mn** | | This is the figure used for the runway calculation below | Calc. |

Restricted cash: the ₹3.30mn earmarked-balance note (FY26-end) is immaterial and is not netted out of the cash line above; it is flagged per MODULE_RULES Rule 3, not silently absorbed. No offshore/trapped-cash disclosure exists beyond this note [`01_capital-structure-and-leverage.md` §3]. Reporting currency: INR millions throughout.

---

## 2. Near-Term Uses (next 12 months, 13-Aug-2026 to 13-Aug-2027)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from `02`) | ₹117.38mn (undiscounted lease payments due within 12 months of the FY26 Annual Report's Note 15(a) maturity table) | [`02_maturity-wall-and-refinancing.md` §1] |
| Cash interest | Embedded within the lease-payment figure above — Note 15(a)'s undiscounted schedule already includes both principal and the ~₹27mn/year of interest cost on the lease book; adding it again here would double-count (`02` §1's own reconciliation confirms the ₹27.49mn gap between the undiscounted total and the discounted balance-sheet liability is exactly this embedded interest) | [`02_maturity-wall-and-refinancing.md` §1, reconciliation footnote] |
| Maintenance capex | ₹41.30mn (LTM total capex, 4 quarters ended 30-Jun-2026 — the company does not disclose a maintenance-vs-growth capex split, so the full LTM figure is used) | [`earnings/01_historical-financials.md` §2] |
| Committed dividends / buybacks | ₹0 — no dividend or buyback has been declared or committed for the next 12 months as of the data-pool cutoff. (The FY26 final+special dividend, ~₹3.24bn net, is not a forward obligation — it was already paid on 29-Jul-2026, before today; see Section 1 adjustment.) | [`IndiaMART-InterMESH-Limited-NSEI-INDIAMART-Key-Developments.txt`; `business-model/11_capital-allocation-governance.md`] |
| **Total near-term uses (gross, excl. double-counted interest)** | **₹158.68mn** | Calc. (117.38 + 41.30 + 0) |

---

## 3. Runway

| Metric | Value |
|---|---:|
| Total effective committed liquidity (adjusted to today) | ₹30,649.92mn |
| Annual FCF (LTM, 4 quarters ended 30-Jun-2026) | ₹6,925.56mn [`earnings/01_historical-financials.md` §2] |
| Basis used | **Net-of-FCF** — FCF is strong, positive, and cash-backed: CFO has exceeded EBITDA every year for 5 straight years (121%–182%) with no cash-conversion red flags [`earnings/06_earnings-quality.md` §2, §7] |
| Annual net cash burn = (12-month debt maturities + committed dividends) − FCF | (₹117.38mn + ₹0) − ₹6,925.56mn = **−₹6,808.18mn** (i.e. an annual **surplus**, not a burn) |
| Monthly net cash burn (annual ÷ 12) | **−₹567.35mn/month** (i.e. a monthly surplus of ~₹567mn) |
| **Liquidity runway** | **No finite runway — FCF alone covers 12-month obligations ~59x over. Annual FCF surplus ≈ ₹6.81bn (~₹567mn/month).** |

Formula shown per MODULE_RULES §8 (net-of-FCF basis): monthly net burn = [(12-month debt maturities + committed dividends/buybacks) − FCF] ÷ 12. Cash interest and maintenance capex are deliberately **not** re-added — FCF (= CFO − total capex) already carries both, so adding them would double-count and understate the true runway.

**Liquidity-only coverage (informational, not the runway itself):** effective liquidity (₹30,649.92mn) ÷ the one real near-term use (₹117.38mn of lease payments) ≈ **261x** — i.e. cash and liquid investments alone, before touching a rupee of operating cash flow, would fund the entire next-12-month obligation about 261 times over.

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital is **not materially seasonal**: `earnings/01_historical-financials.md` §5 finds only a 2–3 percentage-point spread in quarterly revenue share across FY24–FY26 (Q1 smallest at ~23.7–23.9% of the year, Q4 largest at ~25.6–26.3%), which does not clear the module's >30%/<20% seasonality-flag threshold. More importantly, operating working capital is **structurally negative** (−₹12,916.52mn at FY26-end, per `earnings/01_historical-financials.md` §1 fn.4) because customers prepay annual subscriptions upfront — working-capital movements are a net cash **source**, not a use, in this business. There is no disclosed seasonal peak cash need to re-run the runway against.

---

## 4. Sources & Uses Bridge

Internal sources cover the next 12 months many times over without any need for external access — no refinancing, no asset sale, no drawdown of any kind is required, because there is no facility to draw and no market debt to roll (`02_maturity-wall-and-refinancing.md` §4–5). Even on the deliberately conservative gross-obligations view (ignoring all FCF), effective liquidity of ₹30,649.92mn covers the full ₹158.68mn of disclosed near-term uses roughly 193x; on the net-of-FCF basis actually used above, LTM free cash flow alone (₹6,925.56mn) exceeds those obligations ~59x before the balance sheet is touched at all. Essentially none of this runway depends on FCF "holding up" in any marginal sense — FCF would have to collapse by well over 98% before the company needed to draw on its ₹30.65bn of liquid assets to meet its ₹117.38mn of contracted near-term obligations, and even a full FCF collapse to zero would still leave liquidity covering the obligation ~261x.

---

## 5. Liquidity Read

IndiaMART has no finite liquidity runway worth reporting: it generates an annual free-cash-flow surplus of roughly ₹6.81bn (~₹567mn/month) after covering its only material near-term obligation — ₹117.38mn of undiscounted lease payments due within 12 months — and holds ₹30.65bn of effective liquidity today (after netting the dividend paid 29-Jul-2026) against that same ₹117.38mn obligation, a coverage ratio of about 261x even before FCF is counted. This conclusion rests almost entirely on liquidity already in hand, not on FCF materializing — a full stop in operating cash generation would still leave the company able to fund its lease book roughly 261 times over. The single liquidity-relevant risk worth naming is not a funding gap but a capital-allocation question: with no debt to service and a growing pile of idle liquid assets, the real variable going forward is how much of that pile management chooses to distribute (dividends/buybacks, `business-model/11_capital-allocation-governance.md`) or deploy into further minority-stake acquisitions (a recurring, individually small but serial pattern per the same module), not whether the company can pay what it owes.
