# Margin Drivers — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA)
**Reporting standard:** India GAAP (IRDAI insurance template) for statutory accounts; IFRS voluntarily published and used as the primary management reporting basis. Figures in this report use IFRS where explicitly stated, and India GAAP (Capital IQ vendor export) for the annual cost stack. Currency: INR. Fiscal year end: 31 March. FY26 = April 2025–March 2026.
**Upstream input:** `analyses/NIVABUPA_2026-06-22/earnings/01_historical-financials.md` — read and used.
**Business-model cross-module inputs:** `03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md` — all read and used.

---

## Important Note on Margin Metrics for an Insurance Company

Standard industrial margin concepts (gross margin, EBITDA margin, EBIT margin) have limited usefulness for a health insurer. The primary performance metrics are:

- **Combined ratio (IFRS):** (Claims incurred + Acquisition costs + Operating expenses) / Net earned premium. Niva Bupa reports this as its headline operating metric. A ratio below 100% means underwriting is profitable; above 100% means it is loss-making and the business must rely on investment income.
- **Loss ratio:** Claims incurred / Net earned premium (IFRS). Separates claims from expense.
- **Expense of management ratio (EOM):** Total management expenses / Gross written premium. Regulatory metric under IRDAI rules; cap approximately 35.5–36% (including allowances).

The Capital IQ-derived EBITDA and EBIT margin figures (from the historical-financials module) are vendor constructs applied to an insurance template and are directionally useful but not the metrics management or regulators track. This report uses both but treats the IFRS combined ratio and its components (loss ratio + expense ratio) as the primary margin metrics. This is standard for health insurance analysis worldwide.

---

## 1. Segment Decomposition Status

Niva Bupa operates as a single licensed entity (pure-play health insurance). For IRDAI regulatory reporting it is a single-line insurer. Segment-level profit (EBIT, contribution margin) is **not disclosed** in any filing or transcript in the data pool.

**Segment revenue split (GWP basis, FY26):**
- Retail Health Insurance: ~70% (₹6,582 cr of ₹9,433 cr total GWP) [Q4 FY26 Earnings Call, May 8, 2026, p.5 and p.10]
- Group Health Insurance (employer-employee + affinity/Banca-embedded): ~30% (residual ≈ ₹2,851 cr) [Q4 FY26 Earnings Call, May 8, 2026, p.5]
- Personal Accident / Travel: sub-5%, grouped in Group residual [Q4 FY25 Earnings Call, May 7, 2025, p.4]

The company is not a single-segment business (>85% threshold is not met for retail alone). However, segment-level P&L is not disclosed. Margin drivers are therefore decomposed at the consolidated level with loss-ratio data split by retail vs group where disclosed from management commentary. No segment EBIT bridge can be constructed from available data.

**Limitation:** No segment-level P&L is published. Earnings clarity is capped per MODULE_RULES.md for multi-segment businesses without segment P&L.

---

## 2. Cost Stack

This table uses the India GAAP Capital IQ export (vendor tier, §4 tier 5) for the annual cost lines, supplemented by IFRS management commentary from transcripts. FY26 = year ending March 31, 2026. Revenue base = ₹84,435 mn (India GAAP).

| Cost Line | FY26 Amount (INR mn) | % of Revenue | Direction | Evidence | Margin Risk |
|---|---:|---:|---|---|---|
| Claims / Policy Benefits (net incurred claims) | ~75,611 | ~89.5% | Mild upward (mix-driven) | Capital IQ Income Statement FY26: Policy Benefits line; IFRS overall loss ratio moved from ~59.1% (FY25) to ~61.3% (FY26 IFRS net claims ratio per Q4 FY26 transcript, p.13 Nischint Chawathe question) | High — single largest cost; 1 ppt move = ~₹840–900 mn P&L impact |
| Gross commission / acquisition costs | Not separately stated in India GAAP template; ~21–23% of GWP on IFRS basis | ~18–20% of GWP | Declining (operating leverage + GST pass-through) | Q3 FY26 transcript p.5: "gross commission ratio as a percentage of GWP, from around 23% in H1 this financial year to around 21% in Q3" | Mid — structural decline expected as renewal book grows; regulatory risk if commission caps imposed |
| Employee costs / operating expenses | Not separately disclosed from Capital IQ; subsumed in EOM ratio | EOM ratio 33.7% of GWP FY26 (down from 39.2% in FY25) | Improving (operating leverage) | Q4 FY26 transcript, p.5 (CFO): "expense of management ratio for FY '26 improved to 33.7% from 39.2% last year"; fixed overheads grow ~6–7% while GWP grows 27% | High — operating leverage is the primary path to margin expansion |
| Claims management expenses | ~3% of 1/N GWP | ~2–3% of GWP | Stable | Q4 FY26 transcript, p.13 (CFO Vishwanath): "claims management expenses generally is 3% of 1/N GWP" | Low — stable and small relative to overall cost base |
| D&A | ₹308 mn (FY26) | 0.4% | Stable, mild increase | Capital IQ Income Statement, FY26: D&A = ₹308 mn vs ₹271 mn in FY25 | Low |
| Investment income (offset to underwriting loss) | ₹6,190 mn (FY26) | 7.3% of revenue | Stable–mild decline (yield compression from 7.4% to 7.2%) | Capital IQ Income Statement FY26; Q4 FY26 transcript, p.5: "annualized investment yield for FY '26 is 7.2% with AUM of INR 9,670 crores" | Mid — combined ratio >100% means investment income is what closes the profitability gap |
| Reinsurance ceded | ~21.8% of gross written premiums (FY23 data; FY26 not separately broken out) | Not disclosed for FY26 | Unknown | Capital IQ Industry Specific, FY23: ceded premiums ₹8,899 mn on GWP ₹40,730 mn = 21.8%; no FY26 figure in available pool | Low-Mid — reinsurance hardening would widen the net loss ratio |
| Technology / GenAI investment (capex) | ₹486 mn total capex FY26 (PP&E + intangibles); intangibles ₹430 mn | 0.6% of revenue | Rising | Capital IQ Cash Flow tab: intangible capex ₹430 mn FY26 vs ₹97 mn FY25 | Low standalone; positive long-run benefit to expense ratio |
| Interest expense | Not material; net debt ₹1,954 mn at Mar-26 | Minimal | Stable | Capital IQ Balance Sheet; no meaningful interest cost disclosed in transcripts | Low |

**Key structural observation:** Niva Bupa's P&L is dominated by claims (~89% of India GAAP revenue). The expense of management ratio (EOM) is the second largest driver. Investment income (₹6,190 mn, ~7% of revenue) is structurally necessary because the combined ratio exceeds 100%. This is a normal structure for a growth-phase health insurer; the margin improvement path runs through two levers: (1) operating leverage reducing the EOM ratio and (2) keeping the loss ratio from rising faster than pricing.

---

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

**Important caveat:** The FY24–FY26 gross margin figures are on the post-1/N accounting basis (IRDAI mandatory from October 2024); they are not comparable to FY22/FY23 (see Note A in upstream historical-financials). The FY24–FY26 series is internally consistent.

| Margin Level | FY26 | FY25 | Change (bps) | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin (India GAAP post-1/N: premium revenue minus policy benefits) | 10.5% | 11.8% | –130 bps | Mix shift to more retail new business (higher initial loss ratio than renewal); loss ratio up ~1.1% (IFRS basis) primarily from mix change per CFO | Capital IQ Income Statement FY26/FY25; Q4 FY26 transcript, p.5 (CFO): "increase in overall loss ratio by 1.1%, primarily due to mix change" |
| EBITDA margin (vendor-derived: EBIT + D&A) | 6.1% | 5.1% | +100 bps | EOM ratio improvement more than offset gross margin compression; operating leverage | Capital IQ Key Stats tab, FY26 row 22; historical-financials module |
| EBIT margin (operating income / total revenue) | 5.9% | 4.9% | +100 bps | Same as EBITDA — operating leverage, expense ratio improvement | Capital IQ Income Statement, FY26/FY25 |
| Combined ratio (IFRS — the primary margin metric) | 101.4% | ~103.0% (implied from FY25 CFO commentary) | –160 bps improvement | Expense ratio fell 2.7%; loss ratio rose 1.1% (mix); net improvement 160 bps | Q4 FY26 transcript, p.5 (CFO): "combined ratio for FY '26 under IFRS has improved by 160 basis points to 101.4%" |

**Pass-through lag:** Retail premiums are repriced at annual renewal. Management strategy is "high single digit" annual price increases to track medical inflation of ~6.5–7% CAGR. The lag between a claims cost spike and the premium recovery is typically one renewal cycle (approximately 12 months for annual policies, longer for the ~20% of the book on multi-year terms). This means an adverse claims quarter does not immediately appear in the full-year combined ratio if the underlying premium repricing has already been applied at the start of the year — but a sustained inflation overshoot will appear in the following year's renewal pricing cycle. [Q4 FY25 Earnings Call, May 7, 2025, p.5 (CEO): "we do execute annual premium revisions to negate overall medical trends"; Q3 FY26 Earnings Call, Jan 29, 2026, p.8: "our approach to pricing is to do it annually and to do it high single digit"]

---

## 4. Margin Walk — Which Margin Level Matters Most?

For Niva Bupa, the **IFRS combined ratio** is the primary margin metric that matters, not EBITDA margin or gross margin. Here is why.

First, this is a health insurer, not a manufacturer or software company. "Gross margin" in the India GAAP template measures premium revenue minus policy benefits — a ratio that shifts not because of underlying economics but because of the 1/N accounting standard that changes when premium is earned. The FY24–FY26 gross margin figures are valid for comparison within that window but do not represent operational efficiency in the normal sense.

Second, EBITDA margin (6.1% in FY26) and EBIT margin (5.9%) are vendor-constructed metrics applied to an insurance P&L. They are directionally useful (improving trajectory) but do not capture the structure of the business, where investment income is a required component of profitability and the underwriting result runs at a loss.

Third, the IFRS combined ratio of 101.4% is the metric management guides on, analysts question on, and regulators judge against. It separates the loss ratio from the expense ratio, making the two largest drivers transparent. The gap between the combined ratio and 100% tells you how much the business needs from investment income to break even — currently about 1.4 percentage points. This is why investment yield is a margin driver even though it sits outside the combined ratio.

The EBITDA margin series is tracked in parallel as a secondary check for comparability with the Capital IQ financial model, but the primary analytical lens throughout this report is the combined ratio and its components.

---

## 5. Margin Driver Table (Consolidated)

This table uses the IFRS combined ratio as the reference metric. "Tailwind" = helps combined ratio improve (fall); "Headwind" = pushes combined ratio higher (rise).

| Driver | Impact on Combined Ratio | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Operating leverage on expense ratio (fixed costs grow slower than GWP) | EOM ratio fell 5.5 ppts in FY26 (39.2%→33.7%) — the primary source of margin expansion | Tailwind | High | Q4 FY26 transcript, p.5 (CFO); Q4 FY26 transcript, p.11 (CFO on levers: "sheer economies of scale. The overheads — fixed overheads grow by inflation, let's say, 6%, 7%, while GWP you have seen, we are growing at—last year was 27%") |
| Retail/group product mix shift | Higher retail share lowers EOM (lower commission on renewal) but raises loss ratio (retail loss ratio ~66.8% vs group ~60.5%); net effect complex | Neutral–slight headwind on loss ratio | Mid | Q4 FY26 transcript, p.5: "increase in overall loss ratio by 1.1%, primarily due to mix change"; Q4 FY26 transcript, p.9: retail loss ratio 66.8%, group 60.5% |
| New vs renewal mix within retail | Higher renewal share lowers loss ratio (renewal book combined ratio ~97–98%); growing new business temporarily lifts loss ratio | Neutral (structural tailwind as book matures) | Mid | Q4 FY26 transcript, p.11 (CFO: "renewal book, combined ratio of renewal book is more like 97%, 98%"); CEO: retail new/renewal = 40/60 split |
| Medical / healthcare cost inflation | Average claim size CAGR ~5–7%; managed through annual repricing + PPN cost containment | Neutral (managed, with ~1-cycle lag) | High | Q4 FY25 transcript, May 7, 2025, p.5: "average claim size…CAGR has been about 6.5%, 7%"; Q4 FY26 transcript, p.10: "seasonality to our claims ratio driven by post-monsoon infections" |
| Annual retail price increases | 7% price increase on ReAssure 2.0 in Q1 FY26; high single-digit increases planned annually | Tailwind | Mid | Q1 FY26 transcript, Jul 31, 2025, p.5 (CEO: "we did execute a 7% increase in Q1"); Q4 FY26 transcript, p.6 (CFO: "at a portfolio level…high-single-digit price revisions on mature products") |
| GST removal on health premiums (Oct 2025) | Reduced effective cost to customers → ticket size up ~14–15% in H2 FY26 vs H1; passed ITC to distributors, reducing gross commission ratio 23%→21% | Tailwind (demand) — one-time policy tailwind, NOT run-rate | High | Q4 FY26 transcript, p.4 (CEO: "GST continues to be a positive tailwind. H2 for the industry was about 30%, and with Niva Bupa, our retail health growth for the same period was in excess of 40%"); labelled as one-time policy event per Cycle-Position Rule |
| Investment income / AUM yield | Investment yield 7.2% FY26 vs 7.4% FY25; AUM ₹9,670 cr; investment income needed to bridge above-100% combined ratio | Mild headwind (yield slipping) | Mid | Q4 FY26 transcript, p.5 (CFO): "annualized investment yield for FY '26 is 7.2%"; Capital IQ Income Statement FY26: investment income ₹6,190 mn |
| IRDAI commission cap / EOM regulatory changes | Potential regulatory reset of distributor commissions; IRDAI guidance pending as of May 2026 | Unknown (potential headwind) | High | Q4 FY26 transcript, p.7 (CEO: "we await guidance from the authority in terms of how they would like to move forward"); Q3 FY26 transcript, p.8: "as of now, nobody has an answer" on commission cap |
| Seasonal claims (post-monsoon Q2) | Q2 / Q3 IFRS loss ratio structurally 200–300 bps above full-year average; Q3 FY26 IFRS loss ratio = 64.4% | Seasonal (recurs annually; not a trend) | Mid | Q4 FY26 transcript, p.10 (CEO); Q3 FY26 transcript, p.9 (CFO: "quarter 3 IFRS loss ratio overall…is 64.4%") |
| Technology investment (AI / automation) | Reduces claims processing costs and operating expenses over time; Q1 FY26 auto-adjudication disruption reversed in Q2 | Long-run tailwind | Low–Mid | Q4 FY26 transcript, p.11 (CFO: "a lot of investment has been made in technology, in analytics, GenAI. So that's also something which is helping to bend the cost curve"); Q1 FY26 transcript, p.5 |
| Hospital standard treatment protocols (PPN + industry empanelment) | Aim to reduce unnecessary admissions and standardise claims costs; early-stage benefit; 2,500 hospitals signed/ready as of Q4 FY26 | Long-run tailwind (not yet quantified) | Low (currently) | Q4 FY26 transcript, p.4 (CEO: "standard treatment protocols for 8 infections — sorry, 7 infections are live"); Q4 FY26 transcript, p.14 (COO on cost standardisation benefit) |
| Group business loss ratio creep | Group loss ratio rose from ~57% (FY25) to ~62% (FY26 YTD, Q3 transcript) to ~60.5% (FY26 full year); company deliberately slowed group growth to 12% | Managed (selective underwriting) | Low–Mid | Q3 FY26 transcript, p.10 (CFO: "group loss ratio last year was around 57%. This year is 62%. That's the increase. And that has to do mainly with mix change"); Q4 FY26 transcript, p.9 (CFO FY26 full year: "group health loss ratio is around 60.5%") |
| Reinsurance cost | ~21–22% of GWP ceded; pricing subject to global reinsurance market | Unknown | Low–Mid | Capital IQ Industry Specific FY23; not discussed in any FY26 transcript |

---

## 6. Margin Drivers By Segment (Retail vs Group)

Segment-level P&L is not disclosed. The following uses loss-ratio data shared in management commentary.

### Segment: Retail Health (~70% of GWP)

| Driver | Impact on Loss Ratio | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Annual price repricing (high single digit) | Directly offsets medical inflation in the earned premium base | Tailwind | High | Q1 FY26 transcript, p.5 (CEO: 7% increase on ReAssure 2.0); Q3 FY26 transcript, p.8 |
| Medical inflation on claims | Average claim size +5% in FY25, CAGR ~6.5–7%; pushed retail loss ratio from ~65% (FY24) to ~66–68% (FY26) | Mild headwind (managed) | Mid | Q4 FY25 transcript, p.5 (CEO: "average claim size grew by 5%"); Q4 FY26 transcript, p.9: FY26 retail loss ratio 66.8% |
| Renewal book growth vs new business mix | Renewal book loss ratio structurally lower; rising renewal share (60% of FY26 retail) is a tailwind | Tailwind | Mid | Q4 FY26 transcript, p.10 (CEO: new/renewal 40/60) |
| Post-monsoon seasonal claims spike | Retail loss ratio in Q2 (Jul–Sep) is structurally elevated; partial offset from PPN cost controls | Seasonal recurrence | Mid | Q4 FY26 transcript, p.10 (CEO: seasonality driven by post-monsoon infections) |
| GST removal (H2 FY26 one-time tailwind) | Raised average ticket size ~14–15% in H2 vs H1; one-time policy event | Tailwind on revenue — NOT run-rate | High (but one-time) | Q3 FY26 transcript, p.6 (CBO: "ticket size went up by 15% in Q3 vis-a-vis H1"); Q4 FY26 transcript, p.4 |
| Lifetime-value underwriting discipline | Pricing at 1.5–2x standard for chronic conditions; fraud controls; claim rejection policy ~7% stable | Tailwind on loss ratio quality | Mid | Q4 FY25 transcript, p.6 (CEO: pricing for diabetics at 1.5x–2x standard) |

### Segment: Group Health (~30% of GWP)

| Driver | Impact on Loss Ratio | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Mix shift to B2B2C / Banca affinity vs employer-employee | Banca/affinity mix (benefit-based products) carries lower loss ratio than corporate indemnity; management guided future improvement as mix shifts | Tailwind if maintained | Mid | Q3 FY26 transcript, p.10 (CFO: future mix favours benefit-based, improving loss ratio going forward); group composition ~1/3 corporate, ~2/3 Banca [Q4 FY26 transcript, p.9] |
| Selective underwriting of large corporate accounts | Group growing only 12% deliberately; walk away from aggressively priced mandates | Tailwind (prevents loss ratio expansion) | Mid | Q3 FY26 transcript, p.10 (CEO: "group business is only growing at 12%… wherever we believe it makes economic sense for us") |
| Corporate claims volatility | Employer-employee group can be volatile; large mandates written at better economics diluted the prior full-year loss ratio before unwinding | Headwind (concentration risk) | Mid | Q1 FY26 transcript, p.11 (CFO: large corporate MNC accounts written in Jan '25 — one-off group loss ratio distortion in Q1 FY26) |
| IFRS 17 onerous contract provisions | Group contracts where combined loss ratio + risk adjustment >100% require upfront provisioning; unwound as earned | Accounting noise, not run-rate | Low | Q4 FY26 transcript, p.12–13 (CFO: "if it is after risk adjustment, more than 100%, then you upfront create provision for that. And during the policy cycle, you keep unwinding that") |

---

## 7. Margin Bridge — Latest Period (FY26 vs FY25, IFRS combined ratio basis)

The IFRS combined ratio is the primary metric. Where IFRS bridge is not fully disclosed, the contribution of each component is sourced from management commentary and labelled where inferred.

| Component | Combined Ratio Impact (bps, lower = improvement) | Evidence |
|---|---:|---|
| Loss ratio — medical inflation and claims mix (retail) | +110 bps (headwind) | Q4 FY26 transcript, p.5 (CFO: "increase in overall loss ratio by 1.1%, primarily due to mix change") |
| Expense ratio — operating leverage (fixed cost scale) | –270 bps (improvement) | Q4 FY26 transcript, p.5 (CFO: "reduction in expense ratio by 2.7%"). Q4 FY26 transcript, p.11 (CFO: 3 levers: renewal mix, economies of scale, technology) |
| Net combined ratio change | –160 bps improvement | Q4 FY26 transcript, p.5 (CFO: "combined ratio for FY '26 under IFRS has improved by 160 basis points to 101.4%") |
| Investment income contribution | Not in combined ratio; yield slipped 20 bps (7.4%→7.2%) on larger AUM (₹8,175 cr→₹9,670 cr); absolute income up | Capital IQ Income Statement FY26; Q4 FY26 transcript, p.5 |
| One-off: Labour Code (new wage codes) past-service cost | ₹20 cr one-off hit in Q3 FY26 IFRS; unwound by year-end (no full-year impact per management) | Q3 FY26 transcript, p.5 (CFO: "one-off impact of around INR 20 crores on account of the impact of new wage codes related to past service cost for gratuity and leave encashment") |
| One-off: GST removal demand effect (H2 volume/value acceleration) | Not in combined ratio directly; increased GWP denomintor, partially diluting EOM ratio | Q3 FY26 transcript (CBO); Q4 FY26 transcript (CEO) |

**India GAAP EBITDA margin bridge (FY25 → FY26):**

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Operating leverage / EOM ratio improvement | +~200 bps (primary driver of EBITDA margin expansion from 5.1% to 6.1%) | Inferred from EOM improvement per transcripts and Capital IQ FY26 |
| Claims mix headwind (partially offsetting) | –~100 bps | Capital IQ Gross Margin series (11.8%→10.5%, –130 bps gross margin); partly offset at EBITDA level |
| Net EBITDA margin change | +100 bps (+5.1%→+6.1%) | Capital IQ Key Stats tab, FY25 and FY26 |

---

## 8. The Single Biggest Margin Driver

**The expense of management (EOM) ratio and its underlying operating leverage are the single biggest driver of margin improvement — and its compression is the biggest risk.**

Niva Bupa's GWP grew 27% in FY26 while fixed overheads grew approximately 6–7%. The CFO explicitly quantified this: "fixed overheads grow by inflation, let's say, 6%, 7%, while GWP you have seen, we are growing at — last year was 27%." [Q4 FY26 transcript, p.11] This spread between revenue growth and cost growth reduced the EOM ratio from 39.2% in FY25 to 33.7% in FY26, a 550 basis point improvement. The combined ratio improved 160 basis points in FY26 driven primarily by this expense leverage. The loss ratio simultaneously moved against the business (+110 bps), but operating leverage more than offset it.

The current direction is a **tailwind**: the company is still on the early-to-mid part of the operating leverage curve (IFRS combined ratio target approximately 99% by FY29 per CFO [Q4 FY26 transcript, p.7]), which requires further EOM reduction of approximately 200–300 bps from 33.7% today.

What would make this tailwind reverse: (1) revenue growth decelerates materially (e.g., GWP slows from ~27% to below ~15%) such that fixed cost growth catches up; (2) IRDAI imposes a commission cap or EOM restructuring that forces redistribution of economics; or (3) a sustained medical inflation spike that forces heavy reserve additions, compressing the combined ratio faster than operating leverage can offset. Of these, the regulatory commission cap is the most binary and fastest-moving risk — if implemented adversely, distribution channels would shrink volume and the GWP growth engine that powers operating leverage would stall, which is a compound negative for margins. [Q4 FY26 transcript, p.7 (CEO: "we await guidance from the authority")]

**Cycle position note:** Niva Bupa is not in a commodity or demand cycle in the traditional sense. It is in the early-growth phase of a structural penetration curve for Indian retail health insurance. The combined ratio trajectory (101.4% in FY26, target ~99% by FY29) represents an ongoing operational build-out, not a cycle peak. The GST removal in October 2025 provided a one-time policy tailwind that accelerated H2 FY26 volume (retail H2 growth >40% vs industry ~30%) — this is labelled as a policy-conditional one-time tailwind and should not be treated as the normalised growth rate going forward. The company itself described long-run retail health industry CAGR as 17–19% [Q4 FY26 transcript, p.8 (CEO)], well below the FY26 H2 pace.

---

## Citations

| Reference | Source |
|---|---|
| Capital IQ financial data | Capital IQ Financials.xls for NSEI:NIVABUPA — Income Statement, Balance Sheet, Cash Flow, Key Stats, Industry Specific tabs. Data as of FY2026 (Mar-31-2026). Restatement type "Latest Filings." Vendor tier (§4 tier 5). |
| Q4 FY26 transcript | Niva Bupa Health Insurance Company Limited, FQ4 2026 Earnings Call, May 8, 2026. S&P Global Market Intelligence. Prepared remarks pp. 4–5; Q&A pp. 6–15. |
| Q3 FY26 transcript | Niva Bupa Health Insurance Company Limited, FQ3 2026 Earnings Call, January 29, 2026. S&P Global Market Intelligence. Prepared remarks pp. 4–7; Q&A pp. 8–12. |
| Q1 FY26 transcript | Niva Bupa Health Insurance Company Limited, FQ1 2026 Earnings Call, July 31, 2025. S&P Global Market Intelligence. Prepared remarks pp. 4–6; Q&A pp. 7–12. |
| Q4 FY25 transcript | Niva Bupa Health Insurance Company Limited, FQ4 2025 Earnings Call, May 7, 2025. S&P Global Market Intelligence. Prepared remarks pp. 4–5; Q&A pp. 6–12. |
| Business-model cross-module outputs | `analyses/NIVABUPA_2026-06-22/business-model/03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md` — all used for context on segment structure, pricing power, and regulatory exposure. |
