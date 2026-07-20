# Downside Stress Test — NHY

Reporting currency: **Norwegian krone (NOK), millions**, unless stated otherwise. Norsk Hydro ASA reports under IFRS Accounting Standards as adopted by the EU, fiscal year ended 31-Dec [Integrated Annual Report 2025, p.140]. This is a Norwegian listed issuer (Oslo Børs); local-equivalent documents are the Integrated Annual Report 2025 and the First Quarter Report 2026, per `00_solvency-data-triage.md`. Norsk Hydro is an operating industrial company (integrated aluminium producer) — the standard debt/EBITDA stress framework applies (MODULE_RULES.md, Business Type Applicability Gate). No material pending or recently-announced acquisition exists in the data pool (the only material deal, Alumetal, closed in 2023 and is already consolidated in the FY2025 balance sheet) — the pro-forma check in the workflow does not apply here; the stress base below is the reported/current balance sheet, not a pro-forma one.

**EBITDA basis used:** this report runs the primary stress on the **TTM reported EBITDA (NOK 21,976m, through 31-Mar-2026)** — the most current run-rate, and materially lower (−14.5%) than FY2025's full-year NOK 25,696m — paired with the latest (Q1 2026) balance-sheet net debt (NOK 22,503m, strict basis). This is the more conservative and more current pairing (per `01`, §6-7). The FY2025 annual figures are shown alongside throughout as the reference/reconciliation basis, since `04`'s own indicative covenant calculations were built on FY2025. Both bases are cash-backed: per `earnings/06_earnings-quality.md`, CFO/EBITDA is 79.4% (TTM) and 81.3% (3-year average), above the 70% "healthy" threshold — reported EBITDA is not materially inflated versus cash generation, so no adjustment for cash-backing is needed beyond using reported (not the company's further-adjusted) EBITDA, consistent with `01` and `04`'s canonical choice.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed, TTM through 31-Mar-2026) | NOK 21,976m | `01_capital-structure-and-leverage.md` §6-7; cross-checked `earnings/06_earnings-quality.md` (CFO/EBITDA TTM 79.4%) |
| Base EBITDA (FY2025 annual, reference) | NOK 25,696m | `01`, §5, §7 |
| Net debt (strict basis, canonical — Q1 2026 latest) | NOK 22,503m | `01`, §6 (canonical strict basis designated in `01` §4/§7) |
| Net debt (strict basis, FY2025 year-end, reference) | NOK 20,489m | `01`, §4, §7 |
| Net debt / EBITDA (TTM basis) | 1.02x | Derived: 22,503 / 21,976 |
| Net debt / EBITDA (FY2025 basis) | 0.80x | Derived: 20,489 / 25,696 |
| EBITDA / interest (TTM) | 9.82x | `04_coverage-and-covenants.md` §1 |
| EBITDA / interest (FY2025) | 10.90x | `04`, §1 |
| Tightest covenant + threshold | Max net leverage, **assumed** 3.5x (LABELED ASSUMPTION — no real covenant disclosed for parent-level debt) | `04`, §2-3 |
| Next-12m obligations (gross: maturities + cash interest + total capex + dividend floor) | NOK 24,663m | `03_liquidity-runway.md` §2 |
| Next-12m obligations (net-of-FCF basis: maturities + dividend floor only) | NOK 10,723m | `03`, §3 |
| Committed liquidity (restriction-adjusted, Q1 2026) | NOK 40,980m | `03`, §1 |
| Floating-rate debt (gross, confirmed) | NOK 1,500m (4.1% of gross debt) — Sustainability Linked Bond floating tranche, 3-month NIBOR + 2.000% | `01`, §1; `02_maturity-wall-and-refinancing.md` §3 |
| Rate type not disclosed | 75.6% of gross debt (NOK 27,634m) — true floating exposure could be materially higher than the confirmed 4.1% | `02`, §3 |
| Hedge coverage (if any) | Not disclosed for the floating tranche specifically; group-level LME/FX/power hedging exists but is not itemised against this instrument | `02`, §3; `business-model/10_external-dependency.md` |
| Working-capital seasonality / peak build | Not proven calendar-seasonal (too few quarters to test), but a real, disclosed price-cycle-driven outflow occurred in Q1 2026: net cash from operations of NOK (1,891)m against positive Adjusted EBITDA of NOK 8,668m | `03`, §3 ("Seasonality / Peak Liquidity Need" hard check) |

No EBITDA-base gap exists here — the stress test runs on full data, not the "Not assessable" partial-data path. Covenant thresholds ARE undisclosed for parent-level debt, so per the partial-data rule, this report runs the stress against `04`'s labeled-assumption covenants (3.5x max net leverage, 3.0x min EBITDA/interest) and **all covenant breach points below are indicative, not confirmed** — flagged throughout.

## 2. Stress Scenarios

*(All figures NOK millions unless stated. Covenant headroom is signed: positive = headroom remaining, negative = breached. Covenant thresholds are LABELED ASSUMPTIONS per `04` — indicative only.)*

| Metric | Base (TTM) | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock (+NOK1,891m outflow) | −40% + rates +200bp (on NOK1,500m confirmed floating) |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | 21,976 | 15,383 | 13,186 | 8,790 | 13,186 | 13,186 |
| Net debt used | 22,503 | 22,503 | 22,503 | 22,503 | 24,394 | 22,503 |
| Net debt / EBITDA | 1.02x | 1.46x | 1.71x | 2.56x | 1.85x | 1.71x |
| EBITDA / interest | 9.82x | 6.87x | 5.89x | 3.93x | 5.89x | 5.81x |
| Tightest covenant headroom (assumed 3.5x max leverage) | +70.9% | +58.2% | +51.2% | +26.9% | +47.1% | +51.2% |
| Covenant breach? (Y/N) | N | N | N | N | N | N |
| 12-month liquidity gap (uses − sources; negative = surplus) | −31,977 | −31,782 | −30,353 | −27,496 | −28,462 | −30,353 |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

Notes on the two additional shocks:
- **Working-capital shock**: no disclosed seasonal-build percentage exists (`03` explicitly finds working capital "not proven to be calendar-seasonal" in this pool). The labeled assumption used is the actual, disclosed Q1 2026 operating-cash outflow of NOK 1,891m (a real, price-cycle-driven working-capital build, not a calendar-seasonal one) — applied here as a one-time additional draw on the balance sheet (added to net debt for the leverage calculation, since it must be financed from somewhere if it recurs). Even doubled or tripled, this shock is small relative to the NOK 40,980m liquidity base.
- **Rate shock**: +200bp applied only to the NOK 1,500m confirmed floating-rate tranche (no hedge disclosed against it), adding NOK 30m of annual interest — immaterial (coverage moves from 5.89x to 5.81x at −40% EBITDA). This almost certainly **understates** true rate sensitivity: 75.6% of gross debt (NOK 27,634m) carries no disclosed rate type, so if a material share of that undisclosed balance is actually floating, the real rate-shock impact could be several times larger than shown here. This is a genuine disclosure gap, not evidence of low floating exposure — flagged, not resolved.
- A **market-closure scenario** (no new unsecured issuance for 12 months) is addressed in §4 below, consistent with `02`'s own finding that the 12-month wall is covered by cash alone.
- **Cyclical calibration**: Norsk Hydro is flagged as an extremely cyclical, price-taking commodity producer (`business-model/10_external-dependency.md`, risk score 74/100 inverted). However, this data pool discloses company-reported EBITDA for only three years (FY2023–FY2025); FY2022 (the post-COVID price-spike peak year, ROE 24.9%) has no disclosed EBITDA figure, so a true peak-to-trough EBITDA range cannot be built from this pool. The shallowest disclosed trough year available, FY2023 (ROE 2.6%), still shows reported EBITDA of NOK 23,291m — only **9.4% below** FY2025's NOK 25,696m, far shallower than the standard 30–60% haircuts above. This tells us reported EBITDA at Hydro is historically more stable than net income/ROE (large swings sit below the EBITDA line — impairments, derivative timing — per `earnings/06_earnings-quality.md`), but it also means the pool cannot corroborate or refute a genuine deep-cycle trough (e.g., a 2009- or 2015-style downturn) — the 30/40/60% haircuts above remain the primary, and in this case the more rigorous, read; no additional history-calibrated haircut column is added because the data does not support one beyond the shallow FY2023 data point already noted.

## 3. Break Points

*(All formulas executed via Python — see snippet below — not computed by hand.)*

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches — min EBITDA/interest coverage (assumed 3.0x floor) | **~69.4%** (TTM basis) / ~72.5% (FY2025 basis) |
| Tightest covenant breaches — max net leverage (assumed 3.5x ceiling) | **~70.7%** (TTM basis) / ~77.2% (FY2025 basis, matches `04`'s own calc exactly) |
| Committed liquidity exhausted within 12 months | **Does not breach on an EBITDA decline alone (h ≥ 1)** — see solve below |
| Net leverage exceeds an illustrative 6.0x refi-market threshold | **~82.9%** (TTM basis) |

**Executed solve (Python, shown in full):**

```
Inputs: EBITDA_TTM=21,976; net_debt_latest=22,503; interest_TTM=2,239
        FCF_TTM=5,810; maturities_12m=8,250; div_floor=2,473; liquidity=40,980; tax≈35%

(a) Leverage breach (MAX/ceiling, T=3.5x — direction-aware per 04/MODULE_RULES):
    h = 1 − net_debt / (T × EBITDA_base)
    h = 1 − 22,503 / (3.5 × 21,976) = 1 − 22,503/76,916 = 1 − 0.2926 = 0.7074 → ~70.7% (TTM)
    Check: net_debt / (T × EBITDA_base×(1−h)) = 22,503 / (3.5 × 6,429.4) = 3.500  ✓
    FY2025 basis: h = 1 − 20,489/(3.5×25,696) = 1 − 0.2279 = 0.7721 → 77.2% (ties to 04's own figure)

(b) Coverage breach (MIN/floor, T=3.0x):
    h = 1 − (T × interest) / EBITDA_base
    h = 1 − (3.0 × 2,239) / 21,976 = 1 − 6,717/21,976 = 1 − 0.3057 = 0.6943 → ~69.4% (TTM)
    FY2025 basis: h = 1 − (3.0×2,357)/25,696 = 1 − 0.2752 = 0.7248 → 72.5% (ties to 04's own figure)

(c) Refi-threshold breach (MAX form, T=6.0x, illustrative):
    h = 1 − 22,503/(6.0×21,976) = 1 − 0.1707 = 0.8293 → ~82.9%

(d) Liquidity exhaustion:
    Solve: liquidity + [FCF_base − EBITDA_base×h×(1−tax)] = (maturities_12m + div_floor)
    h = (liquidity + FCF_base − obligations) / (EBITDA_base × (1−tax))
    h = (40,980 + 5,810 − 10,723) / (21,976 × 0.65) = 36,067 / 14,284.4 = 2.52 → h ≥ 1
    Sanity check at h=100% (EBITDA→0 for a full year): stressed FCF = 5,810 − 21,976×0.65 = −8,474
      liquidity + stressed FCF = 40,980 − 8,474 = 32,506  vs.  obligations 10,723 → still covered ~3.0x
    Conclusion: liquidity does NOT exhaust on an EBITDA decline alone, even at a full collapse to zero —
    reported per the hard rule as "does not breach on EBITDA decline alone," not a fabricated finite %.
```

The coverage covenant (assumed) breaks marginally before the leverage covenant on both bases (69.4% vs 70.7% TTM; 72.5% vs 77.2% FY2025) — this is worth flagging because `04`'s own indicative-headroom framing (+263% coverage headroom vs +77% leverage headroom, using each covenant's own signed-headroom formula at *today's* actual levels) reads as if coverage has far more room. That framing is correct for headroom at the current level, but it is not the same question as "which EBITDA decline breaks it first" — coverage is a linear function of EBITDA (the covenant's numerator), while leverage is an inverse function of EBITDA (the covenant's denominator), so the two break-even points end up close together even though today's headroom percentages look very different. Both break points sit far beyond the standard 30–60% haircut range tested in §2 — no covenant breach occurs within any scenario modeled above.

## 4. Survival Read

Norsk Hydro survives a 30–60% EBITDA decline without a covenant breach, a liquidity gap, or any need for an equity raise, distressed asset sale, or covenant waiver — even the harshest modeled case (−60% EBITDA, net debt/EBITDA rising to 2.56x) leaves the assumed 3.5x leverage covenant with 26.9% headroom and liquidity in surplus by roughly NOK 27.5 billion. The structure only breaks under a genuinely extreme scenario: an EBITDA collapse of roughly 69–71% (TTM basis) — a decline far beyond a normal recession — which would breach the (unconfirmed, labeled-assumption) coverage covenant marginally before the leverage covenant; liquidity itself does not run out even if EBITDA fell to zero for a full year, because the NOK 40,980m of committed, restriction-adjusted liquidity dwarfs the NOK 10,723m of maturities-plus-dividend-floor obligations that liquidity would actually need to cover. A 30–40% EBITDA decline — the range of a normal recession, not a tail event — is comfortably survivable on the company's own balance sheet, with no external action required. **Market closure test:** assuming no new unsecured refinancing access for 12 months, liquidity still holds — the NOK 8,250m due within 12 months (per `02`) is covered 1.36x by cash on hand alone (NOK 11,251m, Q1 2026) before touching the NOK 24,194m fully undrawn, committed revolver or any FCF; nothing breaks first under closed markets because the near-term wall is small and pre-funded. Norsk Hydro is **not net cash** on the canonical strict basis (net debt NOK 22,503m, Q1 2026) — this is a low-leverage, liquidity-rich balance sheet rather than a net-cash one, and its resilience in this stress test comes from the combination of low starting leverage (1.02x TTM), deep committed liquidity (NOK 40,980m, ~1.9x the gross annual near-term uses bucket), and covenant thresholds (even if the real, undisclosed thresholds are tighter than the 3.5x/3.0x labeled assumptions used here) that would need to move a very long way before an EBITDA decline alone forces a breach. The two real, disclosed vulnerabilities this stress test cannot fully close are the same ones flagged upstream: 75.6% of the debt stack carries no disclosed rate type (so a genuine rate shock could be larger than modeled here), and the tightest covenant figures throughout are labeled assumptions, not confirmed thresholds — a real covenant at the part-owned-subsidiary level, undisclosed in amount or terms, remains a residual unknown this stress test cannot rule out.
