# Earnings Red Flags — INDIAMART

All eight required upstream earnings outputs (00–07) and all three optional business-model cross-module inputs (`03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`, plus `12_red-flags-sweep.md`, read for corroboration) are present in the pool. No upstream output is missing — this scan proceeds without a degraded-confidence flag.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 06_earnings-quality | Cash conversion is structurally strong — CFO has exceeded EBITDA in every one of the last 5 years (121%–182%) | [06_earnings-quality output, §2] | High |
| 06_earnings-quality / 01_historical-financials | Deferred revenue (Unearned Revenue) has grown every year, never declined — company is effectively financed by customer prepayments | [06_earnings-quality output, §3, §6; 01_historical-financials output, §1 fn.4] | High |
| 01_historical-financials | Structural net-cash balance sheet throughout the 5-year window, deepening every year; Debt/EBITDA ~0.04x | [01_historical-financials output, §1] | High |
| 02_revenue-drivers | ARPU has compounded ~8–9% for four straight years, the dominant realized-growth driver | [02_revenue-drivers output, §3–4] | High |
| 04_guidance-consensus | Revenue surprises have been tightly calibrated (0% to +1.3%) for four straight quarters — a well-modeled top line | [04_guidance-consensus output, §6] | High |
| 03_margin-drivers | Accounting Software segment (Busy/Livekeeping) losses narrowed sharply YoY (−17.47% → −2.23% margin) on revenue nearly doubling | [03_margin-drivers output, §6] | Medium |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials / 02_revenue-drivers | Revenue growth has decelerated every year since FY23 (30.78%→21.45%→16.01%→13.02%→11.37% Q1 FY27), the softest of the last 8 quarters | [01_historical-financials output, §6; 02_revenue-drivers output, §7] | High |
| 02_revenue-drivers | Paying-subscriber net additions negative in 3 of the last 4 quarters, flat YoY (218,000 both Jun-25 and Jun-26) | [02_revenue-drivers output, §4, §7] | High |
| 03_margin-drivers | FY26 EBITDA margin compressed −385bps, ~78% driven by discretionary Other-expenses growth (Customer support + Advertisement) | [03_margin-drivers output, §7a] | High |
| 04_guidance-consensus | Sell-side is de-rating the name: target-price revisions 1 up/16 down (18 analysts, last 3 months); average recommendation drifted Outperform→Hold over 6–12 months; revenue and EPS revision breadth both net negative | [04_guidance-consensus output, §5] | High |
| 06_earnings-quality | ~30% of FY26 Profit Before Tax and ~40% of diluted EPS come from a "recurring unusual" mark-to-market gain line on the treasury book | [06_earnings-quality output, §5, §7] | High |
| 07_earnings-sensitivity | A combined downside scenario exists where SME demand weakness pushes subscriber net adds toward their bear case AND forces management to resume acquisition spend early, compounding two bear cases at once rather than occurring independently | [07_earnings-sensitivity output, §5] | Medium |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| No formal company-wide guidance (revenue, EBITDA, EPS) | 04_guidance-consensus, §2 | Beat/miss "bar" rests entirely on sell-side consensus and historical pattern, with no management-anchored baseline to test consensus against — see F9 below |
| No investor presentation / earnings deck in the data pool | 00_earnings-data-triage, §6 | Minor — guidance colour sourced from the verbatim transcript and board-outcome press release instead; no cap applied |
| No segment-level Street consensus for the Accounting Software Services (Busy) segment | 04_guidance-consensus, §3 | Cannot cross-check management's qualitative Busy CAGR guidance against a Street number at the segment level |
| No `ciq_facts.json` sidecar for this run | 01_historical-financials, §0; 06_earnings-quality, §0 | All figures are the agents' own sourced read of Capital IQ exports, cross-checked against primary filings — properly labelled Tier-5 throughout, not a genuine gap |
| Capex maintenance-vs-growth split not disclosed | 06_earnings-quality, §1 fn.4 | Low impact — capex is trivial (≤3% of CFO every year) |
| No company-disclosed quantitative sensitivity for the SME/consumer-cycle variable (management commentary only, qualitative) | 10_external-dependency (business-model), §2 | The single external variable management itself names as the biggest swing factor cannot be sized numerically from any pool source |

### Contradictions Between Agents

*"No material contradictions identified between upstream agents."* The only conflicting figures found in this pool are internal to the Capital IQ vendor exports themselves — not disagreements between this module's own specialist agents. See Section 2.9 (Source Conflicts) for the two internal CIQ inconsistencies (an EBITDA reconciliation gap across CIQ's own tabs, and two different FQ4 FY26 EPS-Normalized actuals within the same workbook family), both of which every upstream agent that touched them flagged transparently rather than silently resolving.

---

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No flags triggered in this category — the data triage verdict is "Sufficient" with no active partial-data caps | Not Triggered | — | — | [00_earnings-data-triage output, §5–§6] | None |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Q1 FY27 EBITDA margin's QoQ improvement (32.80%→35.35%) masks a small YoY decline vs the year-ago quarter (35.89%→35.35%, −54bps) | Triggered | Low | High | [01_historical-financials output, §3 quarterly table: Q4 FY26 32.80%, Q1 FY26 35.89%, Q1 FY27 35.35%] | A reader citing the QoQ margin "tick-up" alone (as 03_margin-drivers' own framing does, describing Q1 FY27 as "expanding QoQ off the FY26 trough") could overstate the read; on a YoY basis the same quarter is still slightly down, consistent with the deceleration story rather than a clean inflection |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Realized revenue growth is almost entirely price/ARPU-driven; paying-subscriber volume (the base ARPU multiplies against) has been flat-to-negative, with net adds negative in 3 of the last 4 quarters | Triggered | High | High | [02_revenue-drivers output, §4, §6, §7 — volume contributed ~0.0pp of Q1 FY27's +11.37pp growth; ARPU contributed +7.89pp] | If subscriber losses continue, the base ARPU is applied against keeps shrinking — management itself frames this as the single biggest 3–12 month risk and has declined to guide on when it turns positive |
| Buyer-side network stagnation admitted directly by the CEO on the Q1 FY27 call — a leading indicator for future lead volume/renewal willingness not addressed at this granularity by `02_revenue-drivers`' own "unique business inquiries" tracking | Triggered | Medium | Medium | [business-model/12_red-flags-sweep output, §2, citing Q1 FY27 Earnings Call, Jul 21 2026, Q&A: CEO — "the overall number of buyers are stagnating"; management confirms deliberately cutting "non-quality buyer" acquisition spend] | A two-sided marketplace depends on both supplier renewal AND buyer-generated leads; if buyer volume stays flat while supplier pricing keeps rising, fewer leads per supplier at a higher price is the mechanism that would eventually show up as weaker paying-supplier net adds or ARPU-tier downgrades |
| Revenue is increasingly concentrated in the top-decile-by-ARPU supplier cohort (41%→49% of revenue, FY21–FY26) | Triggered | Medium | Medium | [business-model/12_red-flags-sweep output, §1, citing `customer-geography` output] | Makes revenue more sensitive to churn or price pushback from a narrowing high-value cohort — not modelled anywhere in this module's own sensitivity table (07_earnings-sensitivity) |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Q1 FY27's "elevated" 35.35% EBITDA margin is a temporary, management-labelled policy choice (deferred customer-acquisition spend), not a sustained run-rate; management itself flags the reversal risk within "2, 3" quarters | Triggered | High | Medium-High | [03_margin-drivers output, §8, Cycle-Position Read: "the single biggest reversal risk is management resuming the outsourced-sales/marketing spend it has throttled"; Q3 FY26 call cites a ~₹10 crore/quarter target run-rate above where actual spend has run] | Any beat/miss or margin read for the next 1–3 quarters that treats the current margin level as the new baseline is likely overstated; this directly undercuts the "Cost pullback runs longer than the stated 2-3 quarters" bull scenario in `05_beat-miss-setup` §2, which is itself rated only "Mid" likelihood |
| Stock-based compensation grew +95.4% YoY in FY26 (2.33% of revenue), though it decelerated sharply to +1.9% YoY in Q1 FY27 — a headwind that could re-accelerate | Triggered | Low | Low | [03_margin-drivers output, §5; 06_earnings-quality output, §4] | Currently a minor, decelerating drag; worth monitoring rather than acting on now |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Consensus FY2027 EPS growth (+16.8% YoY) outpaces consensus FY2027 EBITDA growth (+11.96% YoY, computed: (5,828.73−5,205.94)/5,205.94) by ~4.8pp, even though FY26's reported diluted EPS actually *fell* −14.0% YoY on the back of a shrinking treasury-gains line while EBITDA rose slightly | Triggered | High | Unknown | [04_guidance-consensus output, §3 — FY2027E EBITDA ₹5,828.73mn vs FY2026A EBITDA ₹5,205.94mn (01_historical-financials output, §1); FY2027E EPS ₹92.02 vs FY2026A ₹78.77; FY2026 EPS decline noted in 04_guidance-consensus §3]. This 4.8pp gap and its likely driver are this agent's own cross-check, not asserted by any single upstream agent — Inference, not from filings | The gap must be closed by something below EBITDA — most plausibly a recovery in the treasury mark-to-market gains line that 06_earnings-quality identifies as ~30–40% of FY26 PBT/EPS (§5, §7) and inherently market-linked, not an operating improvement. If consensus implicitly assumes that non-operating item recurs or grows, an EPS "miss" next year could occur even with healthy operating (EBITDA) performance — and the market may not distinguish the two |
| Sell-side is de-rating the name alongside the estimate cuts: target-price revisions sharply negative (1 up / 16 down of 18 analysts, last 3 months); average recommendation drifted from Outperform (2.11–2.44) to Hold (2.61); revenue and EPS revision breadth both net negative even as EBITDA breadth is net positive | Triggered | Medium | High | [04_guidance-consensus output, §5] | A "fair" bar assessment sits alongside declining sell-side conviction — the bar being "fair" does not mean sentiment is neutral; a further miss or soft guide could compound an already-deteriorating sell-side view rather than starting from a clean slate |
| No formal company guidance exists for revenue, EBITDA, or EPS — the beat/miss framework rests entirely on revision momentum and historical pattern with no management-anchored baseline | Triggered | Medium | High | [04_guidance-consensus output, §2–§3, §7: "this call rests entirely on revision momentum and historical beat/miss behaviour"] | Structurally weakens the reliability of any "bar is fair/beatable" call, since there is no guidance-vs-consensus gap to anchor it — this is a permanent feature of the company's disclosure practice, not a one-quarter gap, and MODULE_RULES' no-consensus cap does not apply here because consensus itself is present; the weakening is qualitative, not a scored cap |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The "balanced setup" verdict treats the margin tailwind (deferred acquisition spend) and the revenue drag (falling subscriber net adds) as two independent, offsetting forces — but they are plausibly the SAME underlying SME-demand weakness expressed twice, corroborated across three independent inputs | Triggered | Critical | Medium | [05_beat-miss-setup output, §10 Pre-Mortem: "the margin tailwind... and the revenue drag... turned out not to be independent but to be the same underlying weakness expressing itself twice — management held spend back specifically because underlying demand was soft"; 07_earnings-sensitivity output, §5: "A combined downside scenario... would compound two of this table's bear cases at once rather than occurring independently"; business-model/12_red-flags-sweep output, §2 (buyer-side stagnation confirmed by management in the same quarter the spend pullback is occurring)] | If this compounding scenario materializes, both the revenue driver and the margin driver turn negative at the same reporting date instead of offsetting — this would flip a "balanced" or "stable" read to "Mixed earnings setup" or "Earnings decelerating," not a marginal miss. This is the single most dangerous flag in this report (see Section 5, 7) |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| A recurring, non-operating mark-to-market gain on the ~₹30bn treasury book accounts for ~30% of FY26 Profit Before Tax and ~40% of diluted EPS, despite Capital IQ's own income-statement structure labelling it "Unusual Items" — it has appeared, at material size, in every one of the last 5 fiscal years | Triggered | High | High | [06_earnings-quality output, §5, §7, §8: "the exact 'recurring one-off' trap this section exists to catch"] | Headline diluted EPS and PBT are meaningfully noisier earnings-quality signals than EBIT/EBITDA for this company; any beat/miss or valuation read built on EPS without separating this item risks materially misjudging the operating trend — quarterly EPS has swung from −52% to +56% surprise over the last four quarters almost entirely on this basis |
| Goodwill impairment risk: ₹4,542.72mn of goodwill (Busy Infotech + Livekeeping) is a named Key Audit Matter requiring auditor judgement on revenue-growth, terminal-growth and WACC assumptions; unlike most companies, an impairment here would hit EBITDA directly (not just EBIT), since D&A/impairment sits inside IndiaMART's own EBITDA definition | Unclear | Medium | Low/Unknown | [03_margin-drivers output, §2, §5, citing `business-model/03_segment-map.md` §1 and the FY26 Annual Report's Independent Auditor's Report; 07_earnings-sensitivity output, §6] | Not currently triggered — no impairment has been booked — but if the Accounting Software segment's growth disappoints materially, this is a tail risk to EBITDA itself, not just EBIT, which is unusual and worth flagging explicitly for the synthesizer |
| FY25 effective tax rate (21.98%) sits ~3pp below the ~25% band the other four years (FY22–FY24, FY26) cluster around, with no specific one-off tax event disclosed in the notes reviewed | Unclear | Low | Unknown | [06_earnings-quality output, §8: "flagged conservatively per CLAUDE.md §4, not confirmed"] | A minor, unresolved data point; not large enough on its own to move a verdict, but the residual uncertainty should not be silently dropped |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The single largest earnings-sensitivity variable in the pool (investment-portfolio NAV, ±5% move → ±₹1,426.29mn PBT, ~27% of FY26 EBITDA) sits below the operating line and is driven mostly by market/interest-rate conditions outside the company's control | Triggered | Medium | Medium | [07_earnings-sensitivity output, §2, §4; business-model/10_external-dependency output, §2, citing FY26 Annual Report, Note 31] | A reader relying on headline EPS/PBT for a beat/miss or valuation call would materially misjudge volatility that has nothing to do with the core marketplace's operating health — symmetric risk, direction unknown, but the base rate of a ±5% NAV move in a given year is real |
| Customer support / trust-and-verification cost buildout is a one-directional (only-up) structural cost line — it has risen in every disclosed period (+116% YoY FY26, +168bps again YoY in Q1 FY27) with no observed deceleration or mean-reversion evidence anywhere in the pool | Triggered | Medium | High | [07_earnings-sensitivity output, §3 Rank 3, §6: "This is a structural, not cyclical, cost buildout... there is no evidence it mean-reverts"] | Both the "bull" and "bear" cases modelled for this variable show a net EBITDA drag, only of different sizes — it is a persistent, worsening headwind that partially offsets the discretionary-spend tailwind identified elsewhere, and does not shrink if the subscriber base shrinks (cost scales with transaction/inquiry volume, not subscriber count) |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Capital IQ's own EBITDA figures disagree across its own tabs by ~2.2% (~₹115mn) at multiple periods (Income Statement "LTM" column vs Segments-tab Total vs quarterly-actual sum) — an unresolved intra-vendor inconsistency, not a filing-vs-vendor conflict | Triggered | Low | High | [01_historical-financials output, §2 fn.7: "This is an unreconciled inconsistency within Capital IQ's own tabs... flagged per CLAUDE.md §4/§5 rather than silently resolved"] | Does not change the qualitative trend read, but undermines precision confidence in any TTM EBITDA figure quoted from this vendor family to two decimal places |
| FQ4 FY26 (Mar-2026 quarter) EPS Normalized actual is reported as two different figures (₹11.54 in the Q1 FY27 transcript's own embedded CIQ summary table vs ₹8.33 in the Estimates Report's own Surprise tab) within the same CIQ workbook family | Triggered | Low | High | [04_guidance-consensus output, §6: "the reader should not treat ₹11.54 and ₹8.33 as interchangeable"] | Does not change the qualitative pattern (a large EPS miss that quarter) but a downstream user citing an exact FQ4 FY26 EPS-Normalized figure should verify which of the two sources they are using |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The Earnings Quality score (72/100, "Strong") is explicitly described by its own report as capped by the very issue (recurring treasury gains) that is also named as that report's single biggest quality concern — the headline number sits near the low end of its own Strong band for a reason tied directly to the largest flag in the same document | Unclear | Low | — | [06_earnings-quality output, §9: "which caps the score below the 81–100 band"; §10: "the single biggest risk that reported earnings could overstate the 'real' economic picture"] | A synthesizer citing "Earnings quality: 72, Strong" without the underlying caveat could understate how central the treasury-gains issue is to that exact number; no separate flag beyond the compounding-scenario risk already captured in Beat/Miss Setup (Section 2.6) is triggered here |

---

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Beat/Miss Setup | "Balanced setup" treats the margin tailwind and revenue drag as independent when they may be the same SME-demand weakness expressed twice | Triggered | Critical | Medium | Could flip the verdict to "Mixed earnings setup" or "Earnings decelerating" if both flip together |
| 2 | Earnings Quality | ~30% of PBT / ~40% of diluted EPS (FY26) from a "recurring unusual" treasury mark-to-market gain, every year for 5 years | Triggered | High | High | Headline EPS/PBT are noisy earnings-quality signals; EBIT/EBITDA are the clean reads |
| 3 | Guidance/Consensus | Consensus FY27 EPS growth (+16.8%) outpaces EBITDA growth (+12.0%) by ~4.8pp, implying an undisclosed assumption about non-operating gains | Triggered | High | Unknown | An EPS "miss" could occur even with healthy operating performance if the implicit assumption fails |
| 4 | Margin | Q1 FY27's "elevated" 35.35% EBITDA margin is a temporary policy choice, reversal risk named by management itself | Triggered | High | Medium-High | Treating current margin as the run-rate overstates near-term profitability |
| 5 | Revenue | Realized revenue growth is entirely price/ARPU-driven; subscriber volume flat-to-negative for 3 of 4 quarters | Triggered | High | High | The base ARPU multiplies against keeps shrinking; no management timeline for reversal |
| 6 | Revenue | Buyer-side network stagnation admitted directly by CEO — a leading indicator not fully captured upstream | Triggered | Medium | Medium | Two-sided marketplace risk: fewer leads per supplier at a higher price |
| 7 | Revenue | Revenue increasingly concentrated in top-decile-by-ARPU suppliers (41%→49%, FY21-FY26) | Triggered | Medium | Medium | Higher sensitivity to churn/price pushback from a narrowing high-value cohort |
| 8 | Guidance/Consensus | Sell-side de-rating: target price 1 up/16 down; recommendation drifted Outperform→Hold; revenue/EPS breadth negative | Triggered | Medium | High | "Fair" bar coexists with deteriorating sell-side conviction, not a clean slate |
| 9 | Guidance/Consensus | No formal company guidance exists for revenue/EBITDA/EPS | Triggered | Medium | High | Beat/miss framework has no management-anchored baseline, structurally weaker than a guided name |
| 10 | Sensitivity/External | Largest single sensitivity (treasury NAV, ±27% of FY26 EBITDA on PBT) is external, below the operating line | Triggered | Medium | Medium | Reader relying on EPS/PBT would misjudge volatility unrelated to core marketplace health |
| 11 | Sensitivity/External | Customer support/verification cost buildout is one-directional (only up), no mean-reversion evidence | Triggered | Medium | High | Persistent, worsening margin headwind that does not shrink if the subscriber base shrinks |
| 12 | Earnings Quality | Goodwill impairment (₹4,542.72mn) is a named Key Audit Matter; would hit EBITDA directly if triggered, unlike most companies | Unclear | Medium | Low/Unknown | Tail risk to EBITDA itself, not yet triggered |
| 13 | Source Conflict | CIQ's own EBITDA figures disagree ~2.2% across its own tabs at multiple periods | Triggered | Low | High | Undermines precision confidence in exact TTM EBITDA figures from this vendor family |
| 14 | Source Conflict | FQ4 FY26 EPS Normalized reported as two different figures (₹11.54 vs ₹8.33) within the same CIQ workbook family | Triggered | Low | High | Downstream users must verify which source they are citing |
| 15 | Earnings Quality | FY25 effective tax rate ~3pp below the other 4 years' band, no disclosed one-off explanation | Unclear | Low | Unknown | Minor, unresolved residual uncertainty |
| 16 | Margin | SBC grew +95.4% YoY FY26, though decelerated sharply to +1.9% YoY in Q1 FY27 | Triggered | Low | Low | Currently minor and decelerating; a re-acceleration watch item |
| 17 | Historical Trend | Q1 FY27 EBITDA margin's QoQ improvement masks a small YoY decline (−54bps) vs the year-ago quarter | Triggered | Low | High | QoQ framing alone could overstate the read as a clean margin inflection |
| 18 | Narrative/Framing | Earnings Quality score (72, "Strong") sits near the low end of its own band, capped by the report's own biggest flag | Unclear | Low | — | Citing the headline score alone understates centrality of the treasury-gains issue |

---

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 15 |
| Critical flags | 1 |
| High flags | 4 |
| Medium flags | 7 |
| Low flags | 6 |
| Unclear flags | 3 |
| Unavailable checks (data missing) | 0 |

---

## 5. Red-Flag Severity Verdict

**Material concerns** — high-severity flags present; earnings setup may be overstated or fragile.

One Critical-severity flag and four High-severity flags are present, but none of them is a confirmed, already-triggered breakdown (no accounting fraud, no going-concern issue, no confirmed miss has occurred) — they are well-evidenced forward risks with Medium-to-Unknown probability, which is why this stops short of "Critical concerns." The single most dangerous red flag is that the "balanced setup" the beat/miss agent itself constructed (margin tailwind vs revenue drag, treated as offsetting) may actually be one underlying SME-demand weakness expressed through two channels at once — a scenario independently corroborated by `05_beat-miss-setup`'s own pre-mortem, `07_earnings-sensitivity`'s interaction-effects section, and the business-model module's buyer-stagnation finding. What would resolve it: the next 1–2 quarters showing paying-subscriber net adds turn positive (or stabilize) WHILE management resumes acquisition spend on schedule — proving the two forces are genuinely independent policy/demand levers rather than the same weakness.

---

## 6. What The Synthesis Agent Should Know

- 18 flags identified: 15 Triggered, 3 Unclear, 0 Unavailable. Severity split: 1 Critical, 4 High, 7 Medium, 6 Low.
- The single most dangerous red flag (#1, Critical): the "balanced setup" verdict may rest on treating two connected forces (deferred acquisition spend and falling subscriber net adds) as independent when they are plausibly the same SME-demand weakness expressed twice — corroborated across `05_beat-miss-setup` §10, `07_earnings-sensitivity` §5, and business-model `12_red-flags-sweep` §2.
- This red-flag scan should push the synthesis toward treating "Earnings stable / balanced" with more caution than the upstream 04/05 verdicts alone suggest — not because those agents were wrong on their own evidence, but because two independent downstream checks (07's interaction effects, this agent's cross-read of 05's own pre-mortem) surface a scenario where the offsetting read collapses. Consider whether the verdict should lean toward "Mixed earnings setup" rather than a clean "stable/balanced" read, pending the next 1–2 quarters of evidence.
- A genuinely new finding (#3, High, this agent's own arithmetic): consensus FY2027 EPS growth (+16.8%) outpaces consensus FY2027 EBITDA growth (+11.96%) by ~4.8pp — a gap that, given FY26's demonstrated EPS volatility from non-operating treasury gains (~30–40% of PBT/EPS), likely embeds an undisclosed assumption about that non-operating item recurring or growing. This should be flagged explicitly if the master synthesizer or valuation layer uses consensus EPS as an anchor.
- No score cap from MODULE_RULES is newly triggered by this scan — data sufficiency was already "Sufficient" (00_earnings-data-triage) and no partial-data flag applies. The Earnings Quality score (72/100) already self-caps for the treasury-gains issue (06 §9); this scan does not propose lowering it further, only flags that the number sits close to its own band boundary for a reason worth repeating explicitly in synthesis.
- No material contradictions between upstream specialist agents were found; the only conflicts are internal to the Capital IQ vendor exports (Section 2.9), both already transparently flagged by the agents that touched them.
- Missing data did not prevent a full scan of any category — all 10 categories were assessable from available evidence.
- Net read: the setup is dirtier than a surface read of "Bar is fair" (04) + "Setup is balanced" (05) suggests, primarily because of the compounding-scenario risk (#1) and the EPS/treasury-gains earnings-quality overhang (#2, #3) — not because any individual upstream agent's work was flawed.

---

## 7. Pre-Mortem — If The Earnings Setup Fails

If this earnings setup turns out to be wrong, the most likely reason is that the "balanced setup" call misread two connected symptoms of a single cause as two independent, offsetting forces. Management deliberately pulled back customer-acquisition spend (the margin tailwind) at the same time paying-subscriber net adds turned negative and the CEO admitted the buyer side of the marketplace is stagnating (the revenue drag) — if both trace back to the same underlying SME-demand softness rather than being a genuine policy trade-off, then the moment demand fails to recover on management's stated "2, 3 quarter" timeline, margin and revenue would miss together instead of offsetting, and the setup would fail not from a new shock but from a bad causal inference already visible in this pool: `05_beat-miss-setup`'s own pre-mortem names this exact risk, `07_earnings-sensitivity`'s interaction-effects section models it as a genuine compounding scenario, and the business-model module's admission of buyer-side stagnation on the same call corroborates the shared root cause independently.
