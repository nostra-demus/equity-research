# Downside Stress Test — HAIER

**Company:** Haier Smart Home Co., Ltd. (SHSE:600690 / SEHK:6690). **Reporting currency: RMB (CNY), millions**, consistent with `01`–`05`. Basis date: FY2025 (Dec-31-2025), matching `02`'s and `03`'s anchor date. No pending or recently-announced material acquisition is identified in `business-model/11_capital-allocation-governance.md` or elsewhere in the pool (the acquisition history shown there — GE Appliances 2016, Candy 2018, Kwikot 2024 — is all closed/consolidated, not pending), so no pro-forma base is built; the stress runs directly off the reported FY2025 balance sheet.

**EBITDA basis.** Base EBITDA is CNY 26,543.4mn, FY2025, reported (Haier does not disclose an adjusted/non-GAAP EBITDA, per `01` §5) and is cash-backed: CFO/EBITDA ran 93.9%–98.0% every year FY2021–FY2025 and never broke down [`earnings/06_earnings-quality.md` §2, earnings-quality score 66/100]. No adjustment to a "headline adjusted" figure is needed because none exists — the reported figure is the only figure, and it is well cash-backed, so it is used as-is for every haircut below.

---

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed, FY2025 reported) | CNY 26,543.4mn | `01` §5 / `earnings/06_earnings-quality.md` (CFO/EBITDA 98.0%) |
| Net debt (strict basis, canonical per `01`) | CNY (4,952.2)mn — net cash | `01` §4/§7 |
| Net debt (broad basis, labelled, shown alongside) | CNY (16,975.1)mn — net cash | `01` §4/§7 |
| Net debt / EBITDA (strict) | (0.19x) — net cash | `01` §5 |
| Gross debt / EBITDA | 1.61x | `01` §5 |
| EBITDA / interest (gross interest basis) | 9.91x | `04` §1 |
| Tightest covenant + threshold | **No real covenant disclosed anywhere in the pool** (CapIQ: "no Indentures or Credit Agreements available"). `04` computes indicative headroom against three labelled, assumed market-typical covenants: max Total Liabilities/Total Assets 70% (+18.0% headroom, but not EBITDA-driven — see §5 below), max gross debt/EBITDA 3.5x (+54.1% headroom — the operationally relevant one for an EBITDA-driven stress), min EBITDA/interest 3.0x (+230.2% headroom) | `04` §2/§3 — all three labelled *Inference, not from filings* |
| Next-12m obligations (debt maturities + committed dividends/buybacks) | CNY 43,325.6mn (= CNY 23,452.2mn maturities + CNY 19,873.4mn dividends/buybacks) | `02` §1, `03` §2 |
| Committed liquidity (usable) | CNY 59,644.6mn (cash CNY 47,621.7mn + liquid ST investments/trading securities CNY 12,022.9mn). No min-liquidity covenant to net out (undisclosed — `04` §2); no restricted/trapped cash disclosed (`01` §3) | `03` §1 |
| Floating-rate debt (gross) | CNY 25,468.0mn (70% of FY2025 borrowings, company-disclosed) — a more precise figure than `02`'s CapIQ-implied 91.8% "floating/undisclosed-mix" bucket, and used here as the primary rate-shock base | `business-model/10_external-dependency.md` §1 (IFRS Note 43, "利率風險," p.301) |
| Hedge coverage (if any) | No interest-rate swap or other rate hedge disclosed anywhere in the pool — only FX forwards/NDFs/options/cross-currency swaps are disclosed as hedges, and those do not offset rate risk | `02` §3; `business-model/10` §1 |
| Working-capital seasonality / peak build | **Not disclosed.** `03` §3 Hard Check: only one clean fiscal year of quarterly splits exists, no structurally strong/weak quarter is evidenced, and "no disclosed peak-quarter working-capital cash-usage figure exists in this pool — runway may be overstated." A labelled 5%-of-revenue assumption (CNY 15,029.1mn, on FY2025 main-business revenue of CNY 300,582.0mn) is used below as the working-capital shock in the absence of a disclosed figure | `03` §3; this agent's labelled assumption |

All figures RMB (CNY), millions. EBITDA basis: FY2025 reported, cash-backed (not adjusted — none exists).

---

## 2. Stress Scenarios

All figures computed by an executed Python script (shown below the table); net debt and gross debt are held flat within each pure-EBITDA-haircut column (a snapshot re-leveraging test at the current balance sheet, per MODULE_RULES §13/step 5), and are additionally hit by the stated cash/interest shock in the two combined columns.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA (CNYmn) | 26,543.4 | 18,580.4 | 15,926.0 | 10,617.4 | 15,926.0 | 15,926.0 |
| Gross debt / EBITDA | 1.61x | 2.30x | 2.68x | 4.02x | 2.68x | 2.68x |
| Net debt / EBITDA (strict) | (0.19x) net cash | (0.27x) net cash | (0.31x) net cash | (0.47x) net cash | (0.31x) net cash | (0.31x) net cash |
| EBITDA / interest (gross) | 9.91x | 6.93x | 5.94x | 3.96x | 5.94x | 4.99x (interest raised to CNY 3,188.9mn) |
| Tightest covenant headroom (indicative, assumed 3.5x max gross debt/EBITDA) | +54.1% | +34.4% | +23.5% | **−14.8%** | +23.5% | +23.5% |
| Covenant breach? (Y/N) — indicative only, no real covenant disclosed | N | N | N | **Y (indicative)** | N | N |
| 12-month liquidity gap (uses − [liquidity + stressed FCF], negative = surplus) | (33,470.3) surplus | (26,630.1) surplus | (24,350.0) surplus | (19,789.8) surplus | (9,320.9) surplus | (23,912.4) surplus |
| Survives without external action? (Y/N) | Y | Y | Y | **N** (indicative-covenant breach only; liquidity itself still has a CNY 19.8bn surplus) | Y | Y |

**Cyclical-name history-calibrated scenario** (per MODULE_RULES step 3 — `01` §1/§7 flags Haier as cyclical, cyclicality factor 34/100, the weak end of the band, per `business-model/07_business-quality.md`; external-dependency risk 52/100, mid-band, per `business-model/10_external-dependency.md`): the company's own 5-year EBITDA range runs from CNY 18,229.1mn (FY2021, the trough) to CNY 28,024.6mn (FY2024, the peak) — a peak-to-trough decline of **35.0%** (computed below). Applied to the latest-year EBITDA base: EBITDA falls to CNY 17,265.6mn, gross debt/EBITDA rises to 2.47x, EBITDA/interest falls to 6.44x, the indicative leverage-covenant headroom is +29.4% (no breach), and the 12-month liquidity gap remains a CNY 25,501.4mn surplus. This is milder than the flat −30%/−40% columns above because Haier's own realised 5-year swing (FY2021→FY2024, both growth years, no genuine recession print in the pool) has never actually been a deep drawdown — a caveat, not a reassurance, since a genuine China-property or US-tariff shock could easily cut deeper than anything in the company's own 5-year history.

**Floating-rate/hedge and seasonality shocks — both computable here** (unlike a company with no floating exposure or no revenue base to assume against): the rate shock uses the company's own disclosed floating-debt balance (CNY 25,468.0mn) × 200bp = CNY 509.4mn additional pre-tax interest; the WC shock uses a labelled 5%-of-revenue assumption (CNY 15,029.1mn) because no seasonal-build figure is disclosed (`03` §3).

### Executed calculation (Python, run via Bash)

```
EBITDA_latest = 26543.4; gross_debt = 42669.5; net_debt_strict = -4952.2
gross_interest = 2679.5; tax_rate = 0.141; FCF_base = 17151.3
usable_liquidity = 59644.6; obligations_12m = 43325.6
T_leverage = 3.5; T_coverage = 3.0

def row(h, extra_interest=0.0, wc_shock=0.0):
    es = EBITDA_latest*(1-h)
    gd_e = gross_debt/es
    nd_e = net_debt_strict/es
    interest = gross_interest + extra_interest
    cov = es/interest
    headroom_lev = (T_leverage - gd_e)/T_leverage
    breach = "Y" if headroom_lev < 0 else "N"
    fcf_s = FCF_base - EBITDA_latest*h*(1-tax_rate) - extra_interest*(1-tax_rate)
    liq_after = usable_liquidity + fcf_s - wc_shock
    gap = obligations_12m - liq_after
    return es, gd_e, nd_e, cov, headroom_lev, breach, gap
```

Console output (base / −30% / −40% / −60% / history-cal −35.0% / −40%+WC / −40%+rates), reproduced verbatim:

```
Base                         EBITDA= 26,543.4 GrossD/EBITDA= 1.61x NetD/EBITDA= -0.19x EBITDA/Int= 9.91x LevHeadroom=  54.1% Breach=N Liq+FCF-uses=  33,470.3(surplus) Survive_noExtAction=Y
-30% EBITDA                  EBITDA= 18,580.4 GrossD/EBITDA= 2.30x NetD/EBITDA= -0.27x EBITDA/Int= 6.93x LevHeadroom=  34.4% Breach=N Liq+FCF-uses=  26,630.1(surplus) Survive_noExtAction=Y
-40% EBITDA                  EBITDA= 15,926.0 GrossD/EBITDA= 2.68x NetD/EBITDA= -0.31x EBITDA/Int= 5.94x LevHeadroom=  23.5% Breach=N Liq+FCF-uses=  24,350.0(surplus) Survive_noExtAction=Y
-60% EBITDA                  EBITDA= 10,617.4 GrossD/EBITDA= 4.02x NetD/EBITDA= -0.47x EBITDA/Int= 3.96x LevHeadroom= -14.8% Breach=Y Liq+FCF-uses=  19,789.8(surplus) Survive_noExtAction=N
History-cal (-35.0%)         EBITDA= 17,266.5 GrossD/EBITDA= 2.47x NetD/EBITDA= -0.29x EBITDA/Int= 6.44x LevHeadroom=  29.4% Breach=N Liq+FCF-uses=  25,501.4(surplus) Survive_noExtAction=Y
-40% + WC shock(15,029.1)    EBITDA= 15,926.0 GrossD/EBITDA= 2.68x NetD/EBITDA= -0.31x EBITDA/Int= 5.94x LevHeadroom=  23.5% Breach=N Liq+FCF-uses=   9,320.9(surplus) Survive_noExtAction=Y
-40% + rates+200bp           EBITDA= 15,926.0 GrossD/EBITDA= 2.68x NetD/EBITDA= -0.31x EBITDA/Int= 4.99x LevHeadroom=  23.5% Breach=N Liq+FCF-uses=  23,912.4(surplus) Survive_noExtAction=Y
```

The stressed-FCF scaling used throughout: `stressed FCF(h) ≈ FCF_base − EBITDA·h·(1−tax_rate)` — lost EBITDA drops through to FCF at the after-tax operating margin, holding cash interest and maintenance capex fixed (both already carried inside FCF = CFO − total capex, per `03` §3 / CLAUDE.md §15), with tax_rate = 14.1% (FY2025 effective tax rate, `earnings/06_earnings-quality.md` §8). The two combined-shock columns additionally subtract the labelled WC assumption or add the after-tax cost of the extra rate-shock interest to FCF, as shown in the script.

---

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches (indicative — assumed max gross debt/EBITDA 3.5x, the only assumed covenant that is EBITDA-sensitive; see note below on the other assumed covenant) | **54.1%** |
| Committed liquidity exhausted within 12 months | **Not reached on an EBITDA decline alone (h ≥ 1)** |
| Net leverage exceeds an illustrative 6x refi-market threshold | **Not reached on an EBITDA decline alone (h ≥ 1) — Haier is net cash, so the net-debt numerator is negative** |

**Show the solve, each break point:**

**(a) Covenant breach — MAX/ceiling, assumed max gross debt/EBITDA covenant (`T` = 3.5x).** Formula: `h = 1 − gross_debt ÷ (T · EBITDA)`.
`h = 1 − 42,669.5 ÷ (3.5 × 26,543.4) = 1 − 42,669.5 ÷ 92,901.9 = 1 − 0.4593 = 0.5407 → 54.1%`
This is **indicative only** — no real covenant is disclosed anywhere in the pool (`04` §2), so this is the point at which the *labelled market-typical assumption* would breach, not a confirmed contractual trigger.

**(a′) For reference — the other two assumed covenants, worked the same way, per `04` §3:**
- Assumed min EBITDA/interest coverage covenant (`T` = 3.0x, MIN/floor): `h = 1 − (T·interest)/EBITDA = 1 − (3.0 × 2,679.5) ÷ 26,543.4 = 1 − 0.3028 = 0.6972 → 69.7%` — wider than the leverage covenant, so not the binding constraint.
- Assumed max Total Liabilities/Total Assets covenant (70% ceiling): **not EBITDA-driven** — a pure earnings decline (debt and total assets held flat) does not move this ratio (`04` §3 confirms this directly: "Not directly meaningful... this is a balance-sheet leverage ratio, not an EBITDA-driven one"). It is excluded from this EBITDA-decline solve on that basis, per the step-5 instruction to solve non-EBITDA-driven MIN/MAX metrics on their own driver rather than force the coverage-style formula onto them. `04` separately shows it would take roughly 2.9x the entire current debt stack in new liabilities (or an equivalent asset write-down) to trip it — not something an EBITDA shock alone produces.

**(b) Liquidity exhaustion.** Solve `usable liquidity + stressed 12-month FCF(h) = next-12-month obligations`:
`59,644.6 + [17,151.3 − 26,543.4·h·(1−0.141)] = 43,325.6`
`59,644.6 + 17,151.3 − 43,325.6 = 22,804.8 × h → h = 33,470.3 ÷ 22,804.8 = 1.4679`
`h ≥ 1` — the solve returns a value above 1, meaning even a **complete (100%) EBITDA wipeout** does not exhaust the CNY 59,644.6mn committed liquidity against CNY 43,325.6mn of 12-month obligations. Checked directly at `h = 100%`: stressed FCF = CNY (5,649.5)mn (a real cash burn), liquidity + stressed FCF = CNY 53,995.1mn, still CNY 10,669.5mn above the CNY 43,325.6mn obligations bucket. **Liquidity exhaustion is not reached on an EBITDA decline alone** — this is not a fabricated percentage, it is the direct arithmetic consequence of a CNY 59.6bn liquidity base against a CNY 43.3bn obligations bucket that dwarfs even a full earnings wipeout.

**(refi threshold) Net leverage exceeds an illustrative 6x ceiling.** MAX form: `h = 1 − net_debt ÷ (T·EBITDA)`.
`h = 1 − (−4,952.2) ÷ (6.0 × 26,543.4) = 1 − (−0.0311) = 1.0311 → h ≥ 1`
Net debt (strict) is negative (net cash), so the numerator carries no debt — per the step-5 rule, this means the break point is **not reached on an EBITDA decline alone**; Haier's net leverage cannot cross a positive threshold purely because EBITDA falls, only if net debt itself turns positive (a real cash draw or new borrowing). **Supplementary, gross-debt basis (not net cash, so this one is computable):** gross debt/EBITDA hits 6.0x at `h = 1 − 42,669.5 ÷ (6.0 × 26,543.4) = 1 − 0.2679 = 0.7321 → 73.2%` — i.e., even ignoring the net-cash cushion entirely and looking only at gross debt against EBITDA, Haier would need a 73.2% EBITDA decline (well beyond the −60% base-case haircut) before gross leverage alone would look stretched by a typical refinancing-market yardstick.

---

## 4. Survival Read

Haier survives a 30–40% EBITDA decline — a normal recession, not a tail event — comfortably and without needing a waiver, an asset sale, or new equity: at −40% EBITDA, gross debt/EBITDA rises to a still-moderate 2.68x, EBITDA/interest coverage stays at 5.94x, the indicative leverage-covenant headroom is still +23.5%, and 12-month liquidity carries a CNY 24,350.0mn surplus even after subtracting the full maturity-plus-dividend bucket. The first thing to break, and only in the −60% column, is the **indicative, labelled-assumption** leverage covenant (3.5x max gross debt/EBITDA) — real covenant terms are not disclosed anywhere in the pool, so this is a flag against a market-typical proxy, not a confirmed contractual trigger; the company's actual real-world covenant package, if one exists in an undisclosed bank facility, could sit tighter or looser. Liquidity itself never breaks: the solved break point for exhausting the CNY 59,644.6mn committed liquidity base against next-12-month obligations of CNY 43,325.6mn is `h ≥ 1` — a complete, 100% EBITDA wipeout for a full year still leaves a CNY 10.7bn surplus. **Market closure test:** assuming no new unsecured refinancing is available for 12 months, Haier's cash on hand alone (CNY 47,621.7mn) still covers the entire within-12-month maturity bucket (CNY 23,452.2mn) 2.0x over (`02` §4) — nothing breaks first here, because the wall itself is fully pre-funded by cash, independent of market access. **Haier is net cash on the canonical strict basis (CNY 4,952.2mn, `01` §4/§7, with the broader CNY 16,975.1mn figure shown alongside, labelled) and survives every haircut through −60% EBITDA with no real (disclosed) covenant breach and no liquidity gap** — this is the strongest survival outcome the module can report, and the net cash functions as strategic counter-cyclical capacity (funding continued dividends, buybacks, supplier support, or opportunistic bolt-on M&A if China's property cycle or US tariff conditions worsen further) rather than an idle or "sub-optimal" balance sheet (CLAUDE.md §24 Filter 3). The one caveat worth carrying forward, not from this stress test's own math but from `01`'s liquidity-quality flag: roughly 57% of the cash base sits with the affiliated Haier Group Finance Co. rather than diversified independent banks — a disclosed, drawable, non-restricted concentration risk that does not change any number in this report, but is worth remembering if that counterparty relationship itself ever came under stress.

Out-of-scope request received: none — no probability is assigned to any downside scenario in this report; that judgment belongs to the master synthesizer.
