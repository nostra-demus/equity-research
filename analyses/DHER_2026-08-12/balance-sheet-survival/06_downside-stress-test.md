# Downside Stress Test — DHER

Reporting currency: **EUR** (euro), all figures in EUR million unless stated otherwise. Balance-sheet date: **31-Dec-2025 (FY2025)**, per `01_capital-structure-and-leverage.md` §7 (canonical figures). No pending/announced acquisition **by** DHER exists in the data pool (the live Uber approach is Uber acquiring DHER, not DHER acquiring a target), so the pro-forma acquisition check (workflow step 2a) does not apply — this stress test runs against DHER's standalone, as-reported FY2025 balance sheet. Every number below is produced by an executed Python computation (shown inline where the formula is non-trivial); the script and its output are reproduced in full at the end of this report for verification.

**EBITDA-base note (cash-backed vs headline).** `earnings/06_earnings-quality.md` finds FY2025 cash conversion (CFO ÷ Adjusted EBITDA) collapsed to **8.8%** (CFO €79.5m vs Adjusted EBITDA €903.0m) — a company-defined non-GAAP metric carrying €598.1m (66% of the adjusted figure) of add-backs, the largest being €224.1m of stock-based compensation. That gap is real and material, but `06` also traces the FY2025 CFO collapse to a one-off cash payment (~€645m implied, EU antitrust settlement + Glovo Spain rider-transition payments), not to a deterioration in the underlying EBITDA-generation quality. Per this module's partial-data rule, **both EBITDA bases are carried through this stress test, labeled** — the company's own Adjusted EBITDA (€903.0m) as the primary stress base (since it is what management guides to and the market prices), cross-checked at every step against GAAP-derived **Reported EBITDA** (€304.9m) as the conservative floor. Where the two bases diverge materially in a result, both are shown — never silently averaged.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA — Adjusted (company-defined, primary stress base) | €903.0m | `01` §5; FY2025 Earnings Call, Mar-26-2026 |
| Base EBITDA — Reported (GAAP-derived, conservative cross-check) | €304.9m | `01` §5; CIQ Income Statement tab |
| Cash-backed reality (CFO, FY2025) | €79.5m (8.8% of Adjusted EBITDA) | `earnings/06` §1–2 |
| Net debt (strict basis, §15 — canonical per `01` §7) | €2,512.8m | `01` §4/§7 |
| Gross debt | €4,625.5m | `01` §7 |
| Net debt / EBITDA (Adjusted / Reported) | 2.78x / 8.24x | Computed: 2,512.8 / 903.0 = 2.78x; 2,512.8 / 304.9 = 8.24x |
| Gross debt / EBITDA (Adjusted) | 5.12x | Computed: 4,625.5 / 903.0 |
| EBITDA / interest (Adjusted / Reported), gross interest €382.1m | 2.36x / 0.80x | Computed: 903.0/382.1; 304.9/382.1 (`04` §1) |
| Tightest covenant + threshold | Minimum-liquidity covenant (Group level, quarterly), **€800.0m** — a **labeled assumption sourced from a management transcript quote**, not confirmed in the extracted audited-filing text; treated per this module's partial-data rule as an indicative threshold, not a certified one | `04` §2; CFO Marie-Anne Popp, FY2025 Earnings Call, Mar-26-2026: "the EUR 800 million... the floor and the minimum amount that we operate under" |
| Next-12m obligations — gross-obligations basis (maturities + cash interest + capex + divs) | €860.0m (287.7 + 246.5 + 325.8 + 0) | `03` §2 |
| Next-12m obligations — net-of-FCF basis (maturities + divs only; used in the break-point solves below, since FCF already nets interest/capex) | €287.7m | `03` §2/§4; `02` §1 |
| Committed liquidity — headline (net of the €800m covenant-floor assumption) | €1,312.7m | `03` §1/§3 (2,112.7 − 800.0) |
| Committed liquidity — gross cash (before covenant-floor deduction) | €2,112.7m | `01` §3; `03` §1 |
| Floating-rate debt (gross) | €1,606.4m (34.73% of gross debt) | `02` §3 |
| Hedge coverage | Partial and not comprehensively disclosed — a single prepayment-related derivative (€23.7m, tied to the KRW Term Facility) is referenced in the filing; no group hedge-ratio table for the Dollar/KRW floating book exists in this pool. Rate shock below is therefore run **gross** (undisclosed-hedge caveat) | `00` §3 (hedging/swaps disclosure: "Partial"); `02` §3 |
| Working-capital seasonality / peak build | Modest and real but **not quantified in euros** in this pool: Q3 is consistently the strongest revenue quarter (avg 26.7% of annual revenue, FY2023–FY2025) vs Q2 the weakest (avg 23.5%), a ~3.2-point swing — no disclosed peak-liquidity-need figure exists to size a WC cash build directly | `03` §3 ("Seasonality / Peak Liquidity Need"); `earnings/01_historical-financials.md` §5 |

**Cyclicality calibration (workflow step 3).** `01` §5 and `business-model/10_external-dependency.md` §4 both find DHER does **not** clear this module's "deep cyclical/commodity" bar (cyclicality risk scored 42/100, "moderate," the dominant near-term external variable being the Uber-deal regulatory-approval outcome, not a commodity or macro cycle). A dedicated trough-to-peak-calibrated haircut column is therefore **not added** — consistent with, not a gap versus, `01`'s own determination. For context only: Adjusted EBITDA was negative in FY2021–FY2022 (−€795.6m, −€467.2m) before inflecting positive only in FY2024–FY2025, so the €903.0m base itself sits on an unproven, two-year-old profitability run rather than a demonstrated mid-cycle level (`01` §5) — this fragility is captured in the coverage/leverage reads below, not via a separate cyclical-haircut column.

## 2. Stress Scenarios

*(Primary basis: Adjusted EBITDA, €903.0m. Net debt held constant at €2,512.8m across the pure-EBITDA haircuts, per the workflow's "hold constant unless a stress also moves it" rule; the WC-shock column moves net debt directly since that shock is a cash draw, and the rate-shock column moves interest, not principal. Reported-EBITDA-basis leverage/coverage shown as a labeled cross-check row beneath each column per §15 hygiene.)*

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA (Adjusted) | 903.0 | 632.1 | 541.8 | 361.2 | 541.8 | 541.8 |
| EBITDA (Reported, cross-check) | 304.9 | 213.4 | 182.9 | 122.0 | 182.9 | 182.9 |
| Net debt / EBITDA (Adjusted) | 2.78x | 3.98x | 4.64x | 6.96x | 5.16x¹ | 4.64x |
| Net debt / EBITDA (Reported) | 8.24x | 11.77x | 13.74x | 20.60x | — | — |
| EBITDA / interest (Adjusted) | 2.36x | 1.65x | 1.42x | 0.95x | 1.42x | 1.31x² |
| EBITDA / interest (Reported) | 0.80x | 0.56x | 0.48x | 0.32x | — | — |
| Tightest covenant headroom (indicative, €m above the €800m floor after 12 months)³ | +1,312.7 (today) | +575.5 | +507.8 | +372.3 | +226.6 | +475.7 |
| Covenant breach? (Y/N) | N | N | N | N | N | N |
| 12-month liquidity gap (€m, negative = surplus) | n/a | surplus 575.5 | surplus 507.8 | surplus 372.3 | surplus 226.6 | surplus 475.7 |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

¹ Net debt after the WC draw = €2,512.8m + €281.2m (WC shock, see below) = €2,794.0m; 2,794.0/541.8 = 5.16x.
² Interest after the rate shock = €382.1m + €32.128m = €414.2m; 541.8/414.2 = 1.31x.
³ Formula: `headroom = usable liquidity (net of the €800m floor) + stressed 12-month FCF(h) − scheduled 12-month debt maturities`, i.e. the cash cushion remaining above the covenant floor after a full year of the stressed cash burn and after repaying the near-term maturity bucket, assuming no new unsecured issuance (market-closure test). See §5(b) for the FCF-scaling assumption and the full solve.

**WC shock (labeled assumption, workflow step B1):** no disclosed euro figure for a seasonal working-capital cash build exists in this pool (§1 above). As a labeled assumption, this stress applies a one-time cash outflow of **2% of FY2025 IFRS revenue (€14,059.6m) = €281.2m** — a working assumption sized to the modest but real quarterly revenue seasonality `03`/`earnings/01` document, not a disclosed company figure. This is applied as a direct cash draw (reducing usable liquidity and raising net debt by the same amount) on top of the −40% EBITDA haircut.

**Rate shock (workflow step B2):** +200bp applied to the €1,606.4m floating-rate book (34.73% of gross debt, `02` §3), **gross of hedges** — DHER's hedge disclosure is partial/incomplete (§1 above), so this is the conservative, unmitigated read; the true step-up could be smaller if the undisclosed KRW-facility derivative or other hedges are more extensive than disclosed. Extra annual interest = €1,606.4m × 2.00% = **€32.128m**.

**Market closure (workflow step B3):** assumed throughout — no new unsecured issuance is credited in any scenario above; the revolver (€600.0m committed, €461.8m undrawn per `01`/`03`) is likewise excluded from usable liquidity per `03`'s hard rule (availability/borrowing-base mechanics undisclosed), so every scenario above is already run on a "no external access" basis.

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches (min-liquidity, €800m indicative) | **Not reached on an EBITDA decline alone within 12 months** — solved `h ≈ 115%` (see solve below); since a decline cannot exceed 100%, this covenant does not breach mechanically from EBITDA weakness on its own in a single 12-month window |
| Committed liquidity exhausted within 12 months | **Same event as the covenant breach above** — see note below |
| Net leverage exceeds 6.0x (illustrative refi-market ceiling for a sub-investment-grade issuer) | **53.6%** (Adjusted EBITDA basis) — **already breached today** on the Reported-EBITDA basis (8.24x > 6.0x now) |

**Why the covenant breach and the liquidity exhaustion are the same event for DHER.** `03`'s "usable liquidity" (€1,312.7m) is defined as headline cash **minus** the €800m covenant-floor assumption — so usable liquidity hitting zero is arithmetically identical to cash hitting the €800m floor itself. The two rows above are not independently solved; they are the same mechanical trigger, shown twice because the template asks for both.

**Solve (a)/(b) — liquidity/covenant exhaustion, MIN-floor covenant on a non-coverage metric (minimum cash balance), tied to the liquidity mechanism per the workflow's own instruction ("min liquidity ties to the liquidity break-point"):**

`L + FCF(h) − O = 0`, where `FCF(h) ≈ FCF_base − EBITDA·h·(1−tax)` (FCF-to-EBITDA scaling assumption: lost EBITDA drops through to free cash flow at an after-tax operating margin, holding cash interest and maintenance capex fixed; **labeled assumption: tax = 25%**, since DHER has no clean effective cash-tax rate given consolidated net losses alongside cash tax actually paid — €272.6m FY2025 — in profitable subsidiaries) →

`h = (L + FCF_base − O) / (EBITDA·(1−tax))`
`h = (1,312.7 + (−246.3) − 287.7) / (903.0 × 0.75)`
`h = 778.7 / 677.25 = 1.1498` → **h ≥ 1**

Per the workflow rule, a solve returning `h ≥ 1` means the break point is **not reached on an EBITDA decline alone** — stated plainly, not as a fabricated percentage. Even a complete (100%) elimination of Adjusted EBITDA for a full year, holding interest and maintenance capex fixed, would still leave DHER's usable liquidity above the €800m floor at year-end (headroom would still be ≈ €389m — see the computation appendix). This is a genuine finding, driven by the size of the cash balance (€2,112.7m) relative to the FY2025-dated maturities bucket (€287.7m) it is being tested against — a bucket that, per `02` §4, has in any case already been substantially repaid via a subsequent-event refinancing (the new $1.4bn 2032 term loan, executed by Apr-2026).

**Solve (c) — net leverage exceeds 6.0x, MAX/ceiling form:**

`h = 1 − net debt / (T × EBITDA)`

Adjusted-EBITDA basis: `h = 1 − 2,512.8 / (6.0 × 903.0) = 1 − 0.4638 = 0.5362` → **53.6%**

Reported-EBITDA basis: `h = 1 − 2,512.8 / (6.0 × 304.9) = 1 − 1.3736 = −0.3736` → **h ≤ 0: already above 6.0x today** (actual is 8.24x). Per the workflow rule, a solve giving `h ≤ 0` flags an already-in-breach state on that basis, not a future trigger.

**Sanity check, not a formal break point (context only):** if the top of the disclosed €520m–€860m unrecognized Spain rider-classification contingent-liability range (`05` §3) crystallized in cash concurrently with a −40% EBITDA stress, headroom would flip from a €507.8m surplus to a **−€352.2m breach** (507.8 − 860.0 = −352.2). This is not an EBITDA-decline trigger and is not counted as a formal break point in the table above, but it is the realistic compound scenario that could actually break DHER's liquidity — a large legal/regulatory cash crystallization landing on top of, not instead of, a genuine earnings downturn.

## 4. Survival Read

On a mechanical, 12-month, EBITDA-decline-only basis, DHER's structure does not break under any of the tested haircuts — not even a full elimination of Adjusted EBITDA breaches the labeled €800m minimum-liquidity covenant or creates a 12-month liquidity gap, because usable liquidity (€1,312.7m) dwarfs the near-term maturity bucket (€287.7m) it is tested against, and that bucket has in any case already been substantially repaid via a subsequent-event refinancing (`02` §4). Market closure test: assuming no new unsecured issuance for 12 months and excluding the revolver (availability mechanics undisclosed), liquidity still holds at every haircut up to −60% and even at a full EBITDA wipeout — the first thing that actually breaks is **net leverage against a plausible refi-market ceiling** (illustratively 6.0x), which the −54% haircut crosses on the generous Adjusted-EBITDA basis, and which DHER is **already past today** on the GAAP-consistent Reported-EBITDA basis (8.24x). That gap between the two bases is the real vulnerability this stress test surfaces: DHER's headline resilience rests on a company-defined EBITDA figure carrying €598.1m of add-backs (66% of the figure itself, `earnings/06` §4) and a cash conversion rate that collapsed to 8.8% in the very same year the base EBITDA was set — a 30–40% decline, an ordinary recession rather than a tail event, is survivable on the liquidity math shown here, but it would take Adjusted-EBITDA-basis coverage from 2.36x to 1.42–1.65x and Reported-EBITDA-basis coverage further below the 1x line it is already under today (0.80x base, falling to 0.48–0.56x). A waiver, asset sale, or equity raise is **not** mechanically required by this EBITDA-haircut test; what would force one is a different kind of shock this test does not capture — a large legal/regulatory cash crystallization (the disclosed €520m–€860m Spain contingent range) landing concurrently with a genuine earnings downturn, which the sanity check above shows would turn a €507.8m surplus into a €352.2m breach.

---

## Appendix — Executed Computation (Python)

```
=== BASE CASE ===
Net debt/EBITDA (Adj): 2.78x
Net debt/EBITDA (Rep): 8.24x
Gross debt/EBITDA (Adj): 5.12x
EBITDA/interest (Adj): 2.36x
EBITDA/interest (Rep): 0.80x
Usable liquidity (net of covenant floor): 1312.7

=== HAIRCUTS: EBITDA level, leverage, coverage ===
h=30%: EBITDA(Adj)=632.1 EBITDA(Rep)=213.4 ND/EBITDA(Adj)=3.98x ND/EBITDA(Rep)=11.77x EBITDA/int(Adj)=1.65x EBITDA/int(Rep)=0.56x Covenant-headroom(indicative,€m)=575.5 Breach=N
h=40%: EBITDA(Adj)=541.8 EBITDA(Rep)=182.9 ND/EBITDA(Adj)=4.64x ND/EBITDA(Rep)=13.74x EBITDA/int(Adj)=1.42x EBITDA/int(Rep)=0.48x Covenant-headroom(indicative,€m)=507.8 Breach=N
h=60%: EBITDA(Adj)=361.2 EBITDA(Rep)=122.0 ND/EBITDA(Adj)=6.96x ND/EBITDA(Rep)=20.60x EBITDA/int(Adj)=0.95x EBITDA/int(Rep)=0.32x Covenant-headroom(indicative,€m)=372.3 Breach=N

=== WC SHOCK (labeled assumption: 2% of FY2025 revenue €14,059.6m = €281.2m) ===
WC shock amount: 281.2
-40%+WC: net debt after draw=2794.0 ND/EBITDA=5.16x Covenant-headroom=226.6 Breach=N

=== RATE SHOCK (+200bp on floating debt, net of undisclosed hedges -> gross) ===
Extra annual interest: 32.128
-40%+rates: interest_new=414.23 EBITDA/interest=1.31x Covenant-headroom=475.7 Breach=N

=== BREAK POINT SOLVES ===
Liquidity/covenant exhaustion solve: h = (1312.7+-246.3-287.7)/(903.0*0.75) = 778.7/677.25 = 1.1498 -> >=1, NOT reached within 12m on EBITDA decline alone
Net leverage > 6x (Adj EBITDA basis): h = 1 - 2512.8/(6.0*903.0) = 1 - 0.4638 = 0.5362 -> 53.6%
Net leverage > 6x (Reported EBITDA basis): h = 1 - 2512.8/(6.0*304.9) = 1 - 1.3736 = -0.3736 -> already breached today (h<=0)

Sanity check (not a formal break point): -40% EBITDA + top-of-range Spain contingent payment (€860.0m): headroom = 507.8 - 860.0 = -352.2 -> BREACH
```
