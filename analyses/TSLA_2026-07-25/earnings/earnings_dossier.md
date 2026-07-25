# earnings Module Dossier — TSLA

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `earnings_memo.md`.

- Generated: 2026-07-24T13:08:02Z
- Module folder: `earnings`
- Contents: 1 module synthesis + 9 specialist outputs = 10 files

## Table of Contents

- [earnings — module synthesis](#earnings-module-synthesis) — `99_earnings-synthesis.md`
- [earnings / 00_earnings-data-triage.md](#earnings-00-earnings-data-triage-md) — `00_earnings-data-triage.md`
- [earnings / 01_historical-financials.md](#earnings-01-historical-financials-md) — `01_historical-financials.md`
- [earnings / 02_revenue-drivers.md](#earnings-02-revenue-drivers-md) — `02_revenue-drivers.md`
- [earnings / 03_margin-drivers.md](#earnings-03-margin-drivers-md) — `03_margin-drivers.md`
- [earnings / 04_guidance-consensus.md](#earnings-04-guidance-consensus-md) — `04_guidance-consensus.md`
- [earnings / 05_beat-miss-setup.md](#earnings-05-beat-miss-setup-md) — `05_beat-miss-setup.md`
- [earnings / 06_earnings-quality.md](#earnings-06-earnings-quality-md) — `06_earnings-quality.md`
- [earnings / 07_earnings-sensitivity.md](#earnings-07-earnings-sensitivity-md) — `07_earnings-sensitivity.md`
- [earnings / 08_earnings-red-flags.md](#earnings-08-earnings-red-flags-md) — `08_earnings-red-flags.md`


---

## earnings — module synthesis

_Source: `99_earnings-synthesis.md`_

# Earnings Module — TSLA (Synthesis)

## Abstract

Tesla's earnings picture is splitting in two directions at once: revenue is re-accelerating (Q2 2026 +25.5% YoY, a fourth straight beat) while operating profit keeps shrinking (EBIT margin 16.8% in FY2022 to 4.6% in FY2025 to 1.41% in Q2 2026 alone). The single biggest driver of that split is a locked-in stock-based-compensation ramp tied to the 2025 CEO Performance Award, which alone drove roughly half of the quarter's margin decline and carries $105.8-120.4 billion of further unrecognized expense in tranches not yet deemed probable. Consensus sits at a "fair," still-resetting bar — revenue estimates keep rising while profit estimates keep falling, with revision breadth still net-negative on every profit line a month after the print. The biggest risk is that this SBC overhang produces another lumpy margin step-up with little warning, on top of a delivery recovery that may still be normalizing off a tax-credit-distorted base rather than a proven new demand peak. Net: a mixed earnings setup, not a clean acceleration.

## 1. Earnings Verdict

- **Verdict: Mixed earnings setup**
- Earnings quality: 58/100
- Consensus setup: 50/100 (higher = more beatable)
- Earnings volatility: 68/100 (inverted — higher = WORSE)
- Next-quarter setup: Balanced — but see Section 3/8: the underlying scenario evidence in `05` skews toward miss risk (2 High-likelihood miss scenarios vs. 0 High-likelihood beat scenarios above Mid-High), so "Balanced" should be read as balanced-to-cautious, not neutral-with-no-lean
- Biggest earnings driver (one line): The stock-based-compensation ramp tied to the 2025 CEO Performance Award — already the largest identified cause of the Q2 2026 EBIT-margin decline, with $105.8bn-$120.4bn of further unrecognized expense in tranches "not yet deemed probable" that can trigger another step-up with little warning [`03_margin-drivers.md`, §9; `06_earnings-quality.md`, §4]
- Biggest earnings risk (one line): The same SBC overhang colliding with an unresolved question about whether the Q2 2026 delivery "recovery" (480,126 units, +25% YoY) is genuine new demand or a bounce-back from the federal EV tax-credit pull-forward that likely inflated Q3 2025 and hollowed out Q4 2025/Q1 2026 [`02_revenue-drivers.md`, §6; `07_earnings-sensitivity.md`, §5]
- **Red-flag agent's overall Severity Verdict (reported verbatim, per MODULE_RULES): "Material concerns."** [`08_earnings-red-flags.md`, §5]

## 1A. Module Disconfirmation

- **Strongest bear point:** Revision breadth is still net-negative on every profit line (EBITDA, EBIT, EPS Normalized, EPS GAAP) a full month after the Q2 2026 print, even after EPS Normalized consensus was already cut 10.7% (FY2026) and 14.8% (next quarter) — the estimate reset for the known margin problem is not finished, and it is layered on top of a quantified, one-directional SBC overhang that management itself guides will keep growing [`04_guidance-consensus.md`, §5, §7; `03_margin-drivers.md`, §9].
- **Strongest bull point (steelman):** Revenue growth is real and broad-based, not manufactured — record Q2 deliveries (480,126, +25% YoY), a 62% YoY surge in smaller international markets, and Services/FSD revenue up 50% YoY with margin at an all-time high (14.15%) all show up in independently-disclosed lines, and CFO has exceeded 85% of GAAP EBITDA in every year of the last five with deferred revenue growing every year — there is no evidence of manufactured revenue or a collections crisis behind the top-line story [`02_revenue-drivers.md`, §4, §6; `06_earnings-quality.md`, §1, §9].
- **Single killer risk:** A new CEO Performance Award milestone (vehicle-delivery, FSD-subscription, Robotaxi, or Adjusted-EBITDA count) crosses the "probable" threshold, triggering a fresh multi-quarter SG&A step-up from the $105.8bn-$120.4bn unrecognized pool — the same mechanism that already drove the current $9.82bn tranche's expense recognition, with no formal guidance to warn the market in advance [`03_margin-drivers.md`, §9; `05_beat-miss-setup.md`, §5].
- **Disconfirming evidence already visible:** The Q1 2026 EPS beat (+17.14%) was explicitly aided by a ~$230M one-off warranty/tariff benefit that did not repeat in Q2 2026, when EPS then missed by -38.9% — the exact one-off-aided-beat-then-quality-miss pattern that the killer risk describes has already happened once in the trailing two quarters [`04_guidance-consensus.md`, §6; `05_beat-miss-setup.md`, §5].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| earnings-data-triage | Sufficient — no active partial-data caps | Every element of the "Sufficient" bar (verbatim latest-quarter transcript, filed 10-Q, current consensus with revision/surprise history, segment P&L) is met; the standalone audited FY2025 10-K (Item 8) is absent, but the company's own unaudited Update letters and CIQ export stand in without triggering a cap |
| historical-financials | Revenue inflecting, margins decelerating | Revenue turned negative in FY2025 (-2.9%) then rebounded +25.5% YoY in Q2 2026; EBIT margin fell every year since FY2022's 16.8% peak to 4.6% in FY2025 and 1.41% in Q2 2026 alone; net cash position (strict basis) shrank from $8.7bn (FY2021) to a small $861M net debt by Jun-30-2026 |
| revenue-drivers | Improving, but recovering from a policy-driven air pocket | Vehicle delivery volume is the single biggest revenue lever (~71% of revenue); the Q2 2026 rebound follows a federal EV tax-credit expiration (Sept 30, 2025) that likely pulled forward Q3 2025 deliveries and hollowed out Q4 2025/Q1 2026 — "recovering from a trough, not yet a proven new run-rate peak" |
| margin-drivers | EBIT-margin decline is an opex story, not a gross-margin story | The entire -269bps Q2 2026 EBIT-margin decline traces to R&D/SG&A growing roughly twice as fast as revenue; the stock-based-compensation ramp alone (-126bps) is the single biggest margin driver, with $105.8bn-$120.4bn of further unrecognized SBC expense in tranches not yet deemed probable |
| guidance-consensus | Bar is fair — split by line item | Tesla issues no point guidance; revenue consensus has been raised every lookback window (+20 net revisions last month) while EPS Normalized consensus was cut 10.7%-14.8% in the last month alone, yet revision breadth remains net-negative on every profit line a month after the print |
| beat-miss-setup | Setup is balanced | The revenue bar sits against an artificially high, policy-distorted Q3 2025 base (FQ3 2026 consensus revenue $27,420.6mm already below the Q3 2025 actual $28,095mm); the SBC/opex ramp is the single biggest risk that could flip the balanced read toward "favors miss" |
| earnings-quality | Score 58/100 — Mixed/average | Cash generation is genuinely solid (CFO exceeded 85% of GAAP EBITDA every year), but GAAP net income was materially boosted by one-off items twice in under three years ($5,927M FY2023 tax-valuation-allowance release; a Q2 2026 combination of a $1,005M SpaceX mark-to-market gain and a $274M CA tax-valuation-allowance release), and DSO is rising opposite falling revenue |
| earnings-sensitivity | Volatility 68/100 (High band, inverted — worse) | FX is the single largest quantified swing ($1.64bn per 10% move, unhedged); three of six tested variables (SBC tranche probability, R&D/SG&A opex ratio, regulatory credits) are structurally one-directional headwinds with no offsetting upside case |

## 3. Reconciliation

- **01/02 vs. 05 — confidence on the revenue-beat pattern:** `01_historical-financials` and `02_revenue-drivers` both flag that whether the Q2 2026 revenue rebound is a genuine demand inflection or a one-quarter bounce off a policy-distorted trough "is not resolved" from the pool's own data. `05_beat-miss-setup` separately weights the revenue-beat streak "moderate-to-high" confidence, because it is backed by an independent, converging driver picture (delivery volume, international expansion, Services/FSD attach). Per `08_earnings-red-flags` §1, these are answers to two different questions — demand durability vs. evidentiary support for the beat pattern itself — not a true conflict. This synthesis adopts the more conservative framing per CLAUDE.md §4: the beat streak is real and driver-supported, but the underlying demand base it sits on is not yet proven durable, and the verdict below treats the revenue side as "improving but unresolved," not "accelerating."
- **CIQ vendor export vs. company Update letters (operating income, Q3/Q4 2025):** CIQ's Financials_Quarterly.xls shows Operating Income of $1,862M (Q3'25) and $1,171M (Q4'25); the company's own Update letters consistently show $1,624M and $1,409M for the same quarters. `01_historical-financials` resolves this per the source hierarchy (company primary disclosure over a vendor export) and uses the company figures throughout — this synthesis does the same. The ~$238M/quarter gap itself remains unexplained and is noted, not silently dropped.
- **Red-flag agent's Severity Verdict vs. this synthesis's trajectory verdict:** `08_earnings-red-flags` reports "Material concerns" as its overall severity read (0 Critical flags, 12 High, 24 Medium). This synthesis's trajectory verdict is "Mixed earnings setup." The two are not in conflict — "Material concerns" describes the density and severity of red flags surfaced across the module (concentrated in the SBC overhang, the EBIT-margin trend, and revision breadth), while "Mixed" describes the earnings trajectory itself (revenue improving, margins/EPS deteriorating). Both readings point the same direction: neither supports an unqualified "accelerating" call, and this synthesis does not override or soften the red-flag agent's verdict.
- No other material disagreements between specialists were found; all eight upstream reports were internally consistent on directional facts (revenue up, margins down, quality mixed, volatility high).

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No consensus / estimate data | N — consensus, revisions, surprise, and trend data are all present and current [`00_earnings-data-triage.md`, §5] | Consensus setup | Not capped |
| No cash flow statement | N — present in the 10-Q, Update letters, and CIQ export [`06_earnings-quality.md`, header] | Earnings quality | Not capped |
| No revision history | N — Revisions and Recent Changes tabs both present and current [`04_guidance-consensus.md`, §4-5] | Consensus setup | Not capped |
| No verbatim transcript AND no sell-side proxy | N — both Q1 2026 and Q2 2026 verbatim CIQ transcripts present [`00_earnings-data-triage.md`, §3] | Earnings clarity | Not capped |
| Transcript role filled ONLY by a sell-side proxy (no verbatim) | N — verbatim transcripts present, not a proxy | Earnings clarity | Not capped |
| Only inferred sensitivities | N — FX sensitivity is company-disclosed exactly ($1.64bn/10% move); the opex-ratio sensitivity uses a disclosed historical range. Two of six variables (delivery volume, SBC new-tranche size) carry Low confidence because their dollar coefficients are inferred, not disclosed [`07_earnings-sensitivity.md`, §2] | Earnings volatility confidence | Not fully capped to Low — mixed confidence across the variable set; flagged that 2 of 6 variables individually carry Low confidence |

No score caps from the standard MODULE_RULES list bind. The pool is genuinely sufficient across every dimension tested — the module's limitations are informational gaps (unquantified order backlog, no segment opex allocation, no standalone audited FY2025 10-K), not the kind that trigger a hard numeric cap.

## 5. Earnings Setup Summary

### Revenue Setup

The current revenue trajectory is not obviously sustainable as reported: the Q2 2026 acceleration follows two straight quarters of decline (Q4 2025, Q1 2026) and sits on the other side of a federal EV tax-credit expiration that likely distorted both the prior peak (Q3 2025) and the subsequent trough. The single factor that would flip the direction is whether the "largest order backlog since 2023" — cited by management but never sized in dollars or units — actually converts into deliveries at the current pace once battery-cell capacity (the named production constraint) allows it; if the backlog claim proves smaller than implied, or if international-market growth (which drove 70% of Q2's revenue growth) does not scale, the reported acceleration reverses quickly. There is also a real reported-vs-organic gap: automotive regulatory-credit revenue, historically near-100%-margin, fell 67% YoY and is structurally non-reversing, meaning a growing share of reported revenue growth has to come from lower-margin lines (vehicle volume, Services) to offset that lost cushion.

### Margin Setup

Current margins are not at a cyclical peak or trough in the ordinary commodity-cycle sense — the decline is structural and self-inflicted, driven by a disclosed, management-guided decision to keep growing R&D and SG&A (robotaxi, Optimus, Semi, AI compute) faster than revenue, layered on top of the largest single identified driver: the stock-based-compensation ramp tied to the CEO Performance Award. If SBC and non-SBC opex growth continue at even half their current pace, EBIT margin has no visible floor in the next several quarters; a further 10-20% adverse move in the Energy segment's gross margin (already down from 39.5% to 20.4% quarter over quarter, against a management long-term target of "mid-to-low 20s") would take the single largest bite out of consolidated margins after the SBC line itself. Tesla has essentially no contractual margin-protection mechanism visible in this pool — no pass-through clause, no hedge on the FX exposure that swings pre-tax income $1.64bn per 10% move — making it largely a price-taker on cost inputs, with cost discipline (not a protective structure) as the only lever management has cited.

### Quality Check

The largest gap between reported and economic earnings is the recurring pattern of large, one-off, non-operating items landing in GAAP net income at different points — a $5,927M tax-valuation-allowance release in FY2023 (40% of that year's net income) and, in Q2 2026 alone, a $1,005M SpaceX equity mark-to-market gain plus a $274M California tax-valuation-allowance release, arriving in the same quarter free cash flow turned negative for the first time in eight quarters. This gap is not narrowing — it recurred within roughly two-and-a-half years and both instances involve items the company itself excludes from its own "adjusted" figures, which is honest disclosure but does not make the underlying pattern less real. To model normalized earnings for next year, GAAP is the safer starting point specifically because the current "non-GAAP" definition already excludes stock-based compensation — a genuine, recurring, shareholder-diluting cost equal to 65% of FY2025 GAAP operating income — and building forward from a number that treats SBC as non-economic would materially overstate underlying profitability.

### Consensus Bar

For Tesla to beat the current bar by a material margin, it would need the delivery/backlog story to prove out as genuine new demand rather than tax-credit normalization, and simultaneously for no new CEO Performance Award milestone to become "probable" in the near term (which would otherwise reset the SBC drag higher). The bar looks most likely mis-set on the profit side: EPS Normalized consensus has already been cut 10.7%-14.8% in the last month, yet revision breadth is still net-negative on every profit line a month after the print — implying the Street itself is not confident the cuts are complete, which argues the bar is still too high rather than already reset to a beatable level. A meaningful share of the current consensus revenue trajectory is anchored to a recent, unusual event (the tax-credit-driven Q3 2025 peak and its aftermath) that both `01_historical-financials` and `02_revenue-drivers` flag as unresolved — if that anchor proves to have been a one-off distortion, the revenue side of the consensus bar could reverse as well.

## 5b. Leverage & Capital Structure

Leverage is within normal range and did not change materially during the period — no dedicated treatment required.

(Detail for completeness: net debt on the strict basis — total debt less cash and equivalents only — was a net-cash position of $2,516M at FY2024-end and $1,794M at FY2025-end, moving to a small $861M of net debt by Jun-30-2026 [`01_historical-financials.md`, §1-2]. Against TTM GAAP EBITDA of $10,849M, that implies a net-debt/EBITDA ratio of roughly 0.08x — far below the 3.0x Trigger A threshold. Total debt rose from $14,719M (FY2025-end) to $16,080M (Jun-30-2026), a 9% increase, well below the 50% Trigger B threshold, and the absolute net-debt swing (from net cash to a small net-debt figure) is modest in dollar terms. On the broad basis — netting in $28.3bn of short-term investments — Tesla still carries roughly $27.4bn of net cash [`01_historical-financials.md`, §2]. Neither trigger fires.)

## 6. Key Numbers

- Revenue growth rate: Q2 2026 +25.5% YoY ($22,496M to $28,236M); FY2025 -2.9% YoY; TTM (Jun-30-2026) +11.8% [`01_historical-financials.md`, §1-2]
- EBITDA margin (GAAP): Q2 2026 7.14%, down from 10.47% a year earlier (-333bps); FY2025 11.1% [`01_historical-financials.md`, §3]
- EPS (GAAP diluted): Q2 2026 $0.32; TTM $1.08, down 35.3% YoY [`01_historical-financials.md`, §2-3]
- CFO / EBITDA: 140.4% for FY2025 — but the rise reflects a shrinking EBITDA denominator (down 39% since FY2022's peak), not improving collections [`06_earnings-quality.md`, §1-2]
- Biggest driver current level: vehicle deliveries 480,126 units in Q2 2026 (record quarter, +25% YoY); stock-based compensation $1,151M in Q2 2026 (+81% YoY, 4.08% of revenue) [`02_revenue-drivers.md`, §4; `03_margin-drivers.md`, §3]
- Consensus gap: FQ3 2026 consensus revenue $27,420.6mm sits below the actual Q3 2025 print of $28,095mm — the YoY comparison base is itself in question [`04_guidance-consensus.md`, §4; `05_beat-miss-setup.md`, §1]
- Estimate revision direction: revenue estimates rising every lookback window; EPS Normalized estimates falling (FY2026 -10.7%, next-quarter -14.8%, both in the last month) [`04_guidance-consensus.md`, §4-5]
- Earnings volatility score: 68/100 (inverted — higher is worse), High band [`07_earnings-sensitivity.md`, §7]

## 7. What Would Change The Earnings Verdict?

| Current Verdict | What Would Upgrade It | What Would Downgrade It | Data Needed |
|---|---|---|---|
| Mixed earnings setup | (1) Revision breadth on profit lines (EBITDA, EBIT, EPS) turns net-positive, signaling the estimate reset is complete; (2) a quantified order-backlog figure that confirms delivery growth is demand-led, not battery-capacity-capped normalization; (3) two consecutive quarters of EBIT margin stabilizing or improving without one-off help | (1) A new CEO Performance Award milestone becomes "probable," triggering a fresh SBC step-up from the $105.8bn-$120.4bn unrecognized pool [High-severity flag #6, `08_earnings-red-flags.md`]; (2) Q3 2026 deliveries undershoot the already-lowered consensus base, confirming the Q3 2025 peak was pull-forward demand [High-severity flag #1, #3, #4]; (3) the Robotaxi/FSD securities-fraud litigation produces an adverse ruling or disclosure development that affects the credibility of the Services/FSD growth narrative [High-severity flag #5/#12] | Q3 2026 print and call (Oct 21, 2026); any interim 8-K on CEO Performance Award milestone-probability determinations; a quantified backlog disclosure; docket developments in the Autopilot/FSD/Robotaxi securities case |

Consensus setup is known (not "Unknown") in this pool, so the accelerating-verdict constraint does not mechanically block an "Earnings accelerating" call — but the evidence itself (three straight years of EBIT-margin decline, a still-net-negative profit-revision trend, and a 68/100 volatility score) does not support that call regardless of the consensus-data condition. "Mixed earnings setup" is the correct read on the merits, not merely by default.

## 8. Note To The Final Synthesizer

- Dominant earnings trend: revenue is genuinely re-accelerating (record Q2 2026 deliveries, four straight revenue beats) while operating profit keeps shrinking (EBIT margin fell every year since FY2022, and again sequentially in Q2 2026) — these two trends are moving in opposite directions and should not be collapsed into a single "accelerating" or "decelerating" story.
- Whether earnings are clean and cash-backed: cash generation itself is solid (no manufactured-revenue or collections-crisis evidence, deferred revenue growing every year), but GAAP net income has twice in under three years been materially inflated by one-off, non-operating items (the FY2023 tax-valuation-allowance release and the Q2 2026 SpaceX mark-to-market gain plus a second tax-valuation-allowance release) — read reported net income and EPS with that in mind, not at face value. [High-severity flag #9]
- Consensus bar assessment: "fair" but not settled — the revenue bar has gotten harder (raised every lookback window against a policy-distorted comparison base) while the profit bar has been cut hard but analysts are still cutting a month later, meaning the reset is incomplete. [High-severity flag #7]
- Next-quarter setup and second-quarter look-ahead: `05_beat-miss-setup` calls FQ3 2026 "balanced," but its own scenario tables rate two miss scenarios "High" likelihood versus zero beat scenarios above "Mid-High" — treat the "balanced" label as balanced-to-cautious. Q4 2026 should be a cleaner read on underlying demand since its YoY base (Q4 2025) was not distorted by the tax-credit pull-forward the way Q3 2025 was. [Medium-severity flag #24]
- Top sensitivity variable and its current direction: FX is the single largest quantified swing ($1.64bn per 10% move, currently a tailwind from a weaker dollar) — it is entirely external, unhedged, and can reverse without warning. The SBC/opex variables are structurally one-directional headwinds with no offsetting upside case. [High-severity flags #10, #11]
- Whether any partial-data cap applied: none — every standard MODULE_RULES cap was tested and none bind; the pool is genuinely sufficient (Section 4).
- Biggest missing data point: a quantified order-backlog figure. Management calls it "the largest order backlog since 2023" but discloses no unit or dollar size — this is the central, unverifiable pillar of the bull case for continued delivery growth. [Medium-severity flag #15]
- What would change the earnings verdict: see Section 7 — the SBC-milestone-probability question and the genuineness of the delivery recovery are the two swing factors.
- **Red-flag agent's overall Severity Verdict (reported verbatim): "Material concerns."** [`08_earnings-red-flags.md`, §5]
- Biggest risks not otherwise captured above, propagated verbatim per the mandatory High-severity flag rule: (a) the Q2 2026 revenue re-acceleration may be normalization off a policy-distorted trough rather than a proven new demand peak [flag #1]; (b) EBIT margin decelerated every year for three straight years even as the latest quarter's revenue reads as an acceleration, creating conflation risk [flag #2]; (c) the Q3 2025 revenue share (29.6% of FY2025 revenue) was an unexplained three-year outlier and is the YoY base for the very next print [flag #3]; (d) the Robotaxi/FSD narrative that `02_revenue-drivers` treats as a forward driver is simultaneously the subject of an unresolved federal securities-fraud class action over Autopilot/FSD/Robotaxi effectiveness claims naming Tesla, Elon Musk, and named executives personally [flags #5, #12] — this fact surfaced only in the business-model module's red-flag sweep and was not cross-referenced in the earnings module's own driver analysis; the master synthesis should pull it forward explicitly.

## 9. Simple Summary

- Revenue is growing again — record Q2 2026 deliveries (+25% YoY) — but the growth follows a federal tax-credit expiration that may have borrowed demand from earlier quarters, so it is not yet proven as a clean new trend.
- Operating profit keeps shrinking — EBIT margin has fallen every year since 2022 (16.8% to 4.6%) and again this quarter (to 1.41%) — driven almost entirely by rising R&D and stock-based-compensation costs, not by weaker sales.
- Earnings are mostly clean and cash-backed day to day, but reported net income has twice in under three years been boosted by large one-off items (a tax benefit in 2023, a SpaceX stock gain plus another tax benefit this quarter) that make the GAAP headline look better than the underlying trend.
- The market's bar is roughly fair but unsettled — profit estimates keep getting cut, and even a month after the last earnings call, analysts are still cutting more than raising on every profit measure.
- Next quarter's setup is balanced, leaning cautious — the company has beaten revenue four quarters running, but two of the four risk scenarios flagged by the beat/miss specialist are rated more likely to hurt than help.
- The single biggest swing factor is a huge, disclosed, unrecognized stock-compensation liability ($105.8-120.4 billion) tied to CEO pay milestones not yet triggered — if even one triggers, it could hit margins hard with little warning.
- Earnings volatility is high (68 out of 100, where higher is worse) — several of the biggest swing factors (stock compensation, spending growth, a shrinking tax-credit revenue line) can only get worse, not better, on their own terms.
- This module is useful for the master synthesizer: it shows plainly that "record revenue" and "healthy earnings" are two different questions for Tesla right now, and the answer to the second one is currently negative.



---

## earnings / 00_earnings-data-triage.md

_Source: `00_earnings-data-triage.md`_

# Earnings Data Triage — TSLA

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | Registrant address 1 Tesla Road, Austin, Texas [Form 10-Q, Jul-23-2026, cover page] |
| Exchange | Nasdaq Global Select Market | [Form 10-Q, Jul-23-2026, cover page; Form 10-K/A, Apr-30-2026, cover page] |
| Filing regime | US SEC | Forms filed under Securities Exchange Act of 1934, Commission File No. 001-34756 [Form 10-Q, Jul-23-2026, cover page] |
| Reporting standard | US GAAP | CIQ workbooks state "Acctg. Standard: US GAAP" [Financials_Quarterly.xls, Income Statement tab; EstimatesReport.xls, Consensus tab]; 10-Q financial statements captioned "Condensed Consolidated" per US GAAP [Form 10-Q, Jul-23-2026, Item 1] |
| Reporting currency | US Dollar (USD) | [Form 10-Q, Jul-23-2026, Item 1; CIQ workbooks, "Currency: Reported Currency"/USD] |
| Fiscal-year end | December 31 | "Current Fiscal Year End: Dec-31-2026" [EstimatesReport.xls, Consensus tab]; Q2 2026 quarter ended June 30, 2026 [Form 10-Q, Jul-23-2026, cover page] |
| Document language(s) | English (all documents) | Direct read of all files in `data/TSLA/` |

Tesla is a US domestic filer (10-K / 10-Q / 8-K regime, not a foreign private issuer). No non-English documents in this pool — §27's language provision does not apply here; nothing in the pool is affected by it.

## 1. File Inventory

Multi-tab CIQ workbooks were pre-split by `extract_pool.py` (11 workbooks → 54 tabs; 64 extract files total across 21 sources; 0 failures — `_pool_extracts/manifest.md` / `manifest.json`). Every workbook tab is listed as its own row below, reconciled against the manifest. "Last Modified" is the Drive-sync timestamp (all files synced 2026-07-24) — NOT the reporting period; period is parsed from inside each document (fix F23).

| Filename (+ tab where applicable) | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| Annual_Report_TSLA-Q4-2024.pdf | Investor deck / unaudited shareholder update (mislabeled "Annual Report" in filename; entire deck marked "(Unaudited)") | Q4 & FY2024 (year ended Dec 31, 2024) | 2026-07-24 (sync) | Medium (superseded by FY2025 update) |
| Annual_Report_TSLA-Q4-2025.pdf | Investor deck / unaudited shareholder update + earnings press-release equivalent (same "mislabeled Annual Report" pattern; deck marked "(Unaudited)"; includes GAAP income statement, balance sheet, cash flow) | Q4 & FY2025 (year ended Dec 31, 2025) | 2026-07-24 (sync) | High |
| TSLA-Q1-2026-Update.pdf | Investor deck / unaudited shareholder update (income statement, balance sheet, cash flow, outlook) | Q1 2026 (quarter ended Mar 31, 2026) | 2026-07-24 (sync) | High |
| TSLA-Q2-2026-Update.pdf | Investor deck / unaudited shareholder update (income statement, balance sheet, cash flow, outlook) — most recent | Q2 2026 (quarter ended Jun 30, 2026) | 2026-07-24 (sync) | High |
| Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc | Quarterly filing (SEC 10-Q, mhtml) | Q2 2026 (quarter ended Jun 30, 2026) | 2026-07-24 (sync) | High — full Item 1 financial statements + Item 2 MD&A |
| Tesla_Inc_-_Form_10-KA(Apr-30-2026).doc | Annual filing AMENDMENT (SEC 10-K/A, Part III only) | FY2025 (year ended Dec 31, 2025) | 2026-07-24 (sync) | Low for earnings numbers — this amendment adds ONLY Part III (Items 10–14: directors, exec comp, ownership, related-party, auditor fees) plus new officer certifications. It states it "does not otherwise change or update" the Original Form 10-K. **The Original Form 10-K (Item 8 audited financial statements) for FY2025, filed Jan 29, 2026 per the Explanatory Note, is NOT present in this pool as a standalone SEC document.** |
| Tesla, Inc., Q1 2026 Earnings Call, Apr 22, 2026.rtf | Earnings transcript — **verbatim** (S&P Global Market Intelligence / CIQ) | Q1 2026 (call held Apr 22, 2026) | 2026-07-24 (sync) | High — full prepared remarks + Q&A, participant list, embedded consensus/actual table |
| Tesla, Inc., Q2 2026 Earnings Call, Jul 22, 2026.rtf | Earnings transcript — **verbatim** (S&P Global Market Intelligence / CIQ) — most recent call | Q2 2026 (call held Jul 22, 2026) | 2026-07-24 (sync) | High — full prepared remarks + Q&A |
| Tesla Inc NasdaqGS TSLA Public Company Profile.rtf | Data export (CIQ company profile / business description) | As of extraction (2026-07) | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Public Ownership Summary.rtf | Data export (CIQ ownership summary) | As of extraction (2026-07) | 2026-07-24 (sync) | Low |
| Company Comparable Analysis Tesla Inc .xls — Business Description | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low |
| Company Comparable Analysis Tesla Inc .xls — Credit Health Panel | Data export (workbook tab) | Trailing periods | 2026-07-24 (sync) | Medium |
| Company Comparable Analysis Tesla Inc .xls — Disclaimer | Data export (workbook tab) | — | 2026-07-24 (sync) | Low |
| Company Comparable Analysis Tesla Inc .xls — Financial Data | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | Medium |
| Company Comparable Analysis Tesla Inc .xls — Implied Valuation | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low — peer/valuation comp, out of earnings scope |
| Company Comparable Analysis Tesla Inc .xls — Operating Statistics | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | Medium |
| Company Comparable Analysis Tesla Inc .xls — Trading Multiples | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low |
| Company Comparable Analysis Tesla Inc .xls — Valuation Chart | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low |
| Short_Interest_12m_TSLA.xls — Chart 1 with Data | Data export (workbook tab) | Trailing 12 months | 2026-07-24 (sync) | Low |
| Short_Interest_12m_TSLA.xls — Attributions | Data export (workbook tab) | — | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Summary | Data export (workbook tab) | Current/trailing | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Financials | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | Medium — cash flow/solvency proxy |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Operational Metrics Charts | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Solvency Metrics Charts | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Liquidity Metrics Charts | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Credit Health Panel.xls — Disclaimer | Data export (workbook tab) | — | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Customers.xls — Customers | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low — customer/counterparty list, business-model relevant |
| Tesla Inc NasdaqGS TSLA Events Calendar.xls — Events Calendar | Data export (workbook tab) | Forward-looking | 2026-07-24 (sync) | Medium — upcoming earnings/event dates |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Key Stats | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Income Statement | Data export (workbook tab) | Multi-year annual, latest FY2025 | 2026-07-24 (sync) | High |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Balance Sheet | Data export (workbook tab) | Multi-year annual, latest FY2025 | 2026-07-24 (sync) | High |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Cash Flow | Data export (workbook tab) | Multi-year annual, latest FY2025 | 2026-07-24 (sync) | High |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Multiples | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Historical Capitalization | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Capital Structure Summary | Data export (workbook tab) | Multi-year | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Capital Structure Details | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Ratios | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Supplemental | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Industry Specific | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Pension OPEB | Data export (workbook tab) | Multi-year annual | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Segments | Data export (workbook tab) | Multi-year annual, latest FY2025 | 2026-07-24 (sync) | High — segment revenue/margin (Automotive / Energy Gen & Storage / Services) |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Key Stats | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Income Statement | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | High |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Balance Sheet | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | High |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Cash Flow | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | High |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Multiples | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Historical Capitalization | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Capital Structure Summary | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Capital Structure Details | Data export (workbook tab) | Current | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Ratios | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Supplemental | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Medium |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Industry Specific | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Pension OPEB | Data export (workbook tab) | Multi-quarter | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Segments | Data export (workbook tab) | Multi-quarter, latest Q2 2026 | 2026-07-24 (sync) | High — quarterly segment revenue/margin |
| Tesla Inc NasdaqGS TSLA Key Developments.xls — Key Developments | Data export (workbook tab) | Trailing 1 year (through 2026-07-22) | 2026-07-24 (sync) | Medium — results-announcement / corporate-communication log, useful for catalyst/event timing |
| Tesla Inc NasdaqGS TSLA Public Ownership History.xls — History | Data export (workbook tab) | Historical | 2026-07-24 (sync) | Low |
| Tesla Inc NasdaqGS TSLA Public Ownership Insider Trading.xls — Insider Trading | Data export (workbook tab) | Trailing | 2026-07-24 (sync) | Low — governance-relevant, not earnings |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Consensus | Data export (workbook tab) — consensus/estimate export | Current, fresh as of extraction (post Q2 2026 print; FQ3 2026 release date Oct-21-2026 stated) | 2026-07-24 (sync) | High |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Recent Changes | Data export (workbook tab) | Current | 2026-07-24 (sync) | High — estimate revision momentum |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Guidance | Data export (workbook tab) | Sparse/stale — populated entries stop around 2014–2015; Tesla does not issue point EPS/revenue guidance that CIQ tracks in this field | 2026-07-24 (sync) | Low — this specific tab is not a useful guidance source; qualitative guidance instead lives in the Update-letter "Outlook" sections and the call transcripts |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Multiples | Data export (workbook tab) | Current | 2026-07-24 (sync) | Medium |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Surprise | Data export (workbook tab) | Historical, through latest reported quarter (Q2 2026) | 2026-07-24 (sync) | High — beat/miss history |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Trends | Data export (workbook tab) | Current | 2026-07-24 (sync) | High |
| Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Revisions | Data export (workbook tab) | Current, through FQ3 2026 forward estimates | 2026-07-24 (sync) | High |

No `data/TSLA/external/` folder exists in this pool — Section 1A (External Data) is omitted; nothing external to flag.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing (audited, Item 8 financials) | **Not present as a standalone document.** Nearest surrogate: Annual_Report_TSLA-Q4-2025.pdf (unaudited shareholder update covering FY2025) | FY2025 (year ended Dec 31, 2025) | ~7 months (report dated late Jan 2026; today 2026-07-24) |
| Annual filing (SEC form, Part III only) | Tesla_Inc_-_Form_10-KA(Apr-30-2026).doc | FY2025 (year ended Dec 31, 2025) | ~3 months |
| Quarterly filing | Tesla_Inc_-_Form_10-Q(Jul-23-2026).doc | Q2 2026 (quarter ended Jun 30, 2026) | ~0 months (filed 1 day before triage date) |
| Earnings transcript | Tesla, Inc., Q2 2026 Earnings Call, Jul 22, 2026.rtf | Q2 2026 (call held Jul 22, 2026) | ~0 months |
| Investor deck | TSLA-Q2-2026-Update.pdf | Q2 2026 (quarter ended Jun 30, 2026) | ~0 months |
| Consensus / estimate export | Tesla,IncNasdaqGSTSLAEstimatesReport.xls — Consensus / Revisions / Surprise / Trends | Current, reflects data through Q2 2026 print (next release FQ3 2026, Oct-21-2026 per the workbook) | ~0 months |
| Cash flow data | Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Cash Flow (latest Jun-30-2026); Form 10-Q, Jul-23-2026, Item 1 | Q2 2026 | ~0 months |
| Guidance data | Qualitative guidance in TSLA-Q2-2026-Update.pdf "Outlook" section and Q2 2026 Earnings Call transcript; the CIQ "Guidance" tab is stale (last populated ~2014–2015) and not usable | Q2 2026 | ~0 months (qualitative source); CIQ Guidance tab is not current |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | Form 10-Q (Jul-23-2026), Item 1; TSLA-Q2-2026-Update.pdf, Financial Statements section; Financials_Quarterly.xls, Income Statement tab | Needed for revenue, margin, EPS |
| Balance sheet | Y | Form 10-Q (Jul-23-2026), Item 1; TSLA-Q2-2026-Update.pdf, Balance Sheet section; Financials_Quarterly.xls, Balance Sheet tab | Needed for working capital and leverage |
| Cash flow statement | Y | Form 10-Q (Jul-23-2026), Item 1; TSLA-Q2-2026-Update.pdf, Statement of Cash Flows section; Financials_Quarterly.xls, Cash Flow tab | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Form 10-Q for Q2 2026 (quarter ended Jun 30, 2026), filed Jul 23, 2026 — one day before this triage | Needed for trend and setup |
| Last 8 quarters | Y | Financials_Quarterly.xls, Income Statement / Balance Sheet / Cash Flow tabs run quarterly from FQ1 2017 through Jun-30-2026 (well beyond 8 quarters); TSLA-Q1/Q2-2026-Update.pdf show 5-quarter trend tables | Needed for seasonality and inflection |
| Consensus estimates | Y | EstimatesReport.xls, Consensus tab — mean/median target price, EPS Normalized and Revenue estimates through multiple forward years, "Current Fiscal Year End: Dec-31-2026 \| FQ3 2026 Earnings Release Date: Oct-21-2026" | Needed for market bar |
| Estimate revisions | Y | EstimatesReport.xls, Recent Changes and Revisions tabs | Needed for revision momentum |
| Earnings transcript | Y — verbatim | Q1 2026 (Apr 22, 2026) and Q2 2026 (Jul 22, 2026) CIQ/S&P Global Market Intelligence transcripts, both with prepared remarks + Q&A | Needed for management tone and driver detail |
| Segment P&L | Y | Financials_Annual.xls and Financials_Quarterly.xls, Segments tabs (Automotive / Energy Generation & Storage / Services); Form 10-Q Note disclosures | Needed for mix shift |
| Current price | Y | EstimatesReport.xls, Consensus tab: "Latest Price/Last Close Price 319.69" (data-vendor figure, not a filing number) | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y |
| 06_value-chain.md | Y |
| 10_external-dependency.md | Y |

The full business-model module has run (`analyses/TSLA_2026-07-24/business-model/00` through `99`, plus a dossier and memo) and is available for cross-reference.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus, revisions, surprise, and trend data are all present and current | 04, 05, 99 | Not applicable |
| No quarterly data | N — CIQ quarterly workbook and the Q2 2026 10-Q both cover the latest quarter, with history back to 2017 | 01, 02, 03, 06 | Not applicable |
| No VERBATIM transcript, sell-side proxy present | N — both Q1 2026 and Q2 2026 transcripts are verbatim CIQ transcripts, not sell-side proxies | 02, 03, 04 | Not applicable |
| No transcript AND no sell-side proxy | N — two verbatim transcripts are present | 02, 03, 04 | Not applicable |
| No segment-level P&L | N — Segments tabs present at both annual and quarterly frequency | 02, 03, 99 | Not applicable |
| No cash flow statement | N — present in the 10-Q, the Update letters, and the CIQ Cash Flow tabs | 06, 99 | Not applicable |
| No current price | N — CIQ Consensus tab carries a last-close price (data-vendor figure, cite as such — not a filing number) | 99 | Not applicable |

No partial-data caps from the standard list bind. One item outside the standard list is flagged for downstream awareness (not a cap, since the Update-letter surrogate and the CIQ quarterly/annual workbooks together satisfy the "recent annual filing or equivalent full-year financials" bar):

- **The audited FY2025 10-K (Item 8 financial statements) itself is not in this pool** — only its Part III-only amendment (10-K/A) and the company's own unaudited Q4/FY2025 Update letter. Agents citing FY2025 annual figures should cite the Update letter (labelled "(Unaudited)") or the CIQ Financials_Annual export, and should NOT cite "FY2025 10-K" as the source for a number that in fact came from the unaudited deck or the vendor export — that would violate the same-source citation rule (CLAUDE.md §5). Downstream agents (01, 02, 03, 06) should state this explicitly wherever a FY2025 full-year GAAP figure is used.

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a verbatim latest-quarter earnings transcript (Q2 2026, Jul 22, 2026), a filed latest-quarter 10-Q (quarter ended Jun 30, 2026, filed Jul 23, 2026) with full income statement, balance sheet, and cash flow statement, a current and detailed consensus/estimate export with revision history and surprise history, and segment-level P&L at both annual and quarterly frequency — every element of the Sufficient bar is met from filings, transcripts, and vendor exports, none of them stale.
- **Active partial-data caps:** None.
- **Critical missing items:** None binding a cap. Note only: the standalone audited FY2025 10-K (Item 8) is absent from the pool — its Part III-only amendment and the company's own unaudited Update letter stand in for the full-year 2025 figures; agents must cite the Update letter or the CIQ Financials_Annual export by name for any FY2025 annual number, never mislabel it as coming from "the 10-K."



---

## earnings / 01_historical-financials.md

_Source: `01_historical-financials.md`_

# Historical Financials — TSLA

**Jurisdiction / regime:** United States, Nasdaq Global Select Market, US SEC filer (10-K/10-Q/8-K regime). **Reporting standard:** US GAAP. **Reporting currency:** US Dollar (USD), figures in millions unless stated as per-share. **Fiscal year end:** December 31. [Form 10-Q, Jul-23-2026, cover page; Financials_Annual.xls, Income Statement tab]

**Source note (hard constraint from triage):** The standalone audited FY2025 10-K (Item 8 financial statements) is NOT in this pool — only its Part III-only amendment (10-K/A, Apr-30-2026) and the company's own unaudited shareholder "Update" letters. All FY2025 and quarterly annual-letter figures below are cited to the specific unaudited Update letter (labelled "(Unaudited)" by the company itself) or to the Capital IQ (CIQ) vendor export — never mislabeled as "10-K." [Earnings Data Triage, §5]

**Reconciliation flag:** For Q1, Q3, and Q4 2025, the CIQ Financials_Quarterly.xls "Operating Income" figures (e.g., Q3 2025 = $1,862M, Q4 2025 = $1,171M) do not match the company's own reported "Income from operations" in three separate shareholder Update letters, all of which consistently show Q3 2025 = $1,624M and Q4 2025 = $1,409M [Annual_Report_TSLA-Q4-2025.pdf, p.4; TSLA-Q1-2026-Update.pdf, p.4; TSLA-Q2-2026-Update.pdf, p.3 — all three agree]. Per the earnings-module source hierarchy (interim filing/company primary disclosure ranks above a CIQ export), this report uses the company-reported figures for all quarterly operating-income, revenue, gross-profit and EPS data points and flags this gap rather than silently overriding it. Revenue, gross profit, and full-year totals reconcile exactly between CIQ and the company letters; only these two quarters' operating income lines diverge.

---

## 1. Annual Financial Table (3–5 years)

Currency: USD millions except per-share and margin/ratio rows. Fiscal year ended Dec-31. Figures sourced from Capital IQ Financials_Annual.xls (Income Statement / Balance Sheet / Cash Flow tabs) [5], cross-checked line-by-line against the company's own FY2021–FY2025 "Financial Summary" table in the FY2025 Update letter [1] — revenue, gross profit, operating income, CFO, capex and FCF match exactly between the two sources for every year shown.

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 53,823 | 81,462 | 96,773 | 97,690 | 94,827 | Inflecting |
| Revenue YoY % | +70.7%¹ | +51.4% | +18.8% | +0.9% | −2.9% | Inflecting |
| Gross Profit | 13,606 | 20,853 | 17,660 | 17,450 | 17,094 | Inflecting |
| Gross Margin % | 25.3% | 25.6% | 18.3% | 17.9% | 18.0% | Inflecting |
| EBITDA (GAAP, Op. Income + D&A) | 9,434 | 17,235 | 13,558 | 13,027 | 10,503 | Decelerating |
| EBITDA Margin % | 17.5% | 21.2% | 14.0% | 13.3% | 11.1% | Decelerating |
| EBIT (Operating Income) | 6,523 | 13,692 | 8,891 | 7,659 | 4,355 | Decelerating |
| EBIT Margin % | 12.1% | 16.8% | 9.2% | 7.8% | 4.6% | Decelerating |
| EPS (diluted, GAAP) | 1.63 | 3.62 | 4.30 | 2.04 | 1.08 | Decelerating |
| CFO | 11,497 | 14,724 | 13,256 | 14,923 | 14,747 | Stable |
| Capex (abs.) | 6,514 | 7,163 | 8,899 | 11,342 | 8,527 | Volatile |
| FCF (CFO − Capex) | 4,983 | 7,561 | 4,357 | 3,581 | 6,220 | Volatile |
| Working Capital (Curr. Assets − Curr. Liabs.) | 7,395 | 14,208 | 20,868 | 29,539 | 36,928 | Stable |
| Net Debt (strict: Total Debt − Cash & Equiv.) | (8,703) | (10,505) | (6,825) | (2,516) | (1,794) | Inflecting |
| Net Debt / EBITDA (strict) | (0.92x) | (0.61x) | (0.50x) | (0.19x) | (0.17x) | Inflecting |

¹ FY2021 YoY uses FY2020 revenue of $31,536M as the base [Financials_Annual.xls, Income Statement tab] [5].

**Basis labels (CLAUDE.md §15):** Net Debt above is the **strict** basis (Total Debt − Cash & Equivalents only, excluding short-term investments). On the **broad** basis (netting in short-term investments, which CIQ's own "Net Debt" field uses), net debt is far more negative (more net cash): FY2021 (8,834), FY2022 (16,437), FY2023 (19,521), FY2024 (22,940), FY2025 (29,340) [Financials_Annual.xls, Balance Sheet tab, "Net Debt" row] [5]. The gap between the two bases has widened every year because Tesla has shifted a growing share of its liquid balance sheet into short-term investments (from $131M in FY2021 to $27,546M in FY2025) while cash & equivalents alone has stayed roughly flat (~$16–17.6B). Both bases are shown so the direction is not misread — see §6.

**Total Debt** used above (includes finance/operating lease obligations per CIQ's definition): FY2021 $8,873M; FY2022 $5,748M; FY2023 $9,573M; FY2024 $13,623M; FY2025 $14,719M [Financials_Annual.xls, Balance Sheet tab] [5].

**FCF definition (stated per CLAUDE.md §15 / module Calculation Standard #6):** FCF = CFO − total capex (absolute value). This matches the company's own disclosed "Free cash flow" definition — "Free cash flow = operating cash flow less capital expenditures" [TSLA-Q2-2026-Update.pdf, p.24 non-GAAP definitions] [4] — so no adjustment to the company's own figure is needed; the FY2021–FY2025 figures above tie out exactly to the company's own reported Free Cash Flow line [Annual_Report_TSLA-Q4-2025.pdf, p.4] [1].

**Capex definitional note:** Beginning Q1 2025, the company redefined capex to include purchases of energy generation and storage systems, and restated all prior periods on this new basis [TSLA-Q1-2026-Update.pdf, p.4, footnote 4; TSLA-Q2-2026-Update.pdf, p.3, footnote (1)] [3][4]. The FY2024 and FY2025 capex and FCF figures above are on this restated (post-Q1'25) basis, sourced from the FY2025 Update letter's annual table [1], which is internally consistent — this is a company-level accounting-presentation change, not a quarter-to-quarter mixing of definitions.

---

## 2. TTM Snapshot

TTM = latest four reported quarters (Q3 2025 + Q4 2025 + Q1 2026 + Q2 2026, i.e. period ended Jun-30-2026). Prior TTM = Q3 2024 + Q4 2024 + Q1 2025 + Q2 2025.

| Metric | Latest TTM | Prior TTM | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 103,619 | 92,720 | +11.8% | Sum of quarterly revenue from company Update letters [1][2][3][4]; ties out exactly to CIQ's own LTM Jun-30-2026 column (103,619) [Financials_Annual.xls, Income Statement tab, "LTM 12 months Jun-30-2026"] [5] |
| EBITDA (GAAP, Op. Income + D&A) | 10,849 | 11,346 | −4.4% | Company-reported quarterly operating income [1][2][3][4] + CIQ quarterly D&A [Financials_Quarterly.xls, Cash Flow tab] [6]. CIQ's own LTM EBITDA field shows 10,755 — a ~1% gap explained by the Q3/Q4 2025 operating-income reconciliation flag noted above |
| EBIT (Operating Income) | 4,372 | 5,622 | −22.2% | Company Update letters, "Income from operations" row [1][2][3][4] |
| EPS diluted (GAAP) | 1.08 | 1.67 | −35.3% | Sum of quarterly GAAP diluted EPS from company Update letters [1][2][3][4]; ties out exactly to CIQ's own LTM diluted EPS of 1.08 [Financials_Annual.xls, Income Statement tab] [5] |
| CFO | 18,685 | 15,765 | +18.5% | Sum of quarterly CFO from company Update letters [1][2][3][4]; ties out exactly to CIQ's LTM CFO of 18,685 [Financials_Annual.xls, Cash Flow tab] [5] |
| Capex (abs.) | 12,923 | 10,179 | +27.0% | Sum of quarterly capex from company Update letters [1][2][3][4]; ties out exactly to CIQ's LTM capex of 12,923 [5] |
| FCF | 5,762 | 5,586 | +3.2% | TTM CFO − TTM Capex above; also ties out to the sum of the company's own quarterly "Free cash flow" line: 3,990 + 1,420 + 1,444 + (1,092) = 5,762 [TSLA-Q2-2026-Update.pdf, p.3] [4] |
| Net debt at latest period-end (Jun-30-2026) | Strict: $861M (net debt); Broad (incl. ST investments): $(27,444)M (net cash) | — | Point-in-time balance-sheet figure, not a flow. Total Debt $16,080M − Cash & Equivalents $15,219M = $861M net debt (strict). Netting in $28,305M of short-term investments gives $(27,444)M net cash (broad) [Financials_Quarterly.xls, Balance Sheet tab, Jun-30-2026 column] [6]; also disclosed by the company as "Cash, cash equivalents and short-term investments" of $43,524M against total debt [TSLA-Q2-2026-Update.pdf, p.3] [4] |

Note: Net debt is a point-in-time balance-sheet metric, not a TTM flow metric, per module convention.

---

## 3. Latest Quarterly Trend Table (8 quarters)

Figures sourced from the company's own shareholder "Update" letters (each an unaudited GAAP financial summary functioning as the earnings-release equivalent) [2][3][4], with GAAP EBITDA calculated as Operating Income + D&A (D&A from CIQ's Financials_Quarterly.xls Cash Flow tab [6]). All figures GAAP unless noted; Adjusted EBITDA (non-GAAP) is shown separately in Section 4.

| Metric | Q3'24 | Q4'24 | Q1'25 | Q2'25 | Q3'25 | Q4'25 | Q1'26 | Q2'26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 25,182 | 25,707 | 19,335 | 22,496 | 28,095 | 24,901 | 22,387 | 28,236 | Volatile (seasonal; Q2'26 QoQ +26.1%) | +25.5% (Q2'26 vs Q2'25) |
| Gross Margin % | 19.8% | 16.3% | 16.3% | 17.2% | 18.0% | 20.1% | 21.1% | 16.8% | Volatile | −41 bps (Q2'26 vs Q2'25)² |
| EBITDA (GAAP, calc.) | 4,065 | 3,079 | 1,846 | 2,356 | 3,249 | 3,052 | 2,531 | 2,017 | Decelerating (down from Q3'24 peak) | −14.4% (Q2'26 vs Q2'25) |
| EBITDA Margin % | 16.1% | 12.0% | 9.6% | 10.5% | 11.6% | 12.3% | 11.3% | 7.1% | Decelerating | −333 bps (Q2'26 vs Q2'25) |
| EPS (diluted, GAAP) | 0.62 | 0.60³ | 0.12 | 0.33 | 0.39 | 0.24 | 0.13 | 0.32 | Volatile | −3.0% (Q2'26 vs Q2'25) |

² Company-stated figure, "Total GAAP gross margin ... −41 bp" [TSLA-Q2-2026-Update.pdf, p.3] [4].
³ Q4'24 EPS is the recast figure per the FY2025 Update letter after adoption of the new crypto-assets accounting standard (ASU 2023-08); the originally reported Q4'24 figure was $0.66 [Annual_Report_TSLA-Q4-2024.pdf, p.4, vs Annual_Report_TSLA-Q4-2025.pdf, p.4, footnote 1] [2][1]. This recast also moved Q4'24 GAAP net income from $2,317M (as originally reported) to $2,128M and non-GAAP net income from $2,566M to $2,107M — revenue, gross profit and operating income for that quarter are unaffected by the recast (both letters show operating income $1,583M).

---

## 4. Reported vs Adjusted Metrics

Basis: FY2025 (full year). The company discloses "Adjusted EBITDA (non-GAAP)" and "Net income attributable to common stockholders (non-GAAP)" / non-GAAP diluted EPS; it does not disclose a separate adjusted EBIT.

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA | 10,503 (GAAP: Op. Income + D&A) | 14,596 (Adjusted EBITDA, non-GAAP) | +4,093 | Company definition: net income before interest, taxes, D&A, stock-based compensation expense ($2,825M FY2025 SBC [Financials_Annual.xls, Income Statement tab, "Stock-Based Comp., Total"] [5]), digital-assets unrealized gain/loss, and SpaceX equity-investment unrealized gain | [Annual_Report_TSLA-Q4-2025.pdf, p.4, "Adjusted EBITDA" + footnote definitions p.24] [1] |
| EBIT | 4,355 (GAAP Operating Income) | Not disclosed | N/A | Company does not disclose a separate adjusted EBIT metric — only Adjusted EBITDA and non-GAAP net income/EPS | [Annual_Report_TSLA-Q4-2025.pdf, p.4] [1] |
| EPS (diluted) | 1.08 (GAAP) | 1.66 (non-GAAP) | +0.58 | Same non-GAAP exclusions as Adjusted EBITDA (SBC, digital-assets gain/loss, SpaceX equity gain, certain tax items), net of tax, per share | [Annual_Report_TSLA-Q4-2025.pdf, p.4] [1] |

Net income (GAAP) FY2025 $3,794M vs non-GAAP $5,858M — same reconciling items [1].

---

## 5. Quarterly Seasonality Table (last 3 fiscal years)

Revenue share = quarterly revenue ÷ that fiscal year's total revenue. EBITDA margin is the GAAP-basis figure (Op. Income + D&A ÷ revenue), computed from company-reported operating income [1][2][3] and CIQ D&A [6] for consistency across all three years.

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Margin | FY2024 EBITDA Margin | FY2025 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 24.1% | 21.8% | 20.4% | 22.1% | 15.9% | 11.4% | 9.6% |
| Q2 | 25.8% | 26.1% | 23.7% | 25.2% | 14.3% | 11.3% | 10.5% |
| Q3 | 24.1% | 25.8% | 29.6% | 26.5% | 12.8% | 16.1% | 11.6% |
| Q4 | 26.0% | 26.3% | 26.3% | 26.2% | 13.1% | 12.0% | 12.3% |

No quarter breaches the >30% / <20% flag threshold on a 3-year-average basis. Two things worth flagging for downstream (02_revenue-drivers) rather than explained here, since driver attribution is out of this agent's scope:
- **Q1 is consistently the seasonal low** and its revenue share has fallen each year (24.1% → 21.8% → 20.4%), now within 0.4 points of the 20% flag line.
- **Q3 2025's 29.6% share is a clear outlier** against Q3 2023 (24.1%) and Q3 2024 (25.8%), followed by a revenue pullback in Q4 2025 and Q1 2026 (see Section 3). No cause for this deviation was found in the pool's earnings-call transcripts (searched for tax-credit / pull-forward language; none present) — **not proven from available data**; flagged for 02_revenue-drivers to investigate.

[Sources: Annual_Report_TSLA-Q4-2024.pdf p.4 (FY2023, FY2024 Q3/Q4 quarterly detail) [2]; Annual_Report_TSLA-Q4-2025.pdf p.4 (FY2025 quarterly detail, FY2021–2025 annual table) [1]; TSLA-Q1-2026-Update.pdf p.4 [3]; Financials_Quarterly.xls Income Statement / Cash Flow tabs (D&A, and FY2023 quarters not covered by a company letter in this pool) [6]]

---

## 6. Key Trend Summary

Revenue growth has decelerated every year since the 51% jump in FY2022, turned negative in FY2025 (−2.9%, to $94,827M) [1][5] — a clear inflection from growth to decline — though the most recent quarter (Q2 2026, $28,236M) posted +25.5% YoY growth, helped by a 50% YoY jump in services-and-other revenue and continued growth in energy storage [TSLA-Q2-2026-Update.pdf, p.3] [4]; whether this is a genuine re-acceleration or a seasonal/one-quarter bounce is not resolved by this agent and is flagged for 02_revenue-drivers. Margins are compressing on every profitability line: gross margin stepped down sharply from ~25.6% (FY2022) to ~18% (FY2023–FY2025, a ~735 bps one-time drop rather than a gradual slide) [5], while EBIT margin has fallen every year since its FY2022 peak of 16.8% to 4.6% in FY2025 (−1,222 bps over three years) [1][5]. Seasonality is real and consistent: Q1 is the weakest quarter every year shown (20–24% of annual revenue) and its share has been shrinking further each year, while Q3 2025's 29.6% share was an outlier versus the prior two years' Q3 pattern, followed by a pullback in Q4 2025 and Q1 2026 — the cause is not proven from available data (Section 5). The clearest balance-sheet inflection: on the strict net-debt basis (total debt less cash & equivalents only), Tesla's net-cash cushion has shrunk every year from $8.7B (FY2021) to $1.8B (FY2025) and flipped to a small $861M of net debt by Jun-30-2026 [5][6] — even though the broad basis (netting in $28.3B of short-term investments) still shows roughly $27.4B of net cash, because Tesla has parked a growing share of its liquidity in short-term investments rather than cash & equivalents. The other visible inflection is capex and free cash flow: quarterly capex jumped to $5,789M in Q2 2026 (+142% QoQ, on the company's own post-Q1'25 capex definition that includes energy-storage-system purchases), which pushed quarterly free cash flow negative (−$1,092M) for the first time in the eight quarters shown [TSLA-Q2-2026-Update.pdf, p.3] [4] — a capex ramp whose driver and durability are also flagged for the downstream revenue/margin-driver agents rather than assessed here.

---

## 7. Citations

[1] Tesla Q4 2025 & FY2025 Update letter (Unaudited shareholder update; company's own GAAP financial summary, functioning as the earnings-release equivalent) — `Annual_Report_TSLA-Q4-2025.pdf`, "Financial Summary" p.4 (quarterly Q4'24–Q4'25 table and annual FY2021–FY2025 table, non-GAAP definitions p.24)
[2] Tesla Q4 2024 & FY2024 Update letter (Unaudited) — `Annual_Report_TSLA-Q4-2024.pdf`, "Financial Summary" p.4 (quarterly Q4'23–Q4'24 table, pre-crypto-standard-recast figures)
[3] Tesla Q1 2026 Update letter (Unaudited) — `TSLA-Q1-2026-Update.pdf`, "Financial Summary" p.4 (quarterly Q1'25–Q1'26 table)
[4] Tesla Q2 2026 Update letter (Unaudited) — `TSLA-Q2-2026-Update.pdf`, "Financial Summary" p.3 (quarterly Q2'25–Q2'26 table) and p.24 (non-GAAP definitions: Adjusted EBITDA, non-GAAP net income, free cash flow)
[5] Capital IQ export, Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Income Statement, Balance Sheet, and Cash Flow tabs (annual FY2017–FY2025 plus LTM Jun-30-2026 column; data as of 2026-07-24 extraction)
[6] Capital IQ export, Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Income Statement, Balance Sheet, and Cash Flow tabs (quarterly Q1 2017–Q2 2026; data as of 2026-07-24 extraction)
[7] Form 10-Q, Jul-23-2026, Item 1 (Financial Statements, quarter ended Jun-30-2026) — used to confirm the quarter is the latest filed period; line items cross-checked against the CIQ quarterly export and the Q2 2026 Update letter



---

## earnings / 02_revenue-drivers.md

_Source: `02_revenue-drivers.md`_

# Revenue Drivers — TSLA

## 1. Segment Decomposition Status

Segment decomposition applied — 2 segments from business-model module (`business-model/03_segment-map.md`): Automotive, and Energy Generation and Storage.

Automotive is close to the single-segment threshold on its own (86.5% of FY2025 revenue, 88.9% of Q2 FY2026 revenue — both above the >85% line) [`business-model/03_segment-map.md`, §2]. This report still gives Energy its own driver table (§5) because Tesla discloses full revenue and gross-profit lines for it, and it is the fastest-growing, highest-margin-trend piece of the business [`business-model/03_segment-map.md`, §2]. It also breaks out "Services and other" — a sub-line reported inside the Automotive segment, not a third reportable segment — because it is growing quickly (+50% YoY in Q2 FY2026) and management now discusses it as an economically distinct business [`business-model/03_segment-map.md`, §1, Note 1].

Tesla does not allocate operating expenses or operating income to either segment — only revenue, cost of revenue, and gross profit [`business-model/03_segment-map.md`, §3]. Everything below is a revenue read; margin allocation is out of scope for this agent (see `03_margin-drivers`).

---

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Multi-segment (Manufacturer + subscription hybrid) | Sum of segment revenue drivers |

**Tesla's own formula:** Total revenue = (vehicle deliveries × average selling price, net of mix and FX) + automotive regulatory-credit sales + automotive leasing + (energy storage/solar deployment volume × realized price per unit) + (installed vehicle fleet × services/software attach and usage, including paid FSD subscriptions and Supercharging).

This is a volume-times-price manufacturer model for the vehicle core, with an increasingly important recurring/subscription layer (FSD, Supercharging, insurance) riding on top of the same installed base, plus a separate, lumpier project-deployment business (Megapack/Powerwall/solar) that behaves more like a capital-goods order book than a consumer product line.

---

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand | Improving, but coming off a policy-distorted base | US federal EV tax credit ($7,500) expired Sept 30, 2025 under the OBBBA, signed July 4, 2025 — public reporting attributes Tesla's record Q3 2025 deliveries (497,099) partly to buyers rushing to beat that deadline, with one analyst estimate of ~55,000 units pulled forward from Q4 [Web: Yahoo Finance / Fortune reporting, Oct 2025 (unverified) — **Inference, not from filings**; Tesla's own filings and transcripts in this pool do not use pull-forward language, and `01_historical-financials` §5 flagged the Q3 2025 revenue-share outlier as unexplained from the pool]. Deliveries fell in Q4 2025 (418,227) and Q1 2026 (358,023, an 8-quarter low) before rebounding to a record Q2 (480,126, +25% YoY) [`TSLA-Q2-2026-Update.pdf`, p.5, Operational Summary] — consistent with a post-credit demand air-pocket followed by a genuine recovery, since the tax credit was already gone by Q2 2026 | 70 |
| Company market share | Improving, concentrated outside the US/China core | Total revenue from "Other International" (ex-US, ex-China) rose 62% YoY in Q2 2026 ($6,382M → $10,353M), adding ~17.7 points of the quarter's 25.5-point total revenue growth — more than the US (+11.8% YoY, ~6.2 points) and China (+8.6% YoY, ~1.6 points) combined [`FY26 Q2 10-Q, Note 14, Revenue by Geographic Area`]. Management cites record deliveries in South Korea, Australia, Colombia, Japan, Taiwan, Thailand, Portugal, the Philippines, Chile, Slovenia and Lithuania, plus new FSD regulatory approvals in Lithuania, Estonia, Denmark and Belgium [`TSLA-Q2-2026-Update.pdf`, p.5-6; Q2 FY26 transcript, prepared remarks] — this reads as genuine new-market share gain, not a broad market tailwind, since China (the largest EV market) grew far more slowly | 75 |
| Price / realization | Deteriorating (core vehicle), improving (services) | Update-letter YoY revenue bridge lists "lower vehicle average selling price (ASP) (excl. FX impact), inclusive of mix impact" as a drag for the quarter [`TSLA-Q2-2026-Update.pdf`, p.25]; the 10-Q attributes the entire 3-month automotive-sales increase to "an increase of approximately 25% in cash deliveries" with no offsetting ASP contribution named for that window [`FY26 Q2 10-Q, MD&A`, p.31] — implying underlying vehicle price is flat-to-down. Services/FSD pricing, by contrast, is a clear positive: Services and other revenue +50% YoY on higher used-vehicle ASP, non-warranty service, and paid Supercharging [`FY26 Q2 10-Q, MD&A`, p.31] | 55 |
| Product / customer / geography mix | Mixed — helps Services/FSD, hurts core vehicle margin quality | FSD (Supervised) subscriptions reached ~1.48 million (+56% YoY) with >55% of North American Q2 deliveries including a subscription at time of sale, called "a significant demand driver" by the CEO [`TSLA-Q2-2026-Update.pdf`, p.5; Q2 FY26 transcript, prepared remarks (Musk, Taneja)]. Geographic mix (see above) is shifting toward smaller international markets, which the filings do not break out by ASP, so the margin effect of that shift is not proven from available data | 50 |
| FX translation | Currently a tailwind, structurally unhedged | A weaker US dollar added a constant-currency-adjusted $0.5bn to Q2 2026 revenue YoY [`TSLA-Q2-2026-Update.pdf`, p.25]. Tesla does not hedge FX and books roughly half its revenue outside the US, mainly in yuan and euro; a 10% adverse FX move across all currencies would swing pre-tax income by $1.64bn (measured Jun-30-2026) [`FY26 Q2 10-Q, Item 3`]. This tailwind is a currency effect, not organic demand, and can reverse | 45 |
| M&A / divestitures | Not applicable | No acquisitions or divestitures affect the revenue base in the period reviewed — Not proven from available data of any inorganic revenue contribution | 5 |

---

## 4. Revenue Driver Table (consolidated)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Vehicle delivery volume | 480,126 units, Q2 2026 (record Q2; +25% YoY; production 451,758, +10% YoY — deliveries outpacing production drew inventory down to 15 days of supply from 27 in Q1) | Improving | High | `TSLA-Q2-2026-Update.pdf`, p.5, Operational Summary |
| Vehicle ASP / realized price | Automotive sales revenue +27% YoY on the back of +25% cash deliveries alone (3-month view); Update letter separately flags "lower vehicle ASP (excl. FX), inclusive of mix" as a YoY drag | Deteriorating | Mid | `FY26 Q2 10-Q, MD&A`, p.31; `TSLA-Q2-2026-Update.pdf`, p.25 |
| Automotive regulatory credits | $146M, Q2 2026, down from $439M Q2 2025 (−67% YoY); down 49% YoY on a six-month basis | Deteriorating — policy-driven, not run-rate (see Cycle-Position note below) | Low on revenue (0.5% of Q2'26 revenue; −1.3pp of the quarter's 25.5pp growth) but historically close to 100%-margin revenue, so the profit effect is larger than the revenue size implies | `FY26 Q2 10-Q, MD&A`, p.31; "Recent governmental and regulatory actions have restricted certain regulatory credit programs tied to our products" [same source] |
| Services and other / FSD subscriptions | $4,581M, Q2 2026 (+50% YoY, 16.2% of total revenue); ~1.48mn active paid FSD subscriptions (+56% YoY); record $648M gross profit at 14.1% margin | Improving | High — the single largest positive dollar contributor to YoY revenue growth after core vehicle sales (added ~6.8pp of the quarter's 25.5pp growth) | `TSLA-Q2-2026-Update.pdf`, p.4-5, p.9 (Services); `FY26 Q2 10-Q, MD&A`, p.31 |
| Energy storage deployment | 13.5 GWh, Q2 2026 (+41% YoY; second-best quarter on record; record TTM deployment) | Improving, but lumpy | Mid (added ~1.6pp of the quarter's 25.5pp total growth; ~11.1% of Q2'26 revenue) | `TSLA-Q2-2026-Update.pdf`, p.2, p.5; Q2 FY26 transcript, prepared remarks ("energy business is inherently lumpy... largely out of our control") |
| Order backlog / demand pipeline | "Largest order backlog since 2023" — no unit or dollar figure disclosed | Improving (qualitative only) | Unknown / potentially High — management ties near-term production and delivery growth directly to it, but it cannot be sized from disclosure | Q2 FY26 transcript, prepared remarks (Vaibhav Taneja, CFO) — verbatim transcript, full trust for the qualitative claim; the number itself is not disclosed anywhere in the pool |
| Production / battery-cell capacity constraint | Battery pack capacity explicitly named as "the main limiting factor to near-term vehicle production volume increase" | Constraining (a cap on how fast the volume driver can move, not a driver of decline) | High — limits upside even with a large backlog | `TSLA-Q2-2026-Update.pdf`, p.2 (Highlights/Summary); Q2 FY26 transcript, prepared remarks |
| FX translation | +$0.5bn constant-currency-adjusted tailwind, Q2 2026 YoY, from a weaker US dollar | Currently improving (tailwind), but volatile and unhedged | Mid-to-High — roughly half of revenue sits in unhedged foreign currency; a 10% adverse move swings pre-tax income $1.64bn | `TSLA-Q2-2026-Update.pdf`, p.25; `FY26 Q2 10-Q, Item 3` |
| New-market / geographic expansion | "Other International" revenue (ex-US, ex-China) +62% YoY to $10,353M in Q2 2026, vs. US +11.8% and China +8.6% | Improving | High — the largest single geographic contributor to growth this quarter (~17.7pp of the 25.5pp total) | `FY26 Q2 10-Q, Note 14, Revenue by Geographic Area` |
| Robotaxi / Cybercab | No standalone revenue disclosure; folded into Services and other; 7 US metros live, ~380,000 unsupervised miles driven with zero notable incidents | Improving optionality, immaterial revenue today | Low today; unquantifiable upside — not proven from available data whether/when this becomes revenue-material | Q2 FY26 transcript, Q&A (Ashok Elluswamy); `business-model/03_segment-map.md` §3 (no separate segment or revenue-line disclosure) |

---

## 5. Revenue Drivers By Segment

### Segment: Automotive, incl. Services and other sub-line (~88.9% of Q2 FY2026 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Vehicle deliveries | 480,126, Q2 2026 (+25% YoY, record Q2) | Improving | High | `TSLA-Q2-2026-Update.pdf`, p.5 |
| Vehicle ASP ex-FX/mix | Described as a YoY drag for the quarter | Deteriorating | Mid | `TSLA-Q2-2026-Update.pdf`, p.25 |
| Automotive regulatory credits | $146M, Q2 2026 (−67% YoY) | Deteriorating, policy-driven | Low on revenue / higher on profit | `FY26 Q2 10-Q, MD&A`, p.31 |
| Automotive leasing | $364M, Q2 2026 (−16% YoY) | Deteriorating | Low | `TSLA-Q2-2026-Update.pdf`, p.24 |
| Services and other (used vehicles, paid Supercharging, insurance, non-warranty service, FSD subscriptions) | $4,581M, Q2 2026 (+50% YoY) | Improving | High | `TSLA-Q2-2026-Update.pdf`, p.9, p.24 |

### Segment: Energy Generation and Storage (~11.1% of Q2 FY2026 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Storage deployment volume (Megapack/Powerwall) | 13.5 GWh, Q2 2026 (+41% YoY, +53% sequentially) | Improving, lumpy | Mid | `TSLA-Q2-2026-Update.pdf`, p.5; Q2 FY26 transcript, prepared remarks |
| Realized price per unit (industrial storage ASP) | Declining "amidst growing competition," per management guidance repeated on the call | Deteriorating | Mid — offsets some of the volume gain | Q2 FY26 transcript, prepared remarks (Vaibhav Taneja) |
| Demand pipeline (grid/data-center buildout) | Described as "robust" backlog; no figure disclosed | Improving (qualitative) | Unknown | Q2 FY26 transcript, prepared remarks — "we are doing our best to build based on both existing demand and future demand we expect from data center growth" |

---

## 6. Revenue Growth Decomposition

Basis: Q2 2026 vs. Q2 2025, total revenue $22,496M → $28,236M, +$5,740M (+25.5% YoY). Tesla does not disclose a volume/price/mix percentage-point split; the two decompositions below use the company's own disclosed revenue-line and geography breakouts, which reconcile exactly to the reported total, so no estimate is required for either row set.

**By revenue line** [`TSLA-Q2-2026-Update.pdf`, p.24, Statement of Operations]:

| Component | $ Change | Contribution to Growth (pp) | Evidence |
|---|---:|---:|---|
| Automotive sales | +4,219 | +18.75 | Driven by ~25% higher cash deliveries [`FY26 Q2 10-Q, MD&A`, p.31] |
| Automotive regulatory credits | −293 | −1.30 | Policy rollback, see §4 |
| Automotive leasing | −71 | −0.32 | Not separately explained in the pool |
| Energy generation and storage | +350 | +1.56 | +41% YoY deployment volume, partly offset by lower ASP |
| Services and other | +1,535 | +6.82 | Used-vehicle volume/ASP, non-warranty service, paid Supercharging, FSD subscriptions [`FY26 Q2 10-Q, MD&A`, p.31] |
| **Total revenue growth** | **+5,740** | **+25.51** | Reconciles to reported +26% YoY (rounded) [`TSLA-Q2-2026-Update.pdf`, p.24] |

**By geography** [`FY26 Q2 10-Q, Note 14, Revenue by Geographic Area`]:

| Component | $ Change | Contribution to Growth (pp) | Evidence |
|---|---:|---:|---|
| United States | +1,399 | +6.22 | +11.8% YoY |
| China | +370 | +1.64 | +8.6% YoY |
| Other International | +3,971 | +17.65 | +62.2% YoY — the dominant growth source this quarter |
| **Total revenue growth** | **+5,740** | **+25.51** | Reconciles to reported total [`FY26 Q2 10-Q, Note 14`] |

Both views agree on the total and tell the same underlying story from different angles: growth is overwhelmingly volume-led (vehicle deliveries) and geographically concentrated in smaller international markets outside the US/China core, with Services/FSD subscription revenue as the second-largest contributor, while the regulatory-credit line is now a net drag rather than a tailwind. Neither breakout isolates pure price/ASP or FX contribution in dollar terms — those are disclosed only as qualitative bridge items (§3) — so a fully quantified volume/price/mix/FX split is not proven from available data.

**Cycle-position note (Cycle-Position Rule):** Automotive is a self-acknowledged cyclical, rate- and policy-sensitive business [`business-model/10_external-dependency.md`, Consumer cycle row, High]. The federal EV tax credit ($7,500) expired Sept 30, 2025 under the OBBBA; public reporting ties Tesla's record Q3 2025 deliveries (497,099, a 3-year quarterly-revenue-share outlier flagged unresolved in `01_historical-financials` §5) partly to buyers pulling purchases forward ahead of that deadline [Web: Yahoo Finance/Fortune, Oct 2025 (unverified) — **Inference, not from filings**]. Deliveries then fell for two straight quarters (Q4 2025: 418,227; Q1 2026: 358,023, the low of the eight quarters shown) before the Q2 2026 rebound to a record Q2 (480,126). Because the tax credit was already gone by Q2 2026, this rebound reads as a genuine demand recovery — driven by new-market expansion, FSD attach, and the Model YL launch — rather than a repeat of the same policy tailwind, but it comes right after a policy-driven air pocket, so the current quarter should be read as **recovering from a trough, not yet a proven new run-rate peak**; the largest-since-2023 order backlog (unquantified) is the main forward signal management points to.

---

## 7. The Single Biggest Revenue Driver

**Vehicle delivery volume** is the single biggest lever: automotive sales alone are ~71% of total revenue ($20,006M of $28,236M in Q2 2026), so a 10–20% swing in deliveries — in either direction — would move total company revenue by roughly 7 to 14 percentage points, larger than any other driver in this report. Its current direction is improving (record Q2 deliveries, +25% YoY, largest order backlog since 2023 per the CFO), but three qualifiers matter for what happens next: (1) the recovery follows a policy-driven demand air pocket (the expired federal EV tax credit pulled Q3 2025 deliveries forward and likely hollowed out Q4 2025/Q1 2026, per public reporting not confirmed in Tesla's own filings — Inference, not from filings), so part of the "rebound" is normalization rather than new demand; (2) more than two-thirds of the quarter's incremental delivery-driven revenue growth came from smaller international markets (+62% YoY) rather than the US or China, so the growth is real but geographically narrow; and (3) management itself names battery-cell and electronic-component supply, not demand, as the binding constraint on how much further volume can rise in the near term.

---

## 8. Citations

[1] `TSLA-Q2-2026-Update.pdf` (Q2 2026 shareholder Update letter, unaudited) — Highlights p.2, Financial Summary p.3-4, Operational Summary p.5, Manufacturing & Hardware p.6, Services p.9, Outlook p.10, Key Metrics YoY Financial Summary p.25, Statement of Operations p.24, Reconciliation of GAAP to Non-GAAP p.30
[2] `Tesla_Inc_-_Form_10-Q-Jul-23-2026` (Q2 FY2026 10-Q) — Item 2 MD&A "Results of Operations" (Automotive & Services and Other Segment; Energy Generation and Storage Segment), p.31; Note 14 (Segment Reporting and Information about Geographic Areas), Revenue by Geographic Area table; Item 3 (Quantitative and Qualitative Disclosures About Market Risk, FX sensitivity)
[3] Tesla Q2 2026 Earnings Call transcript, Jul 22, 2026 (verbatim, S&P Global Market Intelligence) — prepared remarks (Elon Musk, Vaibhav Taneja) and Q&A (Ashok Elluswamy, Lars Moravy)
[4] `analyses/TSLA_2026-07-24/earnings/01_historical-financials.md` — revenue baseline, quarterly trend table, and the flagged Q3 2025 revenue-share outlier
[5] `analyses/TSLA_2026-07-24/business-model/03_segment-map.md` — segment structure, revenue/gross-profit shares, disclosure-quality gaps
[6] `analyses/TSLA_2026-07-24/business-model/10_external-dependency.md` — cyclicality, FX, and policy-dependency classification
[7] `analyses/TSLA_2026-07-24/earnings/04_guidance-consensus.md` — confirms Tesla issues no point revenue guidance; FY2026 consensus revenue $105,415.0mm
[8] Web: Yahoo Finance ("Tesla reports blowout Q3 deliveries as buyers plow in before federal tax credit expires") and Fortune (Oct 22, 2025) reporting on OBBBA's Sept 30, 2025 EV tax-credit expiration and Tesla Q3 2025 delivery pull-forward — dated, unverified, used only to label the Q3 2025 outlier as a probable one-time policy effect; not corroborated by Tesla's own filings in this pool



---

## earnings / 03_margin-drivers.md

_Source: `03_margin-drivers.md`_

# Margin Drivers — TSLA

**Jurisdiction / regime:** United States, US GAAP, USD millions. Fiscal year end Dec-31. [Form 10-Q, Jul-23-2026, cover page]

## 1. Segment Decomposition Status

Segment decomposition applied, matching `02_revenue-drivers` — Tesla reports two ASC 280 segments (Automotive, Energy Generation and Storage) plus a disclosed "Services and other" sub-line inside Automotive that this report treats as a third, informational row [`business-model/03_segment-map.md`, §1]. Automotive alone is 88.9% of Q2 FY2026 revenue — above the >85% single-segment threshold — but Tesla discloses full revenue, cost of revenue, and gross-profit lines for both segments, and margin trends differ sharply between them (Automotive GAAP gross margin 16.9% vs Energy 20.4% in Q2 FY2026 [`FY26 Q2 10-Q, Note 14`]), so segment-level margin decomposition adds real information here.

**Critical disclosure limit carried over from `03_segment-map.md`, §3:** Tesla allocates **revenue, cost of revenue, and gross profit** to each segment — it does **not** allocate operating expenses (R&D, SG&A), operating income, or D&A-below-the-gross-profit-line by segment in the primary segment note. Every segment margin figure in this report is therefore a **gross-margin** read; segment-level EBIT or EBITDA margin cannot be computed from disclosure and is not attempted. (A CIQ vendor tab does carry a segment D&A allocation — Automotive $3,780M / Energy $355M, FY2025 — but this is a vendor apportionment, not a line Tesla itself discloses, and is flagged as such wherever used [`CIQ Financials_Annual export, Segments tab, FY2025`].)

Business-model cross-module inputs used: `03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`, and `02_business-identity.md` §3a (sector-overlay determination) — all present and read for this report.

---

## 2. Sector Overlay

Per `business-model/02_business-identity.md` §3a: *"No row in `frameworks/SECTOR_OVERLAYS.md` covers 'auto OEM' or 'EV manufacturer' by name... no sector overlay for vertically-integrated EV manufacturer — generic read applies."* Confirmed directly against `frameworks/SECTOR_OVERLAYS.md`, which lists SaaS, bank, insurer, REIT, commodity producer/miner, oil & gas, retail, telecom, asset manager, and pharma rows only — none match a vertically integrated EV/energy-storage manufacturer.

**Sector overlay applied: none — generic operating-company cost stack applies** (volume, price/mix, input costs, SG&A/R&D leverage, D&A, one-offs).

---

## 3. Cost Stack

Basis: three months ended Jun-30-2026 vs three months ended Jun-30-2025 (Q2 FY2026 vs Q2 FY2025), GAAP, USD millions, from the Q2 FY2026 10-Q Condensed Consolidated Statements of Operations and Note 9 (Stock-Based Compensation) [`FY26 Q2 10-Q, Item 1`]. Tesla does not break out a standalone raw-material, labor, freight, or energy cost line — cost of revenue is disclosed only by segment (Automotive, Energy, Services and other), so those generic rows are marked "Not disclosed" and the segment cost-of-revenue rows are used instead.

| Cost Line | Q2 FY2026 | Q2 FY2025 | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|---|
| Automotive sales cost of revenue | $16,866M (24.6% higher deliveries drove the $) | $13,567M | Rising with volume; average cost per unit "relatively consistent" | `FY26 Q2 10-Q, Item 2 MD&A` — "Cost of automotive sales revenue increased $3.30 billion, or 24%... Average cost per unit was relatively consistent due to unfavorable sales mix and a negative impact from the weakening of the United States dollar... offset by favorable impacts related to warranty adjustments and tariffs" | Mid — cost tracks volume almost 1:1, so cost discipline (not volume) is what protects margin |
| Energy generation & storage cost of revenue | $2,499M | $1,943M (+29% YoY) | Rising faster than the segment's own revenue growth (13% YoY) | `FY26 Q2 10-Q, Item 2 MD&A` — "increase in average cost per MWh primarily driven by sales mix and unfavorable warranty adjustments" | High — cost outpacing revenue is the direct cause of the segment's margin collapse (see §4) |
| Services and other cost of revenue | $3,933M | $2,880M (+37% YoY, slower than the segment's 50% revenue growth) | Improving relative to revenue | `FY26 Q2 10-Q, Item 2 MD&A` | Low-to-Mid — this is the one segment where cost growth is currently running below revenue growth |
| Raw materials / commodity inputs (standalone line) | Not disclosed | Not disclosed | Unknown | Embedded inside the three cost-of-revenue lines above; no separate raw-material, freight, or energy-cost line is broken out anywhere in the pool | Cannot be isolated from available data |
| Labor (standalone line) | Not disclosed | Not disclosed | Unknown | Not broken out separately from cost of revenue / R&D / SG&A | Cannot be isolated from available data |
| R&D | $2,371M (8% of revenue) | $1,589M (7% of revenue) | Rising, +49% YoY vs +25.5% revenue growth | `FY26 Q2 10-Q, Item 2 MD&A` — "increased $782 million, or 49%... primarily due to significant research and development-related activities, including preproduction ramp costs for new products like the Semi Truck, Optimus, Cybercab and other AI initiatives... additional compute" [Q2 FY2026 transcript, prepared remarks] | High — growing roughly 2x faster than revenue |
| SG&A | $1,982M (7% of revenue) | $1,366M (6% of revenue) | Rising, +45% YoY vs +25.5% revenue growth | `FY26 Q2 10-Q, Item 2 MD&A` — SG&A increased "$616 million, or 45%"; the note attributes a large piece to stock-based compensation (below) | High — same negative-leverage pattern as R&D |
| — of which Stock-based compensation (all lines) | $1,151M total (COGS $258M / R&D $487M / SG&A $406M) | $635M total (COGS $213M / R&D $298M / SG&A $124M) | Rising sharply, +81% YoY | `FY26 Q2 10-Q, Note 9 (Stock-Based Compensation)` | High — see §8; this is the single largest identifiable driver of the opex-ratio increase |
| D&A | $1,619M (5.7% of revenue) | $1,433M (6.4% of revenue) | Falling as a % of revenue (D&A growing slower than revenue for now) | `Financials_Quarterly.xls, Cash Flow tab` [CIQ]; consistent with company Op. Income of $398M [`FY26 Q2 10-Q, Item 1`] | Mid — a forward risk, not a current one: capex "more than doubled sequentially" to fund robotaxi, Optimus, AI compute and new factories, and management guides FY2026 capex ">$25 billion" and rising "for the next two to three years" [Q2 FY2026 transcript, prepared remarks] — D&A has not yet caught up with this capex ramp |
| Restructuring and other (one-off) | $94M | $0 | New this quarter | `FY26 Q2 10-Q, Item 1` — line item appears for the first time in the periods shown; management ties the increase in opex partly to "charges related to litigation expenses in the quarter" [Q2 FY2026 transcript, prepared remarks] | Low on its own, but a genuine one-off that inflates the reported opex growth rate |
| Interest expense | $81M | $86M | Roughly flat, slightly down | `FY26 Q2 10-Q, Item 1` | Low — immaterial to the margin picture |

---

## 4. Gross Margin → EBITDA Margin → EBIT Margin Walk

Basis: three months ended Jun-30-2026 vs three months ended Jun-30-2025 (company-reported GAAP figures, cross-checked against CIQ D&A — see `01_historical-financials` reconciliation flag, which does **not** affect Q2'25/Q2'26, only Q3/Q4 2025).

| Margin Level | Q2 FY2026 | Q2 FY2025 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 16.83% ($4,751M / $28,236M) | 17.24% ($3,878M / $22,496M) | −41 bps | Net of a shrinking, near-pure-margin regulatory-credit line (−67% YoY), a sharp Energy-segment margin drop (30.3%→20.4%, warranty true-up + non-repeating tariff benefit + falling Megapack ASP), and a large Services-margin improvement (5.45%→14.15%) that partly offsets the other two | `TSLA-Q2-2026-Update.pdf, p.3` (company states "-41 bp"); `FY26 Q2 10-Q, Item 2 MD&A` |
| EBITDA margin (GAAP, Op. Income + D&A) | 7.14% ($2,017M) | 10.47% ($2,356M) | −333 bps | Gross-margin erosion (−41bps) plus a sharply higher operating-expense ratio (R&D+SG&A rose from 13.13% to 15.42% of revenue, +229bps) plus a smaller D&A add-back relative to revenue (D&A ratio fell from 6.37% to 5.73%, which mechanically widens the EBITDA-margin decline once EBIT has already fallen) | `01_historical-financials.md`, §3; `FY26 Q2 10-Q, Item 1` |
| EBIT margin (Operating Income) | 1.41% ($398M) | 4.10% ($923M) | −269 bps | Almost entirely the opex-ratio increase (+229bps) plus the small gross-margin decline (−41bps, rounds to ≈−270bps combined) — **not** a gross-margin story | `FY26 Q2 10-Q, Item 1`; calculation shown in §7 |

**Annual complement (structural, not one-quarter):** FY2023→FY2025, gross margin was roughly flat (18.25%→18.03%) while combined R&D+SG&A rose from 9.06% of revenue (FY2023) to 12.91% (FY2025) to 14.25% on a TTM basis (Jun-30-2026) [CIQ Financials_Annual export, Income Statement tab — R&D $3,969M/$4,540M/$6,411M/$7,730M(TTM); SG&A $4,800M/$5,150M/$5,834M/$7,032M(TTM); revenue $96,773M/$97,690M/$94,827M/$103,619M(TTM)]. EBIT margin fell from 9.19% (FY2023) to 4.59% (FY2025) almost in lockstep with the opex-ratio rise, not with gross margin. This is the same pattern the single quarter shows, at a larger scale, over a longer window.

**Pass-through lag (business-model value-chain input, `06_value-chain.md`):** "Tesla's ability to pass rising input costs to customers is partial and lossy, not automatic... the gap was closed mostly by regulatory-credit contribution and cost cuts, not by raising sticker prices" [`06_value-chain.md`, §2]. No numeric lag (in days or quarters) between an input-cost rise and a matching price change is disclosed anywhere in the pool beyond the tariff-recognition timing noted in §7 below — **not proven from available data**.

---

## 5. Margin Walk — Which Margin Level Matters Most?

**EBIT margin (operating income) is the most useful level for Tesla, not gross margin.** Gross margin has been comparatively stable for three years (18.2%–18.9% range, FY2023–TTM) and tells a segment-mix story more than a company-wide profitability story — it moves on regulatory-credit phase-out and Energy-segment one-offs that partly cancel each other out (§4). The real profitability story for the next 3–12 months is happening below the gross-profit line: R&D and SG&A have grown roughly twice as fast as revenue for three straight years, driven by a large, disclosed, and structurally rising stock-based-compensation charge (§8) plus genuine cash investment in Robotaxi, Optimus, Semi, and AI compute that management itself says will keep growing ("we are in a big investment cycle and expect our operating expenses largely driven by R&D to continue to grow in 2026 and beyond" [Q2 FY2026 transcript, prepared remarks]). EBITDA margin is a reasonable secondary check because it strips out the D&A line, which is about to become a forward risk of its own as the current capex ramp (>$25bn FY2026, guided to keep rising [Q2 FY2026 transcript, prepared remarks]) converts into placed-in-service assets — but EBIT margin is the cleanest single number for tracking whether the operating-expense trend (the actual driver identified in this report) is stabilizing or not.

---

## 6. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Stock-based compensation ramp (2025 CEO Performance Award + broader grants) | Directly inflates COGS, R&D, and SG&A; SBC rose from 2.82% to 4.08% of revenue YoY (Q2'25→Q2'26) | Headwind | High (>100bps YoY on its own — see §8 calculation) | `FY26 Q2 10-Q, Note 9`; total SBC $635M→$1,151M YoY |
| R&D / SG&A opex growth beyond SBC (AI compute, Semi/Optimus/Cybercab preproduction, litigation) | Non-SBC opex ratio rose from 10.31% to 11.34% of revenue YoY | Headwind | Mid-to-High (~100bps YoY) | `FY26 Q2 10-Q, Item 2 MD&A`; Q2 FY2026 transcript, prepared remarks |
| Automotive regulatory-credit phase-out | Near-100%-margin revenue line down 67% YoY ($439M→$146M), removing a margin cushion | Headwind, policy-driven, non-reversing | Mid on consolidated margin (small dollar base but high margin quality) | `FY26 Q2 10-Q, Item 2 MD&A` |
| Energy-segment warranty true-up and non-repeat of tariff relief | One-off items compressed Q2'26 energy gross margin; management explicitly separates these from the underlying ASP trend | Headwind this quarter, expected to partially reverse (one-off, not run-rate) | Mid | Q2 FY2026 transcript, prepared remarks — "$240 million" warranty true-up; "more than $200 million" Q1 tariff benefit "did not repeat" |
| Energy Megapack/industrial-storage ASP decline | Structural, competition-driven price erosion, separate from the one-offs above | Headwind, ongoing | Mid — management's own long-term normalized range (mid-to-low 20s% gross margin) is itself below Q1 FY2026's 39.5% print, implying further margin give-back is expected even absent one-offs | Q2 FY2026 transcript, prepared remarks — "ASPs for industrial storage is coming down amidst growing competition... we believe the energy business should normalize at a gross margin rate in the mid- to low 20% range" |
| Services and other margin improvement | Segment margin rose from 5.45% (Q2'25, calculated) to 14.15% (Q2'26), an all-time high per management | Tailwind | Mid (16.2% of revenue, so a meaningful absolute-dollar gross-profit contributor) | `FY26 Q2 10-Q, Item 2 MD&A`; Q2 FY2026 transcript, prepared remarks — "Service and other margins improved sequentially from 9.2% to 14.1%, an all-time high" |
| Vehicle mix / ASP (ex-FX) | Update-letter bridge lists "lower vehicle ASP (excl. FX), inclusive of mix" as a drag; per-unit cost "relatively consistent" | Headwind (mild) | Low-to-Mid | `TSLA-Q2-2026-Update.pdf, p.25`; `FY26 Q2 10-Q, Item 2 MD&A` |
| FX (weaker USD) | Mixed: favorable to reported automotive ASP, unfavorable to reported cost per unit — net effect described by management as roughly offsetting | Neutral-to-mild-headwind on cost side | Low-to-Mid, but the underlying exposure is large (a 10% adverse FX move swings pre-tax income $1.64bn) [`FY26 Q2 10-Q, Item 3`] | `FY26 Q2 10-Q, Item 2 MD&A` |
| Interest-rate subvention cost | Tesla subsidizes below-market vehicle financing; subvention cost is booked upfront against automotive revenue, and rising rates raise this cost | Headwind, macro-linked | Low-to-Mid, not separately quantified in the pool | Q2 FY2026 transcript, prepared remarks — "as interest rates have risen this year, the cost of subvention has risen along with them, which had a negative impact on automotive margins" |
| Capacity utilization / battery-cell supply constraint | Battery-pack capacity is the named constraint on vehicle volume growth; underused new capacity (Megafactory ramps) can depress near-term unit economics before volume catches up | Unknown / potentially headwind | Unknown — no utilization rate is disclosed (flagged as a gap in `business-model/02_business-identity.md` §3a) | `TSLA-Q2-2026-Update.pdf, p.2`; `business-model/02_business-identity.md` §3a |
| D&A step-up from the capex ramp | Not yet visible in the reported ratio (D&A/revenue fell YoY), but capex more than doubled sequentially and is guided to keep rising for 2-3 years | Forward headwind, not a current one | Mid (timing and size not disclosed — Inference, not from filings, on when it hits) | `01_historical-financials.md`, §6; Q2 FY2026 transcript, prepared remarks |
| Restructuring / litigation one-off | New $94M charge this quarter, absent a year ago | Headwind, one-off | Low | `FY26 Q2 10-Q, Item 1`; Q2 FY2026 transcript, prepared remarks |

---

## 7. Margin Drivers By Segment

### Segment: Automotive incl. Services and other sub-line (~88.9% of Q2 FY2026 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Automotive GAAP gross margin (with credits) | 17.2% (Q2'25) → 16.9% (Q2'26), −30bps YoY | Headwind (mild) | Mid | `FY26 Q2 10-Q, Item 2 MD&A` |
| Automotive gross margin ex-regulatory-credits | 19.2% (Q1'26) → 16.3% (Q2'26), −290bps QoQ; no comparable Q2'25 ex-credit figure disclosed in the pool — YoY ex-credit change **not proven from available data** | Headwind, but management attributes most of the QoQ drop to a non-repeating Q1 one-off, not underlying deterioration | Mid | Q2 FY2026 transcript, prepared remarks — "Controlling for the impact of those [Q1] benefits... automotive gross margins, excluding credits would have been approximately flat" |
| Regulatory-credit revenue | $439M (Q2'25) → $146M (Q2'26), −67% YoY | Headwind, policy-driven, non-reversing | Mid-High on margin quality despite small revenue size | `FY26 Q2 10-Q, Item 2 MD&A` — "Recent governmental and regulatory actions have restricted certain regulatory credit programs" |
| Services and other margin | 5.45% (Q2'25, calculated from disclosed revenue/cost) → 14.15% (Q2'26) | Tailwind | High within this sub-line | `FY26 Q2 10-Q, Item 2 MD&A`; Q2 FY2026 transcript |
| Interest-rate subvention cost | Rising with rates, booked against automotive revenue upfront | Headwind | Low-to-Mid, unquantified | Q2 FY2026 transcript, prepared remarks |

### Segment: Energy Generation and Storage (~11.1% of Q2 FY2026 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Segment gross margin | 30.3% (Q2'25) → 20.4% (Q2'26), −990bps YoY; also 39.5% (Q1'26) → 20.4% (Q2'26) QoQ | Headwind | High | `FY26 Q2 10-Q, Item 2 MD&A`; Q2 FY2026 transcript |
| Warranty true-up (vendor cell issue, legacy deployments) | ~$240M one-off cost in Q2'26 | Headwind, one-off | High for this quarter, non-recurring | Q2 FY2026 transcript, prepared remarks |
| Tariff-relief timing | >$200M benefit recognized in Q1'26 "did not repeat" in Q2'26 | Headwind (absence of a prior tailwind), one-off | Mid-High | Q2 FY2026 transcript, prepared remarks |
| Megapack/industrial-storage ASP | Declining "amidst growing competition" | Headwind, structural | Mid, ongoing | Q2 FY2026 transcript, prepared remarks |
| Long-term normalized margin guide | Management targets "mid- to low 20% range" | Neutral (this is management's own steady-state expectation, below the Q1'26 print) | — | Q2 FY2026 transcript, prepared remarks |
| China battery-cell sourcing / tariff exposure | "most of the battery cells are procured from China," named as the reason "tariffs in this business can have outsized impacts" | Headwind risk, not yet in the reported numbers this quarter beyond the tariff-timing item above | High if tariffs escalate | `06_value-chain.md`, §2, citing Q1 FY2026 transcript |

---

## 8. Margin Bridge — Latest Period

Basis: Q2 FY2026 vs Q2 FY2025, EBIT margin (the primary metric per §5). All components computed from disclosed GAAP figures; no estimation was required because gross profit, R&D, SG&A, SBC, and D&A are each separately disclosed for both periods.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Gross margin (segment mix net effect: credits down, Energy margin down, Services margin up) | −41 | `TSLA-Q2-2026-Update.pdf, p.3`; §4 above |
| Operating-expense ratio — stock-based compensation | −126 | Calculated: SBC/revenue 2.82% (Q2'25, $635M/$22,496M) → 4.08% (Q2'26, $1,151M/$28,236M) = +126bps of revenue consumed, i.e., a 126bps drag on EBIT margin. `FY26 Q2 10-Q, Note 9` |
| Operating-expense ratio — R&D/SG&A ex-SBC (AI compute, product preproduction, litigation, headcount) | −103 | Calculated: opex-ex-SBC/revenue 10.31% (Q2'25, $2,320M/$22,496M) → 11.34% (Q2'26, $3,202M/$28,236M) = +103bps drag. `FY26 Q2 10-Q, Item 1` |
| **Total EBIT margin change** | **−269** (calculated: 4.10%→1.41%; components above sum to −270, within rounding) | `FY26 Q2 10-Q, Item 1` |
| Memo: D&A ratio effect on EBITDA margin (not part of the EBIT bridge above) | −64 (widens the EBITDA-margin decline to −333bps total) | D&A/revenue 6.37% (Q2'25) → 5.73% (Q2'26); `Financials_Quarterly.xls, Cash Flow tab` [CIQ] |

The bridge is unusually clean for this business: **the entire EBIT margin decline is an operating-expense story, not a gross-margin story.** Volume, price, one-offs, and segment mix roughly netted out to a −41bps gross-margin effect; the −229bps of additional EBIT-margin damage came entirely from R&D and SG&A growing far faster than revenue, and just over half of that (−126bps of the −229bps) is directly attributable to the rise in stock-based compensation.

---

## 9. The Single Biggest Margin Driver

**The stock-based-compensation ramp tied to the 2025 CEO Performance Award, and the broader R&D/SG&A opex growth riding alongside it, is the single biggest driver of where Tesla's margins go next.** Total company SBC rose from $635M to $1,151M YoY (+81%), and more than half of that increase ($267M of the ~$516M YoY rise) is directly tied to a single new item: the 2025 CEO Performance Award (granted Sept 3, 2025), for which Tesla began recognizing expense in the last several quarters after determining the "20 million vehicles delivered" operational milestone is now probable [`FY26 Q2 10-Q, Note 9`]. As of Jun-30-2026, Tesla still has **$9.82 billion of unrecognized expense** for this now-probable tranche, to be recognized over roughly **9.2 more years** — a locked-in, rising, non-cash cost that will keep pressuring SG&A margin regardless of what the underlying auto or energy business does. Behind that sits a far larger overhang: **$105.82 billion to $120.37 billion of unrecognized expense for tranches tied to milestones not yet deemed probable** (further vehicle-delivery, FSD-subscription, Robotaxi, and Adjusted-EBITDA targets up to $400bn) [`FY26 Q2 10-Q, Note 9`] — if even one or two of those become probable in a future quarter, the same mechanism (a lumpy, multi-quarter step-up in SG&A) will repeat and could be materially larger than the current one. Layered on top, management has explicitly guided that non-SBC operating expenses will also keep growing ("we expect our operating expenses largely driven by R&D to continue to grow in 2026 and beyond" [Q2 FY2026 transcript, prepared remarks]) to fund Robotaxi, Optimus, Semi, and AI-compute build-out — all pre-revenue or early-revenue programs today. Its current direction is a clear, quantified headwind (−229bps of the −269bps total EBIT-margin decline this quarter came from the opex ratio, of which SBC alone was −126bps), and nothing in the disclosed record suggests this reverses in the next several quarters — the opposite: both the CEO-award recognition schedule and management's own guidance point to further opex-ratio growth ahead.

---

## 10. Citations

[1] `Tesla_Inc_-_Form_10-Q(Jul-23-2026)` (Q2 FY2026 10-Q) — Item 1 Financial Statements (Condensed Consolidated Statements of Operations); Note 9 (Stock-Based Compensation, incl. 2025 CEO Performance Award and Summary Stock-Based Compensation table); Note 14 (Segment Reporting); Item 2 MD&A (Results of Operations, Automotive & Services and Other Segment; Energy Generation and Storage Segment; R&D and SG&A expense discussion); Item 3 (FX sensitivity)
[2] Tesla Q2 2026 Earnings Call transcript, Jul 22, 2026 (verbatim, S&P Global Market Intelligence) — prepared remarks (Vaibhav Taneja, CFO; Elon Musk, CEO)
[3] `TSLA-Q2-2026-Update.pdf` (Q2 2026 shareholder Update letter, unaudited) — Financial Summary p.3, Key Metrics YoY Financial Summary p.25
[4] `analyses/TSLA_2026-07-24/earnings/01_historical-financials.md` — margin baseline, quarterly EBITDA/EBIT tables, D&A reconciliation
[5] `analyses/TSLA_2026-07-24/earnings/02_revenue-drivers.md` — revenue-side context (regulatory credits, geographic mix, cycle-position note)
[6] `analyses/TSLA_2026-07-24/business-model/03_segment-map.md` — segment structure, disclosure-depth gap (no opex/EBIT allocation by segment)
[7] `analyses/TSLA_2026-07-24/business-model/06_value-chain.md` — pass-through / pricing-power context
[8] `analyses/TSLA_2026-07-24/business-model/10_external-dependency.md` — cyclicality, FX, interest-rate, and policy dependency classification
[9] `analyses/TSLA_2026-07-24/business-model/02_business-identity.md` §3a — sector-overlay determination (no match; generic read)
[10] Capital IQ export, Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Income Statement, Segments tabs (FY2017–FY2025, data as of 2026-07-24 extraction)
[11] Capital IQ export, Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Income Statement (Stock-Based Comp. detail), Cash Flow (D&A) tabs (data as of 2026-07-24 extraction)
[12] `frameworks/SECTOR_OVERLAYS.md` — confirms no auto-OEM / EV-manufacturer row exists



---

## earnings / 04_guidance-consensus.md

_Source: `04_guidance-consensus.md`_

# Guidance & Consensus — TSLA

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ (`Tesla,IncNasdaqGSTSLAEstimatesReport.xls` — Consensus, Recent Changes, Revisions, Trends, Surprise tabs) |
| Data as of date | Consensus cover-page timestamp "Jul-22-2026 10:12 PM GMT" [Q2 2026 Earnings Call transcript, Jul 22, 2026, embedded S&P Global Market Intelligence consensus block]; Recent Changes tab shows individual analyst revisions dated through 2026-07-23 [EstimatesReport.xls, Recent Changes tab] — both **post-date** the Q2 2026 print (reported Jul 22, 2026) and the Q2 2026 10-Q (filed Jul 23, 2026), so this is a current, not stale, consensus snapshot |
| Fiscal year basis | Calendar year; "Current Fiscal Year End: Dec-31-2026 \| FQ3 2026 Earnings Release Date: Oct-21-2026" [EstimatesReport.xls, Consensus tab] |
| Analyst count | Varies by line item: Revenue FY2026 44–46 estimates; EPS Normalized FY2026 34–40 estimates; EBITDA FY2026 19–22 estimates [EstimatesReport.xls, Consensus tab and Revisions tab] |
| Currency | US Dollar (USD), reported currency, today's spot rate for any converted line [EstimatesReport.xls, Consensus tab header] |
| Calendarization issue? | N — Tesla's fiscal year matches the calendar year; no reconciliation needed |

## 2. Management Guidance

Tesla does not issue point revenue, EBITDA, or EPS guidance. The Capital IQ "Guidance" tab confirms this from the vendor side: it carries populated entries only through roughly 2014–2015 and is empty for every year since — "Tesla does not issue point EPS/revenue guidance that CIQ tracks in this field" [EstimatesReport.xls, Guidance tab; corroborated in `00_earnings-data-triage.md`]. **Company does not provide formal point guidance for revenue, EBITDA, or EPS.** The only quantified forward figure management gives is a capex floor. All other forward commentary is qualitative, delivered in the Update-letter "Outlook" section and reaffirmed on the earnings calls.

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| Revenue | FY2026 | Not guided. Qualitative only: "Deliveries and deployments will be impacted by aggregate demand for our products, supply chain readiness and allocation decisions" | Qualitative | TSLA-Q2-2026-Update.pdf, Outlook section, p.10 |
| EBITDA / EBIT | FY2026 | Not guided. Qualitative only: "we expect our hardware-related profits to be accompanied by an acceleration of AI, software and fleet-based profits" (no time-bound number) | Qualitative | TSLA-Q2-2026-Update.pdf, Outlook section, p.10 |
| EPS | FY2026 | Not guided | — | — |
| Capex | FY2026 | "We continue to expect that CapEx for this year will be more than $25 billion" — reaffirmed from the Q1 2026 call ("our current expectation for 2025 -- 2026 is over $25 billion of CapEx") | Point (floor) | Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks (Vaibhav Taneja, CFO); Q1 2026 Earnings Call transcript, Apr 22, 2026, prepared remarks (Vaibhav Taneja, CFO) |
| Other KPIs — Operating expenses | FY2026+ | "Expect our operating expenses largely driven by R&D to continue to grow in 2026 and beyond" | Qualitative | Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks |
| Other KPIs — Energy gross margin | Long-term | "We believe the energy business should normalize at a gross margin rate in the mid- to low 20% range" | Range (long-term, not FY2026-specific) | Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks |
| Other KPIs — Robotaxi fleet | FY2026 | "We expect the ramp of the fleet to accelerate throughout the year, along with the expansion into new U.S. markets" | Qualitative | Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks |
| Other KPIs — Semi / Megapack 3 | 2026 | "Tesla Semi and Megapack 3 remain on schedule for production starting in 2026" | Qualitative (timing) | TSLA-Q2-2026-Update.pdf, Outlook section, p.10 |

No range guidance is given for any P&L line, so no midpoint calculation applies. The only quantified figure — capex — is a floor ("more than $25 billion"), not a range, so it is compared directly to consensus below rather than to a midpoint.

## 3. Guidance vs Consensus Table

Because Tesla gives no point guidance for revenue, EBITDA, or EPS, this table can only be built for capex, where a quantified management figure exists. The other rows are shown as "Not guided" per the partial-guidance rule in the template, rather than omitted, so the gap is visible.

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | FY2026 | Not guided | $105,415.0mm (44–46 ests.) [EstimatesReport.xls, Consensus tab] | N/A | N/A — no guidance to compare |
| EBITDA | FY2026 | Not guided | $14,096.1mm (19–22 ests.) [EstimatesReport.xls, Consensus tab] | N/A | N/A — no guidance to compare |
| EPS (Normalized) | FY2026 | Not guided | $1.83 (34–40 ests.) [EstimatesReport.xls, Consensus tab] | N/A | N/A — no guidance to compare |
| Capex | FY2026 | >$25.0bn (floor) [Q2 2026 Earnings Call transcript, Jul 22, 2026] | $26,166.7mm ($26.17bn) [EstimatesReport.xls, Consensus tab, "Capital Expenditure" row] | +$1.17bn | Consensus above the guided floor — the Street already expects more capital spending than management's stated minimum, which is a headwind for the free-cash-flow line specifically |

## 3A. Alt-Data Cross-Check

No `data/TSLA/external/` folder exists in this pool [`00_earnings-data-triage.md`, Section 1]. This section is omitted — its absence is not a gap.

## 4. Estimate Revision Momentum Table

| Estimate | 90 Days Ago (3 months) | 60 Days Ago (2 months) | 30 Days Ago (1 month) | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (next Q — FQ3 2026) | $27,149.4mm | $26,855.5mm | $26,915.0mm | $27,420.6mm | Rising (net up vs. all three lookbacks) |
| EPS Normalized (next Q — FQ3 2026) | $0.55 | $0.54 | $0.54 | $0.46 | Falling — down 14.8% just in the last month |
| Revenue (current FY — FY2026) | $101,947.4mm | $102,284.8mm | $102,551.8mm | $105,415.0mm | Rising |
| EPS Normalized (current FY — FY2026) | $2.08 | $2.04 | $2.05 | $1.83 | Falling — down 10.7% in the last month |
| Revenue (next FY — FY2027, supplemental) | $119,267.6mm | $118,138.3mm | $118,526.9mm | $119,591.9mm | Rising modestly |
| EPS Normalized (next FY — FY2027, supplemental) | $2.53 | $2.53 | $2.52 | $2.24 | Falling — down 11.1% in the last month |

Source for all rows: [EstimatesReport.xls, Trends tab]. The pattern is consistent across every horizon: **revenue estimates have been raised while profit-per-share estimates have been cut**, and most of the EPS cut happened in just the last 30 days — after the Q2 2026 print (reported Jul 22, 2026; see Section 6).

## 5. Revision Breadth

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue, FY2026 | 23 | 3 | +20 | Last month [EstimatesReport.xls, Revisions tab] |
| EBITDA, FY2026 | 5 | 7 | -2 | Last month [EstimatesReport.xls, Revisions tab] |
| EPS Normalized, FY2026 | 6 | 16 | -10 | Last month [EstimatesReport.xls, Revisions tab] |
| EPS (GAAP), FY2026 (supplemental) | 5 | 9 | -4 | Last month [EstimatesReport.xls, Revisions tab] |
| EBIT, FY2026 (supplemental) | 3 | 12 | -9 | Last month [EstimatesReport.xls, Revisions tab] |

Revenue is the only line with broad-based, net-positive revision breadth. Every profit line (EBITDA, EBIT, EPS Normalized, EPS GAAP) has more analysts cutting than raising, even one month after the Q2 print — the negative revision trend on profitability has not yet stabilized.

## 6. Historical Beat / Miss Pattern

| Period | Revenue Beat/Miss | EPS (Normalized) Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| Q3 2025 | Beat (+5.21%) | Miss (-10.71%) | Rev: Actual $28,095mm vs. Est. $26,703.6mm; EPS: Actual $0.50 vs. Est. $0.559 | [EstimatesReport.xls, Surprise tab] |
| Q4 2025 | Beat (+0.49%) | Beat (+11.11%) | Rev: Actual $24,901mm vs. Est. $24,779.9mm; EPS: Actual $0.50 vs. Est. $0.451 | [EstimatesReport.xls, Surprise tab] |
| Q1 2026 | Beat (+0.81%) | Beat (+17.14%) | Rev: Actual $22,387mm vs. Est. $22,208.1mm; EPS: Actual $0.41 vs. Est. $0.350 | Beat partly aided by a "$230 million benefit from warranty true-downs and some tariff relief" that did not repeat in Q2 [Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks; EstimatesReport.xls, Surprise tab] |
| Q2 2026 | Beat (+6.84%) | Miss (-38.89%) | Rev: Actual $28,236mm vs. Est. $26,428.5mm; EPS: Actual $0.33 vs. Est. $0.535; EBIT Actual $398mm vs. Est. $1,369.3mm (-70.9%) | Revenue beat coincided with a large profitability miss — automotive gross margin ex-credits fell sequentially from 19.2% to 16.3%, and energy gross margin fell from 39.5% to 20.4%, both flagged by the CFO as driven by non-repeating Q1 benefits plus a $240mm energy warranty true-up [Q2 2026 Earnings Call transcript, Jul 22, 2026, prepared remarks; EstimatesReport.xls, Surprise tab] |

The last four quarters show a consistent revenue-beat, margin-inconsistent pattern: four straight revenue beats, but EPS alternated miss-beat-beat-miss, with the two misses (Q3 2025, Q2 2026) both tied to margin compression rather than a volume shortfall.

## 7. Bar Assessment

**Bar is fair.** The picture is split by line item and neither half dominates cleanly enough to call it Low or High outright.

On revenue, the bar is arguably *higher* than it was: FY2026 consensus revenue has been revised up every lookback window (+20 net analyst revisions in the last month alone, from $102.6bn to $105.4bn), following four consecutive quarterly revenue beats (Section 6) — the Street has already extrapolated the recent beat streak into its model, so clearing revenue again requires a fifth straight beat against a raised number.

On profitability, the bar has just been *lowered* hard: FY2026 EPS Normalized consensus fell 10.7% in the last month (from $2.05 to $1.83) and the next-quarter (FQ3 2026) EPS Normalized estimate fell 14.8% (from $0.54 to $0.46), both cuts arriving in the two days after the Q2 2026 print missed EPS by -38.9% on a margin-driven basis (Section 6). But the revision breadth on every profit line — EBITDA, EBIT, EPS Normalized, EPS GAAP — is still net-negative even in the most recent month (Section 5), meaning analysts are still cutting, not yet done cutting: the estimate has come down, but the direction of travel has not turned, so a lower EPS bar does not by itself prove beat risk is elevated. Management's only quantified guidance point — capex "more than $25 billion" for FY2026 — is already undercut by a consensus of $26.17bn (Section 3), so the Street is modeling more spending than the stated floor, a modest incremental drag on the free-cash-flow read specifically.

Net: the earnings bar has been freshly reset for the known margin problem, but the reset is not yet complete, and the revenue bar it sits alongside has simultaneously gotten harder to clear. Neither a confident beat call nor a confident miss call is supported by the evidence available.



---

## earnings / 05_beat-miss-setup.md

_Source: `05_beat-miss-setup.md`_

# Beat / Miss Setup — TSLA

All four upstream outputs (`01_historical-financials.md`, `02_revenue-drivers.md`, `03_margin-drivers.md`, `04_guidance-consensus.md`) were read and inform this setup. Consensus data IS present (Capital IQ EstimatesReport.xls, data as of Jul-22/23-2026 [`04_guidance-consensus.md`, §1]), so this report is not capped at "Unclear" under the partial-data rule — the bar can be assessed directly.

## 1. Next Quarter Context

The next print is FQ3 2026 (three months ended Sep-30-2026), with an earnings release date of Oct-21-2026 [`04_guidance-consensus.md`, §1]. Q3 is historically a seasonally solid quarter (3-year average 26.5% of annual revenue, second only to Q4's 26.2% [`01_historical-financials.md`, §5]), but Q3 2025 — the quarter Tesla now laps for its YoY comparison — was an outlier at 29.6% of FY2025 revenue and a record 497,099 deliveries, widely attributed in public reporting (unverified, not corroborated in Tesla's own filings) to buyers pulling purchases forward ahead of the Sept 30, 2025 expiration of the federal EV tax credit [`01_historical-financials.md`, §5; `02_revenue-drivers.md`, §3, §6 cycle-position note]. Consensus for FQ3 2026 is Revenue $27,420.6mm and EPS (Normalized) $0.46 [`04_guidance-consensus.md`, §4] — a revenue figure already *below* the $28,095mm actually reported in Q3 2025, and 04's own read calls the overall bar "fair," split cleanly between a harder revenue bar and a freshly-but-incompletely-lowered EPS bar [`04_guidance-consensus.md`, §7].

## 2. Beat Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Delivery volume beat on backlog conversion | Vehicle delivery volume (biggest single revenue lever, §7 of `02`) | The "largest order backlog since 2023" [Q2 FY26 transcript, CFO] converts to deliveries faster than battery-cell supply allows, and international expansion (Other International +62% YoY in Q2) continues at a similar pace | Mid | `02_revenue-drivers.md`, §4, §7 — backlog is unquantified, so magnitude cannot be sized |
| Services / FSD attach keeps compounding | Services and other revenue, incl. FSD subscriptions | FSD (Supervised) subscriptions keep growing off the ~1.48mn base (+56% YoY) and >55% North American attach rate at time of sale continues, holding Services margin near its Q2 all-time high of 14.15% | Mid-High | `02_revenue-drivers.md`, §4, §5; `03_margin-drivers.md`, §4, §7 — this line has grown every quarter shown and carries no disclosed one-off |
| No repeat of Q2's one-off margin drags | Energy-segment one-offs (warranty true-up, tariff-benefit non-repeat) | The ~$240M Q2 warranty true-up and the absence of the >$200M Q1 tariff benefit were both one-off/non-repeating per management — if Energy margin reverts toward its Q1 39.5% print (still above the "mid-to-low 20s" long-term guide), EBIT could beat a consensus set right after the Q2 miss | Mid | `03_margin-drivers.md`, §4, §7, §8 — management explicitly separated these as one-offs on the call |
| Energy storage deployment surprises to the upside | Storage deployment volume (Megapack/Powerwall) | 13.5 GWh Q2 (+41% YoY, +53% sequentially, second-best quarter) continues on a "robust" but unquantified grid/data-center demand pipeline | Low-Mid | `02_revenue-drivers.md`, §5 — management itself calls the business "inherently lumpy... largely out of our control" |

## 3. Miss Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Tough Q3 YoY comp reasserts itself | Vehicle delivery volume / tax-credit air pocket | If the Q3 2025 delivery record (497,099) was genuinely pull-forward demand rather than a sustainable run-rate, Q3 2026 deliveries could undershoot even a consensus that is already below the Q3 2025 revenue base | Mid | `02_revenue-drivers.md`, §3, §6 (cycle-position note — "recovering from a trough, not yet a proven new run-rate peak"); `01_historical-financials.md`, §5 (unresolved Q3 2025 outlier) |
| Stock-based-compensation ramp keeps compressing EBIT/EPS | SBC tied to the 2025 CEO Performance Award + broader grants — named the single biggest margin driver in `03` | SBC continues rising as a share of revenue (2.82%→4.08% YoY in Q2 alone, a −126bps EBIT-margin drag on its own); $9.82bn of unrecognized expense remains for the now-probable tranche, to be recognized over ~9.2 more years, and a further $105.82–120.37bn sits in tranches not yet deemed probable | High | `03_margin-drivers.md`, §6, §8, §9 — quantified, disclosed, and management-guided to continue ("operating expenses... continue to grow in 2026 and beyond") |
| Regulatory-credit and Energy-margin erosion continues | Automotive regulatory credits (−67% YoY, policy-driven, non-reversing) + Energy ASP decline (competition-driven) | Credits keep shrinking toward zero and Megapack ASP keeps falling "amidst growing competition," removing more of the near-100%-margin cushion that partly offset opex growth in past quarters | High | `02_revenue-drivers.md`, §4; `03_margin-drivers.md`, §6, §7 — both explicitly labeled non-reversing / structural, not one-off |
| Battery-cell capacity constraint binds harder than modeled | Production/battery-cell capacity — named by management as "the main limiting factor to near-term vehicle production volume increase" | If the backlog cannot convert to deliveries as fast as consensus assumes, revenue could miss despite genuine demand | Mid | `02_revenue-drivers.md`, §4 — a volume cap, not a demand problem, but revenue-relevant either way |

## 4. What Magnitude Matters?

| Metric | Consensus / Bar | Material Beat Threshold | Material Miss Threshold | Why |
|---|---:|---:|---:|---|
| Revenue (FQ3 2026) | $27,420.6mm [`04`, §4] | >+3% (above the 4-quarter average beat of ~3.4%; last four beats ranged +0.49% to +6.84% [`04`, §6]) | Any miss at all — would break a 4-straight-quarter beat streak [`04`, §6] | Revenue has beaten every quarter for a year; even a small miss changes the pattern, not just the number |
| EBITDA / EBIT | FY2026 consensus EBITDA $14,096.1mm [`04`, §3]; FQ3 2026 EBIT not separately itemized here — last quarter's EBIT miss was −70.9% ($398mm actual vs $1,369.3mm est.) [`04`, §6] | Return toward the FY2025 annual EBIT margin trend (4.6% [`01`, §1]) after the 1.41% Q2 print [`03`, §4] | A repeat of a >30% EBIT miss, consistent with the structural SBC/opex drag continuing at its current pace [`03`, §8, §9] | EBIT is the metric `03` identifies as "the cleanest single number for tracking" the opex trend [`03`, §5] |
| EPS (Normalized, FQ3 2026) | $0.46, already cut 14.8% in the last month [`04`, §4] | >+15% (in line with the historically wide surprise range, e.g. +17.14% Q1 2026 [`04`, §6]) | >−15% (in line with the −38.89% Q2 2026 and −10.71% Q3 2025 misses, both margin-driven [`04`, §6]) | EPS surprises at this company have been unusually wide (−38.9% to +17.1% over the last four quarters) — a "material" band has to be wider than for a typical large-cap |
| Guidance (capex, the only quantified forward figure) | Consensus $26.17bn vs management's stated floor of ">$25bn" [`04`, §3] | Not applicable — no formal guidance is issued for revenue/EBITDA/EPS [`04`, §2] | A capex re-affirmation or increase beyond $26.17bn, which the market already expects, would be a modest incremental drag on free cash flow specifically | Cannot define a material beat/miss threshold for a metric the company does not guide |

## 5. In-Line Print But Bad Guidance Risk

| Risk | Evidence | Why It Matters |
|---|---|---|
| Revenue in line, no formal guide, but opex-growth commentary hardens | Management already says operating expenses "largely driven by R&D [will] continue to grow in 2026 and beyond" [`03_margin-drivers.md`, §9, quoting Q2 FY26 transcript] — a repeat or sharpening of this line at the Q3 call would be a soft guide-down even with no numeric guidance issued | Tesla issues no point guidance [`04`, §2], so a deterioration shows up only in qualitative tone, not a cut number — the synthesizer should watch for language, not a guidance table |
| Beat EPS/margin due to one-offs, miss quality | Q1 2026's EPS beat was explicitly aided by a "$230 million benefit from warranty true-downs and some tariff relief" that did not repeat in Q2, when EPS then missed by −38.9% [`04_guidance-consensus.md`, §6] | This exact pattern (one-off-aided beat followed by a quality-adjusted miss the next quarter) has already happened once in the last two quarters and is a real, evidenced risk, not a hypothetical |
| Beat revenue but free cash flow deteriorates further | Capex "more than doubled sequentially" to $5,789M in Q2 2026, pushing quarterly FCF negative (−$1,092M) for the first time in eight quarters shown; FY2026 capex guided ">$25bn" and rising "for the next two to three years" [`01_historical-financials.md`, §6; `03_margin-drivers.md`, §3] | A revenue beat alongside a widening capex-driven FCF drag would be a genuine quality concern the headline EPS number would not show |
| A new CEO-award milestone becomes "probable," triggering a fresh SG&A step-up | $105.82–120.37bn of unrecognized SBC expense sits in tranches "not yet deemed probable" (further delivery, FSD-subscription, Robotaxi, and Adjusted-EBITDA milestones up to $400bn) [`03_margin-drivers.md`, §9] — the same mechanism that drove the current $9.82bn tranche's expense recognition could repeat, potentially at larger scale | This is a disclosed, quantified overhang that could turn an otherwise in-line quarter into a large, non-cash margin miss with little warning |

## 6. Seasonality Read

Seasonality is a mixed-to-negative influence on the Q3 2026 setup specifically, even though Q3 is normally one of the two strongest quarters of the year (3-year average 26.5% of annual revenue [`01_historical-financials.md`, §5]). The problem is the base, not the season: Q3 2025 posted a 29.6% share and a record 497,099 deliveries, an outlier `01_historical-financials.md` flags as unexplained from the pool and `02_revenue-drivers.md` ties (via unverified public reporting) to demand pulled forward ahead of the Sept 30, 2025 federal tax-credit expiration. Because that inflated quarter is now the YoY base, "seasonally strong" this year means clearing a base that itself may not represent organic demand — which is consistent with FQ3 2026 consensus revenue ($27,420.6mm) sitting below the actual Q3 2025 print ($28,095mm) for the first time in the trailing pattern [`04_guidance-consensus.md`, §4, §6]. The seasonality table by itself is not the swing factor here; the one-time policy distortion sitting on top of it is.

## 7. Historical Pattern

Tesla has a systematic revenue-beat pattern (four straight quarterly beats, Q3 2025 through Q2 2026, ranging +0.49% to +6.84%) but no systematic EPS pattern — EPS alternated miss, beat, beat, miss over the same four quarters, and both misses (Q3 2025, Q2 2026) were tied to margin compression, not a volume shortfall [`04_guidance-consensus.md`, §6]. The synthesizer should weight the revenue-beat streak with moderate-to-high confidence, since it is backed by an independent, converging revenue-driver picture (delivery growth, geographic expansion, Services/FSD attach — `02_revenue-drivers.md`) rather than isolated one-offs. The EPS pattern should be weighted with low confidence as a repeatable bias — its two misses were each driven by identifiable, partly non-repeating items (a margin-driven surprise tied to warranty/tariff timing and the SBC ramp), so "alternating" looks more like noise around a structurally deteriorating trend line than a stable base rate to extrapolate.

## 8. Setup Verdict

**Setup is balanced.**

The single most important factor is the divergence between the two halves of the P&L: the revenue bar has been raised on a real, multi-driver demand story (delivery volume, international expansion, Services/FSD attach — `02_revenue-drivers.md`) even as it now sits against an artificially high, policy-distorted Q3 2025 base, while the profit bar has been cut hard (EPS Normalized down 10.7% for FY2026, down 14.8% for the next quarter, in the last month alone) but analyst revision breadth is still net-negative on every profit line a month later [`04_guidance-consensus.md`, §5, §7] — meaning the cut is not yet finished. The single biggest risk that could flip this balanced read toward "favors miss" is the SBC/opex ramp identified in `03_margin-drivers.md` §9 as the single biggest margin driver: it is quantified, management-guided to continue, and carries a large ($105.82–120.37bn) unrecognized overhang that could produce another lumpy step-up with little warning.

## 9. Second-Quarter Look-Ahead

The quarter after next (Q4 2026) looks structurally different mainly because its YoY base (Q4 2025, $24,901mm, 26.3% revenue share [`01_historical-financials.md`, §3, §5]) was not distorted by the tax-credit pull-forward the way Q3 2025 was — so a Q4 2026 comparison is a cleaner read on underlying demand than Q3 2026's will be. The capex ramp (guided ">$25bn" for FY2026 and "rising for the next two to three years" [`03_margin-drivers.md`, §3]) and the SBC overhang are both multi-quarter, not single-quarter, dynamics, so the margin-headwind picture described here should carry into Q4 largely unchanged; visibility beyond that is limited because Tesla issues no formal guidance for any P&L line [`04_guidance-consensus.md`, §2].

## 10. Pre-Mortem

If this setup fails, the most likely reason is that the delivery-volume "recovery" was read as a genuine new demand run-rate when it was actually still working off the tax-credit-driven distortion of Q3 2025 — a base-rate question `01_historical-financials.md` and `02_revenue-drivers.md` both flag as unresolved from the pool's own data. A second plausible reason: the SBC/opex overhang crossed a new milestone-probability threshold mid-quarter (as it did for the 2025 CEO Performance Award), producing a non-cash margin miss the revenue-driver evidence alone could not have predicted.



---

## earnings / 06_earnings-quality.md

_Source: `06_earnings-quality.md`_

# Earnings Quality — TSLA

**Jurisdiction / regime:** United States, Nasdaq Global Select Market, US GAAP, SEC filer. **Reporting currency:** USD millions unless stated. **Fiscal year end:** Dec-31. All figures in this report are GAAP unless labelled "non-GAAP" or "Adjusted." [Form 10-Q, Jun-30-2026 cover page]

**Source note (carried from upstream):** The standalone audited FY2025 10-K (Item 8 financial statements) is not in this data pool — only its Part III-only amendment (10-K/A, Apr-30-2026) and the company's own unaudited shareholder "Update" letters, which function as the earnings-release equivalent and are labelled "(Unaudited)" by the company itself. All FY2025 figures below are cited to those Update letters or to the Capital IQ (CIQ) vendor export, never mislabeled as "10-K." The Jun-30-2026 10-Q (filed and reviewed, not fully audited under US GAAP interim-review standards) is the latest filed period and is used for the most recent quarter's detail. [01_historical-financials.md §Source note]

Cash flow data is fully available (CIQ annual/quarterly Cash Flow tabs, plus the company's own quarterly statement of cash flows in each Update letter and the 10-Q) — no partial-data cap applies to this report.

---

## 1. EBITDA → CFO → FCF Bridge (5 years)

EBITDA (earnings before interest, tax, depreciation and amortization — a rough measure of operating cash-generating power before financing and accounting non-cash charges) is shown here on a **GAAP** basis (Operating Income + D&A), not the company's "Adjusted EBITDA" (defined in §4/§7). CFO = cash from operations. FCF (free cash flow — the cash left after running and re-investing in the business) = CFO − total capex, matching both this module's default definition and the company's own stated definition ("Free cash flow = operating cash flow less capital expenditures") [TSLA-Q2-2026-Update.pdf, p.24].

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (GAAP) | 9,434 | 17,235 | 13,558 | 13,027 | 10,503 | Deteriorating |
| Working capital change¹ | 667 | (3,712) | (2,248) | 81 | 642 | Volatile |
| Tax paid (cash) | (561) | (1,203) | (1,120) | (1,330) | (1,232) | Stable |
| Interest paid (cash) | (266) | (152) | (126) | (277) | (292) | Stable |
| Other operating items² | 2,223 | 2,556 | 3,192 | 3,422 | 5,126 | Deteriorating (growing plug) |
| **CFO** | **11,497** | **14,724** | **13,256** | **14,923** | **14,747** | Stable |
| Capex (total, abs.)³ | 6,514 | 7,163 | 8,899 | 11,342 | 8,527 | Volatile |
| **FCF (CFO − Total Capex)** | **4,983** | **7,561** | **4,357** | **3,581** | **6,220** | Volatile |
| **CFO / EBITDA %** | **121.9%** | **85.4%** | **97.8%** | **114.6%** | **140.4%** | Rising, but see §2 |

¹ Sum of the five cash-flow reconciling lines (change in receivables, inventory, payables, unearned revenue, other net operating assets) [Financials_Annual.xls, Cash Flow tab].
² Plug = CFO − EBITDA − Working capital change + Tax paid + Interest paid. This mechanically reconciles to CFO in every year (checked to the dollar) and is dominated by the stock-based compensation (SBC) add-back — a genuine non-cash charge already deducted inside EBITDA, so adding it back to reach CFO is standard, not a distortion. SBC alone was $2,121M / $1,560M / $1,812M / $1,999M / $2,825M in FY2021–FY2025 [Financials_Annual.xls, Income Statement tab, "Stock-Based Comp., Total"] — i.e. the plug's growth from $2,223M to $5,126M tracks SBC's near-doubling plus deferred-tax and other non-cash reconciling items, not a hidden cash inflow.
³ **Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow** if a meaningful share of capex is growth rather than maintenance spend (see §2). Beginning Q1 2025 the company redefined capex to include energy-generation/storage-system purchases and restated all prior periods on this basis [TSLA-Q1-2026-Update.pdf, p.4, fn.4] — the FY2024/FY2025 figures above are on the restated basis.

Every year in this bridge is arithmetically checked and reconciles exactly to reported CFO (to the dollar) [Financials_Annual.xls, Cash Flow tab].

**No normalisation trigger found:** the FY2021–FY2025 FCF figures above are not inflated by any single itemised one-off cash item (e.g. a large customer advance) or by a company-defined FCF add-back (interest/dividend received) — Tesla's own FCF definition matches the plain CFO-minus-capex default, so the reported figures above are also the normalised figures. The one real distortion to flag for the FCF trend is **forward-looking, not backward**: the CFO has explicitly guided capex will exceed $25 billion for full-year 2026 (more than double FY2025's $8,527M) and "will grow for the next two to three years" to fund robotaxi, Optimus, a semiconductor fab, solar manufacturing and AI compute buildout [Tesla Q2 2026 Earnings Call, Jul-22-2026, Vaibhav Taneja prepared remarks] — this pushed quarterly FCF negative for the first time in the eight quarters shown in §3 of the upstream report (Q2 2026: −$1,092M) [TSLA-Q2-2026-Update.pdf, p.3]. This is disclosed growth investment, not a hidden earnings-quality problem, but it means FY2025's $6,220M FCF is not a run-rate for 2026.

---

## 2. Cash Conversion Assessment

CFO has stayed close to or above EBITDA every year (85%–140% of EBITDA over FY2021–FY2025), which on its face clears the >70% "healthy" bar in every single year [Financials_Annual.xls, Cash Flow + Income Statement tabs]. But the ratio's recent rise is not a story of improving quality — it mixes two things going the same direction: EBITDA has shrunk every year since FY2022's $17,235M peak to $10,503M in FY2025 (a 39% drop in the denominator), while the non-cash SBC add-back inside CFO has grown from $1,560M to $2,825M over the same period (the numerator's biggest reconciling item). A CFO/EBITDA ratio rising because the EBITDA base is compressing is not the same signal as a ratio rising because collections are improving — read the 140% FY2025 figure with that caveat, not as a standalone positive. The underlying trajectory that matters more for earnings quality is that operating profit itself (EBIT margin, 16.8% in FY2022 to 4.6% in FY2025 — a drop of 1,222 basis points, i.e. hundredths of a percentage point) has fallen every year even as cash conversion of that shrinking profit pool looked fine.

---

## 3. Working Capital Trends

Days sales outstanding (DSO — how many days of sales are sitting uncollected in receivables), days inventory outstanding (DIO — days of cost of goods sold sitting in inventory) and days payable outstanding (DPO — days of cost of goods sold Tesla has not yet paid suppliers for) are computed on average balances ((opening + closing)/2), DSO against revenue, DIO and DPO against cost of goods sold (COGS) — per this module's formula rule, never COGS/DSO or revenue/DIO-DPO cross-mixing.

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 12.1 | 14.2 (+16.7%) | 17.0 (+20.4%) | Rising | **Flagged** — both years breach the >10% YoY threshold |
| Inventory days (DIO) | 61.1 | 58.3 (−4.5%) | 57.3 (−1.7%) | Falling | None — below the >15% rise threshold and moving the right way |
| Payable days (DPO) | 68.5 | 61.2 (−10.6%) | 60.7 (−0.8%) | Falling | None — Tesla is paying suppliers slightly faster, not stretching them further |
| Cash conversion cycle (DSO + DIO − DPO) | 4.7 days | 11.3 days | 13.7 days | Lengthening | Driven entirely by the DSO rise above |

Source: Accounts Receivable, Inventory and Accounts Payable balances from CIQ Financials_Annual.xls Balance Sheet tab; Revenue and COGS from the Income Statement tab [Financials_Annual.xls]. **Cross-check:** the company's own quarterly Update letter discloses DSO and DPO directly — Q4-2025 DSO = 17 days and DPO = 61 days [TSLA-Q2-2026-Update.pdf, p.27, Balance Sheet supplemental] — which matches this report's independently-computed FY2025 DSO of 17.0 and DPO of 60.7 almost exactly, validating the method.

**The DSO flag is the one genuine working-capital concern here.** Absolute days (12→17) are still low for a manufacturer and nowhere near a channel-stuffing signal on their own, but the direction is consistent and two consecutive years both clear this module's 10% YoY flag line, and it runs opposite to falling revenue (FY2025 revenue fell 2.9% while receivables grew 8.1% year-end to year-end) — receivables are growing faster than sales, which is one of the accrual-quality flags in §6. Not proven from available data whether this reflects looser payment terms to move units, growth in the FSD-subscription/financing-adjacent receivable base, or a genuinely benign mix shift; flagged for downstream review, not resolved here.

---

## 4. Non-GAAP Adjustments

The company discloses "Adjusted EBITDA (non-GAAP)," "non-GAAP net income attributable to common stockholders," and non-GAAP diluted EPS every quarter. It does not disclose a separate adjusted EBIT. [TSLA-Q2-2026-Update.pdf, p.24, non-GAAP definitions]

| Adjustment | Amount (FY2025) | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Stock-based compensation (SBC), net of tax, excluded from non-GAAP net income | $2,825M gross (pre-tax) | Y — every quarter, growing | High | [Annual_Report_TSLA-Q4-2025.pdf, p.4/24; Financials_Annual.xls] — SBC is 65% of FY2025 GAAP operating income ($2,825M / $4,355M) |
| Digital-assets (bitcoin) unrealized gain/loss excluded from Adjusted EBITDA and non-GAAP net income | Quarterly swings of roughly $100M–$300M each direction; LTM net loss ≈ $561M | Y — every quarter since the Q1'25 redefinition | Mid | [TSLA-Q2-2026-Update.pdf, p.23, fn.3: "Beginning in Q1'25, Adjusted EBITDA … is presented net of digital assets gains and losses and all prior periods have been adjusted"] |
| SpaceX equity-investment unrealized mark-to-market gain excluded from Adjusted EBITDA and non-GAAP net income | $1,005M pre-tax / ~$763M net of tax, Q2 2026 only | N so far (first occurrence, tied to the Q1 2026 $2,002M SpaceX equity purchase) — but the position is now held on the balance sheet and can mark up or down every quarter | High for the single quarter it hit | [TSLA-Q2-2026-Update.pdf, p.24, non-GAAP reconciliation; Tesla Q2 2026 Earnings Call, Jul-22-2026, Vaibhav Taneja: "Net income was positively impacted by a mark-to-market gain of $1 billion on our SpaceX holdings"] |
| Release of valuation allowance on deferred tax assets excluded from non-GAAP net income | $5,927M, Q4 2023; $274M (California-specific), Q2 2026 | Y — recurred twice in under 3 years | High | [Annual_Report_TSLA-Q4-2024.pdf, p.32, annual reconciliation table: "Release of valuation allowance on deferred tax assets (5,927)" FY2023; Form 10-Q, Jun-30-2026, Note 10 (Income Taxes): "$274 million income tax benefit" from the California SB 122 valuation-allowance release] |

**Materiality:** FY2025 Adjusted EBITDA ($14,596M) exceeds GAAP EBITDA ($10,503M) by $4,093M, or 39% — well above this module's 15% flag threshold — and the gap is driven almost entirely by SBC, which is excluded from "adjusted" earnings every single quarter. That is a real and recurring adjustment, not a one-off; it should not be read as making the "clean" number 39% better every year going forward without also weighing that SBC is a genuine cost of the business (it dilutes existing shareholders) even though it is non-cash.

---

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification | Evidence |
|---|---|---:|---|---|
| Release of valuation allowance on deferred tax assets (federal) | Q4 2023 | $5,927M non-cash tax benefit, added to GAAP net income | Genuine (disclosed, tied to a specific tax-law/realizability judgment) but materially distorts the FY2023 headline — GAAP EPS $4.30 vs non-GAAP $3.12, a 38% overstatement from this single item | [Annual_Report_TSLA-Q4-2024.pdf, p.32] |
| Automotive warranty "true-down" benefit | Q1 2026 | ~$230M favorable, did not repeat in Q2 | Genuine one-off — CFO explicitly flagged it as non-repeating: "we had highlighted in Q1 that we had a $230 million benefit from warranty true-downs and some tariff relief, which did not repeat in Q2" | [Tesla Q2 2026 Earnings Call, Jul-22-2026, Vaibhav Taneja] |
| Tariff-relief benefit | Q1 2026 | >$200M favorable, did not repeat in Q2 | Genuine one-off, same disclosure as above | [Tesla Q2 2026 Earnings Call, Jul-22-2026, Vaibhav Taneja] |
| Energy-storage warranty "true-up" charge (vendor cell issue) | Q2 2026 | ~$240M unfavorable, related to legacy deployments | Genuine but recurring risk — a **vendor** quality issue in energy storage cells that management called out by name; also visible in the accrued-warranty rollforward, where "net changes in liability for pre-existing warranties" rose to $380M in Q2 2026 from $105M in Q2 2025 | [Tesla Q2 2026 Earnings Call, Jul-22-2026; Form 10-Q, Jun-30-2026, Note 1 (Warranties)] |
| SpaceX equity-investment unrealized mark-to-market gain | Q2 2026 | $1,005M pre-tax | Genuine, non-cash, explicitly excluded from the company's own non-GAAP metrics — but it is a **related-party** holding (Tesla purchased $2,002M of SpaceX equity in Q1 2026 and separately sells Megapack products to SpaceX, $318M of revenue in Q2 2026 alone) whose future mark-to-market swings will keep hitting GAAP net income | [TSLA-Q2-2026-Update.pdf, p.24; Form 10-Q, Jun-30-2026, Note 13 (Related Party Transactions)] |
| California deferred-tax valuation-allowance release | Q2 2026 | $274M tax benefit | Genuine, disclosed, but the second valuation-allowance release in under 3 years — lowered the effective tax rate from 23% to 15% for the quarter | [Form 10-Q, Jun-30-2026, Note 10 (Income Taxes)] |
| Restructuring and other charges | Q3 2025 ($238M), Q4 2025 ($162M), FY2024 ($583M) | See amounts | **Recurring "one-off"** — restructuring charges have appeared in 5 of the last 9 fiscal years shown in the annual data (2018, 2019, 2022, 2024) plus two of the last four quarters — frequent enough that "restructuring" functions as a recurring cost line, not a true one-time event | [Financials_Annual.xls, Income Statement tab, "Restructuring Charges"; TSLA-Q2-2026-Update.pdf, p.27, Statement of Operations] |

---

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | N currently, Y historically | FY2022–FY2023: revenue grew 51.4% then 18.8% while CFO grew only 28.1% then fell 10.0% — triggered then. FY2024–FY2025: CFO held up (+12.6%, then −1.2%) better than revenue (+0.9%, then −2.9%) — not triggered in the most recent two years [Financials_Annual.xls] |
| Receivables growing faster than revenue | **Y** | FY2024: receivables +28.2% vs revenue +0.9%. FY2025: receivables +8.1% vs revenue −2.9% (revenue fell while receivables grew) — matches the DSO flag in §3 [Financials_Annual.xls, Balance Sheet + Income Statement tabs] |
| Inventory growing faster than COGS | Marginal/Y (FY2025 only) | FY2024: inventory fell 11.8% while COGS rose 1.4% — not triggered. FY2025: inventory rose 3.1% while COGS fell 3.1% — a modest 6.2-point gap, triggered but small in absolute terms [Financials_Annual.xls] |
| Deferred revenue declining (unearned revenue / contract liabilities) | N | Total deferred revenue (current + non-current) has grown every year: $3,499M (FY2021) → $4,551M → $6,115M → $6,485M → $7,055M (FY2025) → $7,500M (Jun-2026) — a positive signal for the FSD-software and extended-service-plan contract book [Financials_Annual.xls, Balance Sheet tab; TSLA-Q2-2026-Update.pdf, p.27] |
| Capitalized costs growing as % of revenue | Not proven from available data | No disclosed policy of capitalizing software/development costs beyond ordinary property, plant & equipment; capex growth is disclosed as new-facility/new-product investment (robotaxi, Optimus, semiconductor fab), not capitalized opex — no evidence found of an aggressive capitalization shift in this pool |
| Frequent accounting policy / presentation changes | **Y** | At least four distinct definitional or presentation changes inside roughly 18 months: (1) crypto-asset fair-value accounting standard (ASU 2023-08) adopted, recasting Q4'24 EPS from $0.66 to $0.60 [Annual_Report_TSLA-Q4-2025.pdf, fn.1]; (2) capex redefinition beginning Q1 2025 to include energy-storage purchases, all prior periods restated [TSLA-Q1-2026-Update.pdf, p.4, fn.4]; (3) Adjusted EBITDA redefinition beginning Q1 2025 to net out digital-assets gains/losses, all prior periods restated [TSLA-Q2-2026-Update.pdf, p.23, fn.3]; (4) "other non-current assets" reclassified beginning Q4 2025 to include goodwill/intangibles, all prior periods restated [TSLA-Q2-2026-Update.pdf, p.28, fn.2] |

---

## 7. Reported vs Adjusted Reconciliation

Basis: FY2025 full year, all figures GAAP unless labelled non-GAAP.

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | 10,503 (GAAP: Op. Income + D&A) | 14,596 (Adjusted EBITDA, non-GAAP) | +4,093 | +39.0% | Y — SBC, digital-assets gain/loss, and (from Q1'26) SpaceX gain excluded every quarter | [Annual_Report_TSLA-Q4-2025.pdf, p.4/24] |
| EBIT | 4,355 (GAAP Operating Income) | Not disclosed | N/A | N/A | N/A — the company does not publish an adjusted EBIT | [Annual_Report_TSLA-Q4-2025.pdf, p.4] |
| Net income (attributable to common) | 3,794 | 5,858 (non-GAAP) | +2,064 | +54.4% | Y — same exclusions net of tax | [Annual_Report_TSLA-Q4-2025.pdf, p.4] |
| EPS (diluted) | 1.08 | 1.66 (non-GAAP) | +0.58 | +53.7% | Y — same exclusions per share | [Annual_Report_TSLA-Q4-2025.pdf, p.4] |

For comparison, the largest historical gap in this reconciliation was FY2023: GAAP net income $14,997M vs non-GAAP $10,882M — here the *adjusted* number is **lower** than GAAP, because the $5,927M valuation-allowance tax benefit (a GAAP-only, non-recurring gain) was stripped out along with the usual SBC add-back [Annual_Report_TSLA-Q4-2024.pdf, p.32]. This is the one year in the last five where reported (GAAP) earnings quality was worse than the adjusted figure suggests, in the opposite direction from the usual SBC-driven gap.

---

## 8. Accounting Trap Checklist

Severity is inverted — higher score means a worse (more concerning) finding.

| Trap | Triggered? (Y/N) | Evidence | Severity /100 |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | SBC $2,825M FY2025 = 65% of GAAP operating income, excluded from Adjusted EBITDA and non-GAAP EPS every quarter [Financials_Annual.xls; TSLA-Q2-2026-Update.pdf, p.24] | 65 |
| Restructuring costs recur every year | Partial (recurs frequently, not literally every year) | Charges in 2018, 2019, 2022, 2024, Q3'25, Q4'25 [Financials_Annual.xls; TSLA-Q2-2026-Update.pdf, p.27] | 40 |
| Capitalized costs rising faster than revenue | N — not proven from available data | No disclosed capitalization policy shift found in this pool | 10 |
| Receivable factoring / supplier finance disclosed | N — not proven from available data | No mention of a supplier-finance or factoring program found in the 10-Q or 10-K/A text searched | 5 |
| Inventory write-downs or reserve releases | Y (small, recurring) | "Inventory and purchase commitments write-downs" of $136M/$65M/$49M/$77M/$110M in the last five quarters shown — a recurring cost, not a reversal [TSLA-Q2-2026-Update.pdf, p.27, cash flow statement] | 25 |
| Revenue recognized before cash collection risk is clear | Y (moderate) | DSO up 16.7% then 20.4% YoY over FY2024–FY2025 while revenue fell in FY2025 (§3, §6) | 35 |
| Change in useful life / depreciation assumptions | N — not proven from available data | No useful-life or depreciation-estimate change disclosed in the 10-Q or 10-K/A text searched | 10 |
| Tax rate unusually low or boosted by one-off | Y | $5,927M valuation-allowance release (Q4 2023) and $274M California valuation-allowance release (Q2 2026, cutting the quarterly effective tax rate from 23% to 15%) [Annual_Report_TSLA-Q4-2024.pdf, p.32; Form 10-Q, Jun-30-2026, Note 10] | 55 |
| Large fair-value / mark-to-market gains | Y | $1,005M pre-tax SpaceX equity unrealized gain in Q2 2026 alone, plus recurring smaller digital-assets (bitcoin) mark-to-market swings [TSLA-Q2-2026-Update.pdf, p.24] | 50 |

---

## 9. Earnings Quality Score

**Score: 58/100 — Mixed / average (41–60 band).**

The single most important reason: cash generation itself is genuinely solid — CFO has exceeded 85% of GAAP EBITDA in every one of the last five years and deferred revenue keeps growing, so there is no evidence of manufactured revenue or a collections crisis — but reported GAAP earnings have twice in under three years been materially boosted by one-off, non-operating items that the company itself excludes from its own "adjusted" numbers (the $5,927M FY2023 tax-valuation-allowance release, and the $1,005M Q2 2026 SpaceX mark-to-market gain plus a $274M tax-valuation-allowance release in the same quarter). Layer on a rising DSO trend running opposite to falling revenue, a large and growing SBC exclusion (65% of GAAP operating income), and frequent presentation/definitional restatements, and the honest read is that GAAP headline numbers need real translation work every quarter to see the recurring, cash-backed earnings power underneath — that translation work is exactly what caps this out of the "strong" (61–80) band.

---

## 10. The Single Biggest Quality Concern

The single biggest risk that reported GAAP earnings overstate the recurring, cash-backed economics of the business is the recurring pattern of large, one-off, non-operating items landing directly in GAAP net income in specific quarters — a $5,927M tax-valuation-allowance release that alone accounted for 40% of FY2023's reported net income, and, two-and-a-half years later, the same pattern repeating in miniature with a $1,005M SpaceX equity mark-to-market gain and a $274M California tax-valuation-allowance release both hitting Q2 2026 in the same quarter that free cash flow turned negative for the first time in two years. None of these are hidden — the company's own non-GAAP reconciliation calls each one out by name every time — but a reader who only looks at the GAAP headline (net income, EPS) in the quarter or year these land will see a materially better underlying earnings trend than what CFO, EBITDA, and the DSO trend actually support. The rising DSO trend (+16.7%, then +20.4% YoY, against falling revenue) is the second-largest concern and is the one flag in this report that has not yet been explained by management commentary in the available data.



---

## earnings / 07_earnings-sensitivity.md

_Source: `07_earnings-sensitivity.md`_

# Earnings Sensitivity — TSLA

**Basis:** US GAAP, USD millions except per-share and percentage rows. Base metric for dollar impacts below is **reported (GAAP) EBITDA** (Operating Income + D&A), not Adjusted EBITDA — the two are never mixed (CLAUDE.md §15). TTM = four quarters ended Jun-30-2026 [`01_historical-financials.md`, §2]. All EPS figures are a rough post-tax approximation (EBITDA/EBIT delta × (1 − 21% statutory tax) ÷ ≈3,513M diluted shares, the latter derived from FY2025 GAAP net income $3,794M ÷ GAAP diluted EPS $1.08 [`01_historical-financials.md`, §1] — **Inference, not from filings**, since no diluted share count is separately stated in the pool). This approximation ignores non-operating items (interest income, SpaceX/digital-asset mark-to-market, minority interest), so the EBITDA dollar figures are the more reliable output; EPS is directional only.

## 1. Variable Selection

The 3–7 variables below were selected from the highest-magnitude rows in `02_revenue-drivers.md` §3–4 and `03_margin-drivers.md` §6, cross-checked against `business-model/10_external-dependency.md`. Vehicle delivery volume (magnitude "High" in `02_revenue-drivers` §4) is the largest revenue lever. Stock-based compensation and the broader R&D/SG&A opex ratio (both magnitude "High" / "Mid-to-High" in `03_margin-drivers` §6, and jointly responsible for the entire −269bps EBIT-margin decline in §8 of that report) are the two largest margin levers. Automotive regulatory-credit revenue (flagged "Mid-High on margin quality despite small revenue size" in `03_margin-drivers` §6, and named the single biggest external lever in `business-model/10_external-dependency.md` §5) and FX (the company's only formally disclosed market-risk sensitivity, `business-model/10_external-dependency.md` §2, magnitude "Mid-to-High" in `02_revenue-drivers` §3) were both pre-identified by the business-model external-dependency output and are included here. Energy-segment gross margin (Megapack ASP, magnitude "Mid" but structurally headline in `03_margin-drivers` §7) rounds out the set at six variables. Interest-rate subvention cost is flagged by `business-model/10_external-dependency.md` as a "High" external dependency but carries no disclosed or derivable per-unit rate (`03_margin-drivers` §6: "not separately quantified in the pool") — it is therefore discussed qualitatively in §6 below rather than given its own sensitivity row.

## 2. Sensitivity Table

Move-size basis hierarchy applied per CLAUDE.md/module rule: (1) company-disclosed sensitivity, (2) historical observed range, (3) cited industry/guided range, (4) labeled inference. Bull/bear EBITDA impacts below are ANNUALIZED estimates (a single quarter's dollar move ×4, assuming the move is sustained across four quarters) unless noted otherwise — flagged wherever this annualization is applied, since it is itself an assumption, not a disclosed annual figure.

| Variable | Base Case | Move Basis | Bull Case | EBITDA Impact (bull) | Bear Case | EBITDA Impact (bear) | Confidence | Evidence |
|---|---|---|---:|---:|---:|---:|---|---|
| Vehicle delivery volume | 480,126 units/qtr (Q2 FY2026, record quarter) | Historical range: quarterly deliveries swung from 358,023 (Q1'26 low) to 480,126 (Q2'26) in one quarter — a ±10% quarterly swing is within the observed range | +10% → 528,139 units/qtr, sustained annualized | +$1,306M (~+$0.29 EPS) | −10% → 432,113 units/qtr, sustained annualized | −$1,306M (~−$0.29 EPS) | Low (move size Medium/historical; $-per-unit coefficient is an inferred derivation — see below) | Deliveries and automotive-sales revenue-per-unit ($20,006M ÷ 480,126 = $41,665/unit) from `TSLA-Q2-2026-Update.pdf`, p.5 and `02_revenue-drivers.md` §7; incremental margin proxied at the automotive gross margin ex-credits, 16.3% Q2'26 [`03_margin-drivers.md` §7] — **Inference, not from filings**: ignores fixed-opex operating leverage (see §6) |
| Stock-based compensation — new milestone tranche becomes probable | $0 newly probable beyond the current 2025 CEO Performance Award tranche (which already carries $9.82bn of unrecognized expense, being recognized over ~9.2 more years) | Inference from disclosed unrecognized-expense pool: $105.82bn–$120.37bn of further tranches (vehicle-delivery, FSD-subscription, Robotaxi, Adjusted-EBITDA milestones) are "not yet deemed probable"; illustrative $15bn tranche size assumed (≈1/7–1/8 of the disclosed pool), same 9.2-year recognition period as the current tranche | No new tranche becomes probable in the next 12 months | $0 (no incremental drag beyond the current run-rate) | A ~$15bn tranche becomes probable, recognized over ~9.2 years | −$1,630M (~−$0.37 EPS) | Low — tranche size and recognition speed are both assumed, not disclosed | `FY26 Q2 10-Q, Note 9` (Stock-Based Compensation: $9.82bn unrecognized/~9.2yr for the probable tranche; $105.82bn–$120.37bn unrecognized for not-yet-probable tranches); `03_margin-drivers.md` §9 |
| R&D + SG&A (ex-SBC) as % of revenue | 11.34% of revenue (Q2 FY2026), up from 10.31% (Q2 FY2025) | Historical range: the ratio moved 103bps in one year (Q2'25→Q2'26) — used as the swing size in both directions | Ratio reverts to 10.31% (−103bps, back to year-ago level) | +$1,067M (~+$0.24 EPS) | Ratio worsens another 103bps to ~12.37% | −$1,067M (~−$0.24 EPS) | Medium — historical range is directly disclosed; the bps-to-dollar coefficient is a straightforward ratio-to-revenue calculation, not a company-stated per-bp rate | `FY26 Q2 10-Q, Item 2 MD&A` (R&D +49% YoY, SG&A +45% YoY, both roughly double revenue's +25.5% growth); dollar figures ($2,320M→$3,202M ex-SBC opex) and bps calc from `03_margin-drivers.md` §8; annualized using TTM revenue $103,619M [`01_historical-financials.md` §2] |
| FX (USD trade-weighted move, all currencies) | 0% move from current levels (Jun-30-2026 balance-sheet date) | Company-disclosed: a 10% simultaneous adverse move across all non-USD currencies swings pre-tax income $1.64bn (measured Jun-30-2026) | USD weakens 10% | +$1,640M pre-tax income (~+$0.37 EPS) | USD strengthens 10% | −$1,640M pre-tax income (~−$0.37 EPS) | High — company-disclosed, exact figure | `FY26 Q2 10-Q, Item 3` (Quantitative and Qualitative Disclosures About Market Risk); roughly half of revenue sits in unhedged foreign currency (mainly yuan and euro), `business-model/10_external-dependency.md` §1 |
| Energy Generation & Storage gross margin | 20.4% (Q2 FY2026), down from 30.3% (Q2'25) and from 39.5% (Q1'26, one-off boosted) | Company-guided range: management's own "long-term normalized" target is "mid- to low 20% range," against which the current 20.4% print already sits near the bottom | Margin reverts to 25% (mid-20s, +460bps) | +$587M (~+$0.13 EPS) | Margin declines further to ~18% on continued Megapack ASP competition (−240bps) | −$306M (~−$0.07 EPS) | Medium — the target range is company-disclosed; the bps-to-dollar coefficient (using FY2025 Energy revenue $12,771M as the annualized base) is a derived calculation, and Tesla does not allocate opex by segment so the pass-through to consolidated EBITDA is assumed 1:1 | Q2 FY2026 transcript, prepared remarks (Vaibhav Taneja) — "$240 million" Q2 warranty true-up, ">$200 million" Q1 tariff benefit that "did not repeat," "mid- to low 20% range" guide; `03_margin-drivers.md` §6–7; Energy revenue $12,771mn FY2025 [`business-model/10_external-dependency.md` §1] |
| Automotive regulatory-credit revenue | $146M/qtr (Q2 FY2026), down 67% YoY from $439M (Q2'25); ≈$584M annualized run-rate | Company-disclosed decline rate (−67% YoY) plus the company's own characterization of this revenue as "historically close to 100%-margin" | Decline stabilizes — no further loss from the current run-rate | $0 (flat vs. current run-rate) | Program fully phased out to $0 | −$584M (~−$0.13 EPS) | Medium — the dollar trend and near-100%-margin characterization are company-disclosed; the "floor at $0 / stabilizes at current level" bull/bear framing is inferred, since the program is policy-driven and non-reversing | `FY26 Q2 10-Q, Item 2 MD&A` — "Recent governmental and regulatory actions have restricted certain regulatory credit programs tied to our products"; `02_revenue-drivers.md` §4; `03_margin-drivers.md` §6 |

**Interest-rate subvention cost** (flagged "High" external dependency in `business-model/10_external-dependency.md` §1, since Tesla subsidizes below-market vehicle financing and books the cost upfront against automotive revenue): **Impact: not quantifiable.** Management states rising rates "had a negative impact on automotive margins" [Q2 FY2026 transcript, prepared remarks] but no dollar figure, per-unit rate, or historical time series for this specific cost is disclosed anywhere in the pool — `03_margin-drivers.md` §6 independently reaches the same conclusion ("Low-to-Mid, not separately quantified in the pool"). Not proven from available data.

## 3. Sensitivity Ranking

| Rank | Variable | Absolute Impact (avg of bull + bear, $M annualized EBITDA-equivalent) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | FX (USD trade-weighted move) | 1,640 | Currently a tailwind (weaker USD); unhedged and can reverse without warning |
| 2 | Vehicle delivery volume | 1,306 | Improving (record Q2 2026, +25% YoY) but recovering from a policy-driven air pocket, not a proven new peak |
| 3 | R&D + SG&A (ex-SBC) opex ratio | 1,067 | Deteriorating — management guides continued growth into 2026 and beyond |
| 4 | Stock-based compensation — new tranche probability | 815 | Currently stable (no new tranche flagged probable this quarter) but the pool of not-yet-probable tranches ($105.8bn–$120.4bn) is large and one-directional |
| 5 | Energy segment gross margin | 447 | Deteriorating (structural ASP decline plus one-off warranty/tariff timing) |
| 6 | Automotive regulatory-credit revenue | 292 | Deteriorating, policy-driven, non-reversing |

## 4. The Single Highest-Sensitivity Variable

**FX** is the single largest quantified swing factor: a company-disclosed 10% adverse move across all non-USD currencies (roughly half of Tesla's revenue base, mainly Chinese yuan and euro) moves pre-tax income by $1.64bn [`FY26 Q2 10-Q, Item 3`], the largest single-variable dollar swing of the six tested here. Its current direction is a tailwind — a weaker US dollar added a constant-currency-adjusted $0.5bn to Q2 2026 revenue YoY [`TSLA-Q2-2026-Update.pdf`, p.25] — but this is a currency effect, not organic demand, and Tesla does not hedge it [`FY26 Q2 10-Q, Item 3`]. This is entirely external — Tesla does not control global FX markets — and the swing to the adverse case requires nothing more than a broad US-dollar strengthening (e.g., a hawkish Federal Reserve shift or a global risk-off dollar rally), which would mechanically reverse the current tailwind and cut pre-tax income by the same $1.64bn per 10% move.

## 5. Interaction Effects

Several of these variables move together rather than independently. First, **vehicle delivery volume and automotive regulatory-credit revenue are correlated through the same policy event**: the OBBBA's Sept 30, 2025 expiration of the federal EV tax credit both cut the regulatory-credit revenue line (−67% YoY) and, per public reporting not confirmed in Tesla's own filings, likely pulled forward Q3 2025 deliveries and hollowed out Q4 2025/Q1 2026 [`02_revenue-drivers.md` §3, §6 cycle-position note — Inference, not from filings]. A further adverse policy move (e.g., additional EV-incentive rollback) would plausibly hit both variables in the same direction at once, not independently. Second, **the SBC new-tranche variable is mechanically linked to vehicle-delivery and FSD-subscription growth**: several of the not-yet-probable CEO Performance Award milestones are themselves tied to vehicle-delivery and FSD-subscription counts [`FY26 Q2 10-Q, Note 9`], so strong operational execution on deliveries/FSD — which is a bull case for the volume variable — simultaneously raises the odds that a new SBC tranche becomes probable, a bear case for the margin variable. Good delivery news and bad SBC news can arrive together. Third, **FX and the consumer demand cycle correlate loosely**: a broad US-dollar strengthening (the FX bear case) has historically coincided with weaker global growth and tighter global financial conditions, which would also pressure the "Other International" markets that drove ~70% of Q2 2026's revenue growth [`02_revenue-drivers.md` §6] — a compounding, not additive, downside risk.

## 6. Non-Linear Or Asymmetric Risks

- **Operating deleverage on volume.** The vehicle-delivery-volume estimate in §2 assumes the automotive gross margin rate (16.3%) applies symmetrically to both a 10% increase and a 10% decrease in deliveries. In practice R&D and SG&A are largely fixed in the near term — management guides that opex "largely driven by R&D" will "continue to grow in 2026 and beyond" regardless of volume [Q2 FY2026 transcript, prepared remarks] — so a delivery decline likely hits EBITDA margin harder than a same-size delivery increase helps it. The symmetric figures in §2 should be read as a floor on the downside case, not a balanced estimate.
- **Stock-based compensation and regulatory credits are structurally one-directional.** Both variables have a "bull case" of $0 (no further loss / no new tranche) rather than a genuine upside, because SBC milestones do not become "un-probable" once triggered, and the regulatory-credit program is being phased out by enacted law, not by a reversible market condition [`03_margin-drivers.md` §6, §9]. The downside tail is real and quantified; the upside tail is capped at "stops getting worse."
- **Energy-segment one-offs are lumpy, not smooth.** The Q2 FY2026 quarter alone carried a ~$240M warranty true-up and the absence of a >$200M Q1 tariff benefit — a combined ~$440M swing inside a single quarter, separate from the structural ASP-decline trend modeled in §2 [Q2 FY2026 transcript, prepared remarks]. Any given quarter can therefore land well outside the smooth bps-based estimate in §2.
- **Covenant / leverage risk:** not applicable — Tesla carries negative net debt on the strict basis through FY2025 and only a small $861M of net debt (strict) at Jun-30-2026, against $27.4bn of net cash on the broad basis [`01_historical-financials.md` §2] — no covenant-breach non-linearity is evidenced in the pool.

## 7. Earnings Volatility Score

**68/100** (inverted: higher = WORSE / more sensitive to small input changes — High volatility band, 61–80).

Reason: three of the six tested variables (SBC new-tranche probability, R&D/SG&A opex ratio, automotive regulatory credits) are structurally one-directional headwinds with no offsetting upside case, and together with FX (the largest single quantified swing, $1.64bn per 10% move, entirely external and unhedged) and a volume base that is still recovering from a policy-driven air pocket rather than a proven new demand peak, earnings can swing by more than $1bn annualized from several independent levers moving only modestly. The score is not higher (81–100) because Tesla retains real, evidenced management levers — automotive gross margin held "approximately flat" ex one-offs in Q2 FY2026, and Services/FSD margin improved to an all-time high — consistent with `business-model/10_external-dependency.md`'s own "partly, not mostly, externally driven" read (58/100).



---

## earnings / 08_earnings-red-flags.md

_Source: `08_earnings-red-flags.md`_

# Earnings Red Flags — TSLA

All eight upstream earnings outputs (`00` through `07`) are present and were read. Business-model cross-module outputs (`03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`, `12_red-flags-sweep.md`, `99_business-model-synthesis.md`) are also present and were read. No upstream output is missing — this scan proceeds at full confidence on data completeness.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 02_revenue-drivers | Record Q2 2026 deliveries (480,126, +25% YoY) and "largest order backlog since 2023" | `TSLA-Q2-2026-Update.pdf, p.5`; Q2 FY26 transcript, CFO prepared remarks | High on deliveries; Low on backlog (unquantified) |
| 04_guidance-consensus / 02_revenue-drivers | Four consecutive quarterly revenue beats (Q3'25–Q2'26, +0.49% to +6.84%); FY2026 consensus revenue raised in every lookback window (+20 net analyst revisions in the last month) | `EstimatesReport.xls, Surprise/Trends tabs` | High |
| 02_revenue-drivers | Services and other revenue +50% YoY; FSD (Supervised) subscriptions ~1.48M (+56% YoY); Services gross margin hit an all-time high of 14.15% | `FY26 Q2 10-Q, MD&A, p.31`; Q2 FY26 transcript | High |
| 02_revenue-drivers | "Other International" revenue +62% YoY — read as genuine new-market share gain, not a broad tailwind, since China (largest EV market) grew far more slowly | `FY26 Q2 10-Q, Note 14` | Medium-High |
| 01_historical-financials / 06_earnings-quality | CFO exceeded 85% of GAAP EBITDA every year FY2021–FY2025 (140% in FY2025); deferred revenue grew every year — no evidence of manufactured revenue or a collections crisis | `Financials_Annual.xls, Cash Flow/Income Statement tabs` | High |
| 01_historical-financials | Net cash positive on the strict basis every year through FY2025; ~$27.4bn net cash on the broad basis (incl. short-term investments) at Jun-30-2026 — no covenant or solvency risk evidenced | `Financials_Quarterly.xls, Balance Sheet tab`; `TSLA-Q2-2026-Update.pdf, p.3` | High |
| 03_margin-drivers | Management labels the Q2 2026 Energy-segment margin drags (warranty true-up, tariff-benefit non-repeat) as one-offs, implying a possible partial bounce-back | Q2 FY26 transcript, prepared remarks | Medium |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials / 03_margin-drivers | EBIT margin fell every year from 16.8% (FY2022) to 4.6% (FY2025), and to 1.41% in Q2 2026 alone | `Financials_Annual.xls, Income Statement tab`; `FY26 Q2 10-Q, Item 1` | High |
| 03_margin-drivers | Stock-based compensation (SBC) ramp is the single biggest margin driver (−126bps of the −269bps Q2'26 EBIT-margin decline); $105.82bn–$120.37bn of unrecognized SBC expense sits in CEO Performance Award tranches "not yet deemed probable" | `FY26 Q2 10-Q, Note 9` | High |
| 04_guidance-consensus | Revision breadth is net-negative on every profit line (EBITDA, EBIT, EPS Normalized, EPS GAAP) a full month after the Q2 print, even though EPS Normalized was already cut 10.7% (FY2026) and 14.8% (next quarter) | `EstimatesReport.xls, Revisions/Trends tabs` | High |
| 02_revenue-drivers / 05_beat-miss-setup | The Q3 2025 delivery record (497,099) may reflect federal EV tax-credit pull-forward ahead of the Sept 30, 2025 expiration, making the Q2 2026 "rebound" partly a normalization off a policy-distorted trough rather than a proven new demand peak | Web: Yahoo Finance/Fortune, Oct 2025 (unverified) — **Inference, not from filings**; not corroborated in Tesla's own filings | Medium |
| 06_earnings-quality | Two large one-off, non-operating items materially inflated GAAP net income within 3 years: a $5,927M FY2023 tax-valuation-allowance release (40% of that year's reported net income) and a Q2 2026 combination of a $1,005M SpaceX equity mark-to-market gain plus a $274M California tax-valuation-allowance release | `Annual_Report_TSLA-Q4-2024.pdf, p.32`; `Form 10-Q, Jun-30-2026, Note 10` | High |
| 06_earnings-quality | Receivable days (DSO) rose 16.7% then 20.4% YoY (FY2024, FY2025) while revenue fell in FY2025 — receivables growing faster than sales, unexplained in the pool | `Financials_Annual.xls, Balance Sheet/Income Statement tabs` | Medium |
| 07_earnings-sensitivity | Earnings volatility score 68/100 (inverted, High band) — three of six tested variables (SBC tranche probability, R&D/SG&A opex ratio, regulatory credits) are structurally one-directional headwinds with no offsetting upside case | `07_earnings-sensitivity.md`, §7 | High |
| business-model/12_red-flags-sweep | An unresolved federal securities-fraud class action names Tesla, Elon Musk, and named executives personally over alleged misrepresentation of Autopilot/FSD (Supervised)/Robotaxi effectiveness — the exact narrative underlying the Services/FSD growth story that `02_revenue-drivers` treats as a key forward driver | `Q2 FY26 10-Q, Note 11 (Commitments and Contingencies)` | Medium (case is unresolved; existence and pending motion-to-dismiss are fact) |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| Standalone audited FY2025 10-K (Item 8 financial statements) | 00_earnings-data-triage; carried by 01, 06 | All FY2025 full-year GAAP figures rest on the company's own unaudited "Update" letter or the CIQ vendor export, not an audited filing — no cap applied by triage, but this is a genuine reliability gap for annual (not quarterly) numbers |
| Quantified order-backlog figure ("largest since 2023") | 02_revenue-drivers | The single largest disclosed forward demand signal cannot be sized — the bull case for continued delivery growth rests on unquantifiable management language |
| Segment-level operating expense / EBIT allocation | business-model/03_segment-map; carried by 03_margin-drivers | Segment margin analysis is gross-margin only; true segment-level ROIC or operating profitability (especially for the fast-changing Energy segment) cannot be computed from disclosure |
| Quantified interest-rate subvention cost | 03_margin-drivers; 07_earnings-sensitivity | A "High" external dependency (business-model/10_external-dependency) has zero disclosed dollar sensitivity — the 68/100 volatility score in `07` may understate true exposure |
| Robotaxi / Cybercab / Optimus standalone revenue | 02_revenue-drivers; business-model/03_segment-map | Cannot separate real, monetizable progress from pre-revenue narrative in a business area management repeatedly cites as a growth driver |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 01_historical-financials / 02_revenue-drivers | "Whether this is a genuine re-acceleration or a seasonal/one-quarter bounce is not resolved by this agent" [01, §6]; the Q2 2026 rebound is "recovering from a trough, not yet a proven new run-rate peak" [02, §6] | 05_beat-miss-setup | "The synthesizer should weight the revenue-beat streak with moderate-to-high confidence, since it is backed by an independent, converging revenue-driver picture" [05, §7] | Y — these are answers to two different questions (durability of underlying demand vs. evidentiary support for the beat *pattern*), not a true conflict | Both are individually defensible, but 01/02's caution on demand durability is the more conservative read per CLAUDE.md §4 and should govern how the synthesizer frames the revenue-side "improving" verdict — a beat streak built on real drivers can still sit on top of an unresolved demand-base question |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Standalone audited FY2025 10-K (Item 8) absent from pool — only Part III-only 10-K/A and unaudited Update letters stand in | Triggered | Low | High | `00_earnings-data-triage.md`, §5; `01_historical-financials.md`, Source note | No hard cap applies (triage verdict: Sufficient), but every FY2025 annual figure traces to an unaudited company letter or a vendor export, not an audited filing — a genuine, if modest, reliability gap for full-year (not quarterly) numbers |
| No segment-level operating-expense / EBIT allocation (Tesla discloses only revenue, cost of revenue, and gross profit by segment) | Triggered | Medium | High | `business-model/03_segment-map.md`, §3; `03_margin-drivers.md`, §1 | Segment margin reads in `03` are gross-margin only; true segment profitability (especially the volatile Energy segment) cannot be verified from disclosure |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Q2 2026 revenue re-acceleration (+25.5% YoY) follows two quarters of decline (Q4'25, Q1'26) and a policy-distorted Q3'25 peak — genuine new demand run-rate vs. one-quarter bounce is unresolved | Triggered | High | Medium | `01_historical-financials.md`, §5–6; `02_revenue-drivers.md`, §6 (Cycle-Position note) | If the rebound is partly normalization rather than new demand, the revenue-side "improving" read that underlies the beat streak is overstated |
| EBIT margin has decelerated every year for three straight years (16.8%→4.6%, FY2022–FY2025) while the most recent quarter's revenue print reads as an acceleration — risk that the two trends get conflated into one "earnings accelerating" story | Triggered | High | High | `01_historical-financials.md`, §1, §6; `03_margin-drivers.md`, §4 | A synthesis that leads with the revenue beat streak without netting in the margin trajectory would overstate the earnings setup |
| EBITDA margin deteriorated QoQ (11.3% Q1'26 → 7.1% Q2'26) even as revenue grew QoQ (+26.1%) | Triggered | Medium | High | `01_historical-financials.md`, §3 | Shows the revenue and margin trends are already diverging quarter to quarter, not just year to year |
| Q3 2025 revenue share (29.6% of FY2025 revenue) was a clear 3-year outlier versus Q3 2023 (24.1%) and Q3 2024 (25.8%), with no cause found in the pool's transcripts — and this inflated quarter is the YoY base for the next reported quarter (Q3 2026) | Triggered | High | Medium | `01_historical-financials.md`, §5; `05_beat-miss-setup.md`, §1, §6 | Directly affects the very next print: FQ3 2026 consensus revenue ($27,420.6mm) already sits below the actual Q3 2025 print ($28,095mm) |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Vehicle delivery "recovery" may reflect a federal EV tax-credit pull-forward/hollow-out cycle rather than organic re-acceleration | Triggered (labeled inference) | High | Medium | Web: Yahoo Finance/Fortune, Oct 2025 (unverified) — **Inference, not from filings**; `02_revenue-drivers.md`, §3, §6 | The single biggest revenue driver (delivery volume) carries an unresolved demand-durability question |
| Order backlog ("largest since 2023") is the main disclosed forward demand signal but carries no unit or dollar figure | Triggered | Medium | High | Q2 FY26 transcript, CFO prepared remarks; `02_revenue-drivers.md`, §4 | The bull case's central forward driver cannot be sized or independently verified |
| Related-party sales to SpaceX ($318M in Q2 2026, ~10% of the ~$3.1bn Energy segment revenue) sit inside the Energy segment's reported growth, but are not flagged as related-party in `02_revenue-drivers`'s driver analysis | Triggered | Medium | High | `06_earnings-quality.md`, §5 (citing `Form 10-Q, Jun-30-2026, Note 13`) | A meaningful share of one segment's reported growth is transacted with a CEO-controlled counterparty, not disclosed as such where the revenue-driver story is told |
| Growth this quarter is concentrated in smaller international markets (South Korea, Australia, Colombia, Japan, Taiwan, Thailand, Portugal, Philippines, Chile, Slovenia, Lithuania) whose ASP and durability are not broken out | Triggered | Medium | Medium | `02_revenue-drivers.md`, §3 | Real share gain today, but scalability and per-unit economics of this mix shift cannot be verified from disclosure |
| Automotive regulatory-credit revenue (near-100%-margin) fell 67% YoY, structurally non-reversing under enacted policy | Triggered | Medium | High | `FY26 Q2 10-Q, Item 2 MD&A`; `02_revenue-drivers.md`, §4 | Small dollar drag but removes a high-margin cushion that has partly offset opex growth in the past |
| Robotaxi/FSD is repeatedly cited as a forward driver with zero standalone revenue-line disclosure, and is simultaneously the subject of an unresolved federal securities-fraud class action alleging misrepresentation of its effectiveness | Triggered | High | Medium | `02_revenue-drivers.md`, §4, §7; `business-model/12_red-flags-sweep.md`, §2–3 | A narrative driver the earnings module treats as forward optionality is, per the business-model module, also active litigation risk that could affect disclosure or credibility of the same claims |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Stock-based-compensation ramp (2025 CEO Performance Award + broader grants) is the single biggest identified margin driver, management-guided to keep growing, with $105.82bn–$120.37bn of unrecognized expense in tranches "not yet deemed probable" | Triggered | High | High | `FY26 Q2 10-Q, Note 9`; `03_margin-drivers.md`, §8–9 | This is a quantified, ongoing, one-directional EBIT-margin headwind that already explains most of the Q2 2026 EBIT-margin decline |
| Energy-segment one-off items (a ~$240M warranty true-up, a >$200M Q1 tariff benefit that did not repeat) make the segment's true underlying margin trend hard to read even as management's own long-term guide (mid-to-low 20s%) sits below the trailing prints | Triggered | Medium | High | Q2 FY26 transcript, prepared remarks; `03_margin-drivers.md`, §7 | A segment already flagged as lumpy adds one-off noise on top of a structural ASP-decline trend |
| D&A has not yet caught up with the capex ramp (capex more than doubled sequentially; FY2026 guided >$25bn, "rising for the next two to three years") — a forward margin headwind not yet visible in the current D&A/revenue ratio | Triggered | Medium | High | `01_historical-financials.md`, §6; `03_margin-drivers.md`, §3, §6 | The current D&A ratio understates the eventual margin drag once the new capacity is placed in service |
| Battery-cell/new-factory capacity utilization is unknown — new capacity ramps could be depressing near-term unit economics before volume catches up, but no utilization rate is disclosed | Unclear | Medium | Unknown | `03_margin-drivers.md`, §6; `business-model/02_business-identity.md`, §3a | Cannot rule in or out a hidden near-term margin drag tied to underused new capacity |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Tesla issues no point guidance for revenue, EBITDA, or EPS — the only quantified forward figure is a capex floor | Triggered | Medium | High | `04_guidance-consensus.md`, §2 | Beat/miss assessment relies entirely on Street consensus with no company-anchored number to validate against, beyond capex |
| Revision breadth is net-negative on every profit line (EBITDA −2, EBIT −9, EPS Normalized −10, EPS GAAP −4) a full month after the Q2 print, even after EPS Normalized was already cut 10.7%–14.8% | Triggered | High | High | `04_guidance-consensus.md`, §4–5 | The estimate reset for the known margin problem is not yet finished — the direction of travel is still down |
| EPS beats have been aided by one-off items in at least one of the last four quarters (Q1'26 warranty/tariff benefit), immediately followed by a large miss (Q2'26, −38.9%) once the one-off reversed | Triggered | Medium | High | `04_guidance-consensus.md`, §6 | Reduces confidence that any single-quarter EPS beat reflects a repeatable trend rather than timing noise |
| Consensus capex ($26.17bn) already sits above management's stated floor (>$25bn) | Triggered | Low | High | `04_guidance-consensus.md`, §3 | A modest, already-priced incremental drag on the free-cash-flow line specifically |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| `05_beat-miss-setup` calls the setup "balanced," but its own scenario tables rate 2 of 4 miss scenarios "High" likelihood (SBC ramp continuing; regulatory-credit/Energy-margin erosion) versus 0 of 4 beat scenarios rated above "Mid-High" | Triggered | Medium | Medium | `05_beat-miss-setup.md`, §2–3 | The headline "balanced" framing may understate a miss-lean implicit in the agent's own probability labels — the synthesizer should read the underlying table, not just the verdict sentence |
| No formal guidance means any margin deterioration would surface only as a management tone shift, not a guidance cut the market can price ahead of time | Triggered | Medium | Medium | `05_beat-miss-setup.md`, §5 | An in-line or beat print could still mask a soft guide-down that is easy to miss without close attention to call language |
| EPS surprise range over the last four quarters is unusually wide (−38.9% to +17.1%) | Triggered | Medium | High | `04_guidance-consensus.md`, §6; `05_beat-miss-setup.md`, §4 | Makes any single "material beat/miss" threshold less reliable than for a typical large-cap |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Stock-based compensation is excluded from adjusted earnings and equals 65% of FY2025 GAAP operating income | Triggered | High | High | `06_earnings-quality.md`, §4, §8 | "Adjusted" earnings materially overstate the cash-diluting cost of the business's actual compensation structure |
| Two large one-off, non-operating items materially inflated GAAP net income at different points within 3 years: a $5,927M FY2023 tax-valuation-allowance release (40% of that year's net income) and a Q2 2026 combination of a $1,005M SpaceX mark-to-market gain plus a $274M CA tax-valuation-allowance release | Triggered | High | High | `06_earnings-quality.md`, §5, §7, §10 | A reader looking only at the GAAP headline in the quarter/year these land sees a materially better trend than CFO, EBITDA, and DSO actually support |
| Receivable days (DSO) rose 16.7% then 20.4% YoY (FY2024, FY2025) while revenue fell in FY2025 — unexplained by management commentary in the pool | Triggered | Medium | High | `06_earnings-quality.md`, §3, §6, §10 | The one accrual-quality flag in the report that has not been resolved by any disclosed explanation |
| At least four distinct accounting policy / presentation changes inside ~18 months (crypto-asset standard adoption, capex redefinition, Adjusted EBITDA redefinition, balance-sheet reclassification), each restating prior periods | Triggered | Medium | High | `06_earnings-quality.md`, §6 | Makes clean period-over-period comparison harder without careful reconciliation to the restated basis each time |
| Related-party mark-to-market gain ($1.005bn SpaceX equity, Q2 2026) and related-party revenue ($318M Megapack sales to SpaceX) both hit GAAP results in the same reporting window as a negative FCF print | Triggered | Medium | High | `06_earnings-quality.md`, §5; `Form 10-Q, Jun-30-2026, Note 13` | A portion of the quarter's reported profitability and top-line growth is transacted with a CEO-controlled counterparty |
| Quarterly free cash flow turned negative for the first time in the eight quarters shown (−$1,092M, Q2 2026) on a capex ramp guided to continue 2–3 more years | Triggered | Medium | High | `01_historical-financials.md`, §6; `06_earnings-quality.md`, §1 | Disclosed growth investment, not a hidden problem, but it means FY2025's $6,220M FCF is not a run-rate for FY2026 |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Earnings volatility scored 68/100 (inverted, High band) — three of six tested variables (SBC tranche probability, R&D/SG&A opex ratio, regulatory credits) are structurally one-directional headwinds with no offsetting upside case | Triggered | High | High | `07_earnings-sensitivity.md`, §6–7 | Earnings can swing by more than $1bn annualized from several independent levers moving only modestly, most of them tilted downward |
| FX is the single largest quantified swing ($1.64bn per 10% move), entirely external, unhedged, and currently a tailwind that can reverse without warning | Triggered | High | Medium | `FY26 Q2 10-Q, Item 3`; `07_earnings-sensitivity.md`, §4 | The largest single-variable dollar impact in the sensitivity set is outside management's control |
| Multiple variables are likely to move together adversely: policy rollback hits both delivery volume and regulatory credits at once; dollar strength correlates with weaker global growth in the same "Other International" markets driving Q2 2026 growth; strong delivery/FSD execution simultaneously raises the odds of a new SBC tranche becoming probable | Triggered | Medium | Medium | `07_earnings-sensitivity.md`, §5 | The downside case is compounding, not additive — several levers can move the wrong way in the same quarter |
| Symmetric bull/bear sensitivity estimates likely understate true downside because R&D/SG&A are largely fixed near-term (operating deleverage), so a delivery decline would hit margin harder than a same-size increase helps it | Triggered | Medium | Medium | `07_earnings-sensitivity.md`, §6 | The reported sensitivity table should be read as a floor on the downside case, not a balanced estimate |
| Interest-rate subvention cost — a "High" external dependency per the business-model module — carries no disclosed dollar sensitivity anywhere in the pool | Unavailable | Medium | Unknown | `03_margin-drivers.md`, §6; `07_earnings-sensitivity.md`, §2; `business-model/10_external-dependency.md`, §1 | The 68/100 volatility score may understate true exposure since this variable could not be quantified at all |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| CIQ Financials_Quarterly.xls "Operating Income" diverges from the company's own Update-letter "Income from operations" for Q3 2025 (CIQ $1,862M vs company $1,624M) and Q4 2025 (CIQ $1,171M vs company $1,409M), cause unexplained | Triggered | Medium | High | `01_historical-financials.md`, Reconciliation flag | Correctly resolved per the source hierarchy (company figures used throughout), but the ~$238M/quarter gap itself remains an unexplained vendor-vs-filing discrepancy for those two quarters |
| Mild difference in confidence calibration between `01`/`02` (cautious: whether the Q2 2026 revenue rebound is genuine is unresolved) and `05` (more confident: weights the revenue-beat streak "moderate-to-high") | Unclear | Low | Medium | See Contradictions table above | Not a hard contradiction, but the synthesizer should be explicit about which framing it adopts rather than blending both silently |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Risk that the master synthesis reads "record Q2 revenue / four straight beats" as "earnings accelerating" without netting in the structurally worsening EBIT margin, the still-falling EPS estimates, and the 68/100 volatility score | Triggered | Medium | Medium | Synthesis of `01`, `03`, `04`, `07` findings above | Would overstate the earnings setup relative to what the full evidence pool actually supports; `05`'s own verdict is "balanced," not "accelerating," and the master synthesis should not upgrade past that without new evidence |
| The bull case (order backlog, robotaxi optionality, FSD attach durability) leans on qualitative management language rather than disclosed, sizable numbers | Triggered | Medium | High | `02_revenue-drivers.md`, §4, §7 | Reduces the reliability of the improving-revenue narrative as a forward-looking claim, even though the trailing print is real |
| The autonomous-driving/robotaxi/FSD narrative that underlies the Services growth story is the subject of an unresolved federal securities-fraud class action — a fact surfaced only in the business-model module, not referenced anywhere in the earnings module's own driver analysis | Triggered | High | Medium | `business-model/12_red-flags-sweep.md`, §2–3 | A material narrative risk to the same growth story `02_revenue-drivers` treats as a key driver is invisible if the synthesizer reads only the earnings module in isolation |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Historical Trend | Q2 2026 revenue re-acceleration may be normalization off a policy-distorted trough, not a proven new demand peak | Triggered | High | Medium | Revenue-side "improving" read may be overstated |
| 2 | Historical Trend | EBIT margin decelerated every year for 3 straight years while the latest quarter's revenue reads as an acceleration | Triggered | High | High | Risk of conflating a revenue beat with an accelerating earnings setup |
| 3 | Historical Trend | Q3 2025 revenue share (29.6%) was an unexplained 3-year outlier and is the YoY base for the next reported quarter | Triggered | High | Medium | Directly threatens the Q3 2026 print — consensus already sits below the Q3 2025 actual |
| 4 | Revenue | Delivery "recovery" may reflect tax-credit pull-forward/hollow-out, not organic demand | Triggered | High | Medium | The single biggest revenue driver carries an unresolved demand-durability question |
| 5 | Revenue | Robotaxi/FSD is a cited forward driver with zero revenue disclosure and an unresolved securities-fraud class action over the same effectiveness claims | Triggered | High | Medium | A narrative driver is also active litigation risk not cross-referenced in the earnings module |
| 6 | Margins | SBC ramp (CEO Performance Award) is the single biggest margin driver, with $105.82bn–$120.37bn of unrecognized expense in tranches not yet probable | Triggered | High | High | Largest, most quantified, one-directional EBIT-margin headwind identified in this module |
| 7 | Guidance/Consensus | Revision breadth still net-negative on every profit line a month after Q2 print despite double-digit EPS cuts | Triggered | High | High | The estimate reset for the margin problem is not finished |
| 8 | Earnings Quality | SBC excluded from adjusted earnings, equal to 65% of GAAP operating income | Triggered | High | High | "Adjusted" earnings materially overstate cash-diluting compensation cost |
| 9 | Earnings Quality | Two large one-off items materially inflated GAAP net income in different periods within 3 years | Triggered | High | High | GAAP headline in those quarters/years overstates the recurring earnings trend |
| 10 | Sensitivity | Earnings volatility score 68/100 (High band) — three of six variables are one-directional headwinds | Triggered | High | High | Earnings can swing >$1bn annualized from several levers tilted downward |
| 11 | Sensitivity | FX is the largest quantified swing ($1.64bn/10% move), unhedged and reversible without warning | Triggered | High | Medium | Largest single external swing factor sits entirely outside management control |
| 12 | Narrative | Robotaxi/FSD narrative's litigation risk is invisible if only the earnings module is read | Triggered | High | Medium | Cross-module gap the master synthesis must close |
| 13 | Data Completeness | No segment-level opex/EBIT allocation | Triggered | Medium | High | Segment margin reads are gross-margin only; true segment profitability unverifiable |
| 14 | Historical Trend | EBITDA margin deteriorated QoQ even as revenue grew QoQ | Triggered | Medium | High | Shows margin and revenue trends already diverging quarter to quarter |
| 15 | Revenue | Order backlog is the main forward signal but is unquantified | Triggered | Medium | High | Bull case's central driver cannot be sized or verified |
| 16 | Revenue | Related-party SpaceX sales (~10% of Energy segment revenue) not flagged as related-party in the revenue-driver analysis | Triggered | Medium | High | Part of one segment's growth is transacted with a CEO-controlled counterparty |
| 17 | Revenue | Growth concentrated in smaller international markets with undisclosed ASP/durability | Triggered | Medium | Medium | Real share gain today, but scalability unverified |
| 18 | Revenue | Regulatory-credit revenue (near-100% margin) fell 67% YoY, structurally non-reversing | Triggered | Medium | High | Removes a high-margin cushion that has offset opex growth |
| 19 | Margins | Energy-segment one-offs obscure the true underlying margin trend | Triggered | Medium | High | Adds noise on top of a structural ASP-decline trend |
| 20 | Margins | D&A has not caught up with the capex ramp | Triggered | Medium | High | Current D&A ratio understates the eventual margin drag |
| 21 | Margins | Battery-cell/new-factory capacity utilization is unknown | Unclear | Medium | Unknown | Cannot rule out a hidden near-term margin drag |
| 22 | Guidance/Consensus | No formal point guidance issued for revenue/EBITDA/EPS | Triggered | Medium | High | Beat/miss assessment relies entirely on Street consensus with no company anchor |
| 23 | Guidance/Consensus | EPS beats aided by one-offs then reversed the following quarter | Triggered | Medium | High | Reduces confidence any single-quarter EPS beat is repeatable |
| 24 | Beat/Miss | "Balanced" verdict sits atop a scenario table skewed toward miss (2 High-likelihood miss scenarios vs 0 High-likelihood beat scenarios) | Triggered | Medium | Medium | Headline framing may understate the miss-lean in the underlying evidence |
| 25 | Beat/Miss | No formal guidance means margin deterioration surfaces only as tone shift, not a priceable cut | Triggered | Medium | Medium | An in-line print could mask a soft guide-down |
| 26 | Beat/Miss | EPS surprise range historically very wide (−38.9% to +17.1%) | Triggered | Medium | High | Reduces reliability of any single "material" beat/miss threshold |
| 27 | Earnings Quality | Rising DSO opposite falling revenue, unexplained | Triggered | Medium | High | The one unresolved accrual-quality flag in the module |
| 28 | Earnings Quality | Four distinct accounting policy/presentation changes in ~18 months | Triggered | Medium | High | Makes clean period-over-period comparison harder |
| 29 | Earnings Quality | Related-party mark-to-market gain and related-party revenue both hit results in the same quarter as negative FCF | Triggered | Medium | High | Meaningful share of reported profit/growth is transacted with a CEO-controlled counterparty |
| 30 | Earnings Quality | Quarterly FCF turned negative for the first time in 8 quarters | Triggered | Medium | High | FY2025 FCF is not a run-rate for FY2026 |
| 31 | Sensitivity | Multiple variables likely to move together adversely | Triggered | Medium | Medium | Downside case is compounding, not additive |
| 32 | Sensitivity | Symmetric sensitivity estimates likely understate true downside (operating deleverage) | Triggered | Medium | Medium | Reported sensitivity table is a floor, not a balanced estimate |
| 33 | Sensitivity | Interest-rate subvention cost sensitivity cannot be quantified at all | Unavailable | Medium | Unknown | 68/100 volatility score may understate true exposure |
| 34 | Source Conflict | CIQ vs company Update-letter operating income diverge for Q3/Q4 2025 (~$238M/quarter), cause unexplained | Triggered | Medium | High | Correctly resolved per source hierarchy, but the underlying gap is unexplained |
| 35 | Narrative | Master synthesis risks reading the revenue beat streak as "earnings accelerating" without netting in margin/EPS deterioration | Triggered | Medium | Medium | Would overstate the setup relative to the full evidence pool |
| 36 | Narrative | Bull case leans on qualitative language, not disclosed sizable numbers | Triggered | Medium | High | Reduces reliability of the forward-looking part of the improving-revenue narrative |
| 37 | Data Completeness | Standalone audited FY2025 10-K (Item 8) absent from pool | Triggered | Low | High | FY2025 annual figures rest on unaudited company letters/vendor export, not an audited filing |
| 38 | Guidance/Consensus | Consensus capex already above management's guided floor | Triggered | Low | High | Modest, already-priced incremental FCF drag |
| 39 | Source Conflict | Mild confidence-calibration difference between `01`/`02` and `05` on revenue-rebound genuineness | Unclear | Low | Medium | Synthesizer should be explicit about which framing it adopts |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 36 |
| Critical flags | 0 |
| High flags | 12 |
| Medium flags | 24 |
| Low flags | 3 |
| Unclear flags | 2 |
| Unavailable checks (data missing) | 1 |

## 5. Red-Flag Severity Verdict

**Material concerns.**

No single flag rises to Critical (nothing here forces "Insufficient data" or invalidates the setup outright — Tesla carries no covenant risk, no manufactured-revenue evidence, and no going-concern indicator). But twelve High-severity flags cluster tightly around one theme: the earnings setup's revenue side ("improving," "record quarter," a four-quarter beat streak) and its margin/EPS side (three straight years of EBIT-margin decline, a 68/100 volatility score, revision breadth still net-negative a month after the print) are moving in genuinely different directions, and the single most dangerous item is the disclosed $105.82bn–$120.37bn stock-based-compensation overhang tied to the CEO Performance Award's not-yet-probable tranches [`03_margin-drivers.md`, §9; `06_earnings-quality.md`, §4]: it is the largest, most quantified, structurally one-directional headwind in the whole module, it already explains most of Q2 2026's EBIT-margin decline (−126bps of −269bps), and it can produce a further lumpy step-up in SG&A with little warning if a new milestone is deemed "probable," exactly as happened with the current tranche. What would resolve it: a management update at the Q3 2026 call quantifying which (if any) additional Performance Award milestones have moved closer to probable, measured against the disclosed $105.82bn–$120.37bn pool.

## 6. What The Synthesis Agent Should Know

- 36 red flags triggered (12 High, 24 Medium, 0 Critical), 2 Unclear, 1 Unavailable check — no Critical flag, so no hard cap or verdict-lock is required from this scan alone.
- The single most dangerous red flag: the $105.82bn–$120.37bn unrecognized SBC overhang in CEO Performance Award tranches "not yet deemed probable" — quantified, guided to keep growing, already the largest identified driver of the current EBIT-margin decline, and capable of a further lumpy step-up with little advance warning.
- No red flag here should change the earnings verdict away from `05_beat-miss-setup`'s own "balanced" read — but the synthesis should not upgrade that read toward "accelerating" without explicitly weighing the margin/EPS-side evidence (flags #2, #6, #7, #10 above) against the revenue-side evidence (flags #1, #4, #15).
- No red flag here caps a specific MODULE_RULES score cap beyond what upstream agents already applied (no consensus gap, no cash-flow gap, no segment-P&L gap trip the standard partial-data caps) — the segment-opex disclosure gap (flag #13) is a real limitation but does not meet the standard cap thresholds since consolidated segment revenue/gross-profit is fully disclosed.
- Contradiction to reconcile: `01`/`02` treat the genuineness of the Q2 2026 demand recovery as unresolved, while `05` weights the revenue-beat pattern "moderate-to-high" confidence — these are different questions (demand durability vs. evidentiary support for the beat pattern), and the synthesis should state explicitly which framing it is adopting rather than blending both silently.
- Missing data that prevented a fuller scan: the standalone audited FY2025 10-K (Item 8), a quantified order-backlog figure, segment-level opex/EBIT allocation, and a quantified interest-rate-subvention sensitivity — none of these triggered a hard cap, but each limits how precisely a downstream user can verify a specific claim.
- Cross-module gap: the earnings module's own driver analysis (`02_revenue-drivers`) never references the unresolved federal securities-fraud class action over Autopilot/FSD/Robotaxi claims that the business-model module (`12_red-flags-sweep`) already flags as attacking the exact narrative behind the Services/FSD growth story — the master synthesis must pull this forward itself.
- Net read versus upstream: the setup is **not cleaner** than the upstream agents individually suggest — each upstream agent (`01` through `07`) is itself appropriately cautious in isolation, but no single upstream report puts the revenue-side and margin-side evidence side by side the way this scan does, and doing so surfaces a more one-sided (margin/EPS-negative) picture than reading any single upstream report alone would suggest.

## 7. Pre-Mortem — If The Earnings Setup Fails

If this earnings setup turns out to be wrong, the most likely reason is that the Q2 2026 revenue re-acceleration was read as a genuine, durable demand inflection when it was actually a partial bounce-back from the federal EV tax-credit pull-forward that inflated Q3 2025 and then hollowed out Q4 2025 and Q1 2026 — a base-rate question `01_historical-financials` and `02_revenue-drivers` both explicitly flag as unresolved from the pool's own data, and one the missing quantified order-backlog figure (the only disclosed forward demand signal) made impossible to independently verify. If the demand recovery stalls or reverses in Q3/Q4 2026 against a base that consensus has already priced as normalized, the revenue-beat streak the market is extrapolating would break at the same time the SBC/opex ramp keeps compressing margin — the two halves of the setup failing together, not separately, exactly as `07_earnings-sensitivity`'s own interaction-effects analysis (§5) already warns can happen.
