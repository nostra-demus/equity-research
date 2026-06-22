# Earnings Sensitivity — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA)
**Date:** 2026-06-22
**Reporting standard:** India GAAP (IRDAI template) for statutory accounts; IFRS voluntarily reported and used as the primary management metric. Sensitivity impacts expressed in both EPS (India GAAP reported basis, diluted, INR per share) and EBITDA (vendor-derived, INR millions) for comparability.
**Baseline (FY26):** EPS diluted ₹1.98; EBITDA ₹5,148 mn; IFRS PAT ₹3,660 mn; GWP ₹9,433 crores; diluted shares ~1,849 mn.

> **Score direction for Earnings Volatility Score: INVERTED — higher = WORSE (more volatile)**

---

## 1. Variable Selection

Six variables were selected from the magnitude ratings in `02_revenue-drivers.md` and `03_margin-drivers.md`, supplemented by `10_external-dependency.md` from the business-model module. The ranking followed three criteria: (a) rated "High" magnitude in the upstream driver tables; (b) large enough to move EPS by ≥₹0.10 per share in a realistic one-year move; and (c) not a one-time event already reflected in FY26 actuals (so the GST demand spike, which has flowed through, is excluded — its forward significance is captured under GWP growth rate instead).

The six variables are:

1. **EOM ratio / operating leverage** — rated the single biggest margin driver in `03_margin-drivers.md`; a 550 bps fall in FY25→FY26 produced the majority of the 160 bps combined-ratio improvement.
2. **Medical cost inflation / loss ratio** — claims are ~89% of India GAAP revenue and ~62% on an IFRS loss-ratio basis; any sustained claims acceleration hits PAT immediately.
3. **Investment yield** — the IFRS combined ratio runs above 100% (101.4% FY26), meaning the business needs investment income to be profitable; a 100 bps RBI rate-cut cycle would reduce annual investment income by ~₹967 mn.
4. **IRDAI regulatory action (commission cap / EOM restructuring)** — identified as the single biggest external lever in `10_external-dependency.md`; outcome is explicitly unresolved as of May 2026.
5. **Retail GWP growth rate** — the primary revenue driver (`02_revenue-drivers.md`); a 10% shortfall or excess in total GWP flows through to earnings at a current EBIT margin of 5.9%.
6. **Annual premium repricing execution** — a mid-magnitude driver that interacts with the loss ratio; the company reprices at "high single digits" annually; a failure to execute repricing or an inability to pass through pricing would widen the loss ratio.

Variables **not selected** (and why): FX (not applicable — domestic INR business); commodities (not applicable); group business loss ratio creep (already captured within medical inflation / mix, rated Low–Mid); seasonal claims (recurs annually, not a trend — not a sensitivity variable).

---

## 2. Sensitivity Table

*Note: No formal sensitivity disclosures (e.g., a ₹X cr per Y% change table) are published in the available data pool — no audited Annual Report PDF is present for FY26. All company-proxied sensitivities are derived from management commentary on earnings calls. All inferred estimates are labelled.*

**Score direction for Confidence column: High = company-disclosed basis; Medium = historical range or management commentary; Low = inferred.**

| Variable | Base Case (FY26) | Move Basis | Bull Case | EPS Impact (bull) | EBITDA Impact (bull, INR mn) | Bear Case | EPS Impact (bear) | EBITDA Impact (bear, INR mn) | Confidence | Evidence |
|---|---|---|---|---:|---:|---|---:|---:|---|---|
| 1. EOM ratio (expense of management / operating leverage) | 33.7% of GWP (FY26) | Historical range: 39.2% (FY25) → 33.7% (FY26), a 550 bps annual fall; CFO targets ~99% combined ratio by FY29, implying EOM needs to fall ~200–300 more bps. Bull = 270 bps further improvement (GWP grows ~27% again). Bear = 200 bps deterioration (GWP growth slows to ~15%, fixed-cost leverage weakens). | EOM 31.0% (–270 bps) | +₹1.03 | +₹2,547 mn | EOM 35.7% (+200 bps) | –₹0.77 | –₹1,887 mn | Medium (historical range; trajectory from Q4 FY26 call) | Q4 FY26 transcript, May 8, 2026, p.5 (CFO: EOM 33.7% vs 39.2% FY25); Q4 FY26 transcript, p.11 (CFO: fixed overheads +6–7% vs GWP +27%); CFO target 99% combined ratio by FY29 [Q4 FY26 transcript, p.7] |
| 2. Medical cost inflation / loss ratio | Retail IFRS loss ratio 66.8% FY26; group 60.5%; average claim size CAGR ~6.5–7%. Combined ratio 101.4% IFRS. | Historical range: retail loss ratio 65–68% over FY24–FY26 (management commentary); each 100 bps of loss ratio = ₹738 mn on net earned premium (Inference). Bull = medical inflation drops to 4–5% + claims mix improves → 150 bps improvement. Bear = medical inflation accelerates to 9–10% → 200 bps deterioration (one repricing cycle lag). | Loss ratio –150 bps (retail to ~65.3%) | +₹0.45 | +₹1,105 mn | Loss ratio +200 bps (retail to ~68.8%) | –₹0.60 | –₹1,475 mn | Medium (management commentary on claim size CAGR; loss ratio range is from transcripts) | Q4 FY25 transcript, May 7, 2025, p.5 (CEO: "CAGR on average claim size has been about 6.5%, 7%"); Q4 FY26 transcript, p.5 (CFO: loss ratio up 1.1% due to mix); Q4 FY26 transcript, p.9 (CFO: retail 66.8%, group 60.5%) |
| 3. Investment yield | 7.2% FY26 on AUM ₹9,670 cr (₹96,700 mn investment securities per Capital IQ). Investment income = ₹6,190 mn (7.3% of India GAAP revenue). Combined ratio >100%, making investment income structurally necessary. | Historical range: 7.4% (FY25) → 7.3% (H1 FY26) → 7.2% (FY26 full year) — a 20 bps drift in one year. Bull = yields stable / slight rise +30 bps (RBI pauses). Bear = 100 bps fall (RBI rate-cut cycle, reinvestment at lower rates). | Yield +30 bps (7.5%) | +₹0.12 | +₹290 mn | Yield –100 bps (6.2%) | –₹0.39 | –₹967 mn | Medium (historical yield range from transcripts; AUM from Capital IQ; yield impact is Inference, not from filings) | Q4 FY26 transcript, p.5 (CFO: "annualized investment yield for FY '26 is 7.2% with AUM of INR 9,670 crores"); Capital IQ Income Statement FY26: investment income ₹6,190 mn; business-model 10_external-dependency.md: "100 bps fall in yields on entire book ≈ ₹900–950 mn reduction" (Inference) |
| 4. IRDAI regulatory action (commission cap / EOM restructuring) | EOM 33.7% vs regulatory cap ~35.5–36% (buffer ~130–230 bps). Commission ratio fell 23% → 21% of GWP in FY26. IRDAI guidance on new commission framework pending as of May 2026. | Binary / scenario-based: no formal prior range. Bull = IRDAI formalises EOM glide path consistent with company trajectory; no volume disruption. Bear = IRDAI imposes 10%+ reduction in agent/broker commissions → channel partner economics disrupted → GWP growth falls 10 ppts in the year following implementation. Move size is Inference, not from filings — based on management's own description of risk and Q3 FY25 precedent effects. | No regulatory disruption; EOM savings flow through normally | ₹0 (neutral; already in base) | ₹0 mn | GWP growth falls ~10 ppts (net GWP -10% vs base) | –₹0.23 | –₹557 mn | Low (outcome pending; management has not quantified; no prior domestic analogue fully observed) | Q4 FY26 transcript, p.7 (CEO: "we await guidance from the authority in terms of how they would like to move forward"); Q3 FY26 transcript, p.8 (CEO: "as of now, nobody has an answer"); business-model 10_external-dependency.md: "commission cap / EOM reduction could reprice distribution economics overnight" (Inference) |
| 5. Retail GWP growth rate (distribution + demand) | Total GWP ₹9,433 crores FY26, +27.4% like-to-like vs FY25. Retail GWP ₹6,582 crores (70% of total), growing ~35% in FY26. New business ~40% of retail GWP = ~₹2,633 crores. | Historical range: GWP growth 27–48% over FY22–FY26 (Capital IQ). Management guided 17–19% industry CAGR on 5-year view; Niva Bupa has been 5–10 ppts above industry through market share gains → company normalised rate ~22–29%. Bull = 10% total GWP outperformance vs base (new market share gains, distribution acceleration). Bear = 10% total GWP shortfall vs base (distribution slowdown, demand softening). 10% of ₹94,330 mn GWP = ₹9,433 mn, generating EBIT at 5.9% margin. | GWP +10% above current growth path | +₹0.23 | +₹557 mn | GWP –10% below current growth path | –₹0.23 | –₹557 mn | Medium (GWP historical range from Capital IQ; EBIT margin contribution is Inference from EBIT/revenue ratio) | Q4 FY26 transcript, p.5 (CEO: "27.4% overall growth rate"); Q4 FY26 transcript, p.8 (CEO: 17–19% industry CAGR); Capital IQ Income Statement FY26: EBIT margin 5.9%; 02_revenue-drivers.md: magnitude "High" for retail volume driver |
| 6. Annual premium repricing execution | 7% price increase executed on ReAssure 2.0 flagship product in Q1 FY26. Policy: "high single digit" annually. Renewal book = ~60% of retail GWP = ~₹3,949 crores. Repricing tracks medical inflation (~6.5–7% CAGR). | Historical range: repricing has been high-single-digit every year observed (FY25, FY26); no year of zero repricing is in the record. Bull = repricing 9–10% in FY27 (above medical inflation → combined ratio benefit). Bear = repricing held to 4–5% (competitive pressure or regulatory constraint) → loss ratio widened ~200 bps in the following year on the renewal book (~₹3,949 crores renewal base × 2 ppts = ~₹79 crores margin miss). Inference, not from filings on the bear impact. | Repricing 9–10% (above inflation) on renewal book → 50 bps combined ratio benefit | +₹0.09 | +₹220 mn | Repricing only 4–5% (below medical inflation) → 200 bps loss ratio deterioration on renewal book | –₹0.18 | –₹444 mn | Low (no company-disclosed sensitivity; move size from historical repricing range; impact is Inference, not from filings) | Q1 FY26 transcript, p.5 (CEO: "we did execute a 7% increase in Q1"); Q4 FY26 transcript, p.6 (CFO: "high-single-digit price revisions on mature products"); Q4 FY25 transcript, p.8 (CEO: "our approach to pricing is to do it annually and to do it high single digit") |

**Calculation notes:**
- Diluted shares: ~1,849 mn (FY26 India GAAP PAT ₹3,661 mn / EPS ₹1.98; per Capital IQ Income Statement and Surprise tab).
- EPS impacts are post-tax, using an effective tax rate of approximately 25% (Inference — no explicit tax rate confirmed from transcripts; standard Indian corporate rate is 25–26%). Impacts therefore reflect after-tax incremental PAT.
- Net earned premium (IFRS proxy) used for loss ratio sensitivity = GWP × (1 − 21.8% cession rate); cession rate from Capital IQ Industry Specific FY23 data, the last year available in the pool.
- All EBITDA impacts reflect the pre-tax income effect flowing through operating income (EBIT); D&A of ₹308 mn is fixed and not materially affected by these variables, so EBITDA ≈ EBIT + ₹308 mn constant.

---

## 3. Sensitivity Ranking

*Higher absolute impact = higher rank. Average of absolute values of bull and bear impacts.*

> **Score direction: ranked by absolute earnings impact — higher rank = bigger mover.**

| Rank | Variable | Absolute Impact — avg of bull + bear EPS (INR) | Absolute Impact — avg of bull + bear EBITDA (INR mn) | Direction of Current Trend |
|---:|---|---:|---:|---|
| 1 | EOM ratio / operating leverage | ₹0.90 | ₹2,217 mn | Tailwind (improving, but pace uncertain in FY27) |
| 2 | Medical cost inflation / loss ratio | ₹0.53 | ₹1,290 mn | Stable-to-mild headwind (loss ratio +1.1% FY26; medical inflation ~6.5–7% ongoing) |
| 3 | Investment yield | ₹0.26 | ₹629 mn | Mild headwind (yield drifted 7.4% → 7.2% in FY25→FY26) |
| 4 | Retail GWP growth rate | ₹0.23 | ₹557 mn | Decelerating from H2 FY26 spike; normalising toward 22–27% structural range |
| 5 | IRDAI regulatory action | ₹0.12 (bear-only; bull is neutral) | ₹279 mn (bear-only avg) | Unknown — outcome pending as of May 2026 |
| 6 | Annual premium repricing execution | ₹0.14 | ₹332 mn | Stable (high-single-digit repricing maintained every year in available history) |

---

## 4. The Single Highest-Sensitivity Variable

The EOM ratio and the operating leverage that drives it are the variable that moves Niva Bupa's earnings the most. In FY26, a 550 basis point fall in the EOM ratio — from 39.2% to 33.7% — contributed the majority of the 160 basis point improvement in the IFRS combined ratio, and drove EBITDA from ₹3,239 mn (FY25) to ₹5,148 mn (FY26), a 59% jump. At a bull-case pace (270 more basis points of improvement), EPS would increase by ₹1.03 above the FY26 base of ₹1.98 — a 52% uplift from this variable alone. At a bear-case pace (200 basis points deterioration, if revenue growth slows to ~15% and fixed-cost leverage weakens), EPS falls by ₹0.77, a 39% reduction.

The current direction is a tailwind: the CFO has guided to a combined ratio target of approximately 99% by FY29 [Q4 FY26 transcript, p.7], implying ~240 more basis points of combined-ratio improvement from the FY26 level of 101.4%, with the majority coming from further EOM reduction. The company is still in the early-to-mid stage of its operating leverage curve — fixed overheads grow at 6–7% per year while GWP has been growing at 27–35%.

The variable is partly company-controlled (management of headcount and technology spending) and partly external (it depends on GWP growth staying elevated). What would swing this to the adverse case: (a) GWP growth slows materially to below 15%, which shrinks the denominator and causes fixed costs to catch up with premiums — this could result from an IRDAI commission disruption, a demand slowdown, or competitive pricing pressure in the retail market; or (b) IRDAI imposes an EOM restructuring that forces the company to redistribute economics to distribution channels, resetting the expense-ratio trajectory upward.

---

## 5. Interaction Effects

Two important interactions exist in this sensitivity set.

First, the EOM ratio and the retail GWP growth rate are mechanically linked. Operating leverage — the engine of EOM improvement — works only when GWP is growing faster than fixed costs. If IRDAI regulatory action (Variable 4) disrupts distribution economics and causes GWP growth to slow (Variable 5), the two effects compound: the revenue base shrinks (Variable 5 bear) and simultaneously the expense ratio stops improving or deteriorates (Variable 1 bear). A combined adverse move across Variables 1, 4, and 5 would produce an earnings impact much larger than the sum of the individual bear cases — a compound negative spiral rather than three independent risks.

Second, the loss ratio (Variable 2) and the annual repricing execution (Variable 6) move in opposite directions by design. Medical inflation is the driver of claims costs; annual repricing is the offset. In a year when the company cannot reprice adequately (Variable 6 bear), it also faces higher loss ratios (Variable 2 bear). Conversely, when inflation moderates (Variable 2 bull), above-inflation repricing produces a double benefit. The management strategy of "high single digit repricing annually" is specifically designed to keep these two variables in balance. A one-cycle pricing lag (described in the `03_margin-drivers.md` pass-through lag section) means a medical inflation spike in Q2–Q3 does not automatically trigger higher premiums until the next April renewal, creating a timing mismatch that is the source of intra-year volatility even when the full-year impact is managed.

---

## 6. Non-Linear or Asymmetric Risks

Three asymmetric risks are present in this business.

**Operating deleverage asymmetry (Variable 1 × Variable 5):** The EOM improvement seen in FY25–FY26 assumed GWP growth of 27–35%. If GWP growth drops sharply — for example, to 10–15% — fixed costs do not fall proportionately. The EOM ratio, instead of improving, could re-widen by 400–600 basis points, reversing several years of operating leverage gains in a single year. The downside of an operating leverage reversal is therefore considerably larger than the upside from a further leverage improvement, because the operating leverage bull case is already partially priced into management's FY29 combined-ratio target.

**Combined ratio / investment income asymmetry (Variables 2 and 3):** Because the IFRS combined ratio is already above 100% (101.4% FY26), the business structurally runs an underwriting loss and relies on investment income to be profitable. If both variables move adversely at the same time — medical inflation widening the loss ratio while RBI rate cuts compress investment yields — the impact compounds: the underwriting loss widens while the investment income available to offset it shrinks. This is a non-linear negative: two moderate adverse moves (150 bps loss ratio + 80 bps yield decline) could together eliminate the entire IFRS PAT of ₹366 crores. No equivalent compounding exists on the upside.

**Regulatory binary risk (Variable 4):** The IRDAI commission cap / EOM restructuring is not a continuous variable — it is a binary regulatory outcome. The sensitivity table assigns it a bear-only impact (no bull case because the neutral outcome is already reflected in the base). But if the regulation is adverse and severe, the channel disruption could be larger than the base-case bear estimate of 10% GWP loss. Distribution economics in insurance typically take 12–24 months to stabilise after a regulatory reset. This creates a risk of multi-year earnings impact that is not captured in the single-year sensitivity table, making the true downside asymmetric relative to the upside (which is nil for this variable).

---

## 7. Earnings Volatility Score

**Score: 52 / 100** (higher = WORSE; inverted score)

This sits in the "Material sensitivity — earnings can swing meaningfully" band (41–60).

**Reason:** Niva Bupa's combined ratio sits at 101.4% (above breakeven on underwriting alone), making IFRS PAT of ₹366 crores entirely dependent on the net of investment income and underwriting losses. The single biggest sensitivity — EOM ratio / operating leverage — can swing EPS by ₹1.03 bull or ₹0.77 bear on a ₹1.98 base, which is a ±40–50% EPS move from one variable alone. Medical inflation and investment yields compound this further. However, three factors keep the score from entering the "High volatility" band (61–80): (a) FX, commodity, and industrial-cycle exposure are absent, which removes the most volatile external categories; (b) management's annual retail repricing policy provides a built-in mechanism to absorb inflation over one cycle; and (c) the company is a structural growth business with a clear path to combined ratio improvement, which means the operating leverage tailwind is the directional base case, not a risk. The score would move into the 61–80 band if the IRDAI regulatory outcome is adverse, because that would simultaneously trigger an EOM deterioration, a GWP shortfall, and a loss of investment income — the three variables that dominate this analysis — all moving against the business at once.

---

## Citations

| Source | Details |
|---|---|
| Capital IQ Financials.xls | Income Statement, Key Stats, Industry Specific, Cash Flow tabs for NSEI:NIVABUPA; data as of FY2026 (Mar-31-2026); restatement type "Latest Filings"; vendor tier (§4 tier 5) |
| Capital IQ EstimatesReport.xls | Surprise tab for NSEI:NIVABUPA; data as of ~2026-05-11; vendor tier (§4 tier 5) |
| Q4 FY26 Earnings Call transcript | Niva Bupa Health Insurance Company Limited, FQ4 2026, May 8, 2026; S&P Global Market Intelligence; prepared remarks pp. 4–5; Q&A pp. 6–15 |
| Q3 FY26 Earnings Call transcript | Niva Bupa Health Insurance Company Limited, FQ3 2026, January 29, 2026; S&P Global Market Intelligence; prepared remarks pp. 4–7; Q&A pp. 8–12 |
| Q1 FY26 Earnings Call transcript | Niva Bupa Health Insurance Company Limited, FQ1 2026, July 31, 2025; S&P Global Market Intelligence; prepared remarks pp. 4–6; Q&A pp. 7–12 |
| Q4 FY25 Earnings Call transcript | Niva Bupa Health Insurance Company Limited, FQ4 2025, May 7, 2025; S&P Global Market Intelligence; prepared remarks pp. 4–5; Q&A pp. 6–12 |
| Upstream earnings module outputs | `analyses/NIVABUPA_2026-06-22/earnings/01_historical-financials.md`; `02_revenue-drivers.md`; `03_margin-drivers.md` |
| Business-model cross-module | `analyses/NIVABUPA_2026-06-22/business-model/10_external-dependency.md` |
