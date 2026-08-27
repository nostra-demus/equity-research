# Liquidity Runway — KAR

Karoon Energy Ltd (ASX: KAR) reports under IFRS (AASB) in **US dollars** (the company's stated functional and presentation currency, despite its AUD-denominated ASX listing and AUD dividends) [`01_capital-structure-and-leverage.md` §0]. All figures below are USD unless labeled otherwise. This agent reuses the canonical debt stack, net debt, and cash figures from `01_capital-structure-and-leverage.md` and the next-12-month maturity figure from `02_maturity-wall-and-refinancing.md`. No `ciq_facts.json` sidecar exists for this run; the cash-flow and near-term obligation figures below are read from the FY2025 Annual Report, cross-checked against `earnings/01_historical-financials.md` and `earnings/06_earnings-quality.md`, and updated against the most recent quarterly disclosure (2Q26 Activities Report, 22-Jul-2026, unaudited).

**Two anchor dates are used deliberately.** The canonical, audited balance-sheet anchor is **31-Dec-2025** (FY2025 Annual Report), consistent with `01` and `02`. But `01` §6 and `02` §4 both flag that net debt has risen materially since then — cash fell from $206.1m to $80.3m and net debt rose from $132.7m to $269.7m over the six months to 30-Jun-2026, driven by a heavy capital programme, not new borrowing. Per MODULE_RULES.md §7 ("assume the more fragile reading when data is thin"), this report computes the runway on BOTH the audited FY2025 anchor and the more current, unaudited 30-Jun-2026 snapshot, and treats the latter as the more conservative, decision-relevant figure.

## 1. Liquidity Sources (committed only)

### FY2025 audited anchor (31-Dec-2025)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $206.1m | Y | No restricted or trapped cash disclosed anywhere in the FY2025 Annual Report notes read for this report | FY2025 Annual Report, Consolidated Statement of Financial Position, p.79 |
| Liquid short-term investments | $0 | N/A | None disclosed separately from cash & equivalents | Karoon Energy Ltd ASX KAR Financials.xls, Balance Sheet tab |
| Revolver / facility (RBL) — commitment | $340.0m, undrawn | Maybe | Secured, borrowing-base Reserves Based Lending facility; do NOT count the headline commitment alone as liquidity — see availability row | FY2025 Annual Report, Note 17 Borrowings, p.106 |
| Revolver availability (disclosed) | $340.0m at 31-Dec-2025 | Y | Availability = full commitment at this date; the semi-annual borrowing-base step-down schedule had not yet started (first step-down effective 31-Mar-2026) | `02_maturity-wall-and-refinancing.md` §4; FY2025 Annual Report, Note 17 |
| **Total usable liquidity (FY2025 anchor)** | **$546.1m** | | $206.1m cash + $340.0m RBL availability | Derived |

No uncommitted credit lines are disclosed anywhere in the data pool for this ticker.

### Current, unaudited snapshot (30-Jun-2026, most recent quarterly disclosure)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $80.3m | Y | No restriction disclosed in the quarterly update | 2Q26 Activities Report (Jul-22-2026), p.5, "Cash, Liquidity and Cash Flows" table |
| Revolver / facility (RBL) — commitment | $340.0m (original), now amortised | Maybe | Same facility as above; the borrowing-base step-down has now started | Same |
| Revolver availability (disclosed) | $283.3m at 30-Jun-2026, stepping to **$226.7m on 30-Sep-2026** under the semi-annual redetermination / straight-amortising schedule | Y | Company discloses this line item as "Undrawn available facilities" — actual availability, not headline commitment; satisfies the module's "revolvers are not liquidity unless availability is known" rule | 2Q26 Activities Report (Jul-22-2026), p.5 |
| **Total usable liquidity (current, unaudited)** | **$363.6m** | | $80.3m cash + $283.3m RBL availability. This ties exactly to the company's own disclosed "Total liquidity" line — the cleanest available cross-check | 2Q26 Activities Report (Jul-22-2026), p.5 |
| **Total usable liquidity (current, post-step-down, conservative)** | **$307.0m** | | $80.3m cash + $226.7m RBL availability effective 30-Sep-2026 — this agent's own forward substitution, labeled *Inference, not from filings*: assumes cash is unchanged between 30-Jun-2026 and the step-down date | Derived from the same source |

Reporting currency for every figure above is USD. No liquid short-term investments beyond cash are disclosed at either date. The RBL is secured against the Baúna/Patola and Who Dat operating assets and guaranteed by Group members comprising ≥90% of EBITDAX and ≥90% of total assets [`01` §6A] — it is a real, asset-backed committed facility, not an unsecured line that could be pulled at will, but its available amount is mechanically shrinking on a disclosed schedule independent of Karoon's own credit performance.

## 2. Near-Term Uses (next 12 months)

Basis: FY2025 audited actuals (steady-state run-rate), cross-checked against CY26 company guidance where available.

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from `02`, next 12 months from the 31-Dec-2025 anchor) | $0.7m (finance lease, current portion) | `02_maturity-wall-and-refinancing.md` §1 |
| Cash interest (gross finance costs paid, FY2025 actual) | $66.3m | `earnings/06_earnings-quality.md` §1 (EBITDA→CFO→FCF bridge); cross-check: CY26 company guidance "Finance costs and interest, net of interest income" $60–70m, midpoint $65m — consistent [2Q26 Activities Report, p.7] |
| Maintenance capex (FY2025 actual, filing-disclosed split: "Payments for oil and gas assets," sustaining Baúna/Who Dat production) | $57.9m | `earnings/06_earnings-quality.md` §1 |
| Committed dividends / buybacks | $26.9m (dividends only — see note) | See note below |
| **Total near-term uses** | **$151.8m** | Sum of the four rows above |

**Dividend/buyback note (qualifier carried explicitly):** Karoon has no fixed-dollar dividend contractually "committed" for the next 12 months — the board pays 20–40% of underlying NPAT semi-annually under a stated policy, not a guaranteed cash amount [`business-model/11_capital-allocation-governance.md` §1]. The $26.9m used above is the most recent declared combined interim + final FY2025 dividend, used as a policy-consistent proxy for the forward 12 months (FY2026's dividend has not yet been declared in this data pool) — labeled *Inference, not from filings*. The board has also stated it "continues to view buybacks as an attractive near-term use of capital" and intends to continue an on-market buyback (recent run-rate: $4.0m in 2Q26 alone; ~$97m cumulative since the programme began in 2H24) [2Q26 Activities Report, p.5], but no fixed forward-12-month buyback dollar amount is committed or disclosed — it is excluded from the headline "committed" total and shown here only as a memo item: at the recent $4.0m/quarter run-rate, buybacks would add roughly **$16m/year** of discretionary (cuttable) cash use on top of the $151.8m total above. Because both the dividend and the buyback are board-discretionary and could be reduced in a downside, treating them at their recent run-rate is the conservative (not the flattering) choice for this table.

**Maintenance-capex caveat:** FY2025's $57.9m maintenance-capex figure is this report's cleanest filing-sourced base case, but CY26 guidance discloses a much larger, largely front-loaded sustaining-capital programme this specific year — the Baúna flotel revitalisation and FPSO integrity work alone is guided at $49–53m (of which $46.5m was already spent in 1H26), on top of $178–202m of guided CY26 investment capex [2Q26 Activities Report, p.7]. 85% of the year's budgeted capex was already spent by 30-Jun-2026, and management explicitly guides to "lower capital expenditure" and "higher free cash flow" in 2H26 [2Q26 Activities Report, p.2] — so the FY2025 steady-state $57.9m figure likely understates the capital actually deployed in the 12 months trailing today, but overstates what remains to be spent in the 12 months forward from today. This cuts both ways and is not adjusted for in the headline total above; it is flagged as a source of imprecision, not corrected mechanically.

## 3. Runway

Basis chosen: **Gross-obligations.** FY2025 reported FCF was **negative $37.1m** (CFO $251.4m − total capex $288.5m) [`earnings/01_historical-financials.md` §1], and the trailing six months to 30-Jun-2026 show continued heavy cash burn (net debt roughly doubled, cash fell 61%, driven by capex) [`01_capital-structure-and-leverage.md` §6]. Per MODULE_RULES.md §8, FCF this negative/volatile is treated as unreliable, so this report does **not** net FCF against obligations — it uses the full gross 12-month uses bucket instead, which is the more conservative of the two allowed bases. (Context, not part of the calculation: `earnings/06_earnings-quality.md` finds FY2025's reported FCF was fully explained by an itemised, one-off $202.6m M&A/settlement outflow — the FPSO buyout and the Petrobras contingent-consideration payment — and that *normalised operating FCF* was actually +$165.5m. If that normalised figure holds going forward, obligations would be more than internally funded and the true runway would be materially longer than computed below; this is upside context, not the headline number, because the reported, not normalised, cash outcome is what actually left the bank.)

| Metric | FY2025 audited anchor | Current (30-Jun-2026, unaudited) — company's own liquidity figure | Current, post-step-down (conservative) |
|---|---:|---:|---:|
| Total committed liquidity | $546.1m | $363.6m | $307.0m |
| Annual FCF (or proxy) | Negative $37.1m — NOT netted (gross-obligations basis) | Same | Same |
| Basis used | Gross-obligations | Gross-obligations | Gross-obligations |
| Annual net cash burn (12-month uses, §2) | $151.8m | $151.8m | $151.8m |
| Monthly net cash burn (annual ÷ 12) | $12.65m | $12.65m | $12.65m |
| Coverage multiple (liquidity ÷ annual burn) | 3.60x | 2.40x | 2.02x |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **≈43.2 months** | **≈28.7 months** | **≈24.3 months** |

Formula: runway (months) = total committed liquidity ÷ [ (12-month debt maturities + cash interest + maintenance capex + committed dividends) ÷ 12 ]. On every basis tested — the audited FY2025 anchor, the current unaudited snapshot, and the conservative post-step-down snapshot that assumes the RBL has already amortised to $226.7m — the runway clears 24 months, well beyond the 12-month window this metric is meant to test. The gap between the FY2025 anchor (43.2 months) and the current snapshot (24.3–28.7 months) is driven entirely by the post-year-end fall in cash and RBL availability documented in `01` and `02`, not by any change in the near-term obligations themselves.

### Seasonality / Peak Liquidity Need (Hard Check)

`earnings/01_historical-financials.md` §5 finds no material calendar seasonality provable from this data pool: Karoon reports half-yearly, not quarterly, full financials, and the swings observed (FYE-convention change, the FPSO buyout, realised-price moves) are company-specific events, not a recurring seasonal working-capital pattern. `earnings/06_earnings-quality.md` §3 does flag a company-specific, cargo-lifting-timing effect (crude-oil inventory on the FPSO rose 126.8% FY24→FY25, reflecting "one less cargo in the period" at year-end) — this is a single-cargo timing effect in a single-FPSO, cargo-based sales model, not a seasonal working-capital build. **Peak working-capital need is not disclosed** in the data pool beyond this cargo-timing note — the runway above may be marginally overstated in any single quarter where a cargo lifting slips past a period-end, but the effect (one cargo, roughly $90–125m of revenue per Baúna cargo per the 2Q26 Activities Report's own realised-price table) is small relative to the 24+ month runway calculated above and does not change the conclusion.

## 4. Sources & Uses Bridge

On the current, most conservative snapshot, in-hand liquidity ($307.0m–$363.6m, cash plus the RBL's actual disclosed availability) covers the next 12 months of obligations ($151.8m) roughly 2.0x–2.4x over — internal sources alone, with no FCF assumed to materialise and no external market access required, clear the next 12 months comfortably. Because this report deliberately used the gross-obligations basis (FCF not netted), **100% of the calculated runway sits in already-in-hand or already-committed liquidity — cash on the balance sheet plus a secured, asset-backed RBL with disclosed current availability — not in FCF that still has to show up.** If FY2025's normalised operating FCF (+$165.5m, ex one-off M&A) recurs, it would be additive to this runway rather than a load-bearing assumption within it; if it does not recur, the runway calculated above is unaffected because FCF was never counted as a source.

## 5. Liquidity Read

Karoon's liquidity runway is **at least 24 months** against its near-term obligations even on the most conservative, most current data point in the pool (the 30-Jun-2026 unaudited snapshot, using the RBL's post-step-down $226.7m availability rather than today's $283.3m) — and roughly 43 months on the audited FY2025 anchor. The runway rests entirely on cash already on the balance sheet ($80.3m at 30-Jun-2026) plus a secured, asset-backed, borrowing-base RBL whose current and near-term availability is a matter of public disclosure, not on FCF that has to materialise: FY2025 reported FCF was negative and this report deliberately did not net any forecast recovery against obligations. The single biggest liquidity risk is not the 12-month window this metric tests but the **trajectory feeding it**: cash fell from $206.1m to $80.3m and net debt rose from $132.7m to $269.7m in just six months on heavy, largely self-funded capital spending (Baúna flotel revitalisation, SPS-92 and A1 sidetrack work), and the RBL's own availability is on a disclosed, mechanical amortisation schedule ($340.0m → $283.3m → $226.7m by 30-Sep-2026, continuing toward its 30-Sep-2028 maturity) that shrinks regardless of Karoon's credit quality — if the current heavy-capex, cash-burning trajectory continued for another 12–18 months rather than reverting to the company's own guided "higher 2H26 free cash flow," the runway would compress from the ~24–43 months calculated here toward the 12-month line this metric exists to flag.

