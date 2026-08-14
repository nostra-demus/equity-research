# Earnings Module Memo — ORCL

**Verdict: Mixed earnings setup** — sales are clearly speeding up (+17.3% in FY26, guided +27%–29% for the next quarter), but operating margin is roughly flat and guided to worsen, and the reported profit jump leans on items that will not repeat.

Memo date: 2026-08-14. Source: `99_earnings-synthesis.md` (earnings module, ORCL run 2026-08-14). This memo condenses that synthesis and adds nothing to it.

---

## 1. Scores at a Glance

| Score | Value | Source in synthesis |
|---|---|---|
| Earnings quality | **62/100** — "mostly clean but some working capital or adjustment noise" | `06_earnings-quality.md` |
| Consensus setup *(higher = more beatable)* | **52/100** — bar assessed "fair" | `04_guidance-consensus.md` |
| Earnings volatility | **68/100 — INVERTED, higher is WORSE**; "High volatility" band; confidence Low on the precise number | `07_earnings-sensitivity.md` §7 |
| Next-quarter setup | **Balanced** | `05_beat-miss-setup.md` |
| Red-flag severity | **Material concerns** — high-severity flags present; earnings setup may be overstated or fragile. 23 flags: 11 High, 11 Medium, 2 Low, 1 Unclear, zero Critical | `08_earnings-red-flags.md` §5 (verbatim) |

**Read the 62/100 with company alongside it.** The synthesis says the earnings-quality score should not be read in isolation: the business-model module grades the same underlying facts 42/100 on capital allocation and governance ("capital allocation concerns"). The synthesis carries both rather than letting the narrower, more comfortable score stand alone. The two grade different questions — narrow cash-earnings quality versus the broader debt, dividend and credit-rating picture [`99_earnings-synthesis.md` §3.2].

**Score caps applied:** one. The "only inferred sensitivities" cap fired — 5 of the 6 sensitivity variables rest on inference, and only foreign exchange (FX) carries a company-disclosed sensitivity [FY26 10-K, Item 7A]. That sets **confidence Low** on the precise 68/100 figure; the High-volatility band read stands and the number itself is unchanged. No other cap fired — the module's own data-sufficiency verdict is "Sufficient" with no active partial-data caps [`00_earnings-data-triage.md` §5–6].

**Avoid-Big-Risks (§24) filters:** the synthesis carried no separate §24 filter table for this module. It did record its own two leverage triggers firing (§5b): net debt to EBITDA at 4.46x, above the 3.0x trigger, and total debt up 54% in one year to $167.4bn, above the 50% trigger.

---

## 2. What This Module Found

Revenue growth is real, organic and demand-led. FY26 revenue rose 17.3% ($57,399M → $67,357M), and foreign exchange plus acquisitions together explain only about 1 percentage point of that [`01_historical-financials.md` §1; `02_revenue-drivers.md` §3].

The single biggest driver is cloud infrastructure (OCI) capacity being converted from the order book. Contracted-but-not-yet-recognised revenue (RPO) grew 363% in a year to $638bn, OCI revenue reached $18,101M (+77%), and that conversion supplied 79% of FY26's revenue growth with essentially no unexplained residual. The business is currently limited by data-center supply, not customer demand — 98% of AI capacity is already contracted [`02_revenue-drivers.md` §4, §6a–7].

But this pace is not a baseline to extrapolate. FY26's growth sits well above Oracle's own 5-year revenue growth rate and above management's own guided FY25–FY30 long-term rate of 31%, so the synthesis reads it as close to a cycle peak rather than a steady run rate [`02_revenue-drivers.md` §7].

Margins do not confirm the revenue story. GAAP operating margin — profit from operations under audited accounting rules, as a share of sales — was roughly flat at 30.59% versus 30.80%, down 21 basis points (0.21 of a percentage point). Gross margin fell 469 basis points because a new data center costs money the day it turns on but takes "multiple quarters" to earn its full contracted revenue, and management has already pre-announced FY27 gross margin will step down further. Operating-cost leverage of +502 basis points offset the hit almost exactly in FY26, but part of that offset came from a restructuring charge booked under a newly-named plan for the second year running, so its durability into FY27 is an open question [`03_margin-drivers.md` §3, §5, §7–9; `06_earnings-quality.md` §8].

Reported profit is flattered. GAAP diluted earnings per share (profit divided by shares outstanding) of $5.83 grew 34.3%, but inside it sits a one-time $2.7bn investment gain, and the gap between reported (GAAP) and management-adjusted operating profit has run 39%–42% for two straight years, mostly stock-based compensation. Management's own ex-gains figure is 18% growth, not 34% — the synthesis names that as the more defensible starting point for modelling next year [`06_earnings-quality.md` §4, §7, §10; `04_guidance-consensus.md` §2].

The core cash engine is genuinely healthy. Cash from operations against EBITDA — how much of book profit turns into actual cash — was 104.9% reported and 89.6% once a $4,642M one-off customer prepayment is stripped out [`06_earnings-quality.md` §1].

The biggest risk is customer concentration colliding with debt. Four customers each contracted more than $8bn in a single quarter (AMD, Meta, NVIDIA, OpenAI, TikTok and xAI are named). A 20% stress case models $6.9bn of EBITDA downside, roughly 23% of FY26 EBITDA, largely outside Oracle's control. That sits against total debt up 54% in one year to $167.4bn — net debt (borrowings minus cash, strict basis) of $136,143M, or 4.46x EBITDA, the highest in the five-year window — raised specifically to fund capacity built for that same concentrated demand [`07_earnings-sensitivity.md` §2, §4–5; `08_earnings-red-flags.md` §5; `01_historical-financials.md` §1].

Leverage is already constraining what Oracle can do with its cash: buybacks fell to $93M in FY26 from $600M, the $5.8bn common dividend is now funded by debt and preferred-stock proceeds rather than free cash flow (levered free cash flow was -$24.5bn), and S&P cut the issuer credit rating to BBB- on 2026-07-09 — one notch above non-investment grade [`business-model/11_capital-allocation-governance.md` §1–3].

The bar into the next print is fair, not easy. Guidance and Street estimates sit within 0.03%–0.74% of each other: FY27 revenue consensus $89,337M versus a $90,000M guide (-0.74%), and non-GAAP EPS consensus $8.053 versus an $8.05 guide (+0.04%). Positive estimate revisions have thinned to net +2 on both revenue and EPS over the last month, against +22/+10 over three months — and most of that three-month breadth is analysts re-anchoring to the June 2026 print, not an independent re-rating since [`04_guidance-consensus.md` §3, §5].

---

## 3. The Specialists, Briefly

| Specialist | One-line finding |
|---|---|
| earnings-data-triage | Sufficient — audited 10-K, latest 10-Q, two verbatim transcripts, live consensus/revisions, complete quarterly financials FQ1 2016–FQ4 2026; no active caps. |
| historical-financials | Revenue "Accelerating" (17.3% FY26); free cash flow "Decelerating (turned negative)" — capex +162% to $55,663M flipped FCF from -$394M to -$23,686M even as operating cash grew 53.6%. |
| revenue-drivers | Growth is organic and demand-led, supply-constrained not demand-constrained; RPO conversion is 79% of FY26's growth with essentially zero unexplained residual. |
| margin-drivers | GAAP operating margin roughly flat (-21bps); gross margin -469bps and guided to worsen, offset almost exactly by +502bps of operating-cost leverage — two separately earned effects, not one reversing. |
| guidance-consensus | Bar is "fair" — gaps of 0.03%–0.74%; clean-quarter revision breadth thins to net +2 once the post-print re-basing wave is excluded. |
| beat-miss-setup | "Balanced" — hinges on an unquantified capex-to-revenue margin-timing lag; FQ1 is Oracle's smallest, thinnest-margin quarter and the year-ago comp missed both lines. |
| earnings-quality | 62/100 — core cash engine strong (normalised CFO/EBITDA ~90%), but reported growth leans on a one-time gain, recurring "one-off" restructuring and a 39%–42% GAAP-to-non-GAAP gap. |
| earnings-sensitivity | Volatility 68/100 (inverted, High band) — AI-customer concentration inside RPO is the highest-sensitivity variable ($6.9bn EBITDA downside, ~23% of FY26 EBITDA). |

**The disagreement worth knowing (resolved by the synthesis, not reopened here).** `01_historical-financials.md` labelled the profit trend "Inflecting" using a data-vendor figure (33.2% FY26 margin) that leaves restructuring charges out, while `03_margin-drivers.md` shows the audited GAAP operating margin roughly flat-to-down (-21bps). The synthesis applied CLAUDE.md §4/§5 — the audited figure outranks a vendor construct that excludes a real reported expense — and treats the flat-to-slightly-down read as the credible trend.

---

## 4. What Would Change This Read

**Would upgrade it:** FY27 gross margin stabilises or improves faster than management's own guided step-down; and/or the clean (ex-one-off) operating EPS beat rate improves beyond a coin flip for two consecutive quarters [`99_earnings-synthesis.md` §7].

**Would downgrade it:** a pullback, delay or renegotiation from any of the four largest RPO customers; a further gross-margin step-down beyond what is already guided; a second credit-rating downgrade below investment grade [`99_earnings-synthesis.md` §7].

**Data needed to settle it:** FQ1 FY2027 results (due 2026-09-04); a company-disclosed debt maturity and interest-rate schedule; and a customer-level concentration or diversification metric in a future filing [`99_earnings-synthesis.md` §7].

The Mixed classification is not a data gap. Consensus data is live and current, so no no-consensus rule constrains this verdict — the label reflects genuine divergence between an accelerating revenue trend and a flat-to-worsening, one-off-distorted margin and quality trend [`99_earnings-synthesis.md` §7].

---

## 5. Bottom Line

- **Verdict: Mixed earnings setup**, with a red-flag severity verdict of **Material concerns** — 11 High-severity flags, zero Critical.
- **Biggest reason it could be better than it looks:** the revenue engine is real, organic and cash-backed — RPO up 363% to $638bn on named signed contracts, FX and acquisitions only ~1pp of the 17.3% growth, and normalised cash conversion still around 90% of EBITDA.
- **Biggest reason it could be worse than it looks:** the margin deterioration is already guided, not hypothetical (gross margin -469bps and stepping down again); the +34% headline EPS growth is 18% once one-time gains come out; days payable outstanding nearly tripled from 43 to 128 days in two years, meaning part of the build is funded by paying suppliers later; and debt is $167.4bn (+54%) at BBB- with the dividend funded by borrowing.
- **What evidence is missing:** a company-disclosed debt maturity schedule and rate profile — Oracle carries $129.5bn–$167.4bn of debt with no filed interest-rate sensitivity table and no maturity-bucket breakdown in the pool. That is the synthesis's single biggest named gap. Separately, 5 of 6 sensitivity variables are inference-based, which caps confidence in the 68/100 volatility figure at Low.
- **The one thing to watch next:** FQ1 FY2027, due 2026-09-04 — Oracle's seasonally smallest, thinnest-margin quarter, with a year-ago comparison that missed both lines. The specific test is whether the guided FY27 gross-margin step-down tracks or exceeds management's own assumption, and whether any of the four largest named RPO customers shows signs of pulling back.

---

## 6. Plain-English Glossary

- **GAAP** — the audited accounting rules a company must report under; "non-GAAP" is management's own adjusted version of the same numbers.
- **Operating margin / gross margin** — profit left after all operating costs, and after direct costs only, each shown as a share of sales.
- **Basis point (bp)** — one hundredth of a percentage point; 100bps = 1 percentage point.
- **RPO (remaining performance obligations)** — revenue already contracted with customers but not yet booked in the accounts; an order book.
- **EBITDA** — profit before interest, tax, depreciation and amortisation; a rough proxy for operating cash profit.
- **EPS (earnings per share)** — profit divided by the number of shares outstanding.
- **CFO / EBITDA** — how much of book profit actually arrives as operating cash.
- **Capex (capital spending)** — money spent building or buying long-lived assets, here mainly data centers.
- **Free cash flow (FCF)** — cash from operations minus capital spending; what is left for debt, dividends and buybacks.
- **Net debt (strict basis)** — total borrowings minus cash and equivalents.
- **Net debt / EBITDA** — roughly how many years of current operating cash profit it would take to repay net borrowings; higher means more stretched.
- **Stock-based compensation** — pay issued in shares rather than cash; a real cost to existing shareholders, whose ownership share shrinks.
- **BBB-** — the lowest investment-grade credit rating; one notch below it is non-investment grade, which raises borrowing costs.
- **Consensus / the bar** — the average of Wall Street analyst forecasts a company is judged against at each results print.
- **Days payable outstanding (DPO)** — how long a company takes to pay its suppliers.
