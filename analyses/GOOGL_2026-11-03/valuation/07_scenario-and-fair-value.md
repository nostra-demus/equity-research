# Scenario & Fair Value — GOOGL

Alphabet reports under U.S. GAAP in USD. Every level below applies to **GOOGL Class A common stock on Nasdaq Global Select Market, USD**, and uses the valuation anchor's 12,368m fully diluted shares. The $278.99 current price is pool-verified as of 2026-11-03. [Q3 FY2026 Form 10-Q, cover and Note 12; Capital IQ Comps → Financial Data, subject row, 2026-11-03; deterministic `ciq_facts.json` `current_price`]

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $299.76 base P/NTM EPS; $353.46–$360.09 P/B cross-check | Medium-low | 45% | The P/NTM EPS band is the cleanest admissible own-history series: 17.23x–29.40x, with a 21.87x median. P/B is retained only as a secondary cross-check because it does not test the return on the AI and Cloud build. [Valuation 02 Multiples — GOOGL, §§2 and 4; CIQ Financials → Multiples, 2021-12-31–2026-11-02] |
| Relative / peers (03) | $305.19 base NTM P/E; $210.90–$305.19 internal peer-method field | Medium-low | 30% | NTM P/E values equity after depreciation, interest and tax. The peer set is economically relevant but its EV/revenue and EV/EBITDA outputs disagree with P/E, and the peer-cycle history is not assessable. [Valuation 03 Relative Valuation — GOOGL, §§2, 5 and 6; Capital IQ Comps → Trading Multiples, 2026-11-03] |
| Intrinsic DCF (04) | $117.57; WACC/growth grid $95.95–$149.41 | Low | 15% | FCFF is the applicable intrinsic method for an operating company, but 80.4% of its EV is terminal value and its result depends on capex falling from 40.3% of FY2026 revenue to 18.0% by FY2031. [Valuation 04 Intrinsic DCF — GOOGL, §§2, 5–8; Capital IQ Estimates → Consensus, FY2026] |
| Reverse-DCF (05) | 11.78% six-year normalized FCFF CAGR implied; not a fair-value output | Cross-check | n/a | It tests whether the selected levels require an achievable cash-flow outcome; it is not a weighted value. [Valuation 05 Reverse DCF — GOOGL, §§2–5] |
| Sum-of-the-parts (06) | $241.99; multiple-only sensitivity $201–$297 | Low | 10% | It recognizes the separate Services and Cloud economics, but NTM segment revenue is inferred and the Alphabet-level and Other Bets cost capitalization is judgmental. [Valuation 06 Sum-of-the-Parts — GOOGL, §§2–5; Q3 FY2026 Form 10-Q, Note 15] |

Weights sum to 100%. GOOGL is an operating company with a usable NTM earnings measure, so the two multiples lenses carry 75%, while DCF and SOTP together are 25%. Reverse-DCF is a cross-check only. The 02 P/NTM band is admissible: its sector proxy did not show a material five-year same-direction move. The 03 peer reference has no admitted sector-multiple history, so it is not a proven stable anchor. [Valuation 02 Multiples — GOOGL, §5; Valuation 03 Relative Valuation — GOOGL, §6]

## 2. Triangulation & Reconciliation

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history P/NTM EPS | $299.76 base; P/B cross-check $353.46–$360.09 | Medium-low | 45% | Uses the admissible forward-EPS history; the P/B result gets no extra weight. |
| Peer relative valuation | $305.19 base; $210.90–$305.19 field | Medium-low | 30% | The P/E result is the most directly comparable equity lens, but peers give conflicting revenue and EBITDA values. |
| DCF | $117.57; $95.95–$149.41 grid | Low | 15% | Terminal-dominated, capital-intensity-sensitive cash-flow lens. |
| SOTP | $241.99; $201–$297 sensitivity | Low | 10% | Segment structure is useful, but the NTM allocation and cost capitalization are inferred. |
| Reverse-DCF | Price requires 11.78% normalized FCFF CAGR for six years | Cross-check | n/a | It informs the realism of the multiple-led levels, not their arithmetic. |

The high-to-low field of the four primary value-producing method points is **$117.57–$305.19**, a **159.6%** spread relative to the low. That is the headline finding and caps valuation confidence at 55/100. The broader football-field endpoints disclosed by the producers — the DCF grid low and P/B cross-check high — are $95.95–$360.09, a 275.3% spread; those are not silently blended into the base point. [Valuation 02 Multiples — GOOGL, §4; Valuation 03 Relative Valuation — GOOGL, §5; Valuation 04 Intrinsic DCF — GOOGL, §7; Valuation 06 Sum-of-the-Parts — GOOGL, §3]

The mechanically weighted base value is **$268.28 per share**. This trusts the forward P/E lenses most, as required for an operating company with estimates, but does not ignore the DCF's low cash-conversion result or the SOTP's capitalized corporate-cost drag. The gap is real rather than a rounding issue: the DCF assumes a 10.37% WACC and a long capex normalization, while the multiples methods capitalize NTM earnings without proving that post-build free-cash-flow conversion. [Valuation 04 Intrinsic DCF — GOOGL, §§2–5; Valuation 02 Multiples — GOOGL, §4; Valuation 03 Relative Valuation — GOOGL, §5]

The two multiples reads are not independent corroboration. Both use Capital IQ forward data and market-based reference levels; additionally, 03 cannot test whether the peer-group median is cycle-elevated or depressed. 02 found no material move in its broad Nasdaq-100 proxy, so no same-direction cycle tag fires, but the untested peer anchor remains a confidence limitation. [Valuation 02 Multiples — GOOGL, §5; Valuation 03 Relative Valuation — GOOGL, §6]

## 3. Bull / Base / Bear Fair-Value Levels

All three headline cases use the same measure and period: **NTM consensus GAAP EPS expressed on a 12,368m fully diluted-share equivalent basis**. The $13.706 base is the dilution-consistent equivalent of the admissible 02 P/NTM EPS build ($299.76 ÷ 21.87x), not a new earnings forecast. The ±15% EPS changes are **inference, not from filings**, informed by the earnings sensitivity work rather than a reported consensus range: the individual Search, Cloud, cost and R&D stresses are quarter-sized, non-additive, and explicitly not forecasts. [Valuation 02 Multiples — GOOGL, §4; Earnings Sensitivity — GOOGL, §§2 and 5]

| Case | Fair Value / Share (point) | Forward Metric (EPS/EBITDA) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **$378.30** | $15.76 NTM GAAP EPS, fully diluted equivalent | 24.00x P/NTM EPS | 12 months, to Nov. 2027 | Search advertiser demand and monetisation improve while Cloud converts demand without the expected depreciation, third-party-compute and data-centre costs taking the gains. The 24.00x is inside the admissible 17.23x–29.40x own-history P/NTM band. [Earnings Sensitivity — GOOGL, §§2–4; Valuation 02 Multiples — GOOGL, §2] |
| Base | **$268.28** | $13.71 NTM GAAP EPS, fully diluted equivalent | 19.57x P/NTM EPS effective multiple | 12 months, to Nov. 2027 | This is the disclosed 45% / 30% / 15% / 10% method blend. It assumes the forward earnings base is achieved but assigns less than the 21.87x own-history median because returns on the AI capacity build and post-build cash conversion remain unproven. [Valuation 02 Multiples — GOOGL, §4; Valuation 04 Intrinsic DCF — GOOGL, §§2 and 8; Business Quality — GOOGL, §§1 and 4] |
| Bear | **$200.74** | $11.65 NTM GAAP EPS, fully diluted equivalent | 17.23x P/NTM EPS | 12 months, to Nov. 2027 | A 15% earnings shortfall coincides with compression to the historical P/NTM low: weaker advertiser budgets or Search monetisation, slower Cloud conversion, and higher infrastructure or R&D intensity. These drivers can overlap, so the result does not add the separate static stresses. [Earnings Sensitivity — GOOGL, §§2, 5 and 6; External Dependency Check — GOOGL, §§1 and 5; Valuation 02 Multiples — GOOGL, §2] |

The executed arithmetic is below. It uses upstream method outputs and the dilution-consistent NTM EPS equivalency; it does not re-run a valuation method.

```text
$ awk 'BEGIN { own=299.76; peer=305.19; dcf=117.57; sotp=241.99; price=278.99; base=.45*own+.30*peer+.15*dcf+.10*sotp; eps=own/21.87; bull=eps*1.15*24.00; bear=eps*.85*17.23; printf "base=$%.2f; EPS=$%.5f; base P/E=%.2fx; bull=$%.2f; bear=$%.2f; MOS=%.2f%%; downside=%.2f%%\\n", base, eps, base/eps, bull, bear, (base-price)/base*100, (price-bear)/price*100 }'
base=$268.28; EPS=$13.70645; base P/E=19.57x; bull=$378.30; bear=$200.74; MOS=-3.99%; downside=28.05%
```

**Avoid-ruin floor — not the 12-month headline bear:** the structural-reset trigger fires because business quality assigns the AI-led rate-of-change / disruption row **40/100**, while the moat verdict is **Narrow, stable (mixed)** rather than confirmed eroding. The policy therefore keeps the $200.74 cyclical/operating bear as the headline 12-month case and carries the 24–36-month structural reset separately. [Business Quality — GOOGL, §§1 and 4, `RF-BQ-005`; Moat — GOOGL, §5]

The carried-forward structural-reset DCF value is **$73.63 per share**. It uses a 27.0% FY2031 EBIT margin, 20.0% capex/revenue, 1.0% terminal growth, and the same strict net-debt, NCI, preferred-equity and diluted-share bridge; this is an avoid-ruin floor, not a headline case. The bridge reconciles as $1,009,068m implied impaired EV − $73,489m strict net debt − $6,900m NCI − $18,023m preferred equity = $910,656m equity ÷ 12,368m diluted shares = $73.63 per share. The implied EV is a mechanical reconciliation of 04's published per-share result, **inference, not from filings**, not an independent DCF rerun. [Valuation 04 Intrinsic DCF — GOOGL, §5; Valuation 01 Price & Capital Structure — GOOGL, §§4–5]

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | $278.99, pool-verified on 2026-11-03 [Capital IQ Comps → Financial Data, subject row; deterministic `ciq_facts.json` `current_price`] |
| Base-case fair value (point) | $268.28 |
| Bear-case fair value | $200.74 |
| Implied upside to base case = (base FV − price) / price (%) | **(3.84%)** |
| **Margin of safety** = (base FV − price) / base FV — the cushion (%) | **(3.99%)** — no cushion at the current price |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* (%) | **28.05%** |

The price is pool-verified, so price-relative metrics are assessable. Margin of safety and downside to bear use different denominators and answer different questions; the first is a negative base-case cushion and the second is the loss from the current price to the 12-month bear level.

## 5. Warranted-Multiple Check

The base's 19.57x P/NTM EPS multiple is below the current 20.24x and inside the admissible 17.23x–29.40x own-history band, so it does not require a multiple that Alphabet has never sustained. [Valuation 02 Multiples — GOOGL, §§1–2] It is nevertheless not a durable entitlement: business quality is 62/100, the moat is narrow and stable rather than widening, and the rate-of-change score is 40/100 while capex reached $132.0bn in the first nine months of FY2026. [Business Quality — GOOGL, §§1–4; Moat — GOOGL, §5; Q3 FY2026 Form 10-Q, Item 2] The multiple is warranted only if Search and Cloud monetize the enlarged infrastructure base without a further fall in vendor-defined ROIC and cash conversion; those are not proven from available data. [Moat — GOOGL, §5; Valuation 05 Reverse DCF — GOOGL, §3]

## 6. Fair-Value Read

The 12-month fair-value levels are **$378.30 bull, $268.28 base, and $200.74 bear** per GOOGL Class A share; the separate 24–36-month avoid-ruin floor is $73.63. At the $278.99 pool-verified price, the base is 3.84% below price, margin of safety is negative 3.99%, and downside to the 12-month bear is 28.05%. The result is driven by forward P/E lenses, but the $117.57 DCF and $241.99 SOTP keep the base below the multiples-only values and create a 159.6% primary-method spread. The biggest swing factor is whether AI and Cloud capex converts into post-build free cash flow while Search advertising demand holds; the reverse-DCF says the current price needs 11.78% normalized FCFF growth for six years. [Valuation 04 Intrinsic DCF — GOOGL, §8; Valuation 05 Reverse DCF — GOOGL, §5]
