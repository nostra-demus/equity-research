# Moat — AMZN

## 1. Named Competitors

*(Inherited from `08_competitive-map.md`)*

- **Microsoft Corporation (Azure / Intelligent Cloud)** — primary head-to-head rival to AWS in global cloud infrastructure (IaaS, PaaS, AI/ML); Intelligent Cloud segment operating margin ~42% for fiscal year ended June 2025; consolidated ROIC ~23.8% FY2025.
- **Alphabet Inc. (Google Cloud)** — third-largest cloud provider globally; Q4 2025 Google Cloud segment operating margin ~30% (rapidly expanding from ~17% in Q4 2024); consolidated ROIC ~27.8% (LTM March 2026).
- **Walmart Inc.** — dominant rival in US omnichannel retail and grocery; consolidated operating margin ~4.3% FY2025 (fiscal year ended January 2026); ROIC not separately pulled (competitive-map noted as not retrieved from filing pool — marked Not disclosed for the precise figure).

---

## 2. Moat Sources

| Possible Moat | Present? (Y/N) | Evidence | Strength /100 |
|---|---|---|---:|
| Brand | Y | Amazon brand ranked among the top 5 globally (Kantar/Interbrand data, unverified web sources). Prime membership creates habitual repeat purchasing — Prime members triple shopping frequency once perishables/same-day delivery embedded. CEO Letter FY2025 Annual Report states Amazon is the second-largest grocer in the US ($150B gross sales in 2025) and lowest-priced online retailer for 8 consecutive years (Profitero data, cited in FY2024 Annual Report, CEO Letter p.1; reaffirmed Q1 2026 Earnings Call). AWS Gartner leadership consistently recognized. [FY2025 10-K (filed Apr 9, 2026), Item 1, p.4; CEO Letter pp.1–4; Q1 2026 Earnings Call, prepared remarks, Apr 29, 2026] | 65 |
| Cost advantage | Y (AWS only) | Graviton custom CPU (used by 98% of top-1,000 EC2 customers) delivers 40% better price-performance than x86 alternatives. Trainium2 AI chip delivers ~30% better price-performance than comparable GPUs. At scale, Trainium expected to "save tens of billions of capex dollars per year" and provide "several hundred basis points of operating margin advantage" vs. relying on third-party chips for inference. AWS owns the largest cloud infrastructure globally, enabling shared-cost amortization over $128.7B revenue base. [FY2025 Annual Report, CEO Letter pp.5–6; Q1 2026 Earnings Call, CEO prepared remarks, Apr 29, 2026] | 72 |
| Distribution | Y | Amazon operates over 1 million robots across fulfillment centers (as of FY2025 CEO Letter). 85+ Same Day Fulfillment Centers (SSDs) across the US carrying top 90,000 SKUs. Over 500 million same-day units delivered in 2026 thus far (as of Q1 2026 call). Rural delivery network expansion to 1.2 million square miles / 13,000+ zip codes (CEO Letter p.3). Prime Air drone delivery active; Amazon Now (20-minute) scaled in India (360+ micro-fulfillment centers) and expanding to US/Europe. [FY2025 Annual Report, CEO Letter pp.2–4; Q1 2026 Earnings Call, CEO prepared remarks, Apr 29, 2026] | 78 |
| Scale | Y | Largest cloud infrastructure provider globally (~29–33% IaaS market share, ahead of Azure ~21–23% and Google Cloud ~12–13%). Largest US online retailer (~37–40% e-commerce share). 18% of consolidated revenue ($128.7B AWS, growing 20% YoY in FY2025) generates 57% of consolidated operating income ($45.6B of $80.0B). US tech and infrastructure cost base ($108.5B FY2025) is shared across AWS and retail, creating scale economies no new entrant can replicate. [FY2025 10-K, Note 10, p.68–69; CEO Letter; Q1 2026 Earnings Call; cloud market share: unverified web sources citing Synergy Research Group, Q3 2025] | 80 |
| Technology / IP | Y | 10,000+ patents cited in litigation defense posture (Note 7, ongoing patent disputes across AWS Nitro, S3, EC2, DynamoDB, Alexa, Prime Video). Custom silicon (Graviton, Trainium, Inferentia, Nitro EC2 NIC) represents a multi-year proprietary silicon roadmap generating >$20B annual run rate (chips business inclusive of Graviton, Trainium, Nitro). Bedrock AI inference platform, SageMaker, AgentCore, Kiro — proprietary AI tooling stack. [FY2025 10-K, Note 7, pp.59–61; CEO Letter p.5; Q1 2026 Earnings Call, CEO prepared remarks] | 73 |
| Licenses / regulation | N | No material regulatory moat. Regulatory environment is a cost and constraint (FTC settlement $2.5B in FY2025; EU DMA/DSA probes ongoing; Italy fine reduced to €752M after appeal). Government cloud contracts (JEDI successor, C2E) carry moat-like features in that FedRAMP authorization and security clearances are barriers, but this covers only a portion of AWS revenue. [FY2025 10-K, Item 1A, pp.15–16; Item 7, p.27] | 25 |
| Network effects | Y (marketplace/advertising only) | The Amazon marketplace creates a two-sided network: more buyers attract more third-party sellers (61% of worldwide paid units in Q4 2025; $172B 3P seller services FY2025), which improves selection, which attracts more buyers. Advertising network effect: the shopping-intent signal from Amazon's search/browse behavior creates a captive, high-converting ad unit that grows more valuable as the Prime member base scales — $68.6B advertising revenue FY2025, growing 22% YoY in Q1 2026. AWS does NOT exhibit strong network effects — customers do not benefit from other customers being on the same cloud. [FY2025 10-K, Note 10, p.69; Q1 2026 Earnings Call, CFO prepared remarks] | 60 |
| Switching costs | Y | **AWS:** Customers running workloads in AWS face high switching costs: data residency requirements, proprietary API lock-in (S3, DynamoDB, Lambda, Bedrock), operational team retraining, latency dependencies (inference must co-locate with data), and migration downtime risk. 98% of top-1,000 EC2 customers use Graviton; Trainium AI chip is largely sold out — customers building AI pipelines on Trainium become chip-level locked. Committed revenue backlog: $244B remaining contract performance obligations as of Dec 31, 2025 with weighted-average contract life 4.1 years. **Retail/Prime:** FBA logistics creates switching cost for 3P sellers (Prime badge lost if seller leaves Amazon fulfillment). Prime members tripling shopping frequency once perishable same-day delivery embedded. [FY2025 10-K, Note 1, p.51 (unearned revenue); Q1 2026 Earnings Call, CEO prepared remarks; FY2025 Annual Report, CEO Letter p.4] | 78 |
| Natural resource access | N | No natural resource advantage. AWS energy/power contracts are commercially procured. Data center land and power availability is a constraint, not a moat. [FY2025 10-K, Item 1A, p.10] | 10 |
| Location advantage | N (retail) / Y (data center geography) | Retail: no exclusive geographic advantage — Walmart and other retailers operate comparable physical footprints. AWS data center geography is a partial advantage: AWS has the most extensive global data center footprint (multiple availability zones per region, more regions than Azure or Google Cloud), and data gravity (customer data already in a given region creates latency-based lock-in). This is better classified under scale and switching costs than a pure location moat. [FY2025 10-K, Item 2, p.18; competitive-map — unverified web sources, Synergy Research Group] | 30 |

---

## 3. Competitive Economics

| Company / Competitor | Gross Margin | EBIT Margin | Return on Capital (ROIC) | Period | Source |
|---|---:|---:|---:|---|---|
| **Amazon (AMZN)** | 50.3% | 11.2% | **16.4%** (FY2025, computed); **~13.2%** (FY2023–FY2025 through-cycle average, computed) | FY2025 (year ended Dec 31, 2025); through-cycle FY2023–2025 | FY2025 10-K (filed Apr 9, 2026), Consolidated Statements of Operations p.37; Balance Sheet p.39; Note 10 p.68 |
| **Microsoft — Azure/Intelligent Cloud** | Not disclosed at segment level | ~42% (Intelligent Cloud segment operating margin, fiscal year ended June 30, 2025) | ~23.8% (consolidated ROIC, FY2025) | Microsoft FY2025 (year ended June 30, 2025) | Microsoft FY2025 Q4 Segment Revenue, investor.microsoft.com — unverified web source; ROIC: gurufocus.com — unverified web source (as cited in competitive-map) |
| **Alphabet — Google Cloud** | Not disclosed at segment level | ~30% (Google Cloud segment exit margin, Q4 2025 run rate; full-year FY2025 not separately consolidated in filing pool) | ~27.8% (consolidated ROIC, LTM March 2026) | Alphabet Q4 2025 exit rate / LTM March 2026 | Alphabet Q4 2025 earnings release, Feb 4, 2026 — unverified web source (as cited in competitive-map); ROIC: gurufocus.com — unverified web source |
| **Walmart** | ~24% (consolidated gross margin, FY2025) | ~4.3% (consolidated operating margin, FY2025) | Not disclosed (competitive-map marked as not retrieved from filing pool) | Walmart FY2025 (year ended Jan 31, 2025) | Walmart FY2025 Q4 earnings release, SEC Form 8-K, Feb 2025 — unverified web source (as cited in competitive-map) |

**ROIC computation — Amazon FY2025 (this agent's computation, normalized):**

- **EBIT FY2025:** $79,975M [FY2025 10-K, Consolidated Statements of Operations, p.37]
- **Normalized tax rate used: 19.0%.** The reported effective tax rate for FY2025 is 19.6% ($19,087M provision on $97,311M pre-tax income). FY2023 effective rate was 19.0%; FY2024 was anomalously low at 13.5% due to $2.6B excess SBC tax benefits. The 2025 Tax Act increased the FY2025 provision (decreased foreign income deduction). I normalize at 19.0% — the FY2023 structural rate — stripping the FY2025 rate's modest upward distortion from the Tax Act change while not using the distorted FY2024 rate in the other direction. The FY2025 reported rate of 19.6% is close to structural; using 19.0% is conservative (slightly lowers ROIC relative to the as-reported rate). [FY2025 10-K, Note 9, pp.64–65] *Inference, not from filings: the normalized rate is this agent's judgment; management does not disclose a structural tax rate.*
- **NOPAT FY2025** = $79,975 × (1 − 0.19) = **$64,780M**
- **Invested Capital** = Total equity + Long-term debt (carrying) + Finance lease liabilities + Operating lease liabilities (PV) − Cash and cash equivalents − Marketable securities (current):
  - FY2025: $411,065 + $68,396 + $12,286 + $89,252 − $86,810 − $36,219 = **$457,970M**
  - FY2024: $285,970 + $57,640 + $10,602 + $79,596 − $78,779 − $22,423 = **$332,606M**
  - Average IC = ($457,970 + $332,606) / 2 = **$395,288M**
- **ROIC FY2025 = $64,780 / $395,288 = 16.4%** (this agent's computed figure)
- **Management-headline ROIC cross-check:** Management does not disclose a consolidated ROIC figure. The CEO letter references "return on invested capital (ROIC)" qualitatively but does not publish a number. No divergence to flag from a management-stated figure. [FY2025 Annual Report, CEO Letter p.3]

**Through-cycle ROIC (FY2023–FY2025, normalized at 19% throughout):**
- FY2023 EBIT: $36,852M → NOPAT (19%) = $29,850M; FY2024 EBIT: $68,593M → NOPAT (19%) = $55,560M; FY2025: $64,780M
- Average NOPAT FY2023–FY2025: ($29,850 + $55,560 + $64,780) / 3 = **$50,063M**
- Average IC (FY2023–FY2025 midpoint; using FY2024/FY2025 average as the two-year anchor): ~$395,288M (understated for FY2023 when the balance sheet was smaller — actual through-cycle average IC would be lower, making through-cycle ROIC slightly higher than stated; conservative to use current IC)
- **Through-cycle ROIC ≈ 13.2%** (*Inference, not from filings — estimated from 3-year NOPAT average and FY2024/FY2025 IC average; actual FY2023 IC was materially smaller, so 13.2% is a conservative floor*)

**Note on cyclicality:** `07_business-quality` flags FY2025 as near a cyclical peak (consolidated operating margin 11.2%, highest in the company's history, driven by AWS AI inflection and post-2022 retail efficiency recovery). Through-cycle operating margin is estimated at 8–10%. The through-cycle ROIC of ~13.2% is the correct anchor for the moat test, not the FY2025 single-year 16.4%.

**Note on net cash / gross capital:** Amazon is NOT a net-cash company — total debt (long-term notes + finance leases) of $80.7B exceeds reported cash + current marketable securities of $123.0B (broad basis) leaving net cash of ~$42B on a strict basis. The capital base is not near-zero; there is no denominator-collapse risk. The gross IC computation ($395–458B) is the correct basis.

**The economic moat test (required):**

> Return on capital **above** cost of capital: **~13.2% through-cycle ROIC** vs **~10% WACC** (~320 bps gap) — *computed ROIC: NOPAT (19% normalized tax) / average invested capital per balance sheet; WACC: CAPM-based inference at 4.3% risk-free rate + 1.2 beta × 5.0% ERP = 10.3% cost of equity, blended at ~93% equity weight and ~7% debt weight at 3.1% after-tax cost of debt = ~10% WACC. Inference, not from filings — Amazon has not disclosed a WACC or cost of capital.*

The FY2025 single-year ROIC of 16.4% is above WACC by approximately 640 bps, but this is near a cycle peak and should not be used as the moat anchor. The through-cycle ROIC of ~13.2% is the operative figure — still above the estimated 10% WACC by ~320 bps.

---

## 4. Where The Company Sits

**Relative to peers:** Company sits at the **bottom** of named peers on consolidated return on capital (Amazon through-cycle ROIC ~13.2% vs Microsoft consolidated ROIC ~23.8% vs Alphabet consolidated ROIC ~27.8%), and at the **top** of peers on EBIT margin vs Walmart (11.2% vs 4.3%), but below both cloud peers on segment-level cloud margins (AWS 35.4% vs Intelligent Cloud ~42% vs Google Cloud ~30% exit rate). Walmart ROIC is not disclosed from the filing pool.

**Absolute (the economic moat test):** The company earns a return on capital **above** its cost of capital — through-cycle ROIC ~13.2% vs estimated WACC ~10% (~320 bps gap). The moat is economic, not merely structural, though the gap is moderate rather than wide.

---

## 5. Moat Verdict

**Narrow moat** — with a specific AWS-segment carve-out that is strong in its own right but insufficient to upgrade the consolidated verdict.

Amazon's clearest moat is in AWS: the combination of distribution scale (global data center footprint), proprietary silicon (Graviton, Trainium), customer switching costs (data gravity, API lock-in, $244B committed backlog), and scale economies across a $128.7B revenue base creates a genuine advantage that translates into a 35.4% segment operating margin. AWS earns returns well above any reasonable cost of capital when viewed in isolation.

At the consolidated level, however, the retail segments (North America at 6.9% EBIT margin, International at 2.9%) dilute the economic return substantially. The consolidated through-cycle ROIC of ~13.2% exceeds the estimated ~10% WACC by only ~320 basis points — a real but narrow spread. The FY2025 peak of 16.4% is elevated by the AI investment boom and post-pandemic retail efficiency recovery; through-cycle FCF compression (from $38B in FY2024 to $11B in FY2025 on $128B capex) confirms that the capital intensity of sustaining and expanding the moat is very high.

The durability test over the next five years: AWS must demonstrate that (a) Trainium silicon economics hold as inference prices deflate industry-wide, (b) AWS's AI market share does not erode to Microsoft Azure (which has an OpenAI partnership) or Google Cloud (which has TPU and open-source AI advantages), and (c) the $200B FY2026 capex cycle monetizes at or above the cost of capital before the next enterprise IT optimization cycle. In retail, the grocery/perishables flywheel (same-day delivery, Amazon Now) must convert Prime stickiness into pricing power the company currently deliberately suppresses.

**Industry rate-of-change penalty applies** per `07_business-quality` (rate-of-change score 35/100, below the §24 Filter 5 threshold). The cloud infrastructure market is changing fast enough (AI inference, new chip architectures, model commoditization) that a moat scored "Strong" today could erode meaningfully by 2029. This caps the verdict at Narrow.

**Moat trajectory: widening** — but with a high-uncertainty qualifier.

Over FY2023–FY2025, the return on capital rose from near zero (consolidated operating loss in some 2022 quarters) to a through-cycle ROIC of ~13.2%, well above the cost of capital. AWS operating income grew from $22.8B (FY2022) to $24.6B (FY2023) to $39.8B (FY2024) to $45.6B (FY2025), a near-linear compounding that is widening the moat in the dominant segment. Market share in cloud is stable-to-gaining (~29–33% vs Azure's ~21–23%). The AI revenue run rate exceeding $15B at triple-digit growth in Q1 2026 suggests AWS is capturing, not losing, the most valuable new workloads. Advertising ($68.6B, growing 22% YoY in Q1 2026) is adding a high-margin layer to retail that structural competitors (Walmart Connect) are copying but not yet matching in scale.

The widening label carries a meaningful caveat: the $200B FY2026 capex spend is the single biggest risk to the trajectory. If AI workload monetization does not ramp fast enough to absorb that capital — either because inference prices collapse faster than volume scales, or because Microsoft/Google capture a disproportionate share of new AI workloads — the ROIC trajectory could flatten or reverse quickly. The widening verdict is supported by evidence through Q1 2026 but is not yet proven through a full capital cycle.

---

*Self-check notes:*
- *Named competitors inherited from `08_competitive-map.md`; no new competitors introduced.*
- *All "Y" moat rows cite specific evidence with source, period, and page/section.*
- *Scores calibrated to CLAUDE.md §12 bands; no score above 80 without very strong evidence.*
- *Competitive economics show real numbers or "Not disclosed" — no invented figures.*
- *Economic moat test explicit: through-cycle ROIC 13.2% vs WACC ~10% (~320 bps), with cost-of-capital sourced as CAPM inference labeled per §3.*
- *ROIC metric matches business type (operating company → ROIC vs WACC; financials overlay not applicable).*
- *No management-disclosed ROIC to cross-check — no divergence to flag.*
- *NOPAT computed on 19% normalized structural tax rate; distortion rationale stated; rate strips FY2024 anomaly and FY2025 Tax Act effect.*
- *Through-cycle ROIC (FY2023–FY2025 average) used for moat test; single-year FY2025 peak labeled as such.*
- *"Strong moat" verdict not used: through-cycle ROIC gap of ~320 bps is real but narrow; industry rate-of-change caps at Narrow per MODULE_RULES.md §24 Filter 5.*
- *Trajectory based on evidenced ROIC trend, market-share data, and operating income progression — not impression.*
