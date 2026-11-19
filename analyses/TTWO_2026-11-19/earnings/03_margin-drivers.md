# Margin Drivers — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Regime:** US SEC (10-K / 10-Q / 8-K Ex. 99.1) · **Standard:** US GAAP · **Currency:** USD, millions · **Fiscal year:** ends 31 March (FY2026 = year ended 2026-03-31; FY2027 in progress) [1][3].

**Evidence binding.** Frozen supervisor-verified read mode. Every manifest / corpus / CIQ-facts / extract read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. The live logical path `data/TTWO/` was not read; it is a citation label only. One pool file (`Alphabet Inc NasdaqGS GOOGL Key Developments.xls`) is a wrong-company contaminant and is cited nowhere below.

**Upstream inputs present.** `00_earnings-data-triage.md`, `01_historical-financials.md` and `04_guidance-consensus.md` were all read. Business-model module available: `02_business-identity.md`, `03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md` were read. No "module not available" disclaimer applies.

**Three basis rules that govern every margin number below — read first.**

1. **Filing basis only for margins.** The Capital IQ vendor series reclassifies asset writedowns out of cost of revenue. On the vendor basis Q1 FY27 gross margin reads 60.4%; on the filing basis it is **57.5%**, because a $43.4m impairment charged to cost of revenue is moved out [3, Item 2 MD&A; 9]. The widely-quoted "Q1→Q2 gross margin fell 290bps" is a **vendor artefact** — on the filing basis it was 57.5% → 57.5%, flat. **Every margin in Sections 2–9 is on the filing basis.** Vendor figures appear only where the filing does not disclose the line, and are labelled ᵛ.
2. **Three profit bases exist and are never mixed.** GAAP income/(loss) from operations; the company's own **non-GAAP EBITDA** (GAAP net income excluding interest income/expense, income taxes, depreciation, and amortisation and impairment of **acquired** intangibles — it does *not* add back stock-based compensation and does *not* add back amortisation of internally capitalised software) [5, "Non-GAAP Financial Measure"]; and a further **management-reporting** basis that adds back stock-based compensation and a deferred-revenue timing adjustment. In Q2 FY27 a GAAP net loss of $(54.0)m becomes $92.2m of non-GAAP EBITDA and $277.1m of management-reporting EBITDA — a $331m swing on $1,497.0m of revenue, of which **$90.0m is stock-based compensation** (a real cost of paying staff) and **$101.9m is deferred-revenue timing** (shifting income between periods, not creating it) [3; 5, p.2 and p.11].
3. **Margins are on GAAP net revenue, not Net Bookings.** Q2 FY27 GAAP net revenue was $1,497.0m; Net Bookings were $1,601.3m [3; 5, p.1]. Net Bookings appears below only where it is named.

All percentages, basis-point deltas and the bridge in Sections 7 and 7a were produced by an executed Python snippet; the inputs are the sourced figures cited in each row, and the derivations are printed in Section 7a and Section 10.

---

## 1. Segment Decomposition Status

**Single reportable segment — stated by the company, not a disclosure gap.** "We have one operating and reportable segment" [1, Item 1 and Note 21]; the vendor's own segment tab reads "Sale of Software Titles 6,656 (100%) of Total 6,656" for FY2026 [7]. This matches business-model `03_segment-map.md`. Under the `MODULE_RULES.md` Segment-Level Rule the single-segment path applies: the consolidated read below is the primary read, and the "no segment P&L for a multi-segment business" clarity cap does **not** trigger.

**Revenue IS disaggregated on four axes, and costs are NOT.** The company discloses revenue by content (recurrent consumer spending vs full game), by platform (mobile / console / PC), by distribution channel (digital / physical) and by geography [1, Item 7; 3, Item 2; 5, "Net Revenue and Net Bookings by Content, Platform Mix…"]. It discloses **no cost of revenue, gross profit, operating expense or margin for any of those axes.** The only cost statement attached to an axis is qualitative: mobile revenue "generally generates a lower gross margin percentage than our Console or PC revenue" because of the Apple/Google platform fee [1, Item 7 — Online Content and Digital Distribution].

Consequence, stated plainly: **mix is the most-cited margin driver in this company's own filings and the one that cannot be quantified from disclosure.** Section 6 therefore gives directional mix reads with the disclosed revenue weights and refuses to put a margin number on any single platform or content line. No mix figure below is invented.

---

## 1a. Sector Overlay Status (step 3b)

**No sector overlay for "hit-driven owner-operator of entertainment intellectual property — premium console/PC franchise publisher plus free-to-play mobile microtransactions" — generic cost stack applies.** No row in `frameworks/SECTOR_OVERLAYS.md` matches: it is not a bank (no NIM, no credit costs), not a REIT (no NOI), not SaaS/subscription (recurrent consumer spending is per-item microtransaction and in-game advertising, not a contracted recurring fee — there is no RPO/ARR/net-retention grammar to apply), not an insurer, miner, E&P, retailer, telecom, asset manager or pharma. This matches business-model `02_business-identity.md` §3a, which reached the same conclusion independently.

Two consequences for the cost stack in Section 2. First, the generic raw-material / freight / energy rows do **not** exist here: "Take-Two does not occupy the raw-material or component-supply stages: there is no commodity input" [business-model `06_value-chain.md`, §1], and 97.4% of Q2 FY27 net revenue moved through digital channels so there is no meaningful freight line [3, Item 2]. Those rows are marked "Not applicable / not disclosed" rather than padded. Second, the generic candidate list is replaced in practice by the company's **own five disclosed cost-of-revenue lines** plus its four operating-expense lines — which is what the filing gives and what the margin actually moves on.

One item from the SaaS row is borrowed deliberately, because it applies on its own evidence rather than by sector label: **stock-based compensation charged in full, with the GAAP-to-non-GAAP gap made visible.** FY2027 guidance embeds $462m of stock-based compensation — $113m inside cost of revenue and $349m inside operating expenses — equal to **5.7% of the $8,080m guided revenue midpoint** [5, "Outlook for Fiscal Year 2027"]. That gap is itself a margin driver and is scored as one in Section 5.

---

## 1b. Cycle Position (`MODULE_RULES.md` Cycle-Position Rule)

**The latest reported quarter sits at the TROUGH of a release cycle — and the very next quarter is the peak. Neither is a run-rate.**

This business has a release cycle, not a commodity or credit cycle. Business-model `10_external-dependency.md` classifies TTWO as **"partly externally driven"** with consumer cycle Mid and console-hardware cycle Mid, and concludes that "the observed driver of results in both reported FY27 quarters was its own product". This module agrees — the cycle that moves margin here is the company's own release slate, and the external cycles sit behind it.

Evidence for the trough read on Q2 FY27 (three months ended 2026-09-30):
- GAAP net revenue $1,497.0m is the **lowest of the last eight quarters** (range $1,359.8m–$1,773.8m, with the last four all above $1,497.0m until this one) [9; upstream `01`, §3].
- Full-game revenue fell to **19.2% of net revenue from 28.1%** a year earlier, as Borderlands 4 (Sep-2025) and Mafia: The Old Country (Aug-2025) annualised out — $128.0m and $56.3m of revenue decline respectively [3, Item 2].
- Vendor-basis EBITDA margin of 5.1% is the lowest of the eight quarters [9; upstream `01`, §3]. Company-defined non-GAAP EBITDA margin was 6.2% ($92.2m on $1,497.0m) against 6.6% ($116.7m on $1,773.8m) a year earlier [5, p.11].
- The company describes itself as between launches; Grand Theft Auto VI released **2026-11-19 — today** — inside Q3 FY27 [1, Item 7; 5, release schedule].

Evidence that Q3 FY27 is the peak, not a new level: guided GAAP net revenue of **$3,270–3,420m against $1,699.0m in Q3 FY26** — roughly a doubling in one quarter, the largest quarterly revenue skew anywhere in the five-year history [5; 9].

**Three things that are explicitly NOT run-rate, labelled:**
- **FY2026's +288bps gross-margin expansion is partly a base effect, not an operating gain.** The filing attributes it to "lower amortization of intangible assets primarily due to higher impairments in the prior year" — i.e. the FY2025 $3,545.2m goodwill-impairment cycle having already written the assets down — "partially offset by higher amortization of capitalized software and development costs" [1, Item 7]. Game-intangible amortisation fell from 14.4% to 9.9% of revenue on that mechanic [1, Item 7].
- **Q2 FY27's +220bps gross-margin improvement is release-timing, not cost control.** The filing's own one-line cause: "primarily driven by lower amortization of capitalized software and development costs primarily due to the timing of releases" [3, Item 2]. It reverses when a title ships.
- **Q3 FY27's guided 49.5% gross margin is a launch-quarter margin.** It is ~800bps below Q2 FY27's 57.5% and is not a normalised level either. There is no quarter in the next twelve months that can be read as run-rate; this business must be judged across a full release cycle.

**No one-time policy or macro tailwind sits in the latest margin.** The only quantified policy benefit in the pool is a $45.7m software-development tax-credit effect on the FY2026 **tax** line, below EBIT, not in margin [business-model `10_external-dependency.md`, §1A]. A November-2026 intangible-asset reorganisation will change the jurisdictional mix of earnings from November 2026 — again a tax-line effect, with the company stating it is "still" assessing it [3, Note 16 (Subsequent Events)]. Neither is a margin driver and neither is counted as one below.

---

## 2. Cost Stack

Generic operating company (Section 1a) — the rows below are the company's **own disclosed cost lines**, not a template. Percentages are of GAAP net revenue for the three months ended 2026-09-30 (Q2 FY27), with the prior-year quarter beside them. Direction = where the **ratio** is heading on the evidence cited.

| Cost Line | % of Revenue or Amount (Q2 FY27 vs Q2 FY26) | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|
| **Raw materials / commodity inputs** | Not applicable — none exist | n/a | "no commodity input"; 97.4% of Q2 FY27 revenue digital [business-model `06_value-chain.md`, §1; 3, Item 2] | None |
| **Freight / logistics** | Not disclosed; physical retail is only **2.6%** of revenue (was 4.5%) | Shrinking | [3, Item 2 — net revenue by distribution channel] | Immaterial |
| **Energy** | Not disclosed | Unknown | No energy line in any filing in the pool | Not assessable |
| **Product costs** (platform/app-store fees, physical goods, payment costs) | **$184.0m / 12.3%** vs $229.3m / 12.9% | **Falling (Tailwind)** | [3, Item 2 — Cost of revenue]; platform fees "are recorded as Cost of revenue as incurred" [3, Item 2 — Online Content and Digital Distribution] | **High** — Apple and Google "generally have the discretion to set the amounts of their platform fees" [1, Item 1A] |
| **Game intangibles** (amortisation of **acquired** intangibles, mainly Zynga/Gearbox purchase accounting) | **$140.8m / 9.4%** vs $158.8m / 9.0% | **Rising as a ratio** | [3, Item 2]; FY2027 guidance embeds **$572m** of acquired-intangible amortisation inside cost of revenue [5, Outlook] | High — but non-cash and excluded from the company's own non-GAAP EBITDA |
| **Software development costs and royalties** (amortisation of **internally** capitalised game development, plus impairments) | **$107.9m / 7.2%** vs $172.1m / 9.7% | **Fell in Q2; set to rise on launch** | [3, Item 2]; capitalised balance **$2,577.3m** at 2026-09-30, up from $2,346.3m at 2026-03-31 [3, Balance Sheets] | **Highest in the stack** — see Sections 5 and 8 |
| **Licenses** (sports and third-party IP) | **$131.9m / 8.8%** vs $154.4m / 8.7% | **Rising as a ratio** | [3, Item 2]; FY2026 $463.5m / 7.0% of revenue vs 6.5% in FY2025 [1, Item 7]; H1 FY27 7.6% vs 6.9% [3, Item 2] | Mid — guaranteed minimum payments, "may not be able to terminate these agreements" [1, Item 1A] |
| **Internal royalties** (pay-outs to in-house studios on their own titles' success) | **$72.0m / 4.8%** vs $78.7m / 4.4% | **Rising as a ratio** | [3, Item 2]; FY2026 6.3% vs FY2025 7.2% [1, Item 7] | Mid — mechanically rises when owned franchises perform |
| **Total cost of revenue** | **$636.6m / 42.5%** vs $793.3m / 44.7% | Falling (−220bps) | [3, Item 2] | — |
| **Selling and marketing** (includes mobile player-acquisition spend) | **$444.9m / 29.7%** vs $536.7m / 30.3% | **Dollars down $91.8m; ratio down 54bps** | [3, Item 2 — Operating Expenses]; "lower marketing expense for our Borderlands franchise, partially offset by higher marketing expense for our Grand Theft Auto series" [3, Item 2] | **High** — Q3 FY27 management-basis operating expense guided **+21% YoY** "driven by GTA VI launch marketing" [11, prepared remarks (Goldstein)] |
| **Research and development** (pre-feasibility development, charged not capitalised) | **$254.4m / 17.0%** vs $268.0m / 15.1% | **Dollars down $13.6m; ratio UP 189bps** | [3, Item 2]; "lower personnel expense and lower production expenses" [3, Item 2] | High — Q4 FY27 management-basis operating expense implied up ~10%, "mostly being driven by increases in R&D" [11, Q&A (Song / Goldstein)] |
| **General and administrative** | **$230.5m / 15.4%** vs $225.0m / 12.7% | **Dollars UP $5.5m; ratio UP 271bps** | [3, Item 2]; "higher IT-related expenses for cloud-based services and IT infrastructure" [3, Item 2] | Mid |
| **Depreciation and amortisation** (operating-expense line only) | **$48.1m / 3.2%** vs $48.8m / 2.8% | Dollars flat; ratio up 46bps | [3, Item 2]; FY2027 depreciation guided **$165m** [5, EBITDA reconciliation] | Low |
| **Total operating expenses** | **$977.9m / 65.3%** vs $1,078.5m / 60.9% | Dollars down $100.6m; ratio **UP 452bps** | [3, Item 2] | — |
| **Stock-based compensation** (sits inside the lines above, not separate) | **$90.0m / 6.0%** of revenue — $23.1m S&M, $22.5m R&D, $41.0m G&A, $3.4m in cost of revenue | Rising as a ratio | [3, Item 2 — Operating Expenses footnote (1); 3, Item 2 — Cost of revenue footnote (1); 5, p.2] | **High** — $462m guided for FY2027, 5.7% of guided revenue [5, Outlook] |
| **Interest expense** | **$30.2m / 2.0%** vs $37.4m / 2.2% | Falling | [3, Statements of Operations]; FY2027 interest expense, net guided **$41m** [5, EBITDA reconciliation] | Low — below the margin line; zero floating-rate debt [business-model `10_external-dependency.md`, §3] |
| **Labour / wages** | Not disclosed as a line; 9,998 of 12,909 full-time staff sit in development studios | Unknown as a line | [1, Item 1]; payroll is split between capitalised software, R&D, S&M and G&A rather than shown separately | **High but not measurable** — this is the real input cost and it is not a disclosed line |

**One structural point the table makes.** Take-Two's real input is developer time, and it reaches the income statement by **two different routes with different timing**: before a title clears "technological feasibility" it is charged straight to R&D; after that point it is capitalised and then amortised into cost of revenue **only when the game is released** [1, Note 1 — Software Development Costs and Licenses]. So the same payroll dollar hits the P&L either immediately, as research and development inside operating expenses, or years later, as amortisation inside cost of revenue. That split is why gross margin and operating margin can move in opposite directions in the same quarter, which is exactly what Q2 FY27 did.

---

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

### 3.1 Latest quarter — Q2 FY27 vs Q2 FY26 (three months ended 30 September, filing basis)

| Margin Level | Latest (Q2 FY27) | Prior Year (Q2 FY26) | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| **Gross margin** | **57.5%** ($860.4m) | 55.3% ($980.5m) | **+220** | "lower amortization of capitalized software and development costs primarily due to the timing of releases" — the internally capitalised development line fell from 9.7% to 7.2% of revenue | [3, Item 2 — Cost of revenue and gross profit] |
| **EBITDA margin (company-defined non-GAAP)** | **6.2%** ($92.2m) | 6.6% ($116.7m) | **−42** | Gross-margin gain more than given back by operating-expense ratios on a 15.6%-smaller revenue base; the measure excludes acquired-intangible amortisation and depreciation but **charges** stock-based compensation and internal software amortisation | [5, p.11 "EBITDA" reconciliation] |
| **EBITDA margin (vendor-computed)** ᵛ | 5.1% ($75.9m) ᵛ | 6.6% ($117.5m) ᵛ | −150 ᵛ | Shown only for continuity with upstream `01` §3; a **different measure** from the row above and never mixed with it | [9] |
| **EBITDA margin (management-reporting basis)** | **18.5%** ($277.1m) | Not disclosed for the prior-year quarter in the pool | Not computable | Adds back $90.0m stock-based compensation, $101.9m deferred-revenue timing, $2.4m business acquisition, less $9.4m other | [5, p.2] |
| **EBIT margin** (income/(loss) from operations) | **−7.8%** $(117.5)m | −5.6% $(98.0)m | **−232** (filing's rounded print: −220) | Gross margin +220bps swamped by operating-expense ratio +452bps, which is overwhelmingly the smaller revenue base, not higher spending — operating-expense **dollars fell $100.6m** | [3, Item 2 and Statements of Operations] |

### 3.2 Last closed fiscal year — FY2026 vs FY2025 (filing basis)

| Margin Level | FY2026 | FY2025 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | **57.2%** ($3,809.7m) | 54.3% ($3,062.2m) | **+288** | (i) lower acquired-intangible amortisation "primarily due to higher impairments in the prior year", (ii) lower product costs, partly offset by (iii) higher internal software amortisation | [1, Item 7] |
| EBITDA margin (vendor) ᵛ | 11.8% ᵛ | 6.7% ᵛ | +511 ᵛ | No company-defined full-year EBITDA for FY2026 exists in this pool (no Q4 FY26 release admitted) | [7]; upstream `01` §1 |
| EBIT margin | **−1.6%** $(104.2)m | −77.9% $(4,391.1)m | +7,634 | FY2025 carried a $3,545.2m goodwill impairment (62.9% of revenue) that did not recur | [1][2, Item 7] |

### 3.3 Guided — FY2027 and Q3 FY2027 (company's own GAAP outlook, midpoints)

| Margin Level | Q3 FY27 guided | FY2027 guided | vs Q2 FY27 / FY2026 actual | Main Reason | Evidence |
|---|---:|---:|---|---|---|
| Gross margin | **49.5%** (rev 3,345; cost of revenue 1,690.5) | **53.7%** (rev 8,080; cost of revenue 3,739.5) | **−801bps** vs Q2 FY27's 57.5% · **−351bps** vs FY2026's 57.2% | The CFO's own one-line cause, asked directly: *"it appears the gross margins are down slightly in the full year guidance. Can you just help us understand the drivers there?" → "So it's due to the mix of the business, and it's being offset by some changes in the operating expenses."* | [5, Outlook]; [11, Q&A (Schoell / Goldstein)] |
| Operating-expense ratio | **35.0%** (1,172) | **50.6%** (4,088) | −3,029bps vs Q2 FY27's 65.3% · −821bps vs FY2026's 58.8% | Near-fixed cost base against roughly doubled revenue — operating leverage, in the favourable direction this time | [5, Outlook] |
| **EBIT margin** | **+14.4%** ($482.5m) | **+3.1%** ($252.5m) | **+2,227bps** vs Q2 FY27 · **+469bps** vs FY2026 | — | derived from [5, Outlook]; see Section 10 |
| EBITDA margin (company-defined non-GAAP) | 20.2% ($674.5m) | 13.0% ($1,053m) | — | FY2027 add-backs: depreciation $165m, acquired-intangible amortisation $623m | [5, EBITDA reconciliation] |

**Pass-through: what it is here, and the lag.** There is no commodity to pass through. The pass-through question for TTWO is whether it can recover **platform fees and licence costs it does not set**, and business-model `06_value-chain.md` answers it with evidence: **"No — 0% of revenue sits under a disclosed escalator, indexed-pricing or cost-plus clause"**, and the platforms "have retained the right to change the fee structures" at their own discretion [1, Item 1A]. But — and this qualifier must travel (§3) — *no contractual pass-through is a fact about contracts, not a measurement of realised recovery.* The filings show real absorption: product costs (where the app-store fee sits) fell 160bps of revenue in FY2026 and a further 110bps in H1 FY27, through platform mix (mobile 52.2% → 50.1% of FY2026 revenue) and a growing direct-to-consumer channel that bypasses the Apple/Google fee entirely [1, Item 7; 3, Item 2; business-model `06_value-chain.md`, §2].

**The pass-through lag is release-timed, measured in years, and it runs the wrong way after launch.** Take-Two's price lever is the launch price of a new premium title — it set Grand Theft Auto VI at **$80** against the $70 industry norm (a ~14% rise) while holding NBA 2K27 at $70 by choice [business-model `06_value-chain.md`, §3, citing the Q1 FY27 call Q&A]. Between launches there is no price lever on the 80.8% of Q2 FY27 revenue that is recurrent consumer spending, and that spend **fell 9% at unchanged prices** [5, p.1; 3, Item 2]. Worse, after a launch the company deliberately cuts price: it describes "reducing the wholesale prices of our products… typically three to nine months after a product's initial launch" [1, Item 1 — Marketing]. **So the stated lag is: price can be raised only at a launch (years apart), and is cut 3–9 months after one.** A platform-fee increase arriving mid-cycle cannot be priced through for years.

---

## 4. Margin Walk — Which Margin Level Matters Most?

**EBIT margin on the filing basis is the primary metric for this business, with gross margin as the mix signal and company-defined non-GAAP EBITDA as the cross-check. The reason is that only EBIT charges the full cost of making a game.** A game publisher's real production cost is developer payroll, and it reaches the income statement by two routes: charged immediately to research and development (pre-feasibility work, $254.4m in Q2 FY27, sitting in operating expenses) or capitalised and amortised into cost of revenue when the title ships ($107.9m in Q2 FY27, against a $2,577.3m unamortised balance) [3, Item 2 and Balance Sheets; 1, Note 1]. Gross margin sees only the second route, so it can rise 220bps in a quarter precisely *because* nothing shipped — which is what happened in Q2 FY27 and is the opposite of good news. The company's non-GAAP EBITDA is better than the vendor's because it keeps internal software amortisation and keeps stock-based compensation as costs, but it still strips out $145.1m a quarter of acquired-intangible amortisation (the Zynga and Gearbox purchase price being consumed), and the management-reporting basis strips a further $90.0m of stock-based compensation and $101.9m of revenue timing — on those bases a quarter with a $(117.5)m operating loss reads as $277.1m of profit [5, p.2 and p.11]. EBIT is also the only level management guides component by component (revenue, cost of revenue, operating expenses, each with a range), so it is the only level at which the next print can be **tested** against what was underwritten [5, Outlook]. The honest caveat: a single quarter's EBIT margin on this business is close to meaningless — it ranges from −7.8% actual (Q2 FY27) to +14.4% guided (Q3 FY27) on the same cost base — so EBIT margin must be read across a full release cycle, and Section 1b says why neither of the next two quarters is a run-rate.

---

## 5. Margin Driver Table (consolidated)

Magnitude = how much this driver moves **EBIT margin** if it moves plausibly. High >100bps, Mid 30–100bps, Low <30bps.

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **1. Operating leverage — the revenue denominator against a near-fixed cost base** | The dominant swing factor in both directions. Q2 FY27: operating-expense **dollars fell $100.6m** yet the ratio rose 452bps because revenue fell 15.6%. Q3 FY27 guided: the same near-fixed $1,172m of operating expenses against roughly doubled revenue takes the ratio from 65.3% to 35.0% | **Tailwind into Q3 FY27, Headwind thereafter** (guided FY27 operating-expense ratio of 50.6% implies a Q4 ratio far above Q3's) | **High** (±2,000bps+ across the cycle; ~39bps of EBIT margin per 1% of revenue variance around the Q3 guide — see Section 7a) | [3, Item 2]; [5, Outlook]; [11, Q&A (Song / Goldstein)] |
| **2. Release-timed amortisation of the $2,577.3m capitalised software balance** | Amortisation starts only "when a product is available for general release" and is then the **greater of** revenue-proportional and straight-line over 9–36 months; if the title underperforms, an impairment is charged **to cost of revenue** | **Headwind from Q3 FY27** — the balance starts amortising as GTA VI releases; FY2027 cost of revenue guided to 46.3% of revenue vs 42.8% in FY2026 | **High** (−351bps of gross margin already guided for FY2027) | [1, Note 1 — Software Development Costs and Licenses]; [3, Balance Sheets]; [5, Outlook] |
| **3. Content mix — full-game vs recurrent consumer spending** | Full game fell to 19.2% of Q2 FY27 revenue from 28.1%; the FY2027 plan takes recurrent spending **down to 65% of Net Bookings from 78%** as GTA VI full-game sales land. Full-game sales carry the capitalised-development amortisation and the heavier platform/royalty load | **Headwind to gross margin** — the CFO names mix as *the* cause of the lower full-year gross margin | **High** | [3, Item 2]; [5, Outlook; deck slide 8 via upstream `04`, §2.1]; [11, Q&A (Schoell / Goldstein)] |
| **4. Platform mix and the direct-to-consumer channel (product costs)** | Mobile pays the Apple/Google fee and "generally generates a lower gross margin percentage than our Console or PC revenue". Product costs fell to 12.3% of revenue from 12.9% in the quarter, and 160bps across FY2026. Direct-to-consumer bypasses the fee entirely: "a significant driver of revenue and margins"; "it obviously has a very meaningful margin and bottom line impact" | **Tailwind** — but **unquantified by the company**: "We have not described the percentage of our business that comes direct to consumer mobile" | **Mid** (sized from the realised 60bps quarterly / 160bps annual move in product costs, not from the unquantified D2C share) | [1, Item 7 — Online Content and Digital Distribution]; [3, Item 2]; [11, prepared remarks and Q&A (Heaney / Zelnick)] |
| **5. Stock-based compensation** | $90.0m in Q2 FY27 = 6.0% of revenue, charged across four lines; $462m guided for FY2027 = 5.7% of guided revenue. It is the single largest difference between the GAAP margin and the management-reporting margin management is paid on | **Headwind as a ratio** (rising against falling revenue in H1 FY27; $113m of the FY27 total lands in cost of revenue, $96m of it in Q3 alone as capitalised dev costs containing it begin amortising) | **High** | [3, Item 2 footnotes]; [5, p.2 and Outlook] |
| **6. Marketing / player-acquisition spend** | S&M dollars fell $91.8m in Q2 FY27 on lower Borderlands marketing; management-basis operating expenses came in 9% lower YoY, "favorable to our forecast due to lower personnel and user acquisition costs… some of that was due to timing" | **Tailwind in the reported quarter, Headwind next** — Q3 management-basis operating expenses guided **+21% YoY** on GTA VI launch marketing | **High** | [3, Item 2]; [11, prepared remarks and Q&A (Smilek / Goldstein)] |
| **7. R&D intensity** | $254.4m = 17.0% of Q2 FY27 revenue vs 15.1%. Dollars fell 5.1% but the ratio rose 189bps. Management flags R&D as the main driver of a ~10% implied Q4 FY27 operating-expense increase | **Headwind** | **High** | [3, Item 2]; [11, Q&A (Song / Goldstein)] |
| **8. Licence costs (sports and third-party IP)** | 8.8% of Q2 FY27 revenue vs 8.7%; 7.6% of H1 FY27 vs 6.9%; $463.5m / 7.0% in FY2026 vs 6.5%. Multi-year sports licences carry guaranteed minimum payments the company "may not be able to terminate" | **Headwind** — the ratio has risen on three consecutive comparisons | **Mid** (+70bps of gross margin consumed across H1 FY27) | [1, Item 7 and Item 1A]; [3, Item 2] |
| **9. Internal royalties** | 4.8% of Q2 FY27 revenue vs 4.4%; 4.8% of H1 FY27 vs 5.1%; 6.3% of FY2026 vs 7.2%. These are pay-outs to in-house studios geared to their own titles' performance | **Headwind when owned franchises succeed** — mechanically rises with GTA VI | **Mid** | [1, Item 7]; [3, Item 2] |
| **10. Title impairments charged to cost of revenue** | $43.4m in Q1 FY27 and $0.2m in Q2 FY27 — "$43.6 of impairment charges were recorded within Cost of revenue" for the six months, "primarily related to… a decision not to proceed with further development of certain interactive entertainment software products". Worth **144bps of H1 FY27 gross margin** | **Unknown** — episodic by nature, but the mechanism is live and the recoverability test runs quarterly against a $2,577.3m balance | **High** when it trips, and it tripped twice in two quarters | [3, Item 2 and footnotes]; [1, Note 1] |
| **11. FX on costs** | FX cut net revenue by $0.6m, gross profit by $3.8m and total operating expenses by $3.2m in Q2 FY27 — a net EBIT effect of about $(0.6)m, roughly 4bps. FY2026: +$9.9m revenue, +$45.4m gross profit, +$31.2m operating expenses | **Neutral to mildly Headwind** | **Low** (<30bps on the realised quarterly figures; business-model `10_external-dependency.md` records a published ±4.0%-per-10% revenue sensitivity, which is a revenue not a margin sensitivity) | [3, Item 2]; [1, Item 7] |
| **12. General and administrative / IT infrastructure** | $230.5m = 15.4% of revenue vs 12.7%; the only operating line whose **dollars rose** (+$5.5m), on "higher IT-related expenses for cloud-based services and IT infrastructure" | **Headwind** | **Mid** | [3, Item 2] |
| **13. Deferred-revenue timing** | Moves the margin **denominator**, not the cost: GAAP revenue is deferred over a five-to-fifteen-month service period while Net Bookings are recognised on sale. FY2027 guidance embeds +$20m of revenue and $(27)m of cost from this; Q3 embeds +$80m and $(13)m. Deferred revenue fell from $1,159.9m to $1,017.1m over six months | **Unknown direction** — a timing shift, not a margin gain | **Mid** | [5, Outlook]; [3, Balance Sheets and Statements of Cash Flows] |
| **14. Energy / freight / raw materials** | **Not applicable.** No commodity input; physical retail is 2.6% of revenue | n/a | n/a | [business-model `06_value-chain.md`, §1]; [3, Item 2] |
| **15. Labour cost per head** | **Not assessable as a line.** 9,998 of 12,909 staff are in development studios, but payroll is split between capitalised software, R&D, S&M and G&A and never disclosed as a cost | **Unknown** | **Not assessable** — this is the true input cost and the filings do not isolate it | [1, Item 1]; [1, Note 1] |

---

## 6. Margin Drivers By Segment

**Not applicable as a segment table — one reportable segment (Section 1).** What follows is the honest substitute: the disclosed revenue axes, each with the mix direction and the one cost statement the company actually makes about it. **No gross margin, cost of revenue or operating expense is disclosed for any axis below**, so none is estimated.

### Axis: Platform (Q2 FY27 revenue weights)

| Line | Revenue share | Mix direction | Cost statement the company makes | Margin read |
|---|---:|---|---|---|
| Mobile | **48.8%** ($731.1m, −$90.5m YoY) | Share **rose** from 46.3% a year earlier, but **fell** from 52.2% to 50.1% across FY2026 | Mobile "generally generates a lower gross margin percentage than our Console or PC revenue" because of the platform fee; 91.0% of mobile revenue runs on Apple and Google | **Headwind when mobile share rises** — direction, not size. The offset is direct-to-consumer, "significant and growing" but share **not disclosed** |
| Console | **41.1%** ($615.4m, −$104.6m YoY) | Share rose from 40.6%; rose from 37.3% to 39.0% across FY2026 | No separate cost disclosure | Tailwind to gross margin by implication from the mobile statement |
| PC and other | **10.1%** ($150.5m, −$81.7m YoY) | Share **fell** from 13.1% | No separate cost disclosure | Not assessable |

[3, Item 2 — net revenue by platform; 1, Item 7 — Online Content and Digital Distribution; 11, Q&A (Heaney / Zelnick)]

### Axis: Content (Q2 FY27 revenue weights)

| Line | Revenue share | Mix direction | Cost statement | Margin read |
|---|---:|---|---|---|
| Recurrent consumer spending | **80.8%** ($1,210.2m, −$65.7m YoY) | Share rose from 71.9% in the quarter; guided **down to 65% of FY2027 Net Bookings from 78%** | None disclosed | Carries no new capitalised-development amortisation, so a high recurrent share coincides with high gross margin — which is exactly why Q2 FY27 printed 57.5% while losing money at EBIT |
| Full game and other | **19.2%** ($286.8m, −$211.1m YoY) | Share fell from 28.1%; set to rise sharply in Q3 FY27 | Carries the capitalised-development amortisation that commences on release | **The mix shift the CFO means** when she attributes lower FY2027 gross margin to "the mix of the business" |

[3, Item 2 — net revenue by content; 5, Outlook; 11, Q&A (Schoell / Goldstein)]

### Axis: Distribution channel and geography

Digital online was 97.4% of Q2 FY27 revenue (up from 95.5%) and physical retail 2.6% (down from 4.5%) [3, Item 2]. Geography: FY2026 United States $3,940m / 59% and international $2,716m / 41% [1, Item 7 via upstream `00`]. **Neither axis has any cost or margin disclosure**, and FX — the only margin mechanism geography offers — is Low magnitude on the realised figures (driver 11). Nothing further is claimed.

---

## 7. Margin Bridge — Latest Period

**Q2 FY27 vs Q2 FY26 — EBIT margin, filing basis, three months ended 30 September.** Total EBIT margin moved from −5.524% to −7.849%, i.e. **−232bps** (the filing's rounded print is −5.6% → −7.8%, −220bps; the difference is rounding in the filing's own percentages, not a basis change).

Every component below is a **disclosed cost line expressed as a percentage of GAAP net revenue in its own period**, so the bridge is built from the filing's own table rather than from an assumed sensitivity. Favourable to margin = positive.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| **Gross margin — lower internal software amortisation** (software development costs and royalties 7.21% vs 9.70% of revenue) | **+249** | [3, Item 2 — Cost of revenue]; the filing's stated cause: "lower amortization of capitalized software and development costs primarily due to the timing of releases" |
| **Gross margin — lower product costs** (12.29% vs 12.93%; platform fees, physical goods, payment costs) | **+64** | [3, Item 2] |
| **Gross margin — higher acquired-intangible amortisation** (game intangibles 9.41% vs 8.95%) | **−45** | [3, Item 2] |
| **Gross margin — higher internal royalties** (4.81% vs 4.44%) | **−37** | [3, Item 2] |
| **Gross margin — higher licence costs** (8.81% vs 8.70%) | **−11** | [3, Item 2] |
| *Subtotal — gross margin* | **+220** | 57.475% vs 55.277% [3, Item 2] |
| **Operating expenses — selling and marketing** (29.72% vs 30.26%; dollars −$91.8m on lower Borderlands marketing) | **+54** | [3, Item 2 — Operating Expenses] |
| **Operating expenses — research and development** (16.99% vs 15.11%; dollars −$13.6m but revenue −15.6%) | **−189** | [3, Item 2] |
| **Operating expenses — general and administrative** (15.40% vs 12.68%; dollars **+$5.5m** on higher cloud/IT spend) | **−271** | [3, Item 2] |
| **Operating expenses — depreciation and amortisation** (3.21% vs 2.75%) | **−46** | [3, Item 2] |
| *Subtotal — operating expenses* | **−452** | 65.324% vs 60.802% [3, Item 2] |
| **Other / unexplained residual** | **0** | Nothing is left over: the components are the filing's complete cost stack |
| **Total margin change (EBIT)** | **−232** | −7.849% vs −5.525% [3, Statements of Operations and Item 2] |

**Memo lines — already inside the components above, shown for completeness and NOT additive (adding them would double-count):**
- **FX:** cut net revenue $0.6m, gross profit $3.8m and total operating expenses $3.2m — net EBIT effect about $(0.6)m, roughly **−4bps** [3, Item 2].
- **One-offs:** $0.2m of impairment inside cost of revenue this quarter, about **−1bp**. The comparable figure for Q1 FY27 was $43.4m, worth about −283bps of that quarter's gross margin [3, Item 2 and footnote].
- **Price:** no separate price component is shown because **none is disclosed.** The company publishes no price or unit volumes per title per period; business-model `02_business-identity.md` §3a records period volume as "Partial — must be inferred from revenue, not read". Inventing a price/volume split here would be the exact defect §15 bans. The one priced event in the window is GTA VI's $80 launch price, which falls in Q3 FY27, not this quarter.

---

## 7a. Bridge Attribution and Residual (`MODULE_RULES.md` "Driver Attribution" / §15)

**Component status: every bps figure in Section 7 is a reported ratio, not a modelled one.** Each line is `(disclosed cost dollars ÷ that period's own GAAP net revenue)` differenced across two periods, both printed in the same filing table. So for all eleven components: **"Asserted from disclosure, no sensitivity applied."** No cost ratio was projected, no elasticity was used, and no ratio measured on one period's mix was applied to another's.

**Reconciliation.** Sum of components vs Section 7's stated Total:

```
Gross-margin components:  +249.3 (software dev) +64.4 (product) −45.5 (game intang)
                          −36.8 (internal roy)  −11.3 (licences)      = +219.8bps
Operating-expense items:   +54.0 (S&M) −188.9 (R&D) −271.3 (G&A) −46.0 (D&A) = −452.2bps
Sum of components                                                     = −232.4bps
Stated Total (EBIT margin, −7.849% less −5.525%)                      = −232.4bps
```

**= −232bps reconciled, 0bps residual.** The bridge closes exactly because the components are the filing's complete cost stack, not a selection from it.

**The causal decomposition — where the arithmetic is actually required.** A zero residual on the ratio bridge does **not** tell you *why* the ratios moved, and the honest answer is that almost none of it is cost action. Separating the two forces, with the derivation printed:

```
Operating expenses:
  cost-dollar effect  = 977.9/1,773.8 − 1,078.5/1,773.8   [both on Q2 FY26 revenue — basis named]
                      = 55.13% − 60.80%                   = −567bps  (favourable)
  denominator effect  = 977.9/1,497.0 − 977.9/1,773.8      [same $977.9m, two revenue bases]
                      = 65.32% − 55.13%                    = +1,019bps (unfavourable)
  sum                                                      = +452bps  → matches Section 7 ✓

Cost of revenue:
  cost-dollar effect  = 636.6/1,773.8 − 793.3/1,773.8      = −883bps  (favourable)
  denominator effect  = 636.6/1,497.0 − 636.6/1,773.8      = +664bps  (unfavourable)
  sum                                                      = −220bps  → matches Section 7 ✓

EBIT margin:
  total cost-dollar relief   = +883 + 567                  = +1,450bps
  total denominator drag     = −(664 + 1,019)              = −1,683bps
  net                                                      = −233bps
  vs stated Total                                          = −232bps  → residual −1bp (rounding)
```

**Basis statement.** Both effects are measured on the periods' own reported revenue ($1,773.8m for Q2 FY26, $1,497.0m for Q2 FY27) and the periods' own reported cost dollars, all from one table in one filing [3, Item 2]. No ratio crosses a basis it was not measured on, and no vendor figure enters the bridge — which matters here, because the vendor's reclassification of impairments out of cost of revenue would have corrupted the gross-margin leg (upstream `01`, §3).

**What this changes about the read.** The company **cut $156.7m of cost of revenue and $100.6m of operating expenses** — $257.3m of cost taken out in one quarter — and still lost 232bps of EBIT margin, because revenue fell $276.8m. Of the −232bps, **−1,683bps is the revenue denominator and +1,450bps is cost reduction**: the single largest force by a wide margin is negative operating leverage, and it is roughly seven times the size of the net margin change it produced. That is also the force that reverses hardest in Q3 FY27.

```
RF-EARN-002: margin bridge reconciled — explained -232bps, residual 0bps, total -232bps
```

---

## 8. The Single Biggest Margin Driver

**One driver: the revenue the $2,577.3m capitalised content asset has to earn — in plain terms, how much Grand Theft Auto VI actually sells against the cost already sunk into it. If that moves adversely, margins compress twice over, and nothing else in the stack comes close.** The mechanism is in the accounting policy, not in a forecast. Amortisation of capitalised development starts only when a title is released and is then **"the greater of"** (a) the proportion of this year's revenue to total revenue expected over the title's life, or (b) straight-line over its remaining estimated life, across amortisation periods that "generally range from 9 to 36 months" [1, Note 1]. On the upside that is roughly self-correcting: strong sell-through means amortisation tracks revenue and the gross-margin ratio holds. On the downside **both legs bite** — the straight-line floor charges cost against revenue that did not arrive, and separately, "when we determine that capitalized cost of the title is unlikely to be recovered by product sales, an impairment of software development and license costs capitalized is charged to cost of revenue" [1, Note 1]. The pool already contains two realised examples of that second leg inside two quarters: $43.4m in Q1 FY27 and $0.2m in Q2 FY27, the first worth about 283bps of that quarter's gross margin [3, Item 2]. Layered on top is the operating leverage quantified in Section 7a: against the Q3 FY27 guide, holding operating expenses at the guided $1,172m and cost of revenue at the guided 50.5% of revenue, **a 10% revenue shortfall takes EBIT margin from +14.4% to +10.5% — about 39bps of EBIT margin per 1% of revenue** (*inference, labelled: it assumes cost of revenue is fully variable, which the "greater of" policy makes optimistic, and assumes no management response*).

**Current direction: Headwind, already guided and already acknowledged.** FY2027 gross margin is guided to 53.7% against 57.2% in FY2026 — **−351bps** — and the CFO, asked directly why, answered: "it's due to the mix of the business, and it's being offset by some changes in the operating expenses" [5, Outlook; 11, Q&A (Schoell / Goldstein)]. The one input that would settle whether this is a manageable headwind or a serious one is pre-order volume, and it is **not quantifiable from this pool**: management described pre-orders as "extraordinary" and "tracking far in excess of our initial expectations" without a number [11, prepared remarks]. The bridge in Section 7 reconciles to zero residual, so the "biggest driver" claim here is not resting on unexplained arithmetic — but it does rest on a forward input the engine cannot verify, and that distinction travels with it.

---

## 9. Investment Spend — Both Signs

**Trigger met.** Capital expenditure is guided to **approximately $290m for FY2027, +52% above FY2026's $190.2m** and above every year in the five-year history ($158.6m, $204.2m, $169.1m, $189.7m, $190.2m). Trailing-twelve-month capex is $304.5m, up 72.1% year on year. Purchases of fixed assets in the six months to 2026-09-30 were **$163.3m against $57.0m** a year earlier — 2.9x. Separately, cash spend on software development costs and licences (which sits *inside* operating cash flow, not capex) was **$372.4m in H1 FY27 against $345.0m** [1, p.66; 3, Statements of Cash Flows; 5, Outlook; upstream `01`, §2].

| Reading | What it would show | Evidence here |
|---|---|---|
| **Spend as a future COST** | A depreciation and amortisation step-up, its recognition lag, the line it lands in, and what it does to margin as it arrives | **Two separate cost tails, with very different weights.** (i) **The real one — content, not capex.** Capitalised software development costs and licences stand at **$2,577.3m** at 2026-09-30, up $231.0m in six months ($82.4m current + $2,494.9m non-current, from $68.8m + $2,277.5m). This lands in **cost of revenue** when titles release, over 9–36 months, at the greater of revenue-proportional or straight-line [1, Note 1; 3, Balance Sheets]. It is already visible in guidance: FY2027 cost of revenue guided to 46.3% of revenue vs 42.8% in FY2026, a **−351bps** gross-margin effect, with $572m of acquired-intangible amortisation and $113m of stock-based compensation inside that cost line [5, Outlook]. (ii) **The fixed-asset tail is small and partly a lease swap.** The six-month capex surge is substantially "our purchase of the building where we previously leased office space in London, England" — a $91.8m asset acquisition allocated **$82.9m to land (not depreciated) and $8.9m to building over 20 years**, "net of the derecognition of the preexisting lease liability and right-of-use asset" [3, Note 15 (Asset Acquisition) and MD&A — Liquidity]. That replaces rent with a trivial depreciation charge; it is not capacity. FY2027 depreciation is guided at **$165m**, against $198.5m of operating-expense D&A in FY2026 — i.e. **guided lower, not higher** [5, EBITDA reconciliation; 1, Item 7]. The rest of the increase is cloud and IT infrastructure, already showing up as the +$5.5m of G&A dollars [3, Item 2]. |
| **Spend as a DEMAND signal** | Backlog / bookings / contracted revenue, management's own supply-vs-demand language, whether capacity is sold before it is built | **The content spend is pre-sold in a way the fixed-asset spend is not.** (i) Q3 FY27 Net Bookings guided to **$3,350–3,500m against $1,757.1m a year earlier — +90.6% to +99.2%** — with GAAP revenue guided to $3,270–3,420m against $1,699.0m [5, Outlook; upstream `04`, §1A]. That is a firm company commitment made ten days before launch, not a hope. (ii) Deferred revenue of **$1,017.1m current plus $25.0m non-current** at 2026-09-30 is billed-but-unrecognised revenue — the closest thing this business has to a backlog, though note it **fell** from $1,159.9m at 2026-03-31, a $147.3m six-month outflow [3, Balance Sheets and Statements of Cash Flows]. (iii) Management's own language is demand-side and emphatic but **unquantified**: "The launch of Grand Theft Auto VI is only 10 days away, and the level of preorders generated is extraordinary", "tracking far in excess of our initial expectations" [11, prepared remarks]. (iv) The Street has moved toward it, though only by shifting money between quarters: FQ3 2027 Net Bookings consensus rose +5.2% in the ten days after the print while FY2027 was left flat and FY2028 was cut 1.8% [upstream `04`, §4]. (v) There is **no supply constraint** on digital software — the "capacity sold before it is built" test does not apply in the physical sense; the analogue is content built against a dated, pre-ordered release, which is what the $2,577.3m balance is. |

**Current read: the demand reading is better evidenced for the CONTENT spend, and the cost reading is correct for the FIXED-ASSET spend — and conflating the two is the error to avoid here.** The headline "+52% capex" is mostly an office building and IT, carries a *falling* guided depreciation charge, and is not a demand signal at all. The spend that genuinely carries both signs is the $2,577.3m capitalised content asset: it is simultaneously the guided −351bps gross-margin headwind for FY2027 and the only reason Q3 FY27 revenue can roughly double. On the evidence available today the demand sign dominates, because it is anchored in a company-guided, component-by-component outlook (revenue, cost of revenue and operating expenses each with a range) rather than in an adjective — and because the operating-leverage arithmetic in Section 7a says a doubling of revenue against a near-fixed cost base is worth about +2,227bps of EBIT margin, dwarfing the −801bps of gross margin it costs.

**The ONE observable that would flip it:** the Q3 FY27 print on **2027-02-09** — specifically whether cost of revenue lands inside the guided **$1,649–1,732m** on revenue inside **$3,270–3,420m**. If revenue lands in range but cost of revenue overshoots, the "greater of" amortisation floor is binding and the content asset is not earning its cost; if revenue misses and an impairment appears in cost of revenue (the mechanism that already produced $43.4m in Q1 FY27), the cost reading wins outright and the FY2027 53.7% guided gross margin becomes the ceiling rather than the forecast [5, Outlook; 1, Note 1; upstream `04`, §1A for the filing date].

---

## 10. Computation Log (executed, not mental arithmetic)

All percentages and basis-point deltas above were produced by an executed Python snippet. Inputs are the cited filing figures; the printed output is reproduced verbatim.

```python
# Q2 FY27 vs Q2 FY26, filing basis [3, Item 2].  rev: 1497.0 vs 1773.8
# cost of revenue lines (2026, 2025): product 184.0/229.3 ; game intangibles 140.8/158.8
#   software dev & royalties 107.9/172.1 ; licences 131.9/154.4 ; internal royalties 72.0/78.7
# opex: S&M 444.9/536.7 ; R&D 254.4/268.0 ; G&A 230.5/225.0 ; D&A 48.1/48.8
# guidance midpoints [5]: FY27 rev 8080 CoR 3739.5 opex 4088 ; Q3 rev 3345 CoR 1690.5 opex 1172
```

```
rev change            -276.8   = -15.60%
Product costs          12.29% vs 12.93%  ->  +64bps favourable
Game intangibles        9.41% vs  8.95%  ->  -45bps
Software dev & royalty  7.21% vs  9.70%  -> +249bps favourable
Licenses                8.81% vs  8.70%  ->  -11bps
Internal royalties      4.81% vs  4.44%  ->  -37bps
Cost of revenue        42.525% vs 44.723%   Gross margin 57.475% vs 55.277% = +220bps
S&M  29.72% vs 30.26% = +54bps   ($ -91.8)     R&D 16.99% vs 15.11% = -189bps  ($ -13.6)
G&A  15.40% vs 12.68% = -271bps  ($  +5.5)     D&A  3.21% vs  2.75% =  -46bps  ($  -0.7)
Total opex 65.324% vs 60.802% = -452bps ;  EBIT margin -7.849% vs -5.525% = -232bps
opex split: cost-dollar -567bps / denominator +1019bps  (sum +452 OK)
CoR  split: cost-dollar -883bps / denominator  +664bps  (sum -220 OK)
EBIT: cost relief +1450bps - denominator drag 1683bps = -233bps (vs -232, residual -1bp rounding)
non-GAAP EBITDA margin  6.16% (92.2) vs 6.58% (116.7) = -42bps ; mgmt-basis 18.51% (277.1)
H1 FY27 gross margin 57.504% vs 58.747% = -124bps ; impairment 43.6 = 144bps of H1 revenue
FY26 gross 57.23% opex 58.80% EBIT -1.57% ; FY25 gross 54.34%
FY27 guided: gross 53.72% (-351bps vs FY26) opex 50.59% (-820bps) EBIT +3.13% (+469bps)
Q3 FY27 guided: gross 49.46% (-801bps vs Q2 FY27) opex 35.04% EBIT +14.42% (+2227bps)
Q3 FY27 guided CoR embeds SBC 96 = 2.87% of rev ; acquired intangibles 141 = 4.22%
FY27 guided CoR embeds SBC 113 = 1.40% of rev ; acquired intangibles 572 = 7.08%
Q3 sensitivity (opex fixed at 1172, CoR ratio held at 50.54%): -10% revenue -> EBIT 10.53%
   i.e. -387bps for a 10% miss = ~39bps of EBIT margin per 1% of revenue
capex: FY22-26 158.6/204.2/169.1/189.7/190.2 ; FY27 guide 290 = +52.5% vs FY26
6M fixed assets 163.3 vs 57.0 = 2.86x ; capitalised sw dev 2577.3 vs 2346.3 (+231.0)
```

---

## 11. Citations

[1] FY2026 Form 10-K (fiscal year ended 2026-03-31), filed 2026-05-22 — Item 1 (Business — General / Our Businesses / Sales / Marketing); Item 1A (Risk Factors — dependence on key products; limited number of channel partners; ability to acquire and maintain licenses); Item 7 (MD&A — Cost of revenue and gross profit; Operating Expenses; net revenue by content / platform / distribution channel; Online Content and Digital Distribution); Note 1 (Basis of Presentation and Significant Accounting Policies — Software Development Costs and Licenses); Note 21 (Segment); Consolidated Statements of Cash Flows p.66. `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`
[2] FY2025 Form 10-K (fiscal year ended 2025-03-31) — Item 7 (MD&A — Cost of revenue and gross profit; Operating Expenses, FY2025 / FY2024 / FY2023). `data/TTWO/10K_2024_25_0001628280-25-026694.pdf`
[3] Q2 FY2027 Form 10-Q (quarter ended 2026-09-30) — Condensed Consolidated Balance Sheets p.2; Statements of Operations p.3; Statements of Cash Flows p.5 (six months); Item 2 (MD&A — Results of Operations: Three Months Ended September 30, 2026 Compared to September 30, 2025, and Six Months comparison; Cost of revenue; Operating Expenses; Net Bookings; Online Content and Digital Distribution; Liquidity and Capital Resources); Note 15 (Asset Acquisition); Note 16 (Subsequent Events). `data/TTWO/10Q_2Q_0001628280-26-072254.pdf`
[4] Q1 FY2027 Form 10-Q (quarter ended 2026-06-30) — Condensed Consolidated Statements of Operations. `data/TTWO/10Q_1Q_0001628280-26-054870.pdf`
[5] TTWO Q2 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-11-09 — p.1 (Net Bookings $1,601.3m, −18%); p.2 (management-reporting adjustment table, 18% management tax rate, 188.0m share count); "Outlook for Fiscal Year 2027" and "Fiscal Third Quarter Ending December 31, 2026" (GAAP revenue, cost of revenue, operating expenses, EPS, capex, non-GAAP EBITDA, Net Bookings, and the deferred-revenue / stock-based-compensation / acquired-intangible adjustment columns); "Non-GAAP Financial Measure" (EBITDA definition); p.11 (Reconciliation of GAAP to Non-GAAP Measure); "Key assumptions and dependencies"; release schedule. `data/TTWO/TTWO 2Q27 Earnings Release FINAL.pdf`
[6] TTWO Q1 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-08-07 — p.2 (management-reporting adjustment table; Q1 FY27 impairment on an abandoned third-party title). `data/TTWO/TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf`
[7] Capital IQ `Financials_Annual` export, **Income Statement** and **Segments** tabs (FY2017 → FY2026 + LTM Sep-30-2026; reported currency USD m; restatement basis "Latest Filings"), data as of the 2026-11 export. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Annual.xls`
[8] Capital IQ `Financials_Annual` export, **Cash Flow** and **Supplemental** tabs. Same workbook as [7].
[9] Capital IQ `Financials_Quarterly` export, **Income Statement** tab (FQ1 2017 / Jun-30-2016 → FQ2 2027 / Sep-30-2026), data as of the 2026-11 export — used ONLY where the filing does not disclose the line (Q3 FY26 and Q4 FY26 columns), and never mixed with filing-basis margins. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Quarterly.xls`
[10] `ciq_facts.json` deterministic facts sidecar (frozen extract generation) — `ltm_ebitda_m` 724.9; `ltm_ocf_m` 367.1; `margin_trend`; `segments`; all referencing the Capital IQ workbooks at [7]–[9]. Tier-5 vendor export, never cited as a filing.
[11] Take-Two Interactive Software, Inc., **Q2 2027 Earnings Call verbatim transcript**, 2026-11-09 (S&P Capital IQ; Call Participants + Presentation + Question and Answer) — prepared remarks (Goldstein: cost of revenue, operating expenses, management-basis operating expense growth, FY27 and Q3 outlook, pre-orders; Zelnick: Q2 shortfall); Q&A (Schoell / Goldstein on full-year gross margin drivers; Smilek / Goldstein on user-acquisition costs; Song / Goldstein on Q4 operating expenses; Heaney / Zelnick on direct-to-consumer margins). `data/TTWO/Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf`
[12] Take-Two Interactive Software, Inc., Q1 2027 Earnings Call verbatim transcript, 2026-08-07 (S&P Capital IQ). `data/TTWO/Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf`

**Upstream and cross-module inputs used:** `analyses/TTWO_2026-11-19/earnings/00_earnings-data-triage.md` (jurisdiction, reporting basis, pool inventory, the Net-Bookings-vs-GAAP basis warning); `…/01_historical-financials.md` (margin baseline, the vendor-vs-filing gross-margin trap, TTM and capex series); `…/04_guidance-consensus.md` (guidance table, basis bridges, Q3 FY27 filing date, consensus revision pattern); `analyses/TTWO_2026-11-19/business-model/02_business-identity.md` §3a (sector-overlay determination, KPI presence/absence), `03_segment-map.md` (single-segment structure), `06_value-chain.md` (pricing power, pass-through, realised cost absorption), `10_external-dependency.md` (cyclicality classification, policy register, FX sensitivity).

**Not used:** `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant (Alphabet Inc., not Take-Two) and is cited nowhere in this report. The DEF 14A export (2026-07-27) contains no tabular payload and carries no margin content.

---

## 12. Self-Check

- Segment decomposition status stated explicitly (Section 1): single reportable segment per the company; revenue disaggregated on four axes, costs disclosed on none.
- Sector overlay step completed (Section 1a): no matching row in `SECTOR_OVERLAYS.md`; generic cost stack applies, built from the company's own nine disclosed cost lines; bank / REIT / SaaS / miner grammars explicitly rejected with reasons.
- Every driver row carries direction, magnitude and evidence. Two rows carry **Unknown** and two carry **Not assessable** rather than a manufactured read.
- The bridge uses reported line items only; the residual is **0bps** on the ratio bridge and **−1bp** (rounding) on the causal decomposition, both printed with their arithmetic and their basis named.
- Section 7a closes with the standalone `RF-EARN-002` tag line in the reconciled form.
- Primary margin metric (EBIT, filing basis) chosen and justified in Section 4, with the single-quarter limitation stated.
- Section 8 names ONE driver.
- Section 9 states both signs with evidence on each, separates the content spend from the fixed-asset spend (which is largely a lease buyout with a *falling* guided depreciation charge), and names the one observable that would flip the read.
- Pass-through lag stated explicitly (Section 3): price rises only at a launch, price **cuts** 3–9 months after one; no contractual escalator, but realised absorption of 160bps in FY2026 shown separately from the contractual fact.
- Cycle position stated with evidence (Section 1b): release-cycle trough in Q2 FY27, peak in Q3 FY27, with three non-run-rate items labelled. Reconciled against business-model `10_external-dependency.md` — no divergence.
- Segment/content/platform mix treated as a scored driver (Sections 5 and 6), not buried in prose.
- Verbatim transcript present for the latest quarter, so no transcript limitation and no `MODULE_RULES.md` score cap arises from this agent's inputs.
- No banned phrases. No vendor margin figure mixed with a filing margin figure.
