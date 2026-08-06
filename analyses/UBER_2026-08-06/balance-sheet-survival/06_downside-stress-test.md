# Downside Stress Test — UBER

**Reporting currency:** USD (millions unless stated). **Reporting standard:** US GAAP, fiscal year end Dec-31. **Period base:** LTM ended Jun-30-2026 unless stated. **Source-pool caveat (carried from `00`–`05`):** no primary SEC filing (10-K/10-Q) is physically present in `data/UBER/`; every balance-sheet, debt, and covenant figure below is Capital IQ's vendor transcription of Uber's FY2025 10-K (filed 2026-02-13) and Q2 FY2026 results (released 2026-08-05), cited as "CIQ export," never as "10-K." **No maintenance covenant is disclosed anywhere in the pool** — per `04_coverage-and-covenants.md`, all covenant thresholds used below are **labeled assumptions** calibrated to Uber's S&P BBB+ credit profile, and every breach point derived from them is **indicative, not a filed fact**.

**EBITDA basis used:** two bases are carried throughout, exactly as `01`/`04` present them — **Reported/GAAP-based EBITDA** (Operating Income + D&A, LTM = $7,474mm) and **Adjusted EBITDA** (company-defined, non-GAAP, LTM = $10,043mm). Both are **cash-backed**: `earnings/06_earnings-quality.md` §2 shows CFO has exceeded Adjusted EBITDA every year since FY2023 (115.7% in FY2025, 103.8% LTM), so neither EBITDA base is inflated relative to cash generation — this report does not need to discount either series for cash-quality reasons. GAAP-based EBITDA is used as the primary haircut base (the more conservative of the two, and the one that does not carry a large non-cash stock-based-compensation add-back), with Adjusted EBITDA shown in parallel throughout, per module convention.

## 0. Pending Acquisition — Pro-Forma Trigger (mandatory check)

Uber signed a Business Combination Agreement (2026-07-16) to buy the remaining ~63.21% of Delivery Hero SE for **€8.4bn cash** (€41.50/share; implied 100%-equity value €12.9bn / $14.8bn, per the deal's own stated dual-currency equivalent), financed by a **committed bridge facility of ~€14bn**. The deal is signed but **not closed** (offer expected H2 2027; termination fees €700mm Uber / €200mm Delivery Hero) [`01_capital-structure-and-leverage.md` §1, citing `UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf` deal-summary text]. This is a material, near-certain pending acquisition not yet reflected in the reported balance sheet, so **Section 3 below builds a pro-forma overlay in addition to the disclosed-balance-sheet stress**, per the module's pending-acquisition rule.

**FX used throughout this report:** the deal's own stated dual-currency equivalent, €12.9bn = $14.8bn → implied rate **1.14729 USD/EUR**, applied consistently to every euro figure below (per CLAUDE.md §27 — use the filing's own stated equivalent rather than an independently sourced rate).

**Already-reflected vs. pending:** ~$4,000mm of open-market Delivery Hero share purchases in Q2 FY2026 are **already inside** the current $9,861mm net debt (strict) figure [`01_capital-structure-and-leverage.md` §1, §6] — not added again here. What is **not yet reflected** is the cash consideration for the remaining ~63.21% stake (€8.4bn ≈ **$9,638mm**) and the possibility that the full €14bn bridge facility (≈**$16,062mm**) is drawn to also cover Delivery Hero's own debt refinancing, fees, and buffer.

**Perimeter-matching caveat (Inference, not from filings):** Delivery Hero's own EBITDA and consolidating net debt are **not disclosed anywhere in this pool** — no target financials are present. Per the module's matching rule, this report does **not** add Delivery Hero's own debt to the numerator without its EBITDA in the denominator, and vice versa. The pro-forma below therefore adds only **Uber's own acquisition-financing debt** (the cash consideration, funded by the bridge) to net debt, while holding the EBITDA base at **Uber's own EBITDA only**. This is a labeled, partial pro-forma — it excludes Delivery Hero's own balance sheet and earnings entirely, in both directions, rather than guessing either. The likely direction of the omission: Delivery Hero almost certainly carries its own net debt (it is a public company with its own bond stack), so a **fully combined** pro-forma would show even less headroom than the figures below, not more.

## 1. Base Case (today, disclosed balance sheet — no pro-forma)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (GAAP-based, cash-backed) | $7,474mm (LTM Jun-30-2026) | `01_capital-structure-and-leverage.md` §5, §7 |
| Base EBITDA (Adjusted, company-defined, cash-backed) | $10,043mm (LTM Jun-30-2026) | `01_capital-structure-and-leverage.md` §5, §7 |
| Net debt (strict, §15 basis — CANONICAL, per `01`) | $9,861mm | `01_capital-structure-and-leverage.md` §4, §7 |
| Net debt / EBITDA (GAAP / Adj.) | 1.32x / 0.98x | `01_capital-structure-and-leverage.md` §5 |
| EBITDA / interest (GAAP / Adj., gross interest $462mm) | 16.18x / 21.74x | `04_coverage-and-covenants.md` §1 |
| Tightest covenant + threshold (labeled assumption, Not filed) | Max net leverage ≤3.5x (typical large-cap IG unsecured revolver) | `04_coverage-and-covenants.md` §2, §3 |
| Next-12m obligations | $2,945mm ($2,175mm maturities + $462mm cash interest + $308mm maintenance capex + $0 committed returns) | `03_liquidity-runway.md` §2 |
| Committed liquidity | $10,059mm (cash $4,870mm + ST investments $521mm + undrawn committed revolver $4,668mm) | `03_liquidity-runway.md` §1 |
| Floating-rate debt (gross, drawn) | $0 — 100% of drawn debt is fixed-rate; $4,668mm revolver + $2,000mm commercial paper are floating-if-drawn, currently $0 drawn | `02_maturity-wall-and-refinancing.md` §3 |
| Hedge coverage | Not disclosed in the pool | `02_maturity-wall-and-refinancing.md` §3 |
| Working-capital seasonality / peak build | Mild: Q1 revenue share ~22–24% vs. a flat 25% split; no dollar peak-cash-use figure disclosed | `03_liquidity-runway.md` §3 |

**Reporting currency: USD. EBITDA basis: both GAAP-based and Adjusted (company-defined), each labeled at every use, per `01`/`04` convention.**

## 2. Stress Scenarios — Disclosed Balance Sheet (no pro-forma overlay)

Net debt held at the current $9,861mm (strict) throughout this table — the pro-forma overlay in Section 3 is where the pending acquisition is modeled. FCF pass-through assumption: **stressed FCF(h) ≈ FCF_base − (1 − tax) × GAAP EBITDA_base × h**, holding cash interest and maintenance capex fixed inside the FCF walk, with a labeled **10% effective cash-tax-rate** assumption (Inference, not from filings — conservative relative to Uber's actual FY2025 cash-tax/Adj.-EBITDA ratio of ~4%, reflecting Uber's ~$31.4bn NOL carryforward shield per `earnings/06_earnings-quality.md` §10). Adjusted EBITDA is stressed by subtracting the **same dollar decline** as GAAP EBITDA (its addbacks, chiefly $1,939mm of non-cash stock-based compensation, do not shrink mechanically with an operating downturn).

Executed solve (Python):
```
GAAP_EBITDA(h) = 7474*(1-h);  Adj_EBITDA(h) = 10043 - 7474*h
ND/EBITDA(h)   = 9861 / EBITDA(h)
EBITDA/Int(h)  = EBITDA(h) / 462
Headroom(h)    = (3.5 - ND/EBITDA(h)) / 3.5      [MAX covenant, direction-aware]
FCF(h)         = 10116 - 0.90 * 7474 * h          [10% tax assumption]
12m gap(h)     = 2945 - (10059 + FCF(h))          [negative = surplus]
```

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA (GAAP) | 7,474 | 5,232 | 4,484 | 2,990 | 4,484 | 4,484 |
| EBITDA (Adj.) | 10,043 | 7,801 | 7,053 | 5,559 | 7,053 | 7,053 |
| Net debt / EBITDA (GAAP) | 1.32x | 1.89x | 2.20x | 3.30x | 2.20x | 2.20x (n/a — see note) |
| Net debt / EBITDA (Adj.) | 0.98x | 1.26x | 1.40x | 1.77x | 1.40x | 1.40x (n/a — see note) |
| EBITDA / interest (GAAP) | 16.18x | 11.32x | 9.71x | 6.47x | 9.71x | 9.71x |
| EBITDA / interest (Adj.) | 21.74x | 16.88x | 15.27x | 12.03x | 15.27x | 15.27x |
| Tightest covenant headroom (GAAP / assumed 3.5x max leverage) | +62.3% | +46.1% | +37.2% | **+5.8%** | +37.2% | +37.2% |
| Tightest covenant headroom (Adj.) | +71.9% | +63.9% | +60.1% | +49.3% | +60.1% | +60.1% |
| Covenant breach? (Y/N, GAAP / Adj.) | N / N | N / N | N / N | N / N | N / N | N / N |
| 12-month liquidity gap (uses − sources; negative = surplus) | −17,230 | −15,212 | −14,539 | −13,194 | **−13,849** | −14,539 (n/a — see note) |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

**WC shock (labeled assumption, not disclosed):** 5% of a single quarter's LTM revenue ($55,227mm/4 × 5% ≈ **$690mm**), calibrated to the ~2-point gap between Uber's softest quarter's revenue share (~23%) and a flat 25% split noted in `03_liquidity-runway.md` §3 (no dollar seasonal-build figure is disclosed). Added only to the 12-month uses bucket (does not move EBITDA/leverage/coverage). At −40% EBITDA + this shock, 12-month uses rise to $3,635mm against $17,484mm of sources (liquidity + stressed FCF) — still a **$13,849mm surplus**, not a gap.

**Rate shock (+200bp on floating debt): not applicable / not computable on the disclosed balance sheet.** 100% of drawn debt is fixed-rate and $0 is drawn on the floating-rate revolver or commercial-paper program [`02_maturity-wall-and-refinancing.md` §3] — a +200bp move reprices nothing currently outstanding, and the liquidity surplus at −40% EBITDA (§ above) is large enough that no revolver draw is needed to fund the stress. The columns above show "n/a" flags for that reason; the leverage/coverage/liquidity figures in that column are identical to the plain −40% column because no floating exposure exists to shock. **The real forward rate exposure is the pending Delivery Hero bridge facility (Section 3)** — bridge facilities are conventionally floating-rate, and that exposure does not exist on today's balance sheet.

## 3. Pro-Forma Overlay — Post–Delivery Hero Close

Two illustrative net-debt add-ons (Section 0): **(A) consideration-only** — the disclosed €8.4bn (≈$9,638mm) cash price for the remaining stake, financed by the bridge — pro-forma net debt **$19,498mm**; **(B) full-bridge draw (illustrative upper bound)** — the entire committed €14bn facility (≈$16,062mm) drawn, which 04's own illustrative note suggests may be sized to also cover Delivery Hero's own debt refinancing and fees — pro-forma net debt **$25,923mm**. Both use **Uber's own EBITDA only** in the denominator (Delivery Hero's own EBITDA is not in this pool — Section 0 caveat); both leverage readings are therefore best read as a **floor on true combined leverage**, not a ceiling.

**Leverage shown on both peak/latest and mid-cycle EBITDA** (mid-cycle = FY2023–FY2025 3-year average, GAAP $3,927mm / Adj. $6,422mm, per `01_capital-structure-and-leverage.md` §5 — labeled a scaling-stage floor-check, not a clean cyclical trough, per `01`'s own caveat):

| Basis | Net debt | GAAP EBITDA (peak/latest) | Leverage (peak) | GAAP EBITDA (mid-cycle) | Leverage (mid-cycle) | Adj. EBITDA (peak) | Leverage (peak, Adj.) | Adj. EBITDA (mid-cycle) | Leverage (mid-cycle, Adj.) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Current (actual, no deal) | 9,861 | 7,474 | 1.32x | 3,927 | 2.51x | 10,043 | 0.98x | 6,422 | 1.54x |
| Pro-forma (A) consideration-only | 19,498 | 7,474 | **2.61x** | 3,927 | **4.97x** | 10,043 | 1.94x | 6,422 | **3.04x** |
| Pro-forma (B) full-bridge (illustrative) | 25,923 | 7,474 | **3.47x** | 3,927 | **6.60x** | 10,043 | 2.58x | 6,422 | **4.04x** |

**Read:** on today's actual EBITDA, the deal looks tolerable (2.6x–3.5x GAAP-EBITDA leverage). On a mid-cycle EBITDA base — the more conservative, through-cycle view the module's cyclicality rule requires — pro-forma leverage runs **5.0x–6.6x on a GAAP basis**, well past where an investment-grade issuer typically sits, even before Delivery Hero's own (undisclosed) net debt is added.

### Pro-forma stress (haircuts applied to Uber's own EBITDA; net debt held at each pro-forma level)

| Scenario | h=0% | h=30% | h=40% | h=60% |
|---|---:|---:|---:|---:|
| **(A) Consideration-only, ND/EBITDA (GAAP)** | 2.61x (headroom +25.5%, N) | 3.73x (headroom **−6.5%, Y**) | 4.35x (headroom −24.2%, Y) | 6.52x (headroom −86.3%, Y) |
| **(A) Consideration-only, ND/EBITDA (Adj.)** | 1.94x (headroom +44.5%, N) | 2.50x (+28.6%, N) | 2.76x (+21.0%, N) | 3.51x (**−0.2%, Y**) |
| **(B) Full-bridge, ND/EBITDA (GAAP)** | 3.47x (headroom **+0.9%, N**) | 4.95x (−41.6%, Y) | 5.78x (−65.2%, Y) | 8.67x (−147.7%, Y) |
| **(B) Full-bridge, ND/EBITDA (Adj.)** | 2.58x (+26.3%, N) | 3.32x (+5.1%, N) | 3.68x (**−5.0%, Y**) | 4.66x (−33.2%, Y) |

Breach flags use the same assumed 3.5x max-leverage covenant as Section 2 — **applied here only as an illustrative anchor; the bridge facility's own covenant package is not disclosed anywhere in this pool** [`04_coverage-and-covenants.md` §2]. Coverage (EBITDA/interest) is checked separately below and is **not** the binding constraint in most cells — using a labeled 6.0% assumed bridge-facility interest rate (Inference, not from filings), pro-forma interest rises to $1,040mm (A) / $1,426mm (B); coverage stays above the assumed 3.0x floor through −40% EBITDA in every pro-forma case and only dips below it (2.87x A / 2.10x B) at the −60% haircut — by which point the leverage covenant has already breached at a much shallower decline in every pro-forma scenario. **Leverage, not coverage, is the binding constraint once the deal closes.**

**Rate shock on the pro-forma overlay (illustrative, labeled):** a +200bp move on the DH-related debt (bridge facilities are conventionally floating-rate, unlike Uber's existing 100%-fixed bond stack) would add **~$193mm/yr** (consideration-only, $9,638mm × 2%) to **~$321mm/yr** (full-bridge, $16,062mm × 2%) of incremental interest — real money, but not large enough on its own to move the EBITDA/interest coverage figures above the assumed 3.0x floor at any haircut level shown; leverage remains the binding constraint even with this shock layered on.

**Timing caveat:** the deal is not expected to close until H2 2027 — over a year from this report's date — so this pro-forma overlay does not apply to the disclosed 12-month liquidity runway in Section 2, which covers obligations already on the books today. It is the medium-term structural risk this stress test is required to surface, not an imminent 12-month liquidity event.

## 4. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches (current balance sheet, GAAP EBITDA basis) | **62.3%** |
| Tightest covenant breaches (current balance sheet, Adj. EBITDA basis) | **71.9%** |
| Tightest covenant breaches (pro-forma A, consideration-only, GAAP basis) | **25.5%** |
| Tightest covenant breaches (pro-forma B, full-bridge, GAAP basis) | **0.9%** |
| Committed liquidity exhausted within 12 months (current balance sheet) | **Not reached on an EBITDA decline alone (h ≥ 1)** |
| Net leverage exceeds 6.0x (illustrative refi-market / IG-to-HY crossover threshold), current balance sheet, GAAP basis | **78.0%** |
| Net leverage exceeds 6.0x, pro-forma A (consideration-only), GAAP basis | **56.5%** |
| Net leverage exceeds 6.0x, pro-forma B (full-bridge), GAAP basis | **42.2%** |

**Show the solve (direction-aware, MAX/ceiling form, per `04`'s own covenant type):**

- **Covenant breach, current balance sheet:** `h = 1 − net debt ÷ (T · EBITDA)`. GAAP: `h = 1 − 9,861 ÷ (3.5 × 7,474) = 1 − 0.377 = 62.3%`. Adj.: `h = 1 − 9,861 ÷ (3.5 × 10,043) = 1 − 0.280 = 71.9%`. Both reconcile exactly to `04_coverage-and-covenants.md` §3's own indicative figure (62.3%), a cross-check pass.
- **Covenant breach, pro-forma A:** `h = 1 − 19,498 ÷ (3.5 × 7,474) = 25.5%` (GAAP); `h = 1 − 19,498 ÷ (3.5 × 10,043) = 44.5%` (Adj.).
- **Covenant breach, pro-forma B:** `h = 1 − 25,923 ÷ (3.5 × 7,474) = 0.9%` (GAAP) — i.e., on a full bridge draw and unchanged EBITDA, the illustrative 3.5x threshold is **already essentially reached** (0.9% of headroom); `h = 1 − 25,923 ÷ (3.5 × 10,043) = 26.3%` (Adj.).
- **Liquidity exhaustion, current balance sheet:** solve `liquidity + FCF_base − (1−tax)×GAAP_EBITDA×h = obligations_12m` for `h`: `h = (10,059 + 10,116 − 2,945) ÷ (0.90 × 7,474) = 17,230 ÷ 6,726.6 = 2.56`. Since `h ≥ 1`, **liquidity does not exhaust on an EBITDA decline alone** — even a complete (100%) EBITDA wipeout still leaves stressed FCF of $3,389mm plus $10,059mm of liquidity ($13,448mm) against $2,945mm of 12-month obligations. This is not a spurious figure; it reflects genuinely deep committed liquidity plus a large cash buffer relative to a small near-term wall (14.8% of debt due within 12 months, per `02`).
- **Net-leverage-threshold (6.0x) rows:** same MAX form with `T = 6.0`. Current: `h = 1 − 9,861 ÷ (6.0 × 7,474) = 78.0%`. Pro-forma A: `h = 1 − 19,498 ÷ (6.0 × 7,474) = 56.5%`. Pro-forma B: `h = 1 − 25,923 ÷ (6.0 × 7,474) = 42.2%`.

## 5. Survival Read

On the balance sheet as reported today, Uber is a fortress case: net leverage is 1.32x (GAAP EBITDA) / 0.98x (Adjusted EBITDA), the assumed 3.5x max-leverage covenant does not breach until a **62–72% EBITDA decline** — deeper than any downturn in Uber's own disclosed history (FY2021 group Adjusted EBITDA was actually negative, −$774mm, but that trough happened at a far smaller revenue and cash-liquidity base than today's; the pool does not carry a group-level FY2020 dollar figure to build a second, cleaner trough-to-peak calibration, and `business-model/10_external-dependency.md` scores Uber 42/100 for external dependence, "partly externally driven," not a flagged "deep cyclical/commodity" name, so the module's mandatory history-calibration is applied here only as this qualitative FY2021 reference rather than a forced ratio column that would require dividing by a negative EBITDA) — and committed liquidity ($10,059mm) plus LTM free cash flow ($10,116mm, cash-backed per `earnings/06`) never comes close to exhausting under any EBITDA haircut modeled: even a full (100%) EBITDA wipeout leaves a liquidity-plus-FCF surplus over 12-month obligations. A working-capital shock and a floating-rate shock (the latter not applicable — 0% of drawn debt is floating) do not change that conclusion. **Market closure test:** assuming no new unsecured issuance for 12 months, cash ($4,870mm) plus the committed, undrawn revolver ($4,668mm, availability known) alone cover the $2,175mm within-12-month wall more than 4x over, before any FCF is counted [`02_maturity-wall-and-refinancing.md` §5] — liquidity holds, and nothing breaks.

**That verdict changes once the pending Delivery Hero acquisition is priced in.** The €8.4bn (~$9,638mm) cash consideration for the remaining 63.21% stake, financed by a committed bridge facility, would on its own push net leverage to 2.6x on today's GAAP EBITDA and to **4.97x on Uber's own mid-cycle EBITDA** — and if the full €14bn (~$16,062mm) bridge is drawn (plausible if it is also sized to refinance Delivery Hero's own debt), pro-forma leverage on a mid-cycle base runs to **6.6x**, before Delivery Hero's own EBITDA or debt (neither disclosed in this pool) is added on either side of the ledger. Under that pro-forma overlay, the same assumed 3.5x covenant would need only a **25.5% EBITDA decline** (consideration-only case) — or almost no decline at all, **0.9%**, in the full-bridge case — to breach; a normal recession-scale −30% to −40% EBITDA decline **would breach it** in three of the four consideration-only/full-bridge, GAAP/Adjusted combinations modeled in Section 3. Because the shortfall would be a leverage-covenant breach rather than a cash shortage (liquidity and FCF remain ample even in the pro-forma case, per Section 3's coverage check), what the company would need is not an equity raise or distressed asset sale but a **covenant waiver or amendment from the bridge lenders**, an accelerated pay-down (e.g., from the $10bn+ of annual FCF or a partial sale of the ~$3.8bn AV-partner equity-method stakes already on the balance sheet), or delaying/reducing the buyback program that management has already throttled once, in Q2 2026, to fund the pre-deal stake purchase [`01_capital-structure-and-leverage.md` §6].

Uber is **not net cash** on the strict basis today (net debt $9,861mm positive) — the strongest survival category (net cash as strategic optionality) does not apply. Read plainly: the company survives a 30–40% EBITDA decline comfortably **as currently constituted**, with wide covenant and liquidity margin; it does **not** clearly survive the same decline **once the Delivery Hero deal closes and the bridge is drawn**, at least not without lender accommodation on a covenant that — to be explicit — is itself only a labeled, unfiled assumption (no covenant package for the bridge is disclosed anywhere in this pool), so the precise breach point is indicative, not a filed fact. The single biggest thing to break, and the first thing to break, is a leverage covenant on the pro-forma structure — not liquidity, which stays deep throughout every scenario modeled here.
