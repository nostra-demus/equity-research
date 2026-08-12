# Valuation Module Memo — DHER (Delivery Hero SE)

**Verdict: Fairly valued** — the base-case fair value of €39.65/share is only 6.6% above the €37.20 price, a thin cushion, and that price is muddied by a pending Uber takeover with no disclosed offer price.

Memo date: 2026-08-12.

---

## Scores at a Glance

All scores are out of 100. "Inverted" means higher is worse.

| Score | Value | Note |
|---|---|---|
| Valuation attractiveness (higher = cheaper) | 45 | mixed |
| Margin of safety (higher = better) | 38 | thin |
| Valuation confidence | 55 | **capped** — see below |
| Downside risk (**inverted** — higher = worse) | 62 | real downside |
| Data quality | 73 | |
| Overall usefulness | 82 | |

Source for all rows: `99_valuation-synthesis.md §1`.

**Score caps applied:** Valuation confidence capped at **55** because the two main methods disagree by +215% (own-history €25.10 vs. peer-relative €79.2) — reconciled with stated reasoning, but the size of the gap still ties to the cap. A second cap (terminal value at 78.1% of the discounted-cash-flow value, above the 75% line, caps confidence at 60) is superseded by the tighter 55. No price-state cap: the price is pool-verified, just deal-contaminated.

**§24 Avoid-Big-Risks filters:** The misaligned-controlling-owner filter (Filter 6) is **not tripped** — governance found no controlling owner (dispersed, single-class ownership). It is carried only as a forward watch item, tied to whether the Uber tender closes without a full buyout of minority holders.

---

## What This Module Found

At €37.20, DHER is roughly fairly valued — the base fair value of €39.65 is 6.6% above the price, not a bargain and not clearly expensive [§1]. Three methods anchored in DHER's own financials — its own trading history, a discounted-cash-flow (DCF, valuing the business off its future cash) and a sum-of-the-parts breakup value — cluster tightly in a €25–€33 band and are the ones to trust [§5]. The single most important driver is DHER's own EV/Sales history (how the market has priced each €1 of its sales over time); the current price sits at the 86th percentile of its own three-year range [§1A].

The most important risk is that the price is not clean. Uber announced an offer to buy DHER on 2026-07-16, and no fixed offer price appears anywhere in the data pool [§1]. The stock is up more than 130% from its €15.73 pre-announcement close on 2026-03-26 [§1]. At today's price the market is pricing in roughly 16.5% annual free-cash-flow growth (the spare cash the business throws off) for seven straight years — a stretch against a two-year slowing trend and a "no moat proven" business-quality read [§5]. Two risks sit outside every fair-value level shown: €2,588.4m of convertible bonds (debt that can turn into shares, about 23% of market value, terms not disclosed) that would dilute per-share value, and deal-completion risk — if the Uber offer breaks, the price has historically fallen back below every bull/base/bear level here [§1].

There is a real bright side: before the deal, the market undervalued DHER standalone. At the €15.73 pre-deal price the margin of safety was 60.3%, and even the bear-case fair value (€18.59) sat above that pre-deal price [§7].

---

## The Specialists, Briefly

- **valuation-data-triage:** All five methods can run; price is present but deal-contaminated, and the fully diluted share count (with convertibles) cannot be computed from the pool [§2].
- **price-and-capital-structure:** Price pool-verified (€37.20, 2026-08-07); stock up >130% from €15.73 pre-Uber, with a €2,588.4m convertible overhang left unquantified [§2].
- **multiples-own-history:** DHER trades at a real premium to its own history; own-history reversion implies €25.10/share, ~33% below current price, and the premium tracks the Uber timeline, not a fundamentals shift [§2].
- **relative-valuation-peers:** Peer read implies ~€79.2/share, a +215% gap with own-history — but driven mainly by peer-set composition, not a clean signal [§2].
- **intrinsic-dcf:** Base intrinsic value €33.31; terminal-dominated (78.1% of value); at DHER's own disclosed cost of capital, value falls to €6–€15/share [§2].
- **reverse-dcf:** €37.20 prices ~16.5% cash-flow growth for 7 years; €15.73 priced only ~5.5% [§2].
- **sum-of-the-parts:** Breakup value €32.59/share; MENA/talabat is the strongest anchor (valued almost 1:1 off a direct public comparable) [§2].
- **scenario-and-fair-value:** Base €39.65, bull €49.01, bear €18.59 (12-month); structural avoid-ruin floor −€2.84; margin of safety thin at +6.2% [§2].

**Main disagreement:** own-history (€25.10) vs. peer-relative (€79.2) diverge by +215%, more than five times the 40% flag level [§3]. The synthesis resolves this by trusting the own-financials-anchored cluster (own-history, DCF, SOTP) over the peer read, because DHER has no clean scale-and-quality-matched public peer [§3]. This is carried as resolved — not re-opened here.

---

## What Would Change This Read

Cheaper (better than it looks):
- A disclosed Uber offer price well above €39.65/share with high odds of closing [§6].
- A durable FY2026 margin beat (Adjusted EBITDA above the €935m guidance midpoint) confirming the profitability turn is structural, not a one-off [§6].
- The Glovo Spain contingent liability (€440–770m) resolving at the low end [§6].

More expensive (worse than it looks):
- The Uber deal breaking with no replacement bidder, sending the price back toward €15.73 [§6].
- A rider-cost/employment-classification regulatory outcome near the disclosed −€344.5m stress case [§6].
- Confirmation the €2,588.4m of convertible bonds are materially in-the-money, diluting per-share value below every level shown [§6].

Data needed: the fixed Uber offer price and terms; the six convertible-bond tranches' conversion prices/ratios; the FY2025 audited Annual Report [§6].

---

## Bottom Line

- **Verdict: fairly valued.** Base fair value €39.65 is only 6.6% above the €37.20 price; margin of safety is thin at +6.2% [§1, §5].
- **Biggest reason it could be better than it looks:** the market undervalued DHER standalone before the deal (60.3% margin of safety at €15.73), and MENA is anchored almost 1:1 off talabat's own public multiple — the tightest comparable in the report [§1A, §7].
- **Biggest reason it could be worse:** if the Uber deal breaks with no fixed price ever disclosed, the price has historically reverted below every level here; a regulatory shock (−€344.5m) plus competitive erosion turns the structural-reset value negative (−€2.84/share) — an avoid-ruin case, not just a lower target [§1, §1A].
- **What's missing:** the six convertible-bond conversion terms (€2,588.4m, ~23% of market cap) — without them every per-share figure here is a ceiling, not a fully diluted read [§7].
- **One thing to watch next:** a disclosed, fixed Uber offer price and terms — it is the single input that would separate deal-completion odds from standalone value [§6, §7].

---

## Plain-English Glossary

- **Fair value:** what the module judges a share is worth, versus what it trades at.
- **Margin of safety:** the gap between fair value and price — the cushion if you are wrong.
- **EV/Sales:** enterprise value divided by sales — how much the market pays for each €1 of revenue.
- **Discounted cash flow (DCF):** valuing a business off the future cash it is expected to produce, brought back to today's money.
- **Sum-of-the-parts (SOTP):** valuing each business segment separately, then adding them up (a breakup value).
- **Free-cash-flow growth:** the growth rate in the spare cash the business throws off after spending to run and grow itself.
- **Moat:** a durable edge that protects profits from competitors; "no moat proven" means none was demonstrated.
- **Terminal value:** the part of a DCF that estimates value beyond the forecast years; 78.1% here means most of the value rests on the distant future.
- **Cost of capital:** the return investors require to fund the business; if a DCF discounts at less than this, it flatters the value.
- **Convertible bonds:** debt that can turn into new shares, diluting existing holders if converted.
- **Net debt:** total debt minus cash (€2,512.8m here, strict basis).
- **Adjusted EBITDA:** earnings before interest, tax, depreciation and amortisation, after management's stated adjustments — a rough profit proxy.
