# Downside Stress Test — KAR

Karoon Energy Ltd (ASX: KAR) reports under IFRS (AASB) in **US dollars**; every figure below is USD unless labelled otherwise. This agent consumes `01`–`05` of this module (all read in full) plus `business-model/10_external-dependency.md`, `business-model/11_capital-allocation-governance.md`, `earnings/03_margin-drivers.md`, and `earnings/06_earnings-quality.md`. No pending or recently-announced material acquisition exists in the data pool (confirmed in `business-model/11_capital-allocation-governance.md` §1 — the last transaction was the 2025 Baúna FPSO buyout, already fully reflected in the FY2025 balance sheet) — the pro-forma acquisition check in this agent's workflow therefore does not apply; the stress base below is the reported balance sheet, not a pro-forma one.

**A usable EBITDA base exists** (§4, `04_coverage-and-covenants.md` confirms EBITDA/EBIT/interest all disclosed) and **covenant thresholds are undisclosed** (confirmed absent in `04` §2 and `00` §5/§6: "There are no Indentures or Credit Agreements available for this company"). Per the partial-data rule, this stress test runs against the labelled-assumption covenants carried from `04`, and every covenant breach point below is **indicative, not measured against a real, disclosed threshold**.

## 1. Base Case (today)

Reporting currency: **USD**. EBITDA basis: **cash-backed, one-off-stripped reported EBITDA — $324.2m.** This is `01_capital-structure-and-leverage.md` §5's one-off-stripped figure (company-reported FY2025 EBITDA $380.7m, less a $35.3m non-cash gain on disposal of the Baúna FPSO right-of-use asset and a $21.2m non-cash fair-value gain on the Petrobras contingent-consideration liability — both one-off, non-operating, non-cash items that should not inflate a downside starting point). This basis is cross-checked against `earnings/06_earnings-quality.md` §2: FY2025 cash conversion (CFO ÷ EBITDA) was 66.0%, above the module's 50% red-flag line in every one of the last three reported years — reported EBITDA is materially cash-backed, and stripping the two one-off gains removes non-recurring items without implying a cash-conversion problem. Company-reported EBITDA ($380.7m) and Underlying EBITDAX ($388.8m) are shown for cross-reference but are NOT used as the stress base, because a downside test should not start from a base inflated by ~$56.5m of one-time, non-cash gains.

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed, one-off-stripped) | **$324.2m** | `01_capital-structure-and-leverage.md` §5; cross-checked `earnings/06_earnings-quality.md` §2 |
| — for reference: reported EBITDA / Underlying EBITDAX | $380.7m / $388.8m | `01` §5 |
| Net debt — **canonical (strict basis, FY2025 audited anchor, 31-Dec-2025)** | **$132.7m** | `01_capital-structure-and-leverage.md` §4/§7 — designated canonical for this module |
| Net debt — **current, unaudited (30-Jun-2026)**, flagged as the more fragile, decision-relevant trajectory | **$269.7m** | `01` §6; `02` §4; `03` §0 — cash fell $206.1m→$80.3m and net debt rose $132.7m→$269.7m over 6 months, driven by capex, not new borrowing |
| Net debt / EBITDA (clean EBITDA basis) | 0.41x (canonical net debt) / 0.83x (current net debt) | Derived: $132.7m or $269.7m ÷ $324.2m |
| EBITDA / interest (debt-related interest $40.8m) | 7.95x (clean EBITDA basis); 9.33x on reported EBITDA (04's basis) | `04_coverage-and-covenants.md` §1 |
| Tightest covenant + threshold | **Not assessable on a real threshold — no indenture/credit agreement in the pool.** Indicative tightest test (labelled assumption): DSCR-style (EBITDA − recurring capex) ÷ debt-related interest, assumed floor **1.2x–1.5x** | `04_coverage-and-covenants.md` §2/§3 |
| Next-12m obligations — gross-obligations basis (debt maturities + cash interest + maintenance capex + dividends) | $151.8m | `03_liquidity-runway.md` §2 |
| Next-12m obligations — net-of-FCF basis (debt maturities + dividends only; interest and capex already inside FCF) | $27.6m ($0.7m + $26.9m) | Derived from `03` §2 components, per MODULE_RULES.md §8 |
| Committed liquidity — FY2025 audited anchor | $546.1m ($206.1m cash + $340.0m RBL, full availability) | `03_liquidity-runway.md` §1 |
| Committed liquidity — current (30-Jun-2026) | $363.6m ($80.3m cash + $283.3m RBL availability) | `03` §1 |
| Committed liquidity — current, post-step-down (conservative, RBL steps to $226.7m on 30-Sep-2026) | $307.0m | `03` §1 |
| Floating-rate debt (gross) | **$0 (0% of drawn debt).** The $350.0m Notes are 100% fixed at 10.50%; the $340.0m RBL is undrawn at both 31-Dec-2025 and 30-Jun-2026 and would be floating (SOFR + undisclosed margin) only if drawn | `02_maturity-wall-and-refinancing.md` §3 |
| Hedge coverage | **None active.** Last Brent collar expired out-of-the-money end-2025 and was not replaced; fully unhedged into FY2026 | `business-model/10_external-dependency.md` §1; `02` §3 |
| Working-capital seasonality / peak build | No provable recurring seasonal pattern (half-yearly reporter). One disclosed, company-specific cargo-timing effect: crude-oil inventory on the FPSO rose 126.8% FY24→FY25 ("one less cargo in the period" at year-end), each Baúna cargo worth roughly $90m–$125m of revenue | `03_liquidity-runway.md` §3 (Seasonality Hard Check); `earnings/06_earnings-quality.md` §3 |

Karoon is **not net cash** on the strict basis at either anchor date (net debt $132.7m canonical / $269.7m current, against $338.8m gross debt and $1,032.5m equity) — this is a low-leverage, not a net-cash, balance sheet, so the module's "fortress" net-cash framing does not apply verbatim; the standout survival characteristic instead is the sheer size of committed liquidity relative to near-term obligations (see §3–4).

## 2. Stress Scenarios

Base EBITDA $324.2m (clean, one-off-stripped). Leverage is shown on both the canonical FY2025 net debt ($132.7m) and the current, more fragile 30-Jun-2026 net debt ($269.7m). Committed liquidity uses the current, post-step-down (conservative) figure of $307.0m as the decision-relevant basis for the liquidity-gap row (the FY2025-anchor $546.1m figure is shown as context in §1 but is stale relative to the disclosed post-year-end deterioration). All dollar figures US$m; formulas and full working are in §3 and the Bash-executed calculations referenced there.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp | Historical trough calibration (−54.2%) |
|---|---:|---:|---:|---:|---:|---:|---:|
| EBITDA | 324.2 | 226.9 | 194.5 | 129.7 | 194.5 | 194.5 | 148.5 |
| Net debt / EBITDA (canonical net debt $132.7m) | 0.41x | 0.58x | 0.68x | 1.02x | 0.68x | 0.68x | 0.89x |
| Net debt / EBITDA (current net debt $269.7m) | 0.83x | 1.19x | 1.39x | 2.08x | 1.39x | 1.39x | 1.82x |
| EBITDA / interest (debt-related, $40.8m) | 7.95x | 5.56x | 4.77x | 3.18x | 4.77x | 4.77x | 3.64x |
| DSCR-style: (EBITDA − recurring capex $85.9m) / interest | 5.84x | 3.46x | 2.66x | 1.07x | 2.66x | 2.66x | 1.53x |
| Tightest covenant headroom (indicative, DSCR-style, T=1.5x floor) | +289% | +130% | +77% | **−29%** | +77% | +77% | +2% (razor-thin) |
| Covenant breach? (Y/N, indicative only — no real threshold disclosed) | N | N | N | **Y (indicative)** | N | N | N (marginal) |
| 12-month liquidity gap (net-of-FCF basis; negative = surplus) | −$444.9m | −$380.7m | −$359.3m | −$316.5m | −$259.3m | −$359.3m | −$356.5m |
| Survives without external action? (Y/N) | Y | Y | Y | **Y on liquidity; a real covenant at this assumed threshold would need a waiver** | Y | Y | Y (marginal on the indicative covenant) |

**Rate shock (−40% + rates +200bp): not applicable in direct-cost terms.** Floating-rate debt is currently $0 (RBL fully undrawn at both anchor dates, §1) — a +200bp move reprices nothing today. Labelled sensitivity only: if the $283.3m RBL were fully drawn (not required or indicated by any scenario below — liquidity never needs it, §3), +200bp would add roughly $5.7m/year of interest cost ($283.3m × 2.00%) — immaterial next to the $194.5m of EBITDA left at −40%. This column is therefore identical to the plain −40% column on every metric that uses debt-related interest, and is shown for completeness per MODULE_RULES.md's stress-test rule.

**Working-capital shock, labelled assumption:** $100m cash outflow, the midpoint of the disclosed $90m–$125m single-Baúna-cargo revenue value (`03` §3) — modelled as one cargo's proceeds not received in the stress window (a real, disclosed timing mechanism in this single-FPSO, cargo-based sales model, not a seasonal build). Applied on top of the −40% EBITDA case by reducing usable liquidity by $100m.

All scenarios assume zero management mitigation — this is a survival bound, not a forecast; the earnings module's realised-offset case (`earnings/07` §2, if produced) is the expected-outcome read.

## 3. Break Points

**Executed solve (Bash/Python, shown for reproducibility):**

```
Leverage covenant (MAX, net debt/EBITDA), h = 1 − net debt/(T×EBITDA), EBITDA=$324.2m clean:
  T=3.0x, canonical net debt $132.7m: h = 1 − 132.7/(3.0×324.2) = 0.864 → 86.4%
  T=4.0x, canonical net debt $132.7m: h = 1 − 132.7/(4.0×324.2) = 0.898 → 89.8%
  T=3.0x, current net debt $269.7m:   h = 1 − 269.7/(3.0×324.2) = 0.723 → 72.3%
  T=4.0x, current net debt $269.7m:   h = 1 − 269.7/(4.0×324.2) = 0.792 → 79.2%

Coverage covenant (MIN, EBITDA/interest), h = 1 − (T×interest)/EBITDA, interest=$40.8m:
  T=2.5x: h = 1 − (2.5×40.8)/324.2 = 0.685 → 68.5%
  T=3.0x: h = 1 − (3.0×40.8)/324.2 = 0.622 → 62.2%

DSCR-style covenant (MIN, (EBITDA−recurring capex)/interest), h = 1 − (T×interest + capex)/EBITDA, capex=$85.9m:
  T=1.2x: h = 1 − (1.2×40.8+85.9)/324.2 = 0.584 → 58.4%
  T=1.5x: h = 1 − (1.5×40.8+85.9)/324.2 = 0.546 → 54.6%

Refi-market net-leverage threshold (MAX, e.g. 6.0x — a level well above sub-investment-grade E&P norms):
  T=6.0x, canonical net debt: h = 1 − 132.7/(6.0×324.2) = 0.932 → 93.2%
  T=6.0x, current net debt:   h = 1 − 269.7/(6.0×324.2) = 0.861 → 86.1%

Liquidity exhaustion, usable liquidity + stressed FCF(h) = obligations (net-of-FCF basis, $27.6m):
  stressed FCF(h) = FCF_base − EBITDA×h×(1−tax) = 165.5 − 324.2×h×0.66 = 165.5 − 213.97×h
  (FCF_base = $165.5m normalised operating FCF ex one-off M&A [earnings/06 §1]; tax = 34%, Brazilian statutory
   rate, labelled assumption, since effective cash tax has ranged 12.4%–46.7% and is not a reliable forward rate)
  h_break = (liquidity + 165.5 − 27.6) / 213.97
    FY2025 anchor liquidity $546.1m:      h_break = 3.20  → h≥1, DOES NOT BREACH on EBITDA decline alone
    Current liquidity $363.6m:            h_break = 2.34  → h≥1, DOES NOT BREACH on EBITDA decline alone
    Current, post-step-down $307.0m:      h_break = 2.08  → h≥1, DOES NOT BREACH on EBITDA decline alone
  Sanity check at h=100% (total EBITDA wipeout): stressed FCF = −$48.5m; liquidity+FCF still $258.5m (post-step-
  down basis) against $27.6m of obligations — a $230.9m surplus even in a complete EBITDA wipeout.
```

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest (indicative, undisclosed) covenant breaches — DSCR-style, T=1.5x floor | **≈54.6%** (T=1.2x: ≈58.4%) — first break in the tested range, occurring between the −40% and −60% haircuts |
| Coverage covenant breaches (indicative) — EBITDA/interest, T=3.0x floor | ≈62.2% (T=2.5x: ≈68.5%) |
| Net-leverage covenant breaches (indicative) — MAX 3.0x, current net debt basis | ≈72.3% (canonical net debt basis: ≈86.4%) |
| Net leverage exceeds a 6.0x refi-market threshold | ≈86.1% (current net debt) / ≈93.2% (canonical net debt) — **does not bind inside any tested haircut; shown only because it is far outside the −30/−40/−60 range, confirming leverage is not the binding constraint** |
| Committed liquidity exhausted within 12 months | **Does not breach on an EBITDA decline alone (h≥1 on every liquidity basis tested, including the current, post-step-down $307.0m figure).** Karoon's committed liquidity so far exceeds its net-of-FCF near-term obligations ($27.6m) that even a complete, 100% EBITDA wipeout leaves a $230.9m liquidity surplus, before any WC shock is even applied |

**Caveat on the liquidity solve:** this result assumes the $340.0m RBL's disclosed, mechanical step-down schedule ($340.0m→$283.3m→$226.7m by 30-Sep-2026) is the only change to its availability. The RBL is a **reserves-based lending** facility whose borrowing base is periodically redetermined against the value of proved reserves — a severe, sustained oil-price decline (the underlying driver of any EBITDA haircut this deep) would plausibly cut the redetermined borrowing base further than the disclosed amortisation schedule alone, beyond what this pool discloses a formula for. The liquidity break-point above should be read as **liquidity does not break on the EBITDA decline itself**, not as a guarantee that RBL availability is immune to the same commodity-price shock that produced the EBITDA decline.

## 4. Survival Read

Karoon survives a 30–40% EBITDA decline — an ordinary cyclical downturn for a name whose own history already shows a 54.2% peak-to-trough EBITDA swing (FY2024 $450.3m to FY2022 $206.3m, company-reported basis) — on every metric tested here, with no covenant breach (even on the indicative, undisclosed assumed thresholds from `04`) and a large liquidity surplus, without needing a waiver, an equity raise, or an asset sale. The first thing to break in the tested range is the **indicative** DSCR-style covenant (assumed 1.2x–1.5x floor on (EBITDA − recurring capex)/interest), which trips at roughly a 55–58% EBITDA decline — a level between the −40% and −60% haircuts — but this is a labelled assumption, not a measured fact: no indenture or credit agreement for either the $350.0m Notes or the $340.0m RBL exists in the data pool (`04` §2, `00` §6), so this is the best available proxy for where a real covenant might sit, not a confirmed breach level. **Liquidity itself does not exhaust on an EBITDA decline alone at any haircut tested, including a full (100%) EBITDA wipeout combined with a $100m working-capital shock** — Karoon's $307.0m of current, post-step-down committed liquidity so exceeds its $27.6m of net-of-FCF near-term obligations (debt maturities plus the policy-consistent dividend proxy; buybacks are discretionary and excluded) that this is the single strongest finding in this stress test, not a bland "nothing breaks." **Market closure test:** assuming no new unsecured refinancing is available for 12 months, Karoon still clears the next 12 months comfortably — the only scheduled maturity in that window is $0.7m of finance leases, cash on hand ($80.3m at 30-Jun-2026) alone covers it many times over, and the $283.3m RBL is a secured, already-committed facility that does not require fresh capital-markets access to draw. The real vulnerability this test surfaces is **not** the 12-month window but the medium-term compression already flagged in `02`: the RBL matures 30-Sep-2028 and the $350.0m Notes bullet lands 14-May-2029, both inside a period where, if a 50%+ EBITDA decline actually materialised and persisted for multiple years (rather than the single-year shock modelled here), the RBL's own reserves-based redetermination and Karoon's sub-investment-grade (S&P B / Fitch B) rating would make refinancing that 2028–2029 pair materially harder and more expensive than the current point-in-time 8.211% market yield-to-worst (`02` §3) suggests.
