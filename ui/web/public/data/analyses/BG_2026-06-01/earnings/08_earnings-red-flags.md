# Earnings Red Flags — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency:** US$ millions unless noted (EPS US$/share). **Fiscal year:** ends Dec 31. **FY0 = FY2025** (10-K); **latest quarter Q0 = Q1 2026** (10-Q, quarter ended Mar 31, 2026). **Date:** 2026-06-01.

> **Upstream output missing: `05_beat-miss-setup`, `07_earnings-sensitivity` — red-flag scan proceeds with degraded confidence.**
> Two of the eight earnings outputs this agent depends on were not produced for this run. Effect: Category 2.6 (Beat / Miss Setup) and Category 2.8 (Sensitivity / External Variables) are scanned from the available material (`04_guidance-consensus` carries the beat/miss history; business-model `10_external-dependency` carries the disclosed sensitivities) but cannot be cross-checked against the dedicated agents. Both categories therefore carry an explicit "Unavailable" check row and lower confidence. The four core specialist outputs needed to anchor the financial baseline — `01_historical-financials`, `02_revenue-drivers`, `03_margin-drivers`, `04_guidance-consensus`, `06_earnings-quality` — are all present, so the scan is NOT capped at "Incomplete."

> Business-model module IS available — all 14 outputs present at `analyses/BG_2026-06-01/business-model/`. Cross-module evidence (segment-map, value-chain, external-dependency, red-flags-sweep, synthesis) is used below.

> Note on the earnings setup being stress-tested: the upstream agents describe a **margin-led, biofuel-policy-driven upgrade** — FY2026 adjusted-EPS guidance was raised ~20% (to $9.00–9.50 from $7.50–8.00) after the EPA RVO decision, EBITDA/EPS estimates rose ~9–16% while revenue estimates were flat-to-down, and the company has beaten adjusted EPS five quarters running. The whole construct rests on (a) a management-defined adjusted EPS number, (b) an exchange-set crush spread no one at Bunge controls, and (c) a second half the Street is already nudging lower. That is what the categories below test.

---

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 02_revenue-drivers | Biofuel mandate demand (EPA RVO + Brazil/Indonesia/EU) is the largest organic forward driver; soy-oil stocks to "draw down… Q3 and especially Q4" | `[02_revenue-drivers output, §3, §7; Q1 2026 transcript, Q&A]` | Medium |
| 02_revenue-drivers | Viterra structurally expanded footprint — "biggest ag business in Argentina," expanded soybean origination and grain handling | `[02_revenue-drivers output, §3; Q1 2026 transcript]` | High (that it happened); Low (that it lifts the spread) |
| 03_margin-drivers | Soybean + softseed crush spread is improving; "primarily drove" the Q1 beat; FY26 guidance raised mostly on these two segments | `[03_margin-drivers output, §5, §8; Q1 2026 transcript, lines 95–96, 210]` | Medium |
| 03_margin-drivers | Viterra cost synergies "running ahead of plan"; corporate drag (pension, impairment, integration) should ease | `[03_margin-drivers output, §5; Q1 2026 transcript, lines 171–172, 234–235]` | Low (dollar synergy target redacted from pool) |
| 04_guidance-consensus | FY2026 adjusted-EPS revision breadth is 6 up / 0 down (last 1m and 3m); FQ2 2026 6 up / 0 down; EBITDA/EBIT breadth uniformly positive | `[04_guidance-consensus output, §5; Capital IQ Revisions export, data as of 2026-05-09]` | High |
| 04_guidance-consensus | Five consecutive adjusted-EPS beats (Q1'25 → Q1'26); FQ2 2026 ($1.93 consensus) "well-supported and broadly beatable" on recent cadence | `[04_guidance-consensus output, §6, §7; Capital IQ Surprise export]` | High (history); Medium (forward) |
| 06_earnings-quality | Non-GAAP adjustments are two-sided (GAAP exceeded adjusted in FY2023); SBC correctly kept inside adjusted EPS; no reverse factoring; contract liabilities rising | `[06_earnings-quality output, §4, §8; Q1 2026 release, p.2]` | High |
| 06_earnings-quality | Working-capital/cash-conversion deterioration is substantially a Viterra-consolidation + liquid-RMI artifact, not accrual manipulation | `[06_earnings-quality output, §2, §3, §6]` | Medium |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | GAAP gross margin fell 8.14% → 6.39% → 4.85% (−329 bps over 2 yrs); company-defined Total EBIT margin 5.60% → 2.18%; Total EBIT $3,333M → $1,533M even as revenue grew | `[01_historical-financials output, §1, §6; FY25 10-K, line 4691, p.37]` | High |
| 01_historical-financials | FY2025 revenue +32.4% and Q1'26 +87.8% are almost entirely the Viterra consolidation; organic like-for-like growth is NOT separable from the data | `[01_historical-financials output, §6; 02_revenue-drivers output, §6]` | High |
| 01_historical-financials | Net debt jumped $2,927M → $12,916M; Net Debt/EBITDA ~1.3x → ~5.78x; FY2025 FCF −$879M; TTM FCF −$1,161M | `[01_historical-financials output, §1, §2; FY25 10-K, balance sheet + CF]` | High |
| 06_earnings-quality | CFO/EBITDA collapsed ~85% → 38% (FY25) → 25% (TTM); usable earnings figure is management-defined (Q1'26 adjusted EPS 5.2x GAAP) | `[06_earnings-quality output, §1, §2, §9, §10]` | High |
| 06_earnings-quality | Viterra integration "one-offs" recurred 3 years running ($114M/$244M/$223M); receivables securitization ($1,174M derecognized) flatters DSO and CFO | `[06_earnings-quality output, §5, §8]` | High |
| 04_guidance-consensus | The ~10% guidance-above-Street gap at issuance has been arbitraged away — consensus $9.43 now sits ABOVE the $9.25 midpoint; "level is no longer obviously beatable" | `[04_guidance-consensus output, §3, §7; Capital IQ Consensus export, data as of 2026-05-09]` | High |
| 04_guidance-consensus | Upgrade is margin/biofuel-led, not volume-led — FY2026 revenue breadth 4 down / 1 up; back-half (FQ3/FQ4 2026) adjusted-EPS breadth net negative; H2 visibility "low" | `[04_guidance-consensus output, §4, §5, §7; Q1 2026 transcript]` | High |
| 03_margin-drivers / business-model | Bunge is "Squeezed" — price-taker on inputs AND outputs; crush spread set by exchanges, no contractual margin defense; Soybean EBIT swung $2,222M→$872M→$1,225M (±60%) | `[03_margin-drivers output, §8; 06_value-chain.md, §4–5; 10_external-dependency.md, §3]` | High |
| business-model 10_external-dependency | External dependency 72/100 (inverted, higher=worse); commodity/crush margin, biofuel policy, weather all High; >100% single-quarter guidance swing on one EPA policy decision | `[10_external-dependency.md, §1, §4, §5]` | High |
| business-model 12_red-flags-sweep | Brazil indirect-tax claims $760M (Q1'26), unprovisioned, +$115M in one quarter, vs FY25 net income $816M; Brazil is an undiversified compounding risk node | `[12_red-flags-sweep.md, §2, §3, §4; FY25 10-K Note 20; Q1 2026 10-Q Note 15]` | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| `05_beat-miss-setup` output (the dedicated beat/miss agent) | This agent (not produced for run) | No structured beat-case-vs-miss-case decomposition or material-beat threshold; beat/miss read leans on `04`'s history only |
| `07_earnings-sensitivity` output (the dedicated sensitivity agent) | This agent (not produced for run) | No structured EPS-per-unit sensitivity to crush spread / biofuel volume / freight; sensitivity read leans on the 10-K Item 7A VaR table, which `10` warns does NOT capture the crush-margin cycle |
| Organic (ex-Viterra) revenue and volume growth | 01_historical-financials §6; 02_revenue-drivers §6 | Cannot separate organic demand from acquisition; headline growth not an organic signal; first clean comparison is Q3 2026 (Viterra anniversary) |
| Standalone crush margin per ton; quantified Viterra synergy $ target | business-model synthesis §4; 03_margin-drivers §5 (synergy $ redacted) | Cannot independently size the single biggest margin lever or verify the synergy tailwind in the guidance |
| Cash interest paid / cash taxes paid (supplemental CF note) | 06_earnings-quality §1 note [e] | Cash earnings-quality bridge is incomplete; accrual interest/tax used as proxy |
| Clean post-Viterra full-year cash conversion (FY2026) | 06_earnings-quality §2, §9, §10 | The key disconfirming/confirming evidence for whether the cash gap is structural or acquisition-distorted is not yet in hand |
| Current / spot share price | 00_earnings-data-triage §3, §5 | Out of earnings scope; noted only because it limits master-level stock-reaction context |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 01_historical-financials (§4) | BP Bunge Bioenergia $195M stake-sale gain was an **FY2023** favorable one-off | 06_earnings-quality (§5, "Reconciliation flag") | Audited 10-K records the $195M gain in **FY2024**; FY2023 attribution is wrong | Y | **06 is correct.** Verified against raw filing: FY25 10-K states the gain three times as FY2024 `[FY25 10-K, lines 2714, 2732, 5849–5850]`. `01` mis-dated it. Material because it changes which year carried the favorable item (it explains part of why FY2024 GAAP held up vs adjusted). |
| 02_revenue-drivers / 03_margin-drivers (Q1'26) | Soybean & softseed processing was "stronger underlying" and "primarily drove" the beat | 04_guidance-consensus (§6) | Q1'26 revenue **missed** consensus; adjusted EPS beat was +110% versus a **depressed $0.87 estimate**, while adjusted EPS was essentially flat YoY ($1.83 vs $1.81) | Y | Both true and not in conflict once framed: margin/mix beat, revenue missed, and the headline beat magnitude is a low-bar artifact. The synthesis should not read +110% as +110% of operating improvement — verified: adjusted EPS $1.83 vs $1.81 prior year `[Q1 2026 transcript, line 119]`. |
| 03_margin-drivers (§5) | Corporate & Other drag is a "Headwind, easing" — pension/impairment were one-offs, integration fades | 06_earnings-quality (§5, §8) | Viterra integration "one-offs" have recurred **three years running**; "certain charges" are partly a running annual cost, not true one-offs | Partial | **06 more conservative and better-evidenced.** The pension settlement ($118M) and impairment ($30M) are genuine one-offs, but integration cost ($223M FY25) is on a 3-year streak. "Easing" is plausible but unproven; treat the corporate drag's improvement as a forecast, not a fact. |

No other material contradictions identified between upstream agents on the central facts (spread economics, Soybean dominance, Viterra-distorted comparisons, the GAAP-vs-adjusted gap). The three above are reconciled; only the first is a factual error and it has already been corrected by `06`.

---

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Two dependent earnings agents not produced (`05_beat-miss-setup`, `07_earnings-sensitivity`) | Triggered | High | High | This agent's input set vs files present in `analyses/BG_2026-06-01/earnings/` (only 00,01,02,03,04,06) | Beat/miss and sensitivity categories run with degraded confidence; synthesis must not assume a structured beat-case or EPS-sensitivity table exists |
| Organic vs inorganic (ex-Viterra) growth not separable | Triggered | Medium | High | `[01_historical-financials output, §6; 02_revenue-drivers output, §6]` | Headline +32.4% / +87.8% growth cannot be read as organic demand; first clean YoY comparison is not until Q3 2026 |
| No standalone investor deck; call references unshown slides | Triggered | Low | High | `[00_earnings-data-triage output, §2, §6]` | Minor — release + transcript cover the substance |
| Discrete 8-quarter standalone GAAP P&L only partially reconstructable | Triggered | Low | High | `[00_earnings-data-triage output, §6; 01_historical-financials output, §3, §5]` | Seasonality/QoQ work limited; FY2025 Q3/Q4 weighting is a Viterra artifact, not a forward seasonal assumption |
| Cash interest paid / cash taxes paid not disclosed | Triggered | Low | High | `[06_earnings-quality output, §1, note e]` | Cash earnings-quality bridge incomplete; accrual proxies used |
| Stale financials | Not Triggered | — | — | `[00_earnings-data-triage output, §2]` — FY25 10-K (~5m), Q1 2026 10-Q (~2m), Q1 2026 transcript (~1m), consensus as of 2026-05-09 | No staleness |
| No consensus / revision history | Not Triggered | — | — | Full Capital IQ suite present `[00_earnings-data-triage output, §3]` | No cap |
| No cash flow statement | Not Triggered | — | — | CF in 10-K and 10-Q `[06_earnings-quality output, header]` | Earnings-quality cap (max 45) does NOT apply |
| Fiscal-year mismatch between sources | Not Triggered | — | — | Capital IQ aligns to BG Dec-31 year-end `[04_guidance-consensus output, §1]` | None |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Reported revenue acceleration is acquisition-driven, not organic demand | Triggered | High | High | FY25 revenue +32.4%, Q1'26 +87.8%, "almost entirely… Viterra" `[01_historical-financials output, §6; 02_revenue-drivers output, §6, §7]` | A setup that reads the top-line acceleration as demand strength would be wrong; the acceleration laps from Q3 2026 |
| Margins compressing while the setup narrative is "improving" | Triggered | High | Medium | GAAP gross margin −329 bps over 2 yrs to 4.85%; adjusted Total EBIT margin 3.80% → 2.89% (FY24→FY25) `[01_historical-financials output, §1, §4; 03_margin-drivers output, §3]` | The forward "improving spread" story is a Q1'26-and-guidance call sitting on top of a 2-year compression trend; trend and forecast point opposite ways |
| EBITDA improving while EBIT / GAAP EPS worsen (D&A masking) | Triggered | Medium | High | TTM EBITDA +16.4% but Total EBIT −21.0% and GAAP EPS −60.1%; "EBITDA grew because D&A nearly doubled on Viterra assets, partly masking weaker operating EBIT" `[01_historical-financials output, §2, notes f–h]` | EBITDA-based reads flatter the trajectory; D&A steps up further (~$975M FY26 guide), so the EBITDA-vs-EBIT gap persists |
| One quarter / one segment driving most of the improvement | Triggered | Medium | Medium | Q1'26 Tropical Oils EBIT +$105M and South America soy processing were the swing positives; Grain went −$122M `[03_margin-drivers output, §7; 02_revenue-drivers output, §5]` | The beat is narrow and segment-specific; not broad-based |
| TTM trend contradicts annual trend | Not Triggered | — | — | Both annual and TTM show the same direction (CFO/FCF/EBIT down, EBITDA up on D&A) `[01_historical-financials output, §1, §2]` | Consistent |
| Seasonality ignored / mis-stated | Not Triggered | — | — | `01` explicitly flags FY2025 Q3/Q4 weighting as a Viterra artifact, not seasonality, and isolates the real Q1 cash-outflow seasonality `[01_historical-financials output, §5, §6]` | Handled correctly upstream |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Growth driven by acquisition + flat commodity price, not organic volume demand | Triggered | High | High | Every segment's net-sales rise "primarily due to… Viterra"; Q1 price up on "Iran-conflict energy prices… biofuel mandates" `[02_revenue-drivers output, §3, §4, §6; 10-Q MD&A]` | Reported revenue is gross of pass-through commodity cost (>90% is COGS); revenue is not the value metric — the spread is |
| Forward curves "heavily inverted" — second-half price/volume visibility low | Triggered | Medium | Medium | "forward curves are heavily inverted"; H2 visibility "limited" `[02_revenue-drivers output, §3, §4; 03_margin-drivers output, §8; Q1 2026 transcript, Q&A]` | The forward driver (biofuel-led oil demand) is real but the price structure is signalling near-term inversion; pull-forward risk into H2 |
| US–China trade flows unresolved (swing switch) | Triggered | Medium | Unknown | "China-U.S. trade yet to play out… additional soy business… even corn" `[02_revenue-drivers output, §4; 10_external-dependency.md, §1]` | Binary external switch on volume routing; direction unknown |
| Grain segment revenue and earnings diverge sharply | Triggered | Medium | Medium | Grain Q1'26 net sales +201% but adjusted EBIT $44M vs $60M; GAAP −$76M (bunker-fuel spike) `[02_revenue-drivers output, §5; 03_margin-drivers output, §6]` | A segment can post huge revenue and negative EBIT — confirms revenue is not a profit proxy |
| Customer concentration | Not Triggered | — | — | No single customer >10% `[12_red-flags-sweep.md, §1; 99_business-model-synthesis.md, §1]` | None |
| Channel inventory / stuffing | Not Triggered | — | — | Inventory build is liquid RMI ($11,361M), "not a channel-stuffing signal" `[06_earnings-quality output, §3]` | None |
| Backlog / book-to-bill deterioration | Unclear | Low | Unknown | Not a backlog business; no book-to-bill disclosed | Metric not applicable to a commodity processor; no data |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Margin is an exchange-set spread with no contractual defense — symmetric downside | Triggered | High | Medium | "Squeezed — price-taker on inputs AND outputs"; Soybean EBIT swung ±60% on a stable asset base; "no contractual lever… to defend its margin" `[03_margin-drivers output, §5, §8; 06_value-chain.md, §4–5]` | The same spread that doubled guidance in two months can compress just as fast; the bull case has no margin floor |
| D&A step-up structurally compresses EBIT even if gross spread holds | Triggered | Medium | High | FY25 D&A $703M → FY26 guided ~$975M (+39%) `[03_margin-drivers output, §2, §5; 04_guidance-consensus output, §2]` | EBIT/EPS guidance must absorb a rising fixed D&A line; a gross-spread-only bull read overstates EBIT |
| Interest expense rising on Viterra/working-capital debt | Triggered | Medium | High | FY24 $471M → FY25 $628M → FY26 guided $620–660M (raised from $575–625M) `[03_margin-drivers output, §2, §5; 04_guidance-consensus output, §2]` | Below-EBIT compression on net/EPS; guidance interest assumption was already raised once |
| Input-cost tailwind / freight headwind asymmetry | Triggered | Medium | Medium | Bunker-fuel spike turned Grain EBIT negative; Middle East conflict "meaningfully disrupted… logistics costs" `[03_margin-drivers output, §5, §6; Q1 2026 transcript]` | Freight is a live margin headwind concentrated in Grain; external and uncontrollable |
| Corporate & Other drag "easing" is a forecast, not a fact | Triggered | Medium | Medium | Drag widened −$367M → −$796M (FY24→FY25); integration cost recurred 3 yrs; FY26 "in line" guide is unproven `[03_margin-drivers output, §5; 06_earnings-quality output, §5]` | If integration cost does not fade as guided, the EPS bridge loses a tailwind |
| SG&A cuts appear temporary | Not Triggered | — | — | SG&A held ~3.0% of sales FY24→FY25; no aggressive cut to reverse `[03_margin-drivers output, §2, §5]` | None |
| Low-margin segment growing faster than high-margin segment (mix) | Unclear | Low | Medium | FY26: soy/softseed (higher) guided up, but lower-margin Grain and specialty Tropicals guided down — net mix "neutral-to-headwind" `[03_margin-drivers output, §5; 04_guidance-consensus output, §2]` | Mix effect is small and partly offsetting; not a clear single-direction flag |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Consensus has closed the gap to guidance — bar no longer obviously beatable | Triggered | High | High | Consensus $9.43 now ABOVE the $9.25 midpoint; the ~10% at-issuance gap (vs $8.41) "has been arbitraged away" `[04_guidance-consensus output, §3, §7; Capital IQ Consensus export, data as of 2026-05-09]` | The "easy" part of the setup is gone; full-year EPS upside now requires a genuine beat of a raised bar, not catch-up |
| Back-half (FQ3/FQ4 2026) adjusted-EPS revision breadth is net negative | Triggered | High | Medium | FQ3 ran 2–3 up vs 3–4 down; FQ4 ran 2 up vs 4 down; full-year rose only because H1/Q2 marks rose enough to offset `[04_guidance-consensus output, §5, §7; Capital IQ Revisions export]` | The full-year guide hinges on a second half the Street is already cutting; H2 is where the miss risk concentrates |
| Revenue estimates trimmed while EPS raised — upgrade is margin-only | Triggered | Medium | High | FY2026 revenue breadth 4 down / 1 up; revenue est +0.8% while EBITDA +9%, adjusted EPS +16% `[04_guidance-consensus output, §4, §5]` | The beat thesis rests entirely on crush/refining margins holding — the one variable management calls uncertain |
| Company guides only adjusted EPS + below-the-line; no revenue or EBIT/EBITDA guide | Triggered | Medium | High | Bunge guides adjusted EPS, capex, tax, interest, D&A only; "Revenue — Not guided", "EBIT/EBITDA — Not guided" `[04_guidance-consensus output, §2, §3]` | The single guided headline metric is the management-defined one (adjusted EPS); no guided GAAP anchor |
| Guidance interest cost already raised once mid-year | Triggered | Low | High | FY26 net interest guide $620–660M, raised from $575–625M `[04_guidance-consensus output, §2; 03_margin-drivers output, §5]` | Below-the-line guidance is already drifting the wrong way |
| Analyst count low | Unclear | Low | Medium | FY2026 adjusted-EPS: 8 estimates; revenue: 7; target price: 9 `[04_guidance-consensus output, §1]` | Coverage is thin-ish (7–9) for a ~$17bn-cap name; revision breadth counts (6 of 6) are therefore small samples |
| Estimate revisions falling | Not Triggered | — | — | FY2026 EPS 6 up / 0 down; FQ2 6 up / 0 down; near-term momentum positive `[04_guidance-consensus output, §4, §5]` | Near-term revision momentum is up, not down |
| Consensus stale | Not Triggered | — | — | As of 2026-05-09, post-Q1-call wave captured `[04_guidance-consensus output, §1, §4]` | Current |

### 2.6 Beat / Miss Setup

> Dedicated agent `05_beat-miss-setup` was not produced. Read below is reconstructed from `04_guidance-consensus` §6–§7 only and carries lower confidence.

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No dedicated beat/miss decomposition exists for this run | Unavailable | High | High | `05_beat-miss-setup` absent from `analyses/BG_2026-06-01/earnings/` | No structured beat-case-vs-miss-case, no material-beat threshold; synthesis must treat the beat/miss read as provisional |
| Headline beat magnitude is a low-bar artifact, not operating improvement | Triggered | High | High | Q1'26 adjusted EPS +110.3% vs a depressed $0.87 estimate, but adjusted EPS was flat YoY ($1.83 vs $1.81) `[04_guidance-consensus output, §6; Q1 2026 transcript, line 119 — verified]` | A setup that reads the +110% beat as momentum would overstate; the operating result was roughly flat |
| Beat thesis depends on a guidance raise holding, not just a quarterly print | Triggered | Medium | Medium | Bar called "fair" because the raised guide has been met; near-term FQ2 ($1.93) "broadly beatable" but full-year "hinges on a second half the Street is already nudging lower" `[04_guidance-consensus output, §7]` | Quarterly beat cadence is strong; full-year beat requires the H2 spread to hold — a harder, external-dependent ask |
| Revenue miss is the recurring signature | Triggered | Medium | High | 3 of last 5 quarters missed revenue; "base rate for a clean revenue beat is roughly a coin flip" `[04_guidance-consensus output, §6]` | If the market reacts to revenue lines, in-line/strong EPS can still print a revenue miss |
| Historical adjusted-EPS beat pattern is weak/unavailable | Not Triggered | — | — | 5 straight adjusted-EPS beats; annual surprises modest but positive bias `[04_guidance-consensus output, §6]` | Beat base rate on adjusted EPS is high |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Usable earnings figure is management-defined; adjustment dwarfs GAAP | Triggered | High | High | Q1'26 adjusted EPS $1.83 vs GAAP $0.35 (5.2x); FY25 adjusted $7.57 vs GAAP $4.91 (+54%); MTM "timing" split only management can compute `[06_earnings-quality output, §4, §7, §9, §10; Q1 2026 transcript, lines 115–119 — verified]` | The entire setup is denominated in a number the company computes for itself; quality rests on management's MTM classification |
| CFO/EBITDA collapsed; FCF negative | Triggered | High | High | CFO/EBITDA ~85% → 38% (FY25) → 25% (TTM); FCF −$879M (FY25), −$1,161M (TTM) `[06_earnings-quality output, §1, §2; 01_historical-financials output, §1, §2]` | Earnings are not currently cash-backed at the headline level; quality score 52/100 (Material concerns) |
| Recurring "one-off" integration costs (3 years running) | Triggered | Medium | High | Viterra integration $114M/$244M/$223M FY23/24/25; adjusted out each year `[06_earnings-quality output, §5, §8]` | The adjusted EPS that the guidance is built on adds back a cost that keeps recurring |
| Receivables securitization flatters DSO and CFO | Triggered | Medium | High | $1,174M derecognized at Dec-2025; $13,313M gross sold in FY2025 (program up to $1.5bn) `[06_earnings-quality output, §8; FY25 10-K Note]` | The already-weak CFO is flattered by an ongoing factoring program; true cash conversion is worse |
| Large fair-value / mark-to-market gains run through P&L (the central trap) | Triggered | High | High | MTM timing swings GAAP EBIT by hundreds of $M/qtr ($336M Q1'26); net unrealized derivative add-back +$958M in Q1'26 CFO `[06_earnings-quality output, §8; 12_red-flags-sweep.md, §2]` | GAAP single-period earnings are uninformative; forces reliance on adjusted; a slice of gross profit is a Level 3 mark, not cash |
| Brazil Level 3 unobservable marks are a critical audit matter | Triggered | Medium | Medium | CAM: fair value of RMI + physically-settled forwards using Level 3 Brazil basis/freight inputs `[12_red-flags-sweep.md, §2; FY25 10-K auditor report CAM]` | A material slice of reported gross profit is model-driven; weakens any single-period EBIT print |
| Working-capital build / receivables & inventory growing faster than sales | Triggered | Medium | Medium | DSO 14.8→20.1, DIO 47.7→72.0, CCC 42.0→65.5; receivables +80% vs revenue +32%; inventory +103% vs COGS +35% `[06_earnings-quality output, §3, §6]` | Screens look bad but are substantially a Viterra-base artifact + liquid RMI; becomes a true flag only if it persists into clean FY2026 |
| SBC excluded from adjusted earnings | Not Triggered | — | — | SBC kept INSIDE adjusted ($73M FY25, $23M Q1'26) `[06_earnings-quality output, §4, §8]` | Positive; not triggered |
| Change in useful life / depreciation assumptions | Not Triggered | — | — | Straight-line, unchanged `[06_earnings-quality output, §6, §8; FY25 10-K line 5312]` | None |
| Supplier finance / reverse factoring | Not Triggered | — | — | No reverse-factoring program; payables "RMI-related forward-purchase mark-to-market" not financing `[06_earnings-quality output, §3, §8]` | None |
| Tax rate boosted by one-off to flatter the headline | Not Triggered | — | — | Q1'26 booked a tax *benefit* but on low pre-tax income; it did NOT flatter — GAAP EPS would have been even lower without it `[06_earnings-quality output, §8]` | Not a flatter |

### 2.8 Sensitivity / External Variables

> Dedicated agent `07_earnings-sensitivity` was not produced. Read below is reconstructed from business-model `10_external-dependency` and the 10-K Item 7A table only; lower confidence.

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No dedicated, EPS-denominated sensitivity table exists for this run | Unavailable | High | High | `07_earnings-sensitivity` absent; the 10-K Item 7A VaR table does NOT capture the crush-margin or biofuel cycle `[10_external-dependency.md, §2]` | The single most important sensitivity (EPS per unit of crush spread / mandate volume) is not quantified — only a >100% guidance swing on one policy decision is observed |
| Earnings dominated by one external variable Bunge does not control | Triggered | Critical | High | Biofuel demand policy = "single biggest lever"; a 20% adverse move in mandated/blended biofuel volumes would compress oil-leg demand and crush margins; external dependency 72/100 inverted `[10_external-dependency.md, §4, §5; 03_margin-drivers output, §8]` | The whole FY26 upgrade traces to one EPA RVO decision; a policy reversal could unwind it as fast as it appeared |
| Non-linear / large downside on small input move | Triggered | High | Medium | Soybean segment EBIT moved $2,222M→$872M→$1,225M (±60%) on a near-stable asset base; >100% single-quarter guidance swing | A small move in the exchange-set spread produces a large EBIT/EPS move; downside is symmetric with no contractual floor |
| Bear-case variables currently moving the wrong way (freight, forward curve) | Triggered | High | Medium | Bunker-fuel spike already turned Grain EBIT negative in Q1'26; forward curves "heavily inverted"; Middle East conflict disrupting logistics `[03_margin-drivers output, §5, §6; 02_revenue-drivers output, §3]` | Two bear variables (freight cost, curve inversion) are already adverse in the latest quarter |
| Multiple variables likely move together negatively (correlated tail) | Triggered | High | Medium | Brazil node: weak crop / weaker real simultaneously pressures farmer repayment ($835M+$183M book), widens Level 3 basis marks, and raises indexed tax claims `[12_red-flags-sweep.md, §4; 99_business-model-synthesis.md, §4]` | Bunge's tail risk is concentrated, not diversified across segments; one Brazil scenario hits credit, marks, and tax at once |
| Sensitivity impact not quantifiable beyond a VaR snapshot | Triggered | Medium | High | Disclosed: 10% adverse commodity move = −$131M fair value; 100bp rates = ~$78M interest; 10% FX "not material" — but these are hedged-position VaR, not earnings-cycle sensitivities `[10_external-dependency.md, §2]` | The disclosed sensitivities look modest precisely because they miss the un-hedgeable crush/mandate trend that actually moves EPS |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| $195M BP Bunge Bioenergia gain mis-dated by `01` (FY2023) vs audited 10-K (FY2024) | Triggered | Low | High | Verified raw filing — 3 mentions all FY2024 `[FY25 10-K, lines 2714, 2732, 5849–5850]`; flagged and corrected by `[06_earnings-quality output, §5]` | Already caught; affects which year carried the one-off. Synthesis should adopt the FY2024 attribution |
| "Stronger underlying" Q1 (02/03) vs Q1 revenue miss + flat YoY adjusted EPS (04) | Triggered | Low | High | `[02/03 outputs]` vs `[04_guidance-consensus output, §6; Q1 2026 transcript, line 119]` | Reconcilable (margin beat, revenue miss, low-bar headline) but synthesis must not double-count the +110% as operating strength |
| Corporate drag "easing" (03) vs integration costs recur 3 yrs (06) | Unclear | Medium | Medium | `[03_margin-drivers output, §5]` vs `[06_earnings-quality output, §5, §8]` | "Easing" is a forecast; if integration cost does not fade, an EPS-bridge tailwind disappears. 06 is the more conservative read |
| Filings vs deck conflict | Not Triggered | — | — | No standalone deck in pool; filing/transcript do not conflict `[04_guidance-consensus output, §2]` | None |
| Capital IQ export contradicts filings | Not Triggered | — | — | Quarterly revenue & GAAP EPS cross-tie exactly to 10-K/10-Q; CapIQ "EBITDA/EBIT/normalized EPS" reconcile to company adjusted `[01_historical-financials output, §3, notes m/n]` | None — reconciliation is explicit |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The setup is really a commodity/policy bet wearing a company-specific label | Triggered | High | High | External dependency 72/100 inverted; biofuel policy is the single biggest lever; >100% guidance swing on one EPA decision; "Mostly externally driven" `[10_external-dependency.md, §3, §4, §5; 03_margin-drivers output, §8]` | Per CLAUDE.md §14, the thesis must be classified commodity/policy-conditional and conviction downgraded; this is not a self-determined earnings story |
| "Earnings accelerating" framing overstates a margin-led, low-bar, externally-driven inflection | Triggered | High | Medium | Adjusted EPS flat YoY in Q1'26; revenue trimmed; H2 breadth negative; acceleration is a guidance raise the Street has met `[04_guidance-consensus output, §4, §5, §7; 01_historical-financials output, §6]` | Risk that the synthesis tags "accelerating" when "margin-led, policy-dependent, H2-uncertain" is the honest read |
| Headline beat magnitude (+110%) frames momentum that the operating result does not support | Triggered | Medium | High | +110% vs $0.87 estimate but $1.83 vs $1.81 YoY `[04_guidance-consensus output, §6; Q1 2026 transcript, line 119]` | Beat-size optics oversell; operating EPS was flat |
| Business-quality confused with earnings-setup quality | Triggered | Medium | Medium | Business-model verdict: 28/100 business quality, ROIC 6.7% < 7.2% cost of equity, "survivor not compounder," scale earns sub-cost-of-capital returns `[99_business-model-synthesis.md, §1, §4]` | A favorable near-term earnings inflection sits on a structurally low-return business; the two must not be conflated in the synthesis |
| Bull case relies on adjectives, not numbers | Not Triggered | — | — | Upstream agents quantify drivers (segment EBIT swings, revision counts, guidance midpoints) `[01–04, 06 outputs]` | Evidence is numeric, not adjectival |

---

## 3. Red-Flag Summary Table

Triggered and Unclear flags only, sorted Critical → High → Medium → Low. (Unavailable checks are listed separately in Section 4.)

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | 2.8 Sensitivity | Earnings dominated by one uncontrollable external variable (biofuel policy / crush spread) | Triggered | Critical | High | One EPA RVO decision drove the entire FY26 upgrade; a reversal could unwind it as fast |
| 2 | 2.1 Data | Two dependent agents not produced (`05_beat-miss-setup`, `07_earnings-sensitivity`) | Triggered | High | High | Beat/miss + sensitivity categories run degraded; no structured beat-case or EPS-sensitivity table |
| 3 | 2.2 Trend | Reported revenue acceleration is Viterra-driven, not organic demand | Triggered | High | High | Headline +32.4%/+87.8% growth is inorganic; laps from Q3 2026 |
| 4 | 2.2 Trend | Margins compressing on trend while the forward narrative is "improving" | Triggered | High | Medium | 2-yr gross-margin compression (−329 bps) vs a Q1+guidance "improving spread" call — opposite directions |
| 5 | 2.3 Revenue | Growth driven by acquisition + flat price, not organic volume | Triggered | High | High | Revenue (>90% pass-through COGS) is not the value metric; the spread is |
| 6 | 2.4 Margins | Exchange-set spread, no contractual defense — symmetric downside | Triggered | High | Medium | The spread that doubled guidance in 2 months can compress just as fast; no margin floor |
| 7 | 2.5 Consensus | Consensus closed the gap — bar no longer obviously beatable | Triggered | High | High | The "easy" part is arbitraged away; full-year upside now needs a real beat of a raised bar |
| 8 | 2.5 Consensus | Back-half (FQ3/FQ4 2026) revision breadth net negative | Triggered | High | Medium | Full-year guide hinges on an H2 the Street is already cutting |
| 9 | 2.6 Beat/Miss | Headline +110% beat is a low-bar artifact; adjusted EPS flat YoY | Triggered | High | High | Reading +110% as momentum overstates; operating EPS was ~flat ($1.83 vs $1.81) |
| 10 | 2.7 Quality | Usable earnings figure is management-defined; adjustment dwarfs GAAP (5.2x) | Triggered | High | High | The whole setup is denominated in a number management computes for itself |
| 11 | 2.7 Quality | CFO/EBITDA collapsed to 25–38%; FCF negative | Triggered | High | High | Earnings not cash-backed at the headline; quality 52/100 |
| 12 | 2.7 Quality | Large Level 3 mark-to-market gains run through P&L (central trap) | Triggered | High | High | GAAP single-period earnings uninformative; a slice of gross profit is a model mark |
| 13 | 2.8 Sensitivity | Non-linear / large downside on a small spread move (±60% segment EBIT) | Triggered | High | Medium | Small exchange-set spread move = large EBIT/EPS move, both directions |
| 14 | 2.8 Sensitivity | Bear-case variables already adverse (bunker fuel, inverted curve) | Triggered | High | Medium | Two bear variables already negative in the latest quarter |
| 15 | 2.8 Sensitivity | Correlated Brazil tail (credit + marks + tax move together) | Triggered | High | Medium | One Brazil scenario hits farmer credit, Level 3 marks, and unprovisioned tax at once |
| 16 | 2.10 Narrative | Setup is really a commodity/policy bet, not a company-specific story | Triggered | High | High | Must be classified commodity/policy-conditional; conviction downgraded per CLAUDE.md §14 |
| 17 | 2.10 Narrative | "Accelerating" framing overstates a margin-led, low-bar, H2-uncertain inflection | Triggered | High | Medium | Honest read is "margin-led, policy-dependent, H2-uncertain," not clean acceleration |
| 18 | 2.2 Trend | EBITDA improving while EBIT/GAAP EPS worsen (D&A masking) | Triggered | Medium | High | EBITDA-based reads flatter the trajectory; D&A steps up further to ~$975M |
| 19 | 2.2 Trend | One quarter / narrow segment set drove the improvement | Triggered | Medium | Medium | Q1 beat was Tropical Oils + SA soy; Grain went −$122M — not broad-based |
| 20 | 2.3 Revenue | Forward curves "heavily inverted"; H2 visibility low | Triggered | Medium | Medium | Near-term price structure signals inversion; pull-forward risk into H2 |
| 21 | 2.3 Revenue | US–China trade flows unresolved | Triggered | Medium | Unknown | Binary external switch on volume routing |
| 22 | 2.3 Revenue | Grain revenue and EBIT diverge sharply (+201% sales, negative EBIT) | Triggered | Medium | Medium | Confirms revenue is not a profit proxy |
| 23 | 2.4 Margins | D&A step-up compresses EBIT even if gross spread holds | Triggered | Medium | High | EBIT/EPS guide must absorb +39% D&A |
| 24 | 2.4 Margins | Interest expense rising; guide already raised once | Triggered | Medium | High | Below-EBIT compression; interest assumption drifting wrong way |
| 25 | 2.4 Margins | Freight headwind concentrated and uncontrollable | Triggered | Medium | Medium | Bunker-fuel spike already turned Grain EBIT negative |
| 26 | 2.4 Margins | Corporate-drag "easing" is a forecast, not a fact | Triggered | Medium | Medium | If integration cost does not fade, an EPS-bridge tailwind disappears |
| 27 | 2.5 Consensus | Upgrade is margin-only — revenue trimmed while EPS raised | Triggered | Medium | High | Beat thesis rests entirely on crush/refining margins holding |
| 28 | 2.5 Consensus | Company guides only adjusted EPS + below-the-line; no GAAP anchor | Triggered | Medium | High | The one guided headline is the management-defined metric |
| 29 | 2.6 Beat/Miss | Full-year beat depends on a guidance raise holding, not a print | Triggered | Medium | Medium | Quarterly cadence strong; full-year needs the H2 spread to hold |
| 30 | 2.6 Beat/Miss | Revenue miss is the recurring signature (3 of 5 qtrs) | Triggered | Medium | High | In-line EPS can still print a revenue miss |
| 31 | 2.7 Quality | Recurring "one-off" integration costs (3 yrs) | Triggered | Medium | High | Adjusted EPS adds back a cost that keeps recurring |
| 32 | 2.7 Quality | Receivables securitization flatters DSO and CFO | Triggered | Medium | High | Already-weak CFO is flattered; true cash conversion worse |
| 33 | 2.7 Quality | Brazil Level 3 marks are a critical audit matter | Triggered | Medium | Medium | A material slice of gross profit is model-driven |
| 34 | 2.7 Quality | Working-capital build (DSO/DIO/CCC all up) | Triggered | Medium | Medium | Acquisition-artifact today; a true flag only if it persists into clean FY2026 |
| 35 | 2.8 Sensitivity | Sensitivity not quantifiable beyond a VaR snapshot | Triggered | Medium | High | Disclosed VaR misses the un-hedgeable crush/mandate trend that moves EPS |
| 36 | 2.9 Source | Corporate-drag easing (03) vs integration recurs (06) | Unclear | Medium | Medium | "Easing" is a forecast; 06 is the more conservative read |
| 37 | 2.10 Narrative | +110% beat optics frame momentum the operating result lacks | Triggered | Medium | High | Operating EPS was flat |
| 38 | 2.10 Narrative | Business quality (28/100) must not be conflated with earnings setup | Triggered | Medium | Medium | A near-term inflection sits on a sub-cost-of-capital business |
| 39 | 2.1 Data | Organic vs inorganic growth not separable | Triggered | Medium | High | Headline growth cannot be read as organic; clean comp not until Q3 2026 |
| 40 | 2.1 Data | No investor deck | Triggered | Low | High | Minor; substance covered by release + transcript |
| 41 | 2.1 Data | Discrete 8-qtr standalone GAAP P&L partial | Triggered | Low | High | Seasonality/QoQ limited |
| 42 | 2.1 Data | Cash interest / cash taxes paid not disclosed | Triggered | Low | High | Cash earnings-quality bridge incomplete |
| 43 | 2.5 Consensus | Interest-cost guide already raised once | Triggered | Low | High | Below-the-line guidance drifting wrong way |
| 44 | 2.9 Source | $195M gain mis-dated by `01` (FY23 vs audited FY24) | Triggered | Low | High | Already corrected by 06; adopt FY2024 |
| 45 | 2.9 Source | "Stronger underlying" Q1 vs revenue miss / flat YoY EPS | Triggered | Low | High | Reconcilable; do not double-count the +110% as operating strength |
| 46 | 2.3 Revenue | Backlog / book-to-bill | Unclear | Low | Unknown | Metric not applicable; no data |
| 47 | 2.4 Margins | Mix (low-margin segments) | Unclear | Low | Medium | Small and partly offsetting |
| 48 | 2.5 Consensus | Analyst count low (7–9) | Unclear | Low | Medium | Small revision-breadth samples |

---

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 44 |
| Critical flags | 1 |
| High flags | 16 |
| Medium flags | 21 |
| Low flags | 6 |
| Unclear flags | 4 |
| Unavailable checks (data missing) | 2 |

*(Counts reconcile to Section 3: row #1 = Critical; #2–#17 = High (16); #18–#35, #37, #38 = Medium (21); #36 + #46–#48 = Unclear (4); #40–#45 = Low (6). The two Unavailable checks — `05` and `07` non-production, rows in 2.6 and 2.8 — are counted separately and are NOT in the Section 3 summary table.)*

---

## 5. Red-Flag Severity Verdict

**Material concerns.**

The earnings setup is real but fragile and is being framed more favorably than the evidence supports. Sixteen High-severity flags and one Critical flag cluster around a single mechanism: the entire FY2026 upgrade is a margin-led, biofuel-policy-driven inflection, denominated in a management-defined adjusted EPS number (5.2x GAAP in Q1'26, with CFO/EBITDA at 25–38% and negative FCF), sitting on an exchange-set crush spread Bunge does not control and on a second half the Street is already trimming — while the headline +110% Q1 "beat" was a low-bar artifact (adjusted EPS was flat YoY, $1.83 vs $1.81). The single most dangerous red flag is the Critical one (row #1): earnings are dominated by one uncontrollable external variable — biofuel mandate policy — that swung a full quarter's guidance >100% on a single EPA RVO decision; what a policy decision gave, a policy reversal can take. What would resolve it: a clean post-Viterra FY2026 showing the raised crush/oil-leg margins holding through H2 with CFO/EBITDA back above 70% — and a durable biofuel-mandate framework that does not reverse. This does not reach "Critical concerns" because there is no going-concern, fraud, auditor-resignation, or solvency flag (Deloitte unqualified, investment-grade, no disqualifier triggered), and the quality screens are substantially explained by the Viterra consolidation rather than manipulation; but it is well past "Minor."

---

## 6. What The Synthesis Agent Should Know

- **44 triggered red flags: 1 Critical, 16 High, 21 Medium, 6 Low; plus 4 Unclear and 2 Unavailable checks.** The severity is concentrated, not scattered — most High flags trace to one root mechanism (an externally-set spread + a management-defined earnings number).
- **Single most dangerous flag:** earnings dominated by one uncontrollable variable — biofuel mandate policy (EPA RVO + Brazil/Indonesia/EU). Evidence: the FY26 adjusted-EPS guide moved ~20% (to $9.00–9.50) and a single quarter's guidance swung >100% (~$0.85 → ~$2.00) on one EPA decision `[10_external-dependency.md, §5; 04_guidance-consensus output, §2]`. Symmetric downside, no contractual floor.
- **This should change the verdict framing.** The setup is NOT "earnings accelerating." The honest read is **Mixed earnings setup** leaning to a **margin-led, policy-conditional inflection** — strong near-term FQ2 cadence, but a full year that depends on an H2 spread the Street is already cutting and a number management defines. Do not tag "accelerating."
- **Thesis-type classification (CLAUDE.md §14):** classify **commodity-conditional / policy-conditional**, not company-specific, and downgrade conviction accordingly. The Q1 beat and the guidance raise are spread/policy outcomes, not management actions.
- **Score caps to apply / confirm against MODULE_RULES:**
  - `06_earnings-quality` already self-scored **52/100** ("Material concerns — cash conversion weak"); do not lift it without a clean FY2026 cash print. The CFO/EBITDA collapse and management-defined-earnings dependence cap **earnings quality** in the 41–60 band.
  - **No quantitative MODULE_RULES data-cap is forced** (consensus, quarterly, transcript, segment P&L, cash flow all present). But the **absence of `05_beat-miss-setup` and `07_earnings-sensitivity`** means the beat/miss and sensitivity reads are provisional — earnings-volatility *confidence* should be held no higher than Medium, and the consensus/beat-setup score should not be lifted on a beat-case that no dedicated agent built.
  - **Earnings volatility is an inverted score (higher = worse)** and should be high here: ±60% segment-EBIT swings, GAAP EPS 0.35→4.36 across eight quarters, >100% guidance swing on one policy decision.
- **Contradictions the synthesis must reconcile:** (1) `01` mis-dated the $195M BP Bunge Bioenergia gain to FY2023 — the audited 10-K says FY2024 (verified, 3 mentions); adopt FY2024. (2) `03`'s "corporate drag easing" vs `06`'s "integration costs recur 3 years" — treat the easing as a forecast, not a fact; `06` is more conservative. (3) Q1 "stronger underlying" (02/03) vs revenue miss + flat YoY adjusted EPS (04) — reconcilable, but do not count the +110% as +110% of operating improvement.
- **Missing data that prevented a full scan:** the two un-produced earnings agents; organic-vs-inorganic growth split; standalone crush margin per ton; quantified Viterra synergy $ target; cash interest/taxes paid; and — the decisive one — a clean post-Viterra FY2026 cash-conversion print.
- **Cleaner or dirtier than upstream suggested?** **Dirtier on framing, not on accounting.** The upstream agents are individually rigorous and honest about caveats; the risk is that, stacked, their cautious sub-points add up to a setup that is more externally-dependent, more management-defined, and more H2-back-loaded than a quick read of "guidance raised 20%, six up-revisions, five straight beats" implies. No new accounting fraud signal surfaced beyond what `06` and `12` already carry (Brazil tax claims, Level 3 marks, securitization).

---

## 7. Pre-Mortem — If The Earnings Setup Fails

If this setup turns out wrong, the most likely reason we missed it is **that we let a management-defined adjusted EPS number, lifted by a single favorable biofuel-policy decision, stand in for durable operating earnings — and the second-half crush/oil-leg spread that the raised guide requires did not hold.** The mechanism is already visible in the evidence and is the Critical flag (row #1) feeding the back-half-breadth and margin-only-upgrade flags (rows #8, #27): the FY26 guide jumped ~20% almost entirely on the EPA RVO and the crush spread, the Street has closed the gap so there is no cushion, FQ3/FQ4 revision breadth is already net negative, forward curves are "heavily inverted," and the only guided headline metric is one the company computes for itself on top of a GAAP base that is 5.2x smaller and not cash-backed (CFO/EBITDA 25–38%). The failure would not look like fraud or a balance-sheet blow-up — Deloitte is unqualified and the disqualifiers are clean — it would look like an ordinary commodity-policy round-trip: a mandate or blending-economics shift compresses the oil leg into H2, the spread that doubled guidance in two months gives it back, adjusted EPS lands at the low end or below the $9.00–9.50 range, and the post-mortem error code is **bad causal inference** (treating a policy-driven spread windfall as a company-specific earnings trajectory), with **ignored red flag** as the close runner-up.
