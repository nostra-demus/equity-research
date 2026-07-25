# Downside Stress Test — TSLA

**Reporting currency:** US Dollar (USD), figures in millions unless stated otherwise. **EBITDA basis:** reported (GAAP) EBITDA (Operating Income + D&A), TTM ended Jun-30-2026 = $10,849M — the module's designated base, cross-checked as cash-backed against `earnings/06_earnings-quality.md` (cash from operations, CFO, exceeded 85% of GAAP EBITDA in every year FY2021–FY2025; no evidence of manufactured or non-cash EBITDA). The company's own non-GAAP "Adjusted EBITDA" ($15,322M TTM) is shown as a memo only, never as the stress base, per CLAUDE.md §15. **Net debt basis:** the canonical figure designated by `01_capital-structure-and-leverage.md` §7 — broad/lease-inclusive gross debt ($16,080M) minus cash & equivalents only (§15 strict-cash basis) = **$861M net debt**. Tesla is deeply net cash on every other defensible reading (net cash of $5,877M excluding leases; net cash of $27,444M–$34,182M once short-term investments are netted in), and that framing carries through this report even though the single strictest/most conservative combination shows a small positive net-debt figure.

**Pending-acquisition check (step 2a):** no pending or recently-announced material acquisition is disclosed in `business-model/11_capital-allocation-governance.md` — cash acquisitions were $0 in five of the last six fiscal years, and the one related-party capital commitment on file (a $2.0 billion equity-method investment in SpaceX) is an equity purchase, not a consolidating M&A transaction. **No pro-forma adjustment is required**; this report stresses the reported balance sheet as of Jun-30-2026 directly.

---

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed, GAAP) | $10,849M TTM (Jun-30-2026) | `01_capital-structure-and-leverage.md` §5; cash-backing cross-checked in `earnings/06_earnings-quality.md` §2 |
| Net debt (canonical, §15 strict-cash / broad-debt basis) | $861M net debt | `01_capital-structure-and-leverage.md` §7 |
| Net debt / EBITDA | 0.08x | Computed |
| EBITDA / interest | 32.48x (gross interest $334M TTM) | `04_coverage-and-covenants.md` §1 |
| Tightest covenant + threshold | Max net leverage, **assumed** 4.0x (no disclosed covenant threshold anywhere in the pool — only a binary "in material compliance" statement; labeled assumption per `04`'s partial-data rule) | `04_coverage-and-covenants.md` §2–3 |
| Next-12m obligations (gross-obligations basis: contractual debt wall + cash interest + total capex proxy + $0 dividends/buybacks) | $20,521M | `03_liquidity-runway.md` §2 |
| Committed liquidity (cash + unrestricted ST investments + undrawn RCF) | $48,238M | `03_liquidity-runway.md` §1 |
| Floating-rate debt (gross) | $5,888M (China Working Capital Facility, 63.0% of narrow $9,342M debt stack; fully drawn, unhedged) | `01`/`02_maturity-wall-and-refinancing.md` §3 |
| Hedge coverage | None — Tesla "do[es] not typically hedge foreign currency risk" and discloses no interest-rate hedge or swap | `02_maturity-wall-and-refinancing.md` §3 |
| Working-capital seasonality / peak build | Not disclosed as a $ figure — Q1 is the seasonally weakest revenue quarter and DSO has risen 16.7% then 20.4% YoY, but no peak-quarter cash-usage figure exists in the pool | `03_liquidity-runway.md` §3 (Seasonality Hard Check); `earnings/06_earnings-quality.md` §3 |

Reporting currency: USD. EBITDA basis: reported (GAAP), TTM. **Covenant caveat carried through every stress figure below:** no covenant threshold, ratio, or covenant-EBITDA definition is disclosed in this data pool (only Tesla's binary "in material compliance" statement, Q2 FY26 10-Q Note 8) — the 4.0x max-leverage and 2.5x min-coverage covenants used throughout this report are **labeled assumptions** from `04`'s partial-data rule (typical market ranges for an investment-grade-adjacent industrial borrower), not disclosed facts. Every breach flag and headroom % below is indicative, not a distance to a real, known threshold.

---

## 2. Stress Scenarios

All figures computed with an executed Python snippet (shown in the agent's working; reproducible from the inputs cited above and in `01`–`05`). Liquidity gap is shown on the **gross-obligations basis** (usable liquidity − stressed 12-month obligations, no FCF netted — the more conservative of the two bases `03` defines, and the one that basis leads with given TTM FCF is flagged unreliable against the guided FY2026 capex ramp). A net-of-FCF cross-check is shown in §3's solve; it only widens the surplus.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA ($M) | 10,849 | 7,594 | 6,509 | 4,340 | 6,509 | 6,509 |
| Net debt / EBITDA | 0.08x | 0.11x | 0.13x | 0.20x | 0.13x | 0.13x |
| EBITDA / interest | 32.48x | 22.74x | 19.49x | 12.99x | 19.49x | 14.41x (interest raised to $451.8M) |
| Tightest covenant headroom (assumed 4.0x max leverage; indicative) | +98.0% | +97.2% | +96.7% | +95.0% | +96.7% | +96.7% |
| Covenant breach? (Y/N) | N | N | N | N | N | N |
| 12-month liquidity gap (surplus shown; gross-obligations basis) | +$27,717M | +$27,717M | +$27,717M | +$27,717M | +$26,422M | +$27,599M |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

**WC shock sizing (labeled assumption — no disclosed seasonal-build figure per `03` §3):** 5% of TTM quarterly revenue ($25,905M ÷ 4... i.e. $25,905M quarterly run-rate) = **$1,295M** added to 12-month obligations. **Rate shock sizing:** +200bps applied to the $5,888M floating-rate China Working Capital Facility (unhedged, no interest-rate hedge disclosed) = **+$117.8M/year** incremental interest, raising TTM gross interest from $334M to $451.8M in that column only.

**Historical trough-to-peak calibration (automotive flagged "High" consumer-cycle exposure per `business-model/10_external-dependency.md`):** Tesla's own reported GAAP EBITDA fell from its FY2022 cyclical peak of $17,235M to $10,503M in FY2025 — a **−39.1% peak-to-trough decline**, already realized in the company's own recent history [`earnings/06_earnings-quality.md` §1]. Recomputed on this basis: EBITDA $6,611M, net debt/EBITDA 0.13x, EBITDA/interest 19.79x, tightest covenant headroom +96.7%, no breach, liquidity surplus +$27,717M, survives without external action. This confirms the −40% column above is not a hypothetical tail case for Tesla — it sits almost exactly on top of a decline the company has already lived through this cycle.

---

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches (max leverage, assumed 4.0x) | ~98.0% |
| Min-coverage covenant breaches (assumed 2.5x, memo — not the tightest) | ~92.3% |
| Committed liquidity exhausted within 12 months | **Not reached on an EBITDA decline alone (h ≥ 1)** |
| Net leverage exceeds an illustrative 6.0x market-refi-access ceiling | ~98.7% |

**Solves executed (Python, shown in full):**

- **Leverage covenant (MAX/ceiling, T = 4.0x, net debt held constant at $861M):**
  `h = 1 − net_debt / (T · EBITDA) = 1 − 861 / (4.0 × 10,849) = 1 − 861/43,396 = 1 − 0.01984 = 0.9802` → **98.0% EBITDA decline** required to breach. (Cross-checks `04`'s own indicative read: EBITDA would need to fall to ~$215M.)
- **Coverage covenant (MIN/floor, T = 2.5x, interest held constant at $334M):**
  `h = 1 − (T · interest) / EBITDA = 1 − (2.5 × 334) / 10,849 = 1 − 835/10,849 = 1 − 0.07697 = 0.9230` → **92.3% EBITDA decline** required to breach.
- **Illustrative net-leverage market-refi threshold (MAX form, T = 6.0x — an indicative "loses normal capital-markets access" ceiling, not a disclosed covenant):**
  `h = 1 − 861 / (6.0 × 10,849) = 1 − 861/65,094 = 1 − 0.01323 = 0.9868` → **98.7% EBITDA decline.**
- **Liquidity exhaustion — gross-obligations basis (primary, most conservative; no FCF netted, so the gap is structurally independent of h):**
  `surplus = usable_liquidity − 12m_obligations = 48,238 − 20,521 = $27,717M` at **any** EBITDA haircut — the gap never depends on EBITDA under this basis because it already assumes zero operating cash inflow. Liquidity is not exhausted at any finite EBITDA decline under this basis.
- **Liquidity exhaustion — net-of-FCF cross-check (stressed FCF scaling: lost EBITDA drops through to FCF at the after-tax operating margin, holding cash interest and maintenance capex fixed → `stressed_FCF(h) ≈ FCF_base − EBITDA·h·(1−tax)`, tax = 21% federal statutory rate, labeled assumption; FCF_base = $5,762M TTM):**
  `h = (usable_liquidity + FCF_base − obligations) / (EBITDA × (1 − tax)) = (48,238 + 5,762 − 20,521) / (10,849 × 0.79) = 33,479 / 8,570.7 = 3.906`
  This solve returns **h ≥ 1** — meaning even a 100% elimination of TTM EBITDA (and beyond, mathematically) does not exhaust the 12-month liquidity cushion on this basis either. **Committed liquidity does not break on an EBITDA decline alone under either basis** — the constraint that would actually matter is a run on the $48,238M of cash/investments/RCF itself (e.g., a market-closure-plus-asset-freeze event), not a fall in operating earnings.

All three covenant/leverage break points cluster in the **92–99% EBITDA decline** range — i.e., essentially the total elimination of Tesla's operating earnings, not a plausible recession. This is a mechanical result of net debt ($861M) being minuscule relative to EBITDA ($10,849M TTM), not evidence of exceptional operating resilience — Tesla's EBIT margin has already fallen from 16.8% (FY2022) to 4.6% (FY2025) [`earnings/03_margin-drivers.md` §4] even as these ratios stayed comfortable, because the debt base being measured against is so small.

---

## 4. Survival Read

On every haircut this report can run — −30%, −40%, −60%, and a −39.1% historical peak-to-trough calibration, each alone or stacked with a labeled working-capital shock ($1,295M) or a +200bps floating-rate shock (+$117.8M/year on the unhedged $5,888M China facility) — Tesla shows no covenant breach and a 12-month liquidity surplus in excess of $26 billion; a 30–40% EBITDA decline, a normal recession rather than a tail event, is survivable on the company's own balance sheet with no external action required, and even the historically-realized −39% peak-to-trough EBITDA move (FY2022→FY2025) changes almost nothing about the numbers above. **Market closure test:** assuming no new unsecured refinancing is available for 12 months, Tesla still clears its full $20,521M gross-obligations bucket — including the $5,888M China Working Capital Facility that contractually matures Sep-2026–Mar-2027 but is booked GAAP long-term on an unevidenced "intent and ability to refinance" assertion (`02_maturity-wall-and-refinancing.md` §1b–§4) — out of cash and the undrawn RCF alone, without touching new issuance; the item that "breaks first" in a genuine closure scenario is not covenant headroom or aggregate liquidity but the **China facility's specific refinancing channel**, which depends on continued access to Chinese bank credit rather than the US-dollar cash pile sitting alongside it. The break points that would actually matter — a ~92–99% EBITDA decline to breach the (labeled-assumption) covenants, or an EBITDA collapse beyond 100% to dent the liquidity cushion under either basis modeled — are not realistic near-term scenarios; they reflect a company whose net debt ($861M) is a rounding error against its EBITDA ($10,849M TTM), not a company that has proven itself resilient against a real debt constraint.

**Tesla is net cash on every reading except the single strictest, lease-inclusive-debt/cash-only combination, where it is barely net debt ($861M).** It survives every haircut modeled here with no covenant breach and no liquidity gap — the strongest survival outcome this module can report. That result is a mechanical consequence of an almost debt-free balance sheet (99.98% of Tesla, Inc.'s on-balance-sheet debt is non-recourse SPE/subsidiary paper, per `01_capital-structure-and-leverage.md` §1), not evidence that the operating business itself is immune to a downturn — margin compression is real and already visible (EBIT margin −1,222bps FY2022→FY2025) and the company's own guided capex ramp (>$25bn FY2026) is what is currently pressuring free cash flow, not debt service. Per CLAUDE.md §24 (Filter 3) and this module's Core Principle 8, this net-cash position is strategic optionality — counter-cyclical capacity to keep funding the robotaxi/Optimus/AI-compute investment cycle through a demand downturn without needing a covenant waiver, an asset sale, or an equity raise — not a "nothing breaks" blandness finding: it is the specific, cited reason nothing breaks.

**Caveat on confidence:** the covenant breach points above rest on labeled-assumption thresholds (`04`'s partial-data rule), since no actual covenant is disclosed — if a real lender covenant exists with a materially tighter, idiosyncratic definition, the true breach point could differ from the ~92–99% figures shown, though given how small net debt and interest are in absolute dollars, a materially different outcome would require a covenant far outside typical market ranges. Off-balance-sheet exposures for litigation matters carrying no disclosed dollar estimate (five active matters — discrimination/harassment suits, the Autopilot/FSD class action, the securities class action, and open regulatory investigations, per `05_off-balance-sheet-and-contingencies.md` §3, §5) are not sized in this stress test and remain a source of tail risk this module cannot quantify.
