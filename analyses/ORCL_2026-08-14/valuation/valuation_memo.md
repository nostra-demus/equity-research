# Valuation Module Memo — ORCL

**Verdict: Modestly overvalued** — base-case fair value is $133.77 a share against a $153.94 price, about 13% rich, and the price already assumes a 51.3% beat of Oracle's own FY2027 growth guide plus a profit margin no software peer has ever reached.

**Memo date:** 2026-08-14. **Source:** `99_valuation-synthesis.md` (valuation module). This memo condenses that synthesis and adds nothing to it.

---

## 1. Scores at a Glance

| Score (all /100) | Value | What it means |
|---|---|---|
| Valuation attractiveness (higher = cheaper) | **25** | Base fair value sits below the price; no discount to unlock |
| Margin of safety (higher = better) | **15** | Margin of safety — the cushion between price and fair value — is **−15.08%**, i.e. negative: the price is above fair value, so there is no cushion |
| Valuation confidence | **55** | Capped at 60 by the terminal-value rule; set below the cap given the 207.7% spread between methods |
| Downside risk — **inverted, higher is worse** | **85** | Downside to the headline bear case is **79.58%**; the milder 12-month bear still implies 38.5% |
| Data quality | **90** | Full filings, 41-analyst consensus, a 10-name peer set, complete capital-structure data; triage verdict "Sufficient", no critical gaps |
| Overall usefulness | **85** | Delivers reconciled fair-value levels and a named killer risk for the master synthesizer |

**Score caps applied:** one. Terminal value — the share of the discounted-cash-flow (DCF) valuation that comes from years beyond the forecast, rather than from the forecast itself — is **80.7% of enterprise value** (`04` §5a), above the 75% trigger. That caps valuation confidence at a maximum of 60; it was set at 55.

All other cap triggers tested and **not** applied: price is pool-verified (not indicative), consensus present, peer data present, five methods ran, cash-flow statement present, sum-of-the-parts ran, and the >40% method disagreement was explicitly reconciled rather than silently averaged.

**§24 Avoid-Big-Risks filters: none tripped.** Filter 6 (misaligned controlling owner, RF-OWN-004) was tested and does not trip — founder Larry Ellison holds 40.21% of the vote but is an engaged, value-aligned Executive Chair/CTO, confirmed by `management-governance/99` finding 04-008.

**Fair-value levels:** Bull **$212.67** (+38.2% vs price) / Base **$133.77** (−13.1%) / Bear-cyclical **$94.62** (12-month trough, −38.5%) / Bear-structural, headline **$31.44** (24–36 month reset, −79.6%). Current price **$153.94** (Aug-13-2026, 02:26 PM GMT-5, delayed NYSE quote, Capital IQ pool export; price-state `pool-verified`, 1 trading day old).

---

## 2. What This Module Found

Oracle is not cheap. The triangulated base-case fair value of $133.77 sits about 13% below the $153.94 price, so there is no cushion for an investor buying today [`07_scenario-and-fair-value.md`].

The main driver of the read is what the price already assumes. The reverse-DCF — working backwards from the share price to the growth and profit it requires — says today's price needs a **51.3% FY2027 revenue beat against management's own freshly-issued +33.6% guide**, a **22.6% revenue growth rate a year through FY2034**, and a **61.9% terminal EBIT margin** (operating profit as a share of sales, at the end of the forecast). The best peer on that margin is Microsoft at 46.8%. The synthesis calls this "aggressive, bordering on unachievable" [`05_reverse-dcf.md`]. A second, independent check in `05` converts the price-implied FY2030 revenue into a global cloud-infrastructure market share of roughly 14–17%, against roughly 3% today — a 5–6x share gain in four years that no hyperscaler has ever managed that fast.

The main risk is that the downside is severe rather than shallow. Oracle carries **net debt (total debt minus cash) of 4.46x EBITDA** — earnings before interest, tax, depreciation and amortisation, a rough measure of operating cash earnings — and generated **−$23.7bn of free cash flow in FY26** funding a concentrated AI-infrastructure build for four named customers each above $8bn. The RPO backlog (remaining performance obligations — contracted revenue not yet delivered) stands at **$638bn, up 363% year on year**. If that backlog does not convert to margin-protected cash on schedule, both the DCF and the structural-reset bear say the fall is large [`04`, `07`].

Two other things are worth knowing. Tangible book value is **negative (−$9.70/share)** on $65.5bn of goodwill and intangibles [`01`]. And this is not a classic value trap: no misaligned owner, and the moat is independently verdicted "eroding" by the business-model module (return on capital 12.35% → 8.22% over four years, now at or below the roughly 11.2% estimated cost of capital) — so the warranted multiple is not a premium one.

---

## 3. The Specialists, Briefly

| Specialist | One-line finding |
|---|---|
| valuation-data-triage | Sufficient — all five methods can run, no critical gaps; FY26 free cash flow is negative (−$23.7bn) and Cloud & Software is 90.7% of segment profit |
| price-and-capital-structure | Price `pool-verified` at $153.94, 1 day old; enterprise value $584,464.2M (lease-inclusive), net debt (strict basis) $136,143M, tangible book value negative at −$9.70/share |
| multiples-own-history | Oracle trades close to its own 5-year median on EV-based multiples (17–32nd percentile); own-median EV/EBIT reversion implies ~$151.27/share — but on net debt that rose 38.7% year on year |
| relative-valuation-peers | Neither clearly cheap nor expensive; quality-adjusted base (11.5x NTM EV/EBITDA) is $148.70/share (−3.4%); raw peer-median dispersion $118.10–$191.75 |
| intrinsic-dcf | Base-case intrinsic value $68.92/share, 55.2% below price; terminal value is 80.7% of EV (terminal-dominated, low-confidence) |
| reverse-dcf | Price implies 22.6% revenue growth a year through FY2034 and a 61.9% terminal EBIT margin — "aggressive, bordering on unachievable"; even a zero-reinvestment best case falls $92.3bn short of the $584.5bn EV |
| sum-of-the-parts | Single-segment collapse (Cloud & Software = 90.7% of profit) — no hidden breakup value; the $212.01 raw base is a "peer-parity ceiling, not a base fair value" |
| scenario-and-fair-value | Base fair value $133.77 (−13.1%); headline bear is the 24–36 month structural reset at $31.44 |

**The disagreement that matters, and how the synthesis settled it.** The methods span **207.7%** low to high — $68.92 (DCF) to $212.01 (raw sum-of-the-parts) — far above the 40% tolerance. The synthesis leads with this rather than averaging it. Its resolution: the two multiples methods cluster within 2 points of each other ($151.27 and $148.70) on independent data and anchor the central tendency at 80% combined weight; the DCF's much lower reading is **not** treated as a stray outlier because two other independent lenses point the same way (the reverse-DCF's precedent-free assumptions and the business-model module's eroding-moat verdict), so it is weighted 20% and pulls the blended base to $133.77 — a disclosed departure from the ~$150.0 pure multiples average. The raw sum-of-the-parts is excluded from the blend entirely, because it prices Oracle's 4.46x leverage as if it were Microsoft's 0.6x or SAP's 0.8x.

---

## 4. What Would Change This Read

| Direction | Trigger the synthesis named |
|---|---|
| **Would make it cheaper** | Price falls toward or below $133.77 without fair value deteriorating; **or** the FY2027 print lands at or above the guided +33.6% with gross margin recovering per management's "improves rapidly" claim — which would lift the multiples base and narrow the DCF-vs-multiples gap |
| **Would make it more expensive** | The stock rises further above $153.94 on continued AI enthusiasm with no confirming margin or cash-flow evidence; **or** one of the four >$8bn named customers cuts contracted RPO (the #1 named earnings sensitivity), pulling the multiples base down toward the DCF's $68.92 |
| **Data that would decide it** | The FY2027 actual print — revenue growth and gross margin, due within the fiscal year ending May-2027 — the nearest-term, most falsifiable test of what today's price assumes. A historical peer-premium/discount panel (currently "Not assessable" per `03` §3) would sharpen the relative read |

---

## 5. Bottom Line

- **Verdict: modestly overvalued.** Base fair value $133.77 vs $153.94 price; margin of safety is −15.08%, meaning no cushion at all.
- **Biggest reason it could be better than it looks:** the two methods anchored on what the market actually pays — own-history ($151.27) and peers ($148.70) — land within 2 points of each other and close to today's price on entirely independent data; Oracle's PEG ratio of 0.65 is roughly half the peer median of 1.31, and the raw sum-of-the-parts ceiling of $212.01 shows real optionality if the $638bn RPO backlog converts as management projects.
- **Biggest reason it could be worse:** the headline structural-reset bear is $31.44, a 79.6% fall, tied to 4.46x net debt/EBITDA and −$23.7bn FY26 free cash flow funding a bet concentrated in four customers. The single killer variable is AI-customer concentration: `earnings/07_earnings-sensitivity.md` models −$6,937M EBITDA (23% of FY26 EBITDA) if one of the four pulls back, with "no disclosed upside mirror of comparable size."
- **What evidence is missing:** a multi-year historical peer-premium/discount panel for the Capital IQ comp set. `03` could source only a single-date (2026-08-13) snapshot, so whether Oracle's current premium or discount to peers is normal for this stock cannot be assessed. This is the module's single highest-value next data request.
- **The one thing to watch next:** the FY2027 print — revenue growth against the +33.6% guide, and gross margin. That is the first real test of the 51.3% beat the price already assumes.
- **Note on confidence:** valuation confidence is only 55/100. The DCF is terminal-value dominated (80.7%) and the methods disagree by 207.7%. Treat the fair-value levels as a range with a wide band, not a point estimate — this module assigns no scenario probabilities; that is the master synthesizer's job.

---

## 6. Plain-English Glossary

Terms in order of first appearance:

- **Margin of safety** — the gap between what you pay and what the thing is worth. Negative here (−15.08%) means the price is above fair value.
- **Terminal value** — the part of a valuation that comes from all the years beyond the explicit forecast. When it dominates (80.7% here), small assumption changes swing the answer a lot.
- **Enterprise value (EV)** — the value of the whole business, equity plus debt, less cash. $584,464.2M for Oracle on a lease-inclusive basis.
- **DCF (discounted cash flow)** — valuing a company by projecting its future cash and discounting it back to today's money.
- **Reverse-DCF** — the same model run backwards: start from the share price and solve for the growth and margin the price already assumes.
- **EBIT margin** — operating profit as a share of sales. The price implies 61.9% at the end of the forecast; the best peer is 46.8%.
- **Net debt** — total borrowings minus cash. $136,143M on the strict basis.
- **EBITDA** — earnings before interest, tax, depreciation and amortisation; a rough proxy for operating cash earnings. Net debt is 4.46x that figure.
- **Free cash flow (FCF)** — cash from operations after capital spending. Oracle's was −$23.7bn in FY26.
- **RPO (remaining performance obligations)** — contracted revenue signed but not yet delivered. $638bn, up 363% year on year.
- **Tangible book value** — book equity after removing goodwill and intangibles. Negative here at −$9.70/share.
- **Return on capital / cost of capital (WACC)** — the profit earned on each dollar invested, against what that money costs to raise. Oracle's fell from 12.35% to 8.22% over four years, at or below the roughly 11.2% estimated cost of capital.
- **EV/EBITDA, EV/EBIT** — the price of the whole business measured against its operating earnings. Used to compare Oracle to its own history and to peers.
- **PEG ratio** — the earnings multiple divided by the growth rate. Oracle's 0.65 is roughly half the 1.31 peer median.
- **Sum-of-the-parts (SOTP)** — valuing each business segment separately and adding them up. Collapsed to one segment here, since Cloud & Software is 90.7% of profit.
- **Value trap** — a stock that looks cheap and stays cheap because something structural is wrong. The synthesis says Oracle is closer to the opposite.
