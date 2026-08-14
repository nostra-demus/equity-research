# Earnings Module Memo — ORCL

**Verdict: Mixed earnings setup** — sales are genuinely speeding up (+17.3% in FY26), but reported profit leans on a one-time gain and an unresolved margin lag, so this is not a clean "earnings accelerating" read.

Memo date: 2026-08-14. Source: `99_earnings-synthesis.md` (earnings module, ORCL run 2026-08-14). This memo condenses that synthesis and adds nothing to it.

---

## 1. Scores at a Glance

| Score | Value | Source in synthesis |
|---|---|---|
| Earnings quality | **62/100** — "mostly clean but some working capital or adjustment noise" | `06_earnings-quality` |
| Consensus setup | **50/100** — higher = more beatable; a middle reading, "Bar is fair" | `04_guidance-consensus` (no numeric score output; synthesis assigned 50 from that agent's verdict) |
| Earnings volatility | **68/100 — INVERTED, higher is WORSE**; "High volatility" band | `07_earnings-sensitivity` |
| Next-quarter setup | **Balanced** (not tilted toward a beat) | `05_beat-miss-setup` §8 |
| Red-flag severity | **Material concerns** — high-severity flags present; earnings setup may be overstated or fragile. Zero Critical, 11 High, 11 Medium, 2 Low, 1 Unclear | `08_earnings-red-flags` §5 (verbatim) |

**Score caps applied:** one — the "only inferred sensitivities" cap. Five of the six sensitivity variables are inference-based; only foreign-exchange (FX) carries a company-disclosed sensitivity. This caps *confidence* in the 68/100 volatility score at Low; it does not change the number itself. No other cap fired — the data pool is graded Sufficient with no active gaps [`00_earnings-data-triage` §5–6].

**Avoid-Big-Risks (§24) filters:** the synthesis carried no separate §24 filter table for this module. It did record two of its own leverage triggers firing (§5b): net debt / EBITDA at 4.46x, above the 3.0x threshold, and total debt up 54% year over year to $167.4B, above the 50% threshold.

---

## 2. What This Module Found

Oracle's sales growth is real and demand-led, not an accounting effect. Revenue grew 17.3% in FY26 against 8.4% the year before, and quarterly growth rose in every quarter of the year (12.2% → 14.2% → 21.7% → 20.6%) [`01_historical-financials` §1; `02_revenue-drivers` §3–4].

The single biggest driver is cloud infrastructure (OCI) capacity being converted from the order book. That order book — RPO, or contracted-but-not-yet-recognised revenue — grew 363% in a year to $638B, and OCI revenue of $18,101M (+77%) supplied 79% of FY26's entire revenue growth. Management describes the business as supply-constrained, not demand-constrained: 98% of AI datacenter capacity is already contracted and GPU utilisation is 97.5% [`02_revenue-drivers` §4, §6a, §7].

The earnings line does not confirm the revenue line. GAAP operating margin (profit from operations under audited accounting rules, as a share of sales) was flat-to-down at 30.59% versus 30.80%, a fall of 21 basis points (0.21 percentage points). That flat result hides two big opposing forces: cost of revenue took 469bps out of gross margin as new data centers started costing money before earning their full contracted revenue, and 502bps of operating-cost leverage nearly cancelled it out [`03_margin-drivers` §3, §7–8]. Management has guided FY27 gross margin to step down further, with recovery only once data centers reach "full contractual revenue levels" — a lag it declines to size beyond "multiple quarters."

Reported profit is flattered. GAAP diluted EPS (earnings per share) of $5.83 grew 34.3%, but a $2.7B+ one-time investment gain (the Ampere Computing sale plus Bloom Energy warrants) is inside that number; management's own forward math uses 18% growth excluding those gains, not 34% [`06_earnings-quality` §4–5]. The gap between reported (GAAP) and management-adjusted operating income has run 39–42% for two straight years, driven mainly by $4,811M of stock-based compensation excluded in full — equal to 28.2% of GAAP net income, and not narrowing [`06_earnings-quality` §4, §7].

The biggest risk is customer concentration colliding with debt. Four customers each contracted more than $8B in Q4 FY26 alone (AMD, Meta, NVIDIA, OpenAI, TikTok, xAI are the named large counterparties). A stress case implies roughly $6.9B of EBITDA downside — about 23% of FY26 EBITDA — largely outside Oracle's control [`07_earnings-sensitivity` §4]. That sits on top of total debt of $167.4B, up 54%, with net debt (total debt minus cash, strict basis) of $136,143M and net debt / EBITDA of 4.46x, the highest in the five-year window [`01_historical-financials` §1; `08_earnings-red-flags` §1].

The cash position cuts both ways. Cash from operations against EBITDA — how much of book profit turns into actual cash — was 104.9% reported and about 89.6% once a $4,642M one-off customer prepayment is stripped out, which is genuinely healthy [`06_earnings-quality` §1]. But free cash flow (operating cash minus capital spending) swung from -$394M to -$23,686M as net capex jumped 162% to $55,663M, S&P cut Oracle to BBB- on 2026-07-09 (one notch above non-investment grade), and the dividend is now funded by debt rather than free cash flow [`01_historical-financials` §1; `08_earnings-red-flags` §1].

The bar into the next print is fair, not easy. Guidance and Street estimates sit within ±0.1%–0.7% of each other: the FY2027 revenue guide is $90,000M against a Street mean of $89,336.55M (-0.74%), and the non-GAAP EPS guide of $8.05 versus a Street mean of $8.05313 is essentially in-line [`04_guidance-consensus` §3].

---

## 3. The Specialists, Briefly

| Specialist | One-line finding |
|---|---|
| earnings-data-triage | Sufficient — full pool (audited 10-K, verbatim FQ3/FQ4 transcripts, live consensus, FY2016–FY2026 quarterlies, segment P&L); nothing capped. |
| historical-financials | Revenue accelerating, margins split; the capex ramp ($21,215M → $55,663M, +162%) turned FCF from -$394M to -$23,686M and pushed net debt/EBITDA to 4.46x. |
| revenue-drivers | Cloud infrastructure / RPO conversion is the single biggest driver — 79% of FY26 growth, organic and demand-led; RPO +363% to $638B. |
| margin-drivers | Cost of revenue is the biggest margin driver at -469bps, guided to worsen in FY27; net margin moved only -21bps because +502bps of opex leverage nearly offset it. |
| guidance-consensus | Bar is fair — guidance and consensus within ±0.1%–0.7%; the quality-adjusted "clean" EPS beat rate over four quarters is closer to a coin flip once one-time gains are stripped from two of three beats. |
| beat-miss-setup | Setup is balanced; the deciding factor is whether the unquantified capex-to-revenue margin lag tracks management's guided pace. FQ1 is Oracle's smallest, thinnest-margin quarter, and the year-ago comp missed both lines. |
| earnings-quality | 62/100 — headline GAAP EPS growth of +34% is inflated by a $2.7B+ one-time gain management itself excludes (18% ex-gains). |
| earnings-sensitivity | 68/100 volatility (inverted) — AI-customer concentration is the highest-sensitivity variable, ~$6.9B EBITDA downside (≈23% of FY26 EBITDA) in a stress case. |

**Disagreement worth knowing (resolved by the synthesis, not reopened here).** `01_historical-financials` labelled the EBIT trend "Inflecting" using a Capital IQ figure (33.2% FY26) that excludes restructuring charges, while `03_margin-drivers` shows GAAP operating margin roughly flat-to-down (-21bps) for the same year. The synthesis applied CLAUDE.md §4/§5 — the audited GAAP figure outranks a vendor construct that excludes a real expense — and treats the flat-to-down read as the credible trend. A second tension (earnings quality 62/100 versus the business-model modules' capital-allocation read of 42/100) was carried as two different questions, narrow cash-earnings quality versus broad capital-allocation discipline, rather than averaged into one reassuring number.

---

## 4. What Would Change This Read

**Would upgrade it:** a clean (non-one-off) EPS beat without a gross-margin miss for one to two consecutive quarters; the FY2027 gross-margin step-down resolving faster than "multiple quarters"; RPO growth continuing with no named large customer slowing; net debt/EBITDA stabilising or falling as capex moderates.

**Would downgrade it:** a pullback, delay, or renegotiation by one of the four concentrated large AI-infrastructure customers; the margin-timing lag running longer than management's own guide assumes; a further S&P or Moody's downgrade toward non-investment grade; the restructuring-funded operating-cost savings proving non-repeatable once the 2026 Plan completes.

**Data that would settle it:** a quantified capex-to-revenue conversion lag in quarters rather than qualitative language; a company-disclosed interest-rate sensitivity on the $167.4B debt load; a customer-level concentration limit or diversification metric; the split of capex between maintenance and growth. A debt maturity schedule is also absent — no upstream output reports maturities, weighted-average interest rate, or the share of debt due within 24 months ("Not proven from available data").

---

## 5. Bottom Line

- **Verdict: Mixed earnings setup**, with a red-flag severity verdict of **Material concerns** — 11 High-severity flags, zero Critical.
- **Best case for it being better than it looks:** the revenue acceleration is real, organic and demand-led — not FX (only ~1pp of the 17.3%) and not acquisitions — against an order book up 363% to $638B in a supply-constrained business, with normalised cash conversion still around 90% of EBITDA.
- **Best case for it being worse than it looks:** margins are guided to deteriorate further with an unquantified lag; the +34% headline EPS growth is 18% once one-time gains come out; free cash flow is -$23.7B; debt is $167.4B (+54%) with a BBB- rating and a dividend now funded by debt.
- **What is missing:** a quantified capex-to-revenue margin lag, a company-disclosed interest-rate sensitivity on the debt, and a debt maturity schedule. Five of six sensitivity variables are inference-based, which caps confidence in the 68/100 volatility score at Low.
- **The one thing to watch next:** FQ1 FY2027, due 2026-09-04 — Oracle's seasonally smallest and thinnest-margin quarter, whose year-ago comparison missed on both revenue and EPS. The specific test is whether a revenue beat arrives *without* a gross-margin miss.

---

## 6. Plain-English Glossary

- **GAAP** — the audited accounting rules companies must report under; "non-GAAP" is management's own adjusted version of the same numbers.
- **EPS (earnings per share)** — profit divided by the number of shares outstanding.
- **EBITDA** — profit before interest, tax, depreciation and amortisation; a rough proxy for operating cash profit.
- **Gross margin / operating margin** — profit left after direct costs, and after all operating costs, expressed as a share of sales.
- **Basis point (bp)** — one hundredth of a percentage point; 100bps = 1%.
- **RPO (remaining performance obligations)** — revenue already contracted with customers but not yet recognised in the accounts; an order book.
- **Capex (capital expenditure)** — money spent building or buying long-lived assets, here mainly data centers.
- **Free cash flow (FCF)** — cash from operations minus capital spending; what is left over for debt, dividends and buybacks.
- **CFO / EBITDA** — how much of book profit actually arrives as operating cash.
- **Net debt (strict basis)** — total borrowings minus cash and equivalents.
- **Net debt / EBITDA** — years of current operating cash profit it would take to repay net borrowings; higher means more stretched.
- **Stock-based compensation** — pay issued in shares rather than cash; a real cost to shareholders through dilution (their ownership share shrinks).
- **BBB-** — the lowest investment-grade credit rating; one notch below is non-investment grade, which raises borrowing costs.
- **Consensus / the bar** — the average of Wall Street analyst forecasts a company is judged against at each results print.
- **Days payable outstanding (DPO)** — how long a company takes to pay suppliers; here it nearly tripled from 43 to 128 days.
- **Constant currency** — growth measured with exchange rates held fixed, stripping out FX effects.
