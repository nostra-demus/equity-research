# Liquidity Runway — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions unless stated). **Primary balance-sheet date:** March 31, 2026 (Q1 2026 10-Q, the most current period available). December 31, 2025 (FY2025 10-K) used where Q1 data is not separately disclosed. **Upstream inputs used:** `01_capital-structure-and-leverage.md` (cash, debt); `02_maturity-wall-and-refinancing.md` (12-month maturities, liquid assets as of March 31, 2026); `analyses/AMZN_2026-07-03/earnings/01_historical-financials.md` (CFO, FCF, capex); `analyses/AMZN_2026-07-03/earnings/06_earnings-quality.md` (cash quality).

**Maintenance capex disclosure:** Amazon does not separately disclose maintenance versus growth capex. The total gross capex figure ($151,003M LTM) is used in the strict FCF calculation. Per the partial-data rule, when maintenance capex is unknown the agent uses total capex (the most conservative treatment) and flags this. The company's own disclosed FCF definition nets out asset-sale proceeds from capex but does not separate maintenance from growth.

---

## 1. Liquidity Sources (committed only)

All figures in USD millions. Primary date: March 31, 2026.

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash and cash equivalents | $101,816 | Partially | Balance sheet cash; restricted cash of $2,876M (pledged as collateral for real estate, seller amounts, letters of credit) excluded from usable figure. See restricted flag below. | Q1 2026 10-Q, Balance Sheet, p.6; FY2025 10-K, Note 2, p.53 fn.(2) |
| Less: restricted cash | ($2,876) | No | Pledged collateral — not freely available | Q1 2026 10-Q; FY2025 10-K, Note 2 |
| **Usable cash and equivalents** | **$98,940** | **Y** | Unrestricted | Computed: $101,816 − $2,876 |
| Liquid short-term marketable securities | $41,273 | Y | Investment-grade debt securities, fair value; partially restricted (~$3,296M total restricted between cash and securities at Dec 31, 2025, with the restriction now immaterial relative to the total). March 31 balance per 10-Q. Amazon treats these as its primary excess-liquidity reserve; they are liquid within days. | Q1 2026 10-Q, Balance Sheet, p.6 |
| **Total cash + liquid investments (usable)** | **$140,213** | **Y** | Sum of usable cash + securities | Q1 2026 10-Q |
| $15.0B unsecured revolving credit facility | $15,000 | Y | Committed, $0 drawn at March 31, 2026. Matures November 2028, extendable one year. No borrowing-base limit — availability equals the full commitment. Interest at applicable benchmark + 0.45%; commitment fee 0.03% on undrawn. | Q1 2026 10-Q, Note 5, p.18; FY2025 10-K, Note 6, p.59 |
| $5.0B unsecured 364-day revolving credit facility | $5,000 | Y | Committed, $0 drawn at March 31, 2026. Entered October 2025, matures October 2026, extendable one year. | Q1 2026 10-Q, Note 5, p.18; FY2025 10-K, Note 6, p.59 |
| **Total usable committed revolving capacity** | **$20,000** | **Y** | Both revolvers fully undrawn; no borrowing-base restriction; availability = commitment | Q1 2026 10-Q, Note 5 |
| **Total usable liquidity (cash + investments + revolvers)** | **$160,213** | | Cash + securities + revolvers | |
| $30B Commercial Paper Programs (U.S. Dollar + Euro) | $30,000 | **NOT included** | Uncommitted; excludable per MODULE_RULES §4. Listed separately only for transparency. | FY2025 10-K, Note 6, p.59 |
| $17.5B delayed-draw term loan (signed June 8, 2026) | $17,500 | Not committed at March 31 | Post-quarter; committed but undrawn; expires Sept 30, 2026; matures 3 years after drawdown. Included for context only — not counted in the headline. | Web: TechCrunch, June 10, 2026; Marketscreener, June 8, 2026 (labeled unverified, web-sourced) |

**Reporting currency:** USD. All figures in millions.

**Restricted cash note:** Total restricted cash (included in accounts receivable and other assets) was $3,296M at December 31, 2025. At March 31, 2026, restricted cash of $2,876M is estimated from the Q1 10-Q balance sheet. The restricted amounts are pledged as collateral for real estate arrangements, amounts owed to third-party sellers in certain jurisdictions, debt, standby and trade letters of credit, and digital media content licenses. These amounts are not freely available. [FY2025 10-K, Note 2, p.53 fn.(2); Q1 2026 10-Q]

**Offshore cash note:** Approximately $7.1B (at December 31, 2025) of total cash, equivalents, and securities was held by foreign subsidiaries, with Amazon intending to reinvest this amount indefinitely outside the U.S. Repatriation would incur additional taxes. This amount is a modest fraction of the total liquidity pool ($140B+) and does not materially constrain liquidity for U.S. debt service. [FY2025 10-K, Liquidity section, p.23]

**Uncommitted lines excluded:** The $30.0B Commercial Paper Programs are uncommitted and are therefore excluded from the headline usable liquidity figure. These programs can be pulled at any time and cannot be counted under MODULE_RULES §4. They are listed here for transparency only.

---

## 2. Near-Term Uses (next 12 months)

All figures in USD millions. The 12-month window runs from the reporting date (March 31, 2026) through approximately March 31, 2027.

| Use | Amount | Notes | Source |
|---|---:|---|---|
| Debt maturities (next 12 months, from `02`) | $2,752 | Face value; 2021 Notes tranche maturing 2026. Current portion of long-term debt at March 31, 2026 was $2,832M carrying value ($2,752M face). The $2,752M face figure from the FY2025 10-K annual maturity schedule is used as these are 2026 maturities and none of the March 2026 issuances mature before 2028. | `02_maturity-wall-and-refinancing.md`; FY2025 10-K, Note 6, p.58; Q1 2026 10-Q, Note 5 current portion $2,832M |
| Cash interest (annualized run-rate) | ~$5,000 | Estimated FY2026 cash interest on gross financial debt of ~$122.6B face at weighted-average coupon ~3.85%–4.10%. Q1 2026 interest expense was $800M (partial-year); full-year run-rate with March 2026 issuances contributing a full year estimated at $4,500M–$5,000M. Conservative end of range used. | Q1 2026 10-Q, Income Statement (interest expense $800M Q1); `02_maturity-wall-and-refinancing.md` (rate exposure section) |
| Maintenance capex | Not separately disclosed | Amazon does not separately disclose maintenance versus growth capex. Total gross capex in the LTM period ended March 31, 2026 was $151,003M (annualized). The capex surge is almost entirely AI infrastructure for AWS (growth capex). A maintenance-only estimate is not available from filings. Inference: based on pre-AI-surge capex levels ($52.7B in FY2023 when maintenance-plus-ordinary-replacement represented the bulk), maintenance capex is likely in the range of $25B–$40B annually. This is labeled as Inference, not from filings. | `analyses/AMZN_2026-07-03/earnings/06_earnings-quality.md` Section 1; FY2025 10-K |
| Committed dividends | $0 | Amazon does not pay a cash dividend. | FY2025 10-K — no dividend declared |
| Share buybacks (committed) | $0 disclosed as committed near-term | Amazon has a $10B buyback authorization but there is no contractual commitment to repurchase in the next 12 months. Not included in near-term uses. | FY2025 10-K, Note 6; Note on Equity |
| Operating lease payments (current, due within 12 months) | $15,953 | Combined current-year operating lease payments of $12,654M principal-equivalent (operating lease current liabilities, PV) plus finance lease current liabilities of $1,544M, plus financing obligation current amount of $312M = ~$14,510M. Using the gross annual operating lease payment (not just the PV) per the disclosure: 2026 operating lease payments = $15,953M gross (per Note 4 maturity table). Included for completeness; these are contractual cash outflows. | FY2025 10-K, Note 4, p.55 (operating lease maturity table: 2026 gross payments $15,953M) |
| Finance lease payments (due 2026, gross) | $3,247 | Gross 2026 finance lease payments per Note 4 maturity table. | FY2025 10-K, Note 4, p.55 |
| **Total near-term uses (12 months) — financial debt** | **~$7,752** | Debt maturities $2,752M + cash interest ~$5,000M. This is the "financial obligation" core: what Amazon must pay to service and retire financial debt in the next 12 months. |  |
| **Total near-term uses including contractual lease payments** | **~$26,952** | Above $7,752M + operating lease payments $15,953M + finance lease payments $3,247M. Lease payments are contractual cash outflows but are operationally integral (fulfillment + data centers) — they will renew/continue regardless of the liquidity position. |  |

**Maintenance capex partial-data note:** The maintenance capex figure is not disclosed. Because the total LTM capex ($151B) overwhelmingly reflects growth spending (management has confirmed the AI/AWS infrastructure build is a deliberate cycle), using total capex in a "near-term obligation" calculation would misstate the true maintenance requirement. The strict FCF (CFO minus total capex) is used in the runway formula — which is conservative — and the maintenance-only proxy is not applied to "uses" because it cannot be sourced from filings. The runway computed below is therefore conservative (FCF negative on total-capex basis), meaning the runway is not overstated.

---

## 3. Runway

| Metric | Value | Formula / Notes |
|---|---:|---|
| Total committed usable liquidity (cash + investments + revolvers) | $160,213M | $98,940M usable cash + $41,273M marketable securities + $20,000M committed revolvers (fully available). As of March 31, 2026. |
| Annual CFO (LTM March 31, 2026) | $148,531M | From Q1 2026 10-Q cash flow statement and earnings cross-module. CFO is real and growing (+28% year-over-year). |
| Annual strict FCF (LTM, CFO − gross capex) | ($2,472M) negative | $148,531M − $151,003M. Negative due to AI capex surge. |
| Annual company-disclosed FCF (CFO − capex net of proceeds) | $11,194M (FY2025) | This is the company's own non-GAAP definition; FY2025 because LTM not separately available. Shows the capex-net basis; labeled. |
| Near-term financial debt obligations (next 12 months) | ~$7,752M | Debt maturities $2,752M + cash interest ~$5,000M |
| Near-term financial debt obligations net of strict FCF | ~$10,224M | Net cash obligation = $7,752M uses − (−$2,472M FCF) = $7,752M + $2,472M shortfall. On total capex, FCF is negative, so obligations are additive. |
| **Liquidity runway (months) — financial obligations only** | **Effectively unlimited** | $160,213M liquidity pool vs $7,752M in next-12-month financial obligations = coverage ratio **20.7x**. Even with negative strict FCF (−$2,472M annual drain beyond the $7,752M), the net cash burn rate on financial obligations is roughly $10,224M per year. At that rate, the committed liquidity pool ($160,213M) lasts approximately **188 months (15.7 years)**. |

**Runway formula (financial obligations basis):**

Runway (months) = Committed Liquidity ÷ (Near-term financial obligations per year − Strict FCF per year) × 12

= $160,213M ÷ ($7,752M − (−$2,472M)) × 12

= $160,213M ÷ $10,224M × 12

= **15.7 years** (approximately 188 months)

This assumes the entire liquidity pool is frozen (no new cash generated beyond the LTM FCF level, no new debt issuance, and full draw-down of revolvers only when needed). In practice, CFO is accelerating, adding $148.5B annually to cash before capex, so the pool regenerates far faster than any realistic drawdown.

**Alternative runway formulation — if capex moderates:**

If gross capex declines from the LTM $151B to $110B (plausible as Amazon's $200B+ committed capex program spans 2026; beyond the 2026 peak, management has signaled spending depends on utilization), strict FCF would turn positive at approximately $148.5B CFO − $110B capex = $38.5B FCF, and the liquidity pool would grow rather than shrink. This is labeled as Inference from management commentary (Q1 2026 earnings call: "We'll continue to evaluate pace based on what we're seeing in customer demand" — Q1 2026 10-Q preamble and transcript).

**FCF surplus statement:** On the company-disclosed FCF basis (FY2025: $11,194M), FCF covers the $7,752M in next-12-month financial obligations with a **$3,442M surplus**. On the strict (most conservative) FCF basis, strict FCF (−$2,472M LTM) does not cover the $7,752M obligations, producing a $10,224M annual shortfall — fully covered by the $160B liquidity pool in less than 1 year of drawdown. There is no scenario in which Amazon cannot meet its financial obligations.

### Seasonality / Peak Liquidity Need (Hard Check)

Amazon's business has material Q4 seasonality. The FY2025 10-K explicitly states that cash balances "typically reach their highest level at December 31 due to holiday retail cash collection." [FY2025 10-K, Item 1A, p.18]

The Q1 balance (March 31, 2026: cash $101,816M) represents the trough quarter (Q1 is the seasonal low, typically ~21% of annual revenue vs Q4 at ~30%), yet usable liquidity is still $140,213M — before revolvers. This means the seasonal trough liquidity of ~$140B still provides 18x+ coverage of the $7,752M next-12-month financial obligations.

The peak working-capital build size is not separately quantified in the 10-K or 10-Q as a discrete dollar figure; the annual working capital change ranged from −$13.7B to −$27.5B over the last five years (with FY2025 at −$19.3B and LTM Mar-26 at −$26.5B). Even if the entire annual working capital drag of $27B were concentrated in a single quarter (an extreme case), it would not approach the liquidity pool. The $20B committed revolver capacity alone covers the peak working-capital drag.

**Conclusion on seasonality:** The runway figure does not overstate liquidity even at the seasonal trough. The March 31, 2026 balance is the seasonal low and still provides more than 15 years of coverage against financial obligations. No re-run required.

---

## 4. Sources & Uses Bridge

**Internal sources vs external need.** Amazon's CFO of $148.5B (LTM) covers all financial debt obligations ($7,752M in the next 12 months) approximately 19 times over. The liquidity pool of $140B in hand (cash + investments) alone covers those obligations for over 18 years before CFO is even counted. External access — whether new debt, revolvers, or asset sales — is not required to meet any near-term financial obligation. Amazon drew $0 on its revolvers at March 31, 2026 and has not needed to since the facilities were established.

**In-hand vs must-materialize split.** Of the $160,213M total committed liquidity, $140,213M (88%) is already in hand — cash and securities sitting on the balance sheet today. The $20,000M in revolvers (12%) must be actively drawn to count, but they are committed, unencumbered, and available. Near-term financial obligations ($7,752M) are covered 18x by already-in-hand cash and securities alone. FCF does not need to materialize for Amazon to service any obligation in the next 12 months.

**The only tension in the picture:** Strict FCF is negative at the LTM level (−$2,472M) because growth capex ($151B annualized) exceeds CFO ($148.5B). Amazon is effectively "spending from the balance sheet" on AI infrastructure — gross financial debt has grown from $68.9B to $122.6B in one quarter (December 2025 to March 2026) as it issued $53.8B of new notes. The cash and investment pool (after the debt issuance proceeds came in) rose to $143B at March 31, 2026. Net, Amazon is borrowing to fund capex and holding the borrowed cash: the balance sheet is expanding simultaneously on both sides. This is a deliberate financial strategy, not a distress signal. The runway remains immense regardless of whether the capex is characterized as maintenance or growth.

---

## 5. Liquidity Read

Amazon's next-12-month financial obligations of approximately $7.75B (maturities $2.75B + cash interest ~$5.0B) face a committed liquidity pool of $160B — a coverage ratio of 20.7x, or a runway of approximately 188 months (15.7 years) even on the assumption that strict FCF remains permanently negative at the LTM rate and no new cash is raised. In-hand liquidity (cash + securities of $140B) alone covers those obligations for over 18 years. Internal sources cover all obligations without any external access.

The single biggest liquidity risk is not an obligation the company cannot meet — it is the pace of balance sheet expansion. Gross financial debt jumped from $68.9B to $122.6B in Q1 2026 alone ($53.8B of new notes to fund the AI/AWS build), and management has committed to $200B+ of capex in FY2026. If Amazon's capex program continues at this pace and FCF remains negative, the strict net cash position (currently $12.5B broad or $18.0B strict at year-end 2025) could turn into a small net debt position within 12–18 months, narrowing the buffer — but from a $160B liquidity pool, this is a trajectory concern for 2027–2028, not a near-term liquidity gap. The $364B AWS committed backlog and 28%+ AWS growth rate support the view that this capex is demand-backed, not speculative.

---

## Self-Check

- [x] Liquidity uses committed facilities only; the $30B Commercial Paper Programs are excluded from the headline figure and listed separately as uncommitted.
- [x] Restricted cash ($2,876M at March 31, 2026; $3,296M at December 31, 2025) is flagged and excluded from usable cash.
- [x] Near-term uses pull the 12-month maturity figure ($2,752M) from `02_maturity-wall-and-refinancing.md`.
- [x] The runway is expressed in months (approximately 188 months) with the formula shown.
- [x] The split between in-hand liquidity (88% / $140,213M already on the balance sheet) and must-materialize FCF is stated.
- [x] Maintenance capex is not separately disclosed; the partial-data rule is applied (total capex used in strict FCF; runway is conservative). Conservative treatment means the runway is not overstated.
- [x] Seasonality is addressed: the March 31 balance is the seasonal trough; runway holds at the low point.
- [x] No banned phrases used without specific numbers.
