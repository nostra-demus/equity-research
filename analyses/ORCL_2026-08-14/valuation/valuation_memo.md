# Valuation Module Memo — ORCL

**Verdict: Modestly overvalued** — the $153.94 price sits about 13% above the $133.77 base-case fair value, and the price already assumes a 51% revenue beat next year against Oracle's own guidance plus a 62% terminal profit margin no peer has posted.

Memo date: 2026-08-14. Source: `99_valuation-synthesis.md` (Valuation module, ORCL).

---

## 1. Scores at a Glance

| Score | Value /100 | Direction | Source |
|---|---|---|---|
| Valuation attractiveness | **28** | higher = cheaper | Synthesis §1 |
| Margin of safety | **15** | higher = better (underlying number is negative: −15.08%, price sits above base fair value — no cushion) | Synthesis §1 |
| Valuation confidence | **54** | higher = better | Synthesis §1 |
| Downside risk | **82** | **inverted — higher is worse** (downside to the headline structural bear is 79.58%) | Synthesis §1 |
| Data quality | **88** | higher = better | Synthesis §1 |
| Overall usefulness | **85** | higher = better | Synthesis §1 |

**Score caps applied:**
- Methods disagree by more than 40% and the gap was reconciled by weighting rather than resolved → valuation confidence capped at **max 55**. The full method spread is 207.7% ($68.92 to $212.01); the multiples-versus-DCF gap alone is 119.5% [Synthesis §4].
- Terminal value is 80.7% of the DCF's enterprise value (above the 75% trigger) → valuation confidence capped at **max 60** [Synthesis §4].
- Most restrictive cap governing: **valuation confidence max 55**. No partial-data caps triggered — the price is pool-verified and 1 trading day old, consensus, peers, cash flow and all five methods were available [Synthesis §4, §7].

**§24 Avoid-Big-Risks filters:** none tripped. Filter 6 (misaligned controlling owner, RF-OWN-004) was tested and did not trip — founder Larry Ellison holds 40.21% of the vote as an engaged, value-aligned Executive Chair/CTO [`management-governance/99_management-governance-synthesis.md`, finding 04-008].

---

## 2. What This Module Found

Oracle trades at $153.94 (Aug-13-2026, delayed NYSE quote, pool-verified, 1 trading day old) against a base-case fair value of $133.77 a share — so the stock is roughly 13% expensive relative to this module's central estimate, not cheap [Synthesis §1]. The full range of values runs Bull $212.67 · Base $133.77 · Bear-cyclical over 12 months $94.62 · Bear-structural over 24–36 months $31.44, with the structural case as the headline bear [Synthesis §1].

The most important driver is which of two lenses you believe. Oracle's own 5-year multiple history points to $151.27 a share and the 10-name peer set points to $148.70 — two independent data sets landing within two points of each other, and they carry 80% of the weight [Synthesis §1, §3]. Pulling against them is a discounted cash flow (DCF — a model that values the company off the cash it is projected to produce) at $68.92, weighted 20%. The blend lands at $133.77, below both multiples methods — a disclosed, reasoned departure from a straight ~$150 average, not a silent drag [Synthesis §3].

The reverse-DCF (working backwards from the price to find what the market must be assuming) is the sharpest number here: today's price requires FY2027 revenue growth of +51.3%, which is 18 points above management's own +33.6% guidance issued weeks ago, plus a 61.9% terminal EBIT margin (operating profit as a share of sales, held forever) against the best peer's 46.8% at Microsoft. The reverse-DCF calls that "aggressive, bordering on unachievable" [`05_reverse-dcf.md` §2–3].

The most important risk is the AI-infrastructure bet failing to convert to cash quickly enough: $55,663M of FY26 capex, net debt (total debt minus cash) at 4.46x EBITDA (a rough measure of yearly operating cash profit), and free cash flow of −$23.7bn, against a $638bn RPO backlog (contracted revenue not yet delivered) [Synthesis §1]. There is no cushion — margin of safety is −15.08% — and the loss to the headline bear is 79.58%, versus 38.54% to the milder cyclical trough [Synthesis §7]. A second, structural risk: terminal value is 80.7% of the DCF's enterprise value, so the fair-value read leans on one largely unobserved assumption about whether Oracle's return on capital stabilises at its cost of capital or keeps eroding [`04_intrinsic-dcf.md` §5a].

This is not a classic value trap. There is no misaligned controlling owner and no persistent cheapness to explain away — the read runs the opposite way: a growth-and-margin story already priced in that the evidence does not yet support [Synthesis §5, §7].

---

## 3. The Specialists, Briefly

- **valuation-data-triage** — Sufficient: all five methods can run, no partial-data caps triggered. FY2026 free cash flow is genuinely negative on the AI-capex ramp, and Cloud & Software is 90.7% of segment profit — business-mix facts, not data gaps.
- **price-and-capital-structure** — Price pool-verified at $153.94, 1 trading day old. Enterprise value $584,464.2M (lease-inclusive) on strict net debt of $136,143M; tangible book value is negative at −$9.70 a share on $65.5bn of goodwill and intangibles.
- **multiples-own-history** — Reverts to ~$151.27 a share on the EV/EBIT median, essentially flat to price. Oracle sits near its own 5-year median, but that in-line multiple is now paid on top of net debt that rose 38.7% in one year.
- **relative-valuation-peers** — Quality-adjusted base $148.70 a share, 3.4% below price. Whether Oracle screens cheap or rich depends almost entirely on whether hyper-growth outliers (Palantir, Snowflake, CrowdStrike) are in the peer set.
- **intrinsic-dcf** — Base $68.92 a share, 55.2% below price, and terminal-dominated at 80.7% of enterprise value. The financeable-growth cross-check failed on the first pass and had to be corrected (terminal capex raised from 10% to 19.1% of revenue).
- **reverse-dcf** — Price implies a 51.3% FY27 revenue beat and a 61.9% terminal EBIT margin. Even the model's theoretical best case (zero net reinvestment forever) falls $92.3bn short of today's enterprise value.
- **sum-of-the-parts** — Collapses to a single segment; raw peer-parity ceiling $212.01 a share (+37.7%). Cloud & Software already is effectively the whole company, so this raises a quality-of-multiple question, not a hidden-value question.
- **scenario-and-fair-value** — Base $133.77, Bull $212.67, Bear-cyclical $94.62, Bear-structural (headline) $31.44.

**The disagreement that matters:** the multiples methods cluster near $150 while the DCF sits 119.5% lower at $68.92 — far outside the 40% tolerance. The synthesis resolved this by weighting (80% multiples / 20% DCF), not averaging, because two independent lenses back the DCF's caution: the reverse-DCF's no-precedent 61.9% terminal margin, and the business-model module's separate "eroding" moat verdict (return on capital falling 12.35%→8.22% over four straight years, now at or below the ~11.2% estimated cost of capital) [`business-model/09_moat.md`; Synthesis §3]. The raw sum-of-the-parts ceiling of $212.01 was given 0% weight in the base blend because it prices Oracle's 4.46x leverage as if it were Microsoft's 0.6x or SAP's 0.8x [Synthesis §3].

---

## 4. What Would Change This Read

| Direction | Trigger [Synthesis §6] |
|---|---|
| Would make it cheaper (better) | An FY2027 print that BEATS the price-implied +51.3% revenue growth, plus terminal-margin evidence (OCI infrastructure margin approaching AWS's 35–39% segment level) with return on capital turning back above cost of capital. Or a price pullback toward the $148–151 multiples cluster with no change in fundamentals. |
| Would make it more expensive (worse) | A price fall while fundamentals hold mechanically raises the margin of safety at an unchanged base fair value. Confirmed, sustained conversion of the RPO backlog into cash at or above the four named mega-customers' contracted pace would close the gap toward the $212.67 bull case. |
| Data needed | The FY2027 results print (Aug/Sep-2027) — the nearest-term, most falsifiable data point named in the reverse-DCF. Plus segment-level (not just consolidated) forward guidance for Cloud & Software, to test the 61.9% terminal-margin claim directly. |

---

## 5. Bottom Line

- **Verdict: Modestly overvalued.** $153.94 price versus $133.77 base fair value — about 13% rich. Margin of safety is −15.08%: no cushion.
- **Biggest reason it could be better than it looks:** Oracle's own multiple history ($151.27) and its peer set ($148.70) — built from completely independent data — land within two points of each other and close to today's price, and the sum-of-the-parts ceiling ($212.01) nearly matches the independently derived bull case ($212.67). If the $638bn RPO backlog (+363% year on year) converts on schedule, today's multiple is not obviously irrational.
- **Biggest reason it could be worse:** the price needs a 51.3% FY2027 revenue beat against management's own +33.6% guidance and a 61.9% terminal margin no peer has posted (best: Microsoft 46.8%). Downside to the headline structural bear ($31.44) is 79.58%, and the balance sheet — 4.46x net debt to EBITDA, −$23.7bn free cash flow in FY26 — leaves little room for the bet to go wrong.
- **What evidence is missing:** segment-level forward guidance or consensus for Cloud & Software. Oracle discloses none, so the sum-of-the-parts had to proxy the segment with whole-company forward EBITDA — and it is the exact input that would test the 61.9% implied terminal margin.
- **Confidence is capped at 55** by the unreconciled >40% method disagreement (the terminal-dominance rule alone would have capped at 60). The disagreement is the headline finding, not a footnote.
- **One thing to watch next:** the FY2027 results print (Aug/Sep-2027) — does revenue growth clear the price-implied +51.3%, and does return on capital turn back above cost of capital?

*This module assigns no scenario probabilities. The bull/base/bear levels above are inputs for the master synthesizer, which owns the probability weighting — including how to weigh the 12-month cyclical bear against the 24–36 month structural bear given their different horizons [Synthesis §7].*

---

## 6. Plain-English Glossary

- **Fair value** — what this module's models say a share is worth, against which the market price is compared.
- **Discounted cash flow (DCF)** — a value built from the cash the business is projected to generate in future, discounted back to today.
- **Terminal value** — the slice of a DCF that covers everything beyond the explicit forecast years. Here it is 80.7% of the total, so most of the answer rests on one long-run assumption.
- **Reverse-DCF** — the same model run backwards: instead of asking what the shares are worth, it asks what growth and margins the current price must already assume.
- **EBIT / EBIT margin** — operating profit, and that profit as a share of sales.
- **EBITDA** — a rough measure of yearly operating cash profit, before interest, tax, and the accounting charges for wear and tear.
- **Enterprise value (EV)** — the value of the whole business, equity plus debt minus cash; used so companies with different debt loads can be compared.
- **Net debt / net debt-to-EBITDA** — total debt minus cash (strict basis), and how many years of that operating cash profit it would take to repay it. Oracle is at 4.46x.
- **Free cash flow (FCF)** — operating cash left after capital spending. Oracle's is −$23.7bn in FY26.
- **Capex** — money spent on plant, equipment, and data centres.
- **Multiples (EV/EBIT, EV/EBITDA, NTM)** — valuing a company by what the market pays for each dollar of its profit; NTM means the next twelve months' expected profit.
- **Margin of safety** — how far the price sits below fair value, as a cushion against being wrong. Negative here (−15.08%), meaning the price is above fair value.
- **Return on capital / cost of capital** — the profit earned on each dollar invested, versus what that money costs to raise. Oracle's has fallen to 8.22% against a ~11.2% estimated cost.
- **RPO (remaining performance obligations)** — contracted revenue signed but not yet delivered; Oracle's backlog is $638bn.
- **Sum-of-the-parts (SOTP)** — valuing each business segment separately and adding them up.
- **Tangible book value** — accounting net worth after stripping out goodwill and other intangibles. Oracle's is −$9.70 a share.
- **Moat** — the durable advantage that lets a company keep earning above-average returns. The business-model module verdicts Oracle's as eroding.
