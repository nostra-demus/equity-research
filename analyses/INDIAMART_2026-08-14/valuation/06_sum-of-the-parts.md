# Sum-of-the-Parts — INDIAMART

**Reporting currency / regime:** INR (Indian Rupee), Ind AS (India's IFRS-converged accounting standard), fiscal year ended 31 March. All figures in ₹ millions unless stated. Segment source: FY26 Integrated Annual Report (Ind AS), Note 32 — Segment information [`IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf`], cross-checked against `Financials (1).xls, Segments tab` (Capital IQ export, FY21A–FY26A). Upstream anchors reused verbatim from `01_price-and-capital-structure.md` (Reconciliation Gate 1): price ₹1,784.60 (2026-08-12 close, pool-verified), diluted shares 60,291,720, net debt (broad basis, canonical) ₹(33,670.3)mn net cash, EV (broad basis, canonical) ₹73,644.05mn.

## Partial-Data Rule Applied: Single-Segment Collapse

IndiaMART reports two segments, but one is overwhelmingly dominant on both tests:
- **Revenue test:** Web and Related Services = 91.96% of FY26 consolidated revenue (₹14,429.38m of ₹15,690.42m).
- **Profit test:** Web and Related Services = 100.53% of FY26 consolidated segment result (₹5,328.56m of ₹5,300.41m total), because the second segment, Accounting Software Services, posted a small operating **loss** (₹(28.15)m) that year.

Both clear the >85%-of-EBIT single-segment threshold. **Effectively single-segment — SOTP collapses to the consolidated read.** Per the partial-data rule, this report does not force a spurious two-segment breakup; it provides the dominant-segment multiple sanity check below. There is no unallocated corporate cost bucket on the income-statement side to drop by assertion — the two reportable segments' results sum to exactly 100% of the consolidated segment result (₹5,328.56m + ₹(28.15)m = ₹5,300.41m) — so the Reconciliation Gate 3 concern (no vanished bucket) is satisfied by construction, stated explicitly in §1 below. The one "Unallocable" item in the segment note is a **balance-sheet asset** line (₹7,629.29m, FY26), not an income-statement drag, and is not part of the EBIT walk.

## 1. Segment Inventory

| Segment | Revenue (₹mn) | Segment Result / EBITDA (₹mn) | Margin | % of Total Segment EBIT | Source |
|---|---:|---:|---:|---:|---|
| Web and Related Services | 14,429.38 | 5,328.56 | 36.9% | 100.5% | FY26 Annual Report (Ind AS), Note 32 |
| Accounting Software Services | 1,261.04 | (28.15) | (2.2)% | (0.5)% | FY26 Annual Report (Ind AS), Note 32 |
| **Total (reportable segments)** | **15,690.42** | **5,300.41** | **33.8%** | **100.0%** | FY26 Annual Report (Ind AS), Note 32 |

**Denominator definition:** "% of Total Segment EBIT" uses total reportable-segment result (₹5,300.41m) as the denominator — this is not net of any separate corporate-cost drag, because none exists at the operating-profit level; the two segments' results sum exactly to the consolidated total (100.5% + (0.5)% = 100.0%). No corporate bucket is netted out and none vanishes. (A small CIQ-export variant of Web and Related Services' FY26 revenue, ₹14,429.94m vs the Annual Report's ₹14,429.38m — a ₹0.56m / 0.004% rounding difference — is noted for completeness; the audited Annual Report figure is used as primary per the source hierarchy.)

Accounting Software Services is run through two wholly-owned subsidiaries, Busy Infotech Private Limited (acquired for ~₹500 crore per management commentary, Q1 FY27 earnings call) and Livekeeping Technologies Private Limited. It carries ₹4,542.72m of goodwill on the balance sheet, and the FY26 statutory auditor (B S R & Co. LLP) flagged goodwill impairment as a Key Audit Matter [FY26 Annual Report, Independent Auditor's Report]. It is small, currently loss-making, and growing fast (Busy Infotech billings ~₹59 crore in Q1 FY27 vs ~₹10 crore a year earlier, per management commentary) — a call option, not a value driver today.

A related entity, **Simply Vyapar Apps Private Limited** (~28.6%–28.7% stake), is accounted for as an equity-method **associate**, not a subsidiary. It is not in either segment above; it appears only as "Share in net loss of associates" (₹(547.72)m in FY26) below the segment-result line [FY26 Annual Report, Note 32]. This matters for the equity bridge in §4 — its value is not embedded in segment EBITDA at all.

## 2. Segment Multiples & Comparables

| Segment | Metric Used | Period Basis | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---|---:|---|---:|---|
| Web and Related Services (proxied by consolidated — the metric already nets the Accounting Software Services drag, per the collapse rule) | Consolidated EBITDA | **NTM** (consensus) | 12.32x TEV/EBITDA | IndiaMART's own current market-implied multiple (self) | 12.32x | `EstimatesReport.xls, Multiples tab` — NTM TEV/EBITDA, Capital IQ consensus (18/18–15/15 analysts) |
| — cross-check, not used for the base valuation | LTM/NTM EBITDA, P/E | LTM / NTM | n/a (directional only) | Just Dial Limited (NSEI:JUSTDIAL) | EV/EBITDA: **unusable** (0.2x LTM / 0.22x NTM — see note); NTM forward P/E: 10.29x | `Company Comparable Analysis....xls, Trading Multiples + Financial Data tabs`, as-of 2026-08-13 |
| Accounting Software Services | Not structurable on a forward basis — excluded | — | — | — | — | No listed pure-play Indian SME-accounting-software comparable exists in this pool (Tally, Zoho are private); the segment's forward metric is a small, currently negative EBITDA with no consensus estimate split out |

**Why the "self" multiple, not a peer multiple, anchors the sanity check.** The credible India peer set is thin and mismatched (per `00_valuation-data-triage.md` §6A and `business-model/08_competitive-map.md`): Info Edge (Naukri, NSEI:NAUKRI) trades at 53.03x NTM TEV/EBITDA but is a much richer, differently-shaped business (recruitment classifieds plus large minority stakes in other listed names); Eternal (Zomato) and the two China/Kazakhstan names have no relevant business-economics overlap (food delivery, unrelated small-caps). **Just Dial is the closest same-country, same-adjacency (local search / B2B lead-generation) comparable, but its EV/EBITDA multiple cannot be used**: its Total Enterprise Value is only $8.3mm against a $613mm market cap, because $604.7mm of net cash swamps the EV almost to zero — 0.2x LTM TEV/EBITDA and 0.22x NTM TEV/Forward EBITDA are artefacts of a cash-heavy balance sheet, not a read on the value of Just Dial's operating business [`Company Comparable Analysis....xls, Financial Data tab`: TEV $8.3mm, LTM EBITDA $38.6mm, Net Debt $(604.7)mm]. Using it would fabricate a segment multiple from a distorted number, which this rule set bans. Just Dial's **P/E** (10.29x NTM forward, unaffected by the cash-swamp because P/E uses market cap, not EV) is shown as directional-only context in §5. Given no usable independent peer multiple exists for the dominant segment, the defensible sanity check is: **does the market's own current multiple already fairly price the dominant segment on its own, with no segment being masked?** — answered in §3–4 below.

## 3. Segment Valuation

| Segment | Metric Value (₹mn, NTM) | Multiple | Segment EV (₹mn) |
|---|---:|---:|---:|
| Web and Related Services (proxied by consolidated NTM EBITDA, which already nets the Accounting Software Services drag) | 5,978.7 [`EstimatesReport.xls, Consensus tab`, "Company Level (INR)", NTM column, EBITDA row] | 12.32x (NTM TEV/EBITDA, market-implied) | 73,657.4 |
| Accounting Software Services | Not structurable on a forward basis — excluded (already netted into the consolidated NTM EBITDA figure above, not separately valued, and not double-counted) | — | — |
| **Gross enterprise value (sum)** | | | **~73,657** |

`5,978.7 × 12.3177358969007 ≈ ₹73,644.06m` (shown to more decimals: the derived figure reconciles to **₹73,644.05m**, the canonical EV in `01` (broad basis), to within ₹0.01m / <0.001%). This is not a coincidence — it is the point of the sanity check: because the dominant segment is ~92% of revenue and >100% of profit, the market's current NTM EV/EBITDA multiple on **consolidated** EBITDA is, in effect, already the market's multiple on the **dominant segment**. There is no gap between "what a standalone breakup would say" and "what the consolidated multiple says," because there is effectively nothing left to break up. This is the collapse confirmed numerically, not just asserted.

**Multiple-driven dispersion (sensitivity, not a probability-weighted scenario — that is `07`'s job):**

| NTM TEV/EBITDA multiple | Gross EV (₹mn) | Equity value (₹mn, after §4 bridge) | Value/share (₹) |
|---:|---:|---:|---:|
| 10.0x (de-rate toward Just Dial's cheaper same-country profile) | 59,787.0 | 96,204.2 | 1,595.6 |
| **12.32x (current market-implied — base)** | **73,644.1** | **110,061.3** | **1,825.5** |
| 15.0x (re-rate case) | 89,680.5 | 126,097.7 | 2,091.2 |

## 4. Equity Bridge

| Step | Value (₹mn) |
|---|---:|
| Gross enterprise value | 73,644.05 |
| − Capitalized unallocated corporate costs | 0 (none exist — reportable segments sum to exactly 100% of consolidated segment result; see §1) |
| − Net debt (broad basis, canonical per `01`) | (33,670.3) — net cash; single line, sign shown negative, no separate add-back |
| − Minority / preferred | 0 (no NCI on the balance sheet; no preference shares in issue — `01`) |
| + Equity-method investments | 2,746.89 (Investments in associates, incl. the ~28.6–28.7% Simply Vyapar Apps stake, carrying/book value at 2026-06-30 — `01` EV bridge note; `Financials (1).xls, Balance Sheet tab`) |
| − Conglomerate / holdco discount | 0 (see note below) |
| **= Equity value** | **110,061.24** |
| ÷ Diluted shares | 60,291,720 |
| **= SOTP value per share** | **₹1,825.48** |
| vs current price | ₹1,784.60 → **+2.3%** |

**Internal consistency check:** Gross EV (₹73,644.05m) minus net debt broad basis (₹(33,670.3)m) = ₹107,314.35m, which matches `01`'s market capitalization figure (₹107,314.35m) exactly. That is expected — the EV and net-debt figures are `01`'s own canonical anchors, not independently re-derived here. The only genuine SOTP-specific addition is the +₹2,746.89m equity-method investment line, which is **not** embedded in segment EBITDA at all (Simply Vyapar's results show up only as a loss below the segment-result line, per §1), so a plain EV/EBITDA read of the consolidated business would silently omit it.

**Net-cash sign discipline:** net debt is shown as a single negative line (net cash), added back once. No separate "+ net cash" line exists.

**Conglomerate / holdco discount — none applied, and why.** IndiaMART is an operating company (Business-Type Method Map: Operating), not a holding company: it runs one dominant, wholly-owned operating business (Web and Related Services) plus a small, wholly-owned bolt-on (Accounting Software Services) that is already embedded in the consolidated NTM EBITDA metric used above — there is no sprawling, unrelated multi-business structure that would justify a diversification/opacity discount under CLAUDE.md §24 Filter 6. The Simply Vyapar stake is added at **book (carrying) value**, not a fair-value mark-up — a conservative choice, and one that already reflects Vyapar's own accumulated losses (₹(547.72)m attributed in FY26 alone), so no further illiquidity haircut is layered on top; a materially different fair value for that stake is not evidenced in this data pool.

## 5. SOTP Read

The dominant-segment sanity check puts breakup value at **₹1,825/share (dispersion ₹1,596–₹2,091 across a 10x–15x NTM EV/EBITDA multiple band)** against a current price of ₹1,784.60 — a gap of about +2.3% at the base multiple, which is not a mispricing signal: it is fully explained by adding the ~₹2.7bn book value of the Simply Vyapar equity-method stake (~2.6% of market cap), a holding that never appears in segment EBITDA and so is invisible to a plain consolidated EV/EBITDA read. Web and Related Services — the core India B2B marketplace — carries effectively all of the value; there is no masked high-value segment being obscured by a low consolidated multiple, because there is no second material segment. If anything runs the other way, it is Accounting Software Services (Busy Infotech + Livekeeping): a currently loss-making bolt-on with auditor-flagged goodwill-impairment risk, already netted into (and slightly dragging down) the consolidated NTM EBITDA this sanity check uses — a small embedded liability-in-waiting, not a hidden asset. The one genuine "not fully priced in the headline multiple" sliver is the Simply Vyapar stake, worth ~₹2.7bn at book (~₹46/share), which this bridge picks up and a bare consolidated-multiple read would miss.
