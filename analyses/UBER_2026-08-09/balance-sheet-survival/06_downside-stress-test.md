# Downside Stress Test — UBER

Reporting currency: **USD** ($ millions unless stated). Reporting standard: US GAAP. All base-case figures are as of **June 30, 2026** (Q2 FY26 10-Q, filed Aug-05-2026), consistent with `01`–`05`. EBITDA basis: **reported/unadjusted TTM EBITDA (income from operations + total D&A), $7,474M, Jul-2025–Jun-2026** — this is the basis `01`, `02`, and `04` all use, and it is confirmed **cash-backed**: cash from operations (CFO) ran 160.0% of unadjusted EBITDA in FY2025 and 201.8% in FY2024 [earnings/06_earnings-quality.md §1–2], so unadjusted EBITDA is used here rather than Uber's stale, discontinued "Adjusted EBITDA" ($8,730M, last disclosed FY2025 only). All formulas below were run through an executed Python script; the script and its output are reproduced inline under each section so every number can be checked.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | $7,474M (TTM, unadjusted) | `01` §5, §7; cross-checked `earnings/06_earnings-quality.md` §1–2 (CFO/EBITDA 160–202%) |
| Net debt | $8,163M (strict basis) | `01` §4, §7 — canonical basis this module designates |
| Net debt / EBITDA | 1.09x | Computed: 8,163 / 7,474 |
| EBITDA / interest | 16.2x | `04` §1 (interest = $462M TTM gross) |
| Tightest covenant + threshold | **None disclosed** for any Uber debt instrument. Indicative labeled-assumption covenant used per partial-data rule: max net leverage 4.0x | `04` §2 — "Not assessable," illustrative assumption, *Inference, not from filings* |
| Next-12m obligations | $2,830M (debt maturities $2,136M + cash interest $386M + maintenance capex $308M + committed dividends/buybacks $0) | `03` §2 |
| Committed liquidity | $10,067M (cash $4,870M + ST investments $521M + revolver availability $4,676M) | `03` §1 |
| Floating-rate debt (gross) | $2,000M (15.5% of the debt stack — 2026 Term Loan, Term SOFR + 0.825%) | `01` §1; `02` §3 |
| Hedge coverage (if any) | **None disclosed on the floating Term Loan.** Uber hedges transaction-level FX with forward contracts, but no interest-rate hedge (swap/cap) on the Term Loan is disclosed in this pool | `02` §3; `business-model/10_external-dependency.md` §1 (FX hedging only) |
| Working-capital seasonality / peak build | No dollar peak disclosed. Working capital has been a net **source** of cash in every year FY2021–FY2025 ($1,682M/$335M/$165M/$2,374M/$2,227M); Q4 is the strongest revenue quarter (~27% of the year), Q1 the weakest (~23%) — mild seasonality, no flag tripped | `03` §3 (Seasonality hard check); `earnings/06_earnings-quality.md` §1, §3 |

State of the reporting currency: **USD** throughout. EBITDA basis stated above.

**Cycle-position caveat carried forward from `01`:** TTM EBITDA ($7,474M) is a near-peak, post-COVID-recovery reading — Uber ran **negative** unadjusted EBITDA in FY2021 (−$2,932M) and FY2022 (−$885M) [earnings/06_earnings-quality.md §1]. The 3-year (FY2023–FY2025) average EBITDA of $3,927M is shown throughout as a conservative, "recent average, not true mid-cycle" cross-check, per `01` §5.

**Pending acquisition (pro-forma) flag — read before the haircuts below.** On July 16, 2026, Uber signed a business combination agreement to acquire Delivery Hero SE (implied equity value $14.8bn) and executed a €14.2bn (≈$15.3bn) senior unsecured bridge credit agreement to help fund it. The deal is **not** in the June 30, 2026 balance sheet above, is undrawn, and is not expected to close until H2 2027 [`01` §1; `02` "Read this first"; `business-model/11_capital-allocation-governance.md`]. Because this is the dominant forward capital-structure event every upstream module flags, Section 1a builds a pro-forma base and Section 2b re-runs the haircuts against it, per the module's pending-acquisition rule. The main Section 2 stress table below runs on the **actual, today's** balance sheet — the near-term (12-month) survival test this module is built to answer — with the pro-forma overlay kept explicit and separate so the two are never blended silently.

### 1a. Pro-Forma Base (pending Delivery Hero acquisition)

Net-debt basis: **strict** (same basis `01` designates as canonical — §15).

| Step | Value | Note |
|---|---:|---|
| Current net debt (strict) | $8,163M | `01` §4 |
| + Debt-funded portion of consideration | $15,300M | Full €14.2bn (≈$15.3bn) bridge facility, assumed drawn in full — the same conservative convention `01`/`02`/`04` all use ("if drawn in full it would roughly double Uber's existing debt stack"), since the actual cash-vs-debt funding split is **not disclosed** (Uber states only that funding will come "through existing cash on our balance sheet and new debt financing") [`01` §1; `02` "Read this first"] |
| + Target's own consolidating net debt | **Not disclosed in this data pool.** The deal's cash/debt-free structure is not stated in the extracted filing text. Omitting it understates true pro-forma net debt if Delivery Hero carries net debt of its own at close | Flag, not from filings |
| **Pro-forma net debt (strict)** | **$23,463M** | Computed: 8,163 + 15,300 |
| Uber-only TTM EBITDA (denominator, unchanged) | $7,474M | Target's own EBITDA **not disclosed in this pool** — this Uber-only-pool has no Delivery Hero filing; the ratio below therefore has a **mismatched perimeter** (acquired debt in the numerator, no acquired EBITDA in the denominator) and is not a true pro-forma multiple — it is shown as the best available reading, explicitly flagged, not as a precise bracketed range, because no sourced Delivery Hero EBITDA figure exists in this pool to bracket it with | `01` §5, §7 |
| **Pro-forma net debt / EBITDA (peak/latest, Uber-only EBITDA)** | **3.14x** | Computed: 23,463 / 7,474 — matches `04` §3's own cross-check exactly |
| **Pro-forma net debt / EBITDA (mid-cycle/normalised, 3-yr avg $3,927M, Uber-only EBITDA)** | **5.97x ≈ 6.0x** | Computed: 23,463 / 3,927 |

The gap between 3.14x (peak) and 5.97x (mid-cycle) is the same "how much of today's low leverage is margin-cycle timing" question `01` raises, now carried through the pending deal — **peak-EBITDA pro-forma leverage (3.14x) is a floor, not the central estimate**; on Uber's own recent-average EBITDA the pro-forma structure is close to 6x, a materially more levered credit than today's actual 1.09x — even before any Delivery Hero-side debt or EBITDA is added. Since Delivery Hero's own EBITDA is not sourced in this pool, the true pro-forma multiple could sit either side of 3.14x depending on the target's profitability and its own consolidating debt — this is stated as a genuine unknown, not resolved with an invented number.

```
Executed calc (python3):
net_debt_pf = 8163 + 15300 = 23463
23463/7474  = 3.14
23463/3927  = 5.97
```

## 2. Stress Scenarios (run against today's actual balance sheet)

Net debt held constant at $8,163M across the EBITDA haircuts (no debt paydown/increase assumed unless a scenario says so). Interest held constant at $462M except the rate-shock column. Covenant = the illustrative max-net-leverage 4.0x construct from `04` (MAX/ceiling form, direction-aware); no real covenant is disclosed, so every "breach?" cell below is **indicative**, not a real-covenant read.

Liquidity gap formula (net-of-FCF basis, per `03`'s own basis choice and MODULE_RULES §8): `gap = next-12m obligations ($2,830M [+ WC shock where applied]) − stressed FCF(h)`. Stressed FCF scaling: `stressed FCF(h) ≈ FCF_base − EBITDA·h·(1−tax)`, FCF_base = $10,116M (TTM CFO $10,424M − capex $308M [`03` §3]), **tax = 21%** (US federal statutory rate, a labeled simplifying assumption — *Inference, not from filings*; Uber's actual recent cash tax rate has been unusually low due to NOL carryforwards from the FY2024/FY2025 deferred-tax-asset valuation-allowance releases [earnings/06_earnings-quality.md §5], so this 21% assumption is conservative, not generous, versus recent lived experience). A negative gap = surplus (uses < stressed FCF); shown as such rather than forced into a small "months" figure.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | $7,474M | $5,232M | $4,484M | $2,990M | $4,484M | $4,484M |
| Net debt / EBITDA | 1.09x | 1.56x | 1.82x | 2.73x | 1.82x | 1.82x |
| EBITDA / interest | 16.2x | 11.3x | 9.7x | 6.5x | 9.7x | 8.9x (interest $502M) |
| Tightest covenant headroom (illustrative 4.0x) | +72.7% | +61.0% | +54.5% | +31.7% | +54.5% | +54.5% |
| Covenant breach? (Y/N) | N | N | N | N | N | N |
| 12-month liquidity gap | −$7,286M (surplus) | −$5,515M (surplus) | −$4,924M (surplus) | −$3,743M (surplus) | −$3,819M (surplus) | −$4,893M (surplus) |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

**WC shock assumption (labeled, not disclosed by the company):** no seasonal peak build is disclosed [`03` §3]. This report applies a labeled outflow of **2% of TTM revenue ($55,227M [earnings/01_historical-financials.md §2]) = $1,105M**, added to the 12-month uses bucket. This is a precautionary assumption that runs against the disclosed direction of the evidence — working capital has been a net cash **source** every year FY2021–FY2025 — so it is deliberately conservative, not calibrated to an actual disclosed seasonal figure.

**Rate shock:** +200bp applied to the $2,000M floating-rate Term Loan only (no hedge disclosed) = +$40M annual interest, taking TTM interest from $462M to $502M. Floating exposure is small (15.5% of the stack), so the coverage and liquidity impact is minor, consistent with `02` §3's own finding (~$20M per 100bp on this tranche).

**Market closure test (no new unsecured issuance for 12 months):** even at the −60% EBITDA haircut, the entire 12-month uses bucket ($2,830M) is covered by stressed FCF alone ($6,573M) without touching a dollar of the $10,067M committed liquidity or the undrawn $4.68bn revolver — consistent with `02`'s finding that the legacy $2,136M 12-month maturity wall is covered by unrestricted cash alone (§4–5). **What breaks first under market closure is nothing in the legacy debt stack** — the untested variable is whether the €14.2bn Delivery Hero bridge can be termed out even if unsecured markets are shut (Section 4).

```
Executed calc (python3, base + three haircuts, WC-shock and rate-shock scenarios):
h=0.30: EBITDA=5,232  ND/EBITDA=1.56x  cov=11.32x  headroom(4.0x)=61.0%  breach=False  FCF_s=8,345  gap=-5,515
h=0.40: EBITDA=4,484  ND/EBITDA=1.82x  cov=9.71x   headroom(4.0x)=54.5%  breach=False  FCF_s=7,754  gap=-4,924
h=0.60: EBITDA=2,990  ND/EBITDA=2.73x  cov=6.47x   headroom(4.0x)=31.7%  breach=False  FCF_s=6,573  gap=-3,743
h=0.40 + WC shock 1,105: uses=3,935  FCF_s=7,754  gap=-3,819
h=0.40 + rate +200bp: interest=502  cov=8.93x  FCF_s=7,723  gap=-4,893
Base (h=0): FCF_s=10,116  gap=2,830-10,116=-7,286
```

## 2a. History-calibrated scenario (not a hard "deep cyclical" flag, but real)

`business-model/10_external-dependency.md` scores Uber's external-dependency risk 54/100 ("material exposure, mixed mitigation" — not the 61–80 "mostly externally driven" band), and `07_business-quality.md` scores cyclicality 47/100 (mixed). Neither is a hard commodity/deep-cyclical flag. But Uber's **own** history contains a real, sourced trough far worse than any of the −30/−40/−60% constructs above: unadjusted EBITDA was **negative** in FY2021 (−$2,932M) and FY2022 (−$885M), with FY2021 actual CFO of **−$445M** and FCF of **−$743M** [earnings/06_earnings-quality.md §1]. That decline (from a "peak" reading years later of $7,474M TTM) is a >100% haircut fraction — EBITDA does not just shrink, it goes negative — so it cannot be expressed as an `h` inside the 0–1 haircut framework used above. It is shown directly, using the actual historical dollar levels:

| Metric | If FY2021's actual EBITDA/CFO/FCF recurred, applied to today's balance sheet |
|---|---:|
| EBITDA | −$2,932M |
| Net debt / EBITDA | Not meaningful (EBITDA negative) |
| EBITDA / interest | **−6.35x** — coverage fails outright; a min-coverage covenant, if one existed, would breach |
| 12-month uses | $2,830M |
| CFO / FCF at FY2021 actual level | −$445M / −$743M (an actual cash **use**, not a source) |
| 12-month liquidity gap (uses − FCF) | $2,830M − (−$743M) = **$3,573M** draw on committed liquidity |
| Committed liquidity | $10,067M |
| Liquidity cushion after the draw | **$6,494M** — liquidity still covers the gap **2.8x** over |

```
Executed calc (python3):
gap_hist = 2830 - (-743) = 3573
cushion = 10067 - 3573 = 6494
cov_2021 = -2932/462 = -6.35
```

**Read:** even a literal repeat of Uber's worst historical shock on record — a full return to COVID-era negative EBITDA — would not exhaust today's much larger liquidity pool ($10,067M committed vs. the far smaller cash position Uber held in 2021). What it *would* do is flip interest coverage negative, which is the clearest evidence in this report that a **coverage-based** covenant (if one existed) is the more exposed structure type than a **leverage**-based one at extreme stress, since net debt/EBITDA becomes undefined (not comfortably high) once EBITDA turns negative.

## 2b. Pro-Forma (post-Delivery-Hero) Stress — supplementary

Per the pending-acquisition rule, the haircuts are also run against the **pro-forma base** from Section 1a (net debt $23,463M; Uber-only EBITDA, mismatched perimeter as flagged). This is the single most important table in this report.

| Metric | Pro-forma base (no haircut) | Pro-forma −30% | Pro-forma −40% | Pro-forma −60% |
|---|---:|---:|---:|---:|
| EBITDA | $7,474M | $5,232M | $4,484M | $2,990M |
| Pro-forma net debt / EBITDA | 3.14x | 4.48x | 5.23x | 7.85x |
| Illustrative covenant headroom (4.0x) | +21.5% | **−12.1%** | **−30.8%** | **−96.2%** |
| Covenant breach? (Y/N, illustrative) | N | **Y** | **Y** | **Y** |
| EBITDA / interest (unchanged, interest not yet re-priced for bridge-to-term debt) | 16.2x | 11.3x | 9.7x | 6.5x |

```
Executed calc (python3):
Pro-forma base:  ND/EBITDA=3.14x  headroom=21.5%  breach=False
Pro-forma -30%:  ND/EBITDA=4.48x  headroom=-12.1% breach=True
Pro-forma -40%:  ND/EBITDA=5.23x  headroom=-30.8% breach=True
Pro-forma -60%:  ND/EBITDA=7.85x  headroom=-96.2% breach=True
```

**This flips the survival read entirely for the illustrative covenant.** Pre-deal, EBITDA has to fall 72.7% before the illustrative 4.0x covenant bites (Section 3 below). Post-deal (assuming the bridge is drawn in full, per the conservative convention used throughout `01`/`02`/`04`), only a **30% EBITDA decline — an ordinary recession, not a tail event — is already enough to breach it.** This table does not include: (i) Delivery Hero's own EBITDA (which, if positive and material, would improve the ratio — not sourced in this pool), (ii) Delivery Hero's own consolidating net debt (which, if any, would worsen it), or (iii) the higher interest cost of terming out the bridge into permanent debt (which would push EBITDA/interest lower than shown). None of these can be filled in from this pool — they are the open questions that determine whether the pro-forma structure is closer to the 3.14x floor or materially worse.

## 3. Break Points (solved against today's actual balance sheet, Section 1)

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches (illustrative 4.0x max net leverage, MAX/ceiling form) | **72.7%** |
| Committed liquidity exhausted within 12 months | **Does not breach on an EBITDA decline alone** (linear-scaling solve returns h ≈ 294%, i.e. h ≥ 1 — see caveat below) |
| Net leverage exceeds 6.0x (illustrative refi-market threshold) | **81.8%** |

**Solve (a) — covenant breach, MAX/ceiling form:** `h = 1 − net debt ÷ (T · EBITDA) = 1 − 8,163 ÷ (4.0 × 7,474) = 1 − 8,163/29,896 = 0.727` → **72.7%**. This matches `04` §3's own independent cross-check exactly. Because no real covenant is disclosed (`04` §2), this break point is **indicative only** — built on the module's own labeled-assumption threshold, not a fact from the filings.

**Solve (b) — liquidity exhaustion:** `usable liquidity + stressed FCF(h) = next-12-month obligations` → `10,067 + (10,116 − 7,474·h·0.79) = 2,830` → `h = (10,067 + 10,116 − 2,830) ÷ (7,474 × 0.79) = 17,353 ÷ 5,904.5 = 2.94`. Since `h ≥ 1`, **liquidity does not exhaust on an EBITDA decline alone** under this linear scaling — even a complete elimination of EBITDA (h=1) leaves stressed FCF at a modeled +$4,212M, because CFO has historically run well above EBITDA (working-capital inflows, insurance-reserve float growth, SBC add-back). **This is flagged, not asserted with false precision:** the linear approximation is optimistic at extreme haircuts — checked against Uber's own FY2021 actual result (EBITDA −$2,932M, a decline of ~139% from today's base), the linear formula would have predicted FCF of roughly +$1,909M, but Uber's actual FY2021 FCF was **−$743M**. Section 2a uses the real historical dollar levels instead of the linear formula for that reason, and even there — the actually-observed worst case — liquidity is not exhausted (a $3,573M draw against $10,067M of committed liquidity, a $6,494M cushion). The liquidity break point is therefore not reached under any plausible or historically-observed EBITDA decline mapped in this report.

**Solve (net-leverage-threshold row, MAX form, T = 6.0x):** `h = 1 − 8,163 ÷ (6.0 × 7,474) = 1 − 8,163/44,844 = 0.818` → **81.8%**. The 6.0x threshold is a labeled assumption (a level commonly associated with tightening refinancing conditions for an unsecured corporate borrower) — *Inference, not from filings*; no credit-rating trigger level is disclosed in this pool beyond the S&P BBB+ rating noted in `02` §4.

**Pro-forma covenant-breach solve (Section 2b, same T=4.0x form, pro-forma net debt $23,463M):** `h = 1 − 23,463 ÷ (4.0 × 7,474) = 1 − 23,463/29,896 = 0.215` → **21.5%**. This is the single most decision-relevant break point in this report: it moves the illustrative covenant break point from a 73%-decline tail event today to a 22%-decline event once the pending, largely debt-funded Delivery Hero deal is layered on — well inside the range of an ordinary recession.

```
Executed calc (python3):
h_cov       = 1 - 8163/(4.0*7474)  = 0.727
h_refi_6x   = 1 - 8163/(6.0*7474)  = 0.818
h_liq_lin   = (10067+10116-2830)/(7474*0.79) = 2.939  (>=1, does not breach)
h_cov_pf    = 1 - 23463/(4.0*7474) = 0.215
```

## 4. Survival Read

On today's actual balance sheet, Uber's structure does not break at any EBITDA decline this report can plausibly construct: the illustrative 4.0x covenant (no real covenant is disclosed [`04`]) needs a 72.7% EBITDA decline to breach, committed liquidity ($10,067M) does not exhaust on an EBITDA decline alone, and even a literal replay of Uber's own worst historical result (FY2021's negative EBITDA and negative FCF) leaves a $6,494M liquidity cushion — a 30–40% EBITDA decline, an ordinary recession rather than a tail event, is comfortably survivable with no waiver, asset sale, or equity raise. That comfortable picture changes entirely once the pending €14.2bn Delivery Hero acquisition bridge is layered on (Section 2b): assuming it is drawn in full — the same conservative convention `01`, `02`, and `04` all use, since the actual cash/debt funding split is not disclosed — pro-forma net leverage rises from 1.09x to 3.14x on today's peak EBITDA and to roughly 6.0x on Uber's own recent-average EBITDA, and the illustrative covenant break point collapses from a 72.7% EBITDA decline to just **22%**. Under a market-closure test (no new unsecured issuance for 12 months), today's legacy debt stack clears every maturity from cash alone with no market access needed; the untested variable is whether the bridge facility itself — undisclosed maturity, undisclosed pricing, and explicitly intended to be termed into permanent debt in Q3 2026 — can be refinanced if unsecured markets are shut, since neither this report nor `02` can assess a facility whose terms are not in the pool. Uber is **not** net cash (strict net debt $8,163M positive per `01`), so the net-cash framing does not apply; today's balance sheet is genuinely resilient to an organic EBITDA shock, but that resilience is being spent down by a large, discretionary, debt-funded acquisition that this stress test's central finding is: the real downside risk to Uber's balance sheet is not a demand-driven earnings decline, it is what the company chooses to do with its own balance sheet.

Out-of-scope request received: none. This report assigns no probability to the downside scenarios above and issues no rating — those belong to the master synthesizer.
