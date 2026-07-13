# Sum-of-the-Parts — EMAR

*Emaar Properties PJSC (DFM: EMAAR). UAE / Dubai issuer, **IFRS**, reporting currency **AED**; the dirham is hard-pegged to the US dollar at 3.6725 AED/USD, so AED↔USD carries negligible currency risk. All segment figures are audited **FY2025** (year ended 31 Dec 2025) from Note 3 of the annual report. Anchor price, shares, net cash and minority are taken verbatim from `01_price-and-capital-structure.md` (price AED 12.20, as-of 2026-06-28, pool-verified). This is a **base-case fair-value level (a point) with the multiple-driven dispersion shown separately** — not a single precise target, and not a probability-weighted price (that is the master synthesizer's job).*

**Why SOTP matters here.** Emaar is two businesses bolted together: a cyclical Dubai off-plan **developer** (build-and-sell homes, ~80% of revenue) sitting on top of a wholly-owned, prime, recurring-rent **mall landlord** ("Emaar Malls", ~15%) plus a small **hotel** arm (~5%). The market prices the whole group on one blended multiple — enterprise value ÷ operating cash profit (EV/EBITDA) of **4.0x**, the very bottom (0th percentile) of Emaar's own 16-quarter range of 5.1–8.4x [`ciq_facts.json` → ev_ebitda_current 4.0x / range_position]. A single low multiple can hide a high-value segment behind a low-value one. SOTP tests exactly that.

**This is NOT a single-segment business** — Real Estate is ~73–80% of profit/revenue, below the 85% collapse line — so the full breakup is run (Valuation MODULE_RULES, Segment/SOTP rule).

---

## 1. Segment Inventory

Reportable segments per IFRS 8 (three segments + an "Others" catch-all), FY2025, AED millions. The segment note reports each segment's "result" as **profit before tax, before impairment and before unallocated items** — a messy figure struck *after* each segment's own finance income and finance costs. For an EV multiple I need a pre-financing operating figure, so I strip each segment's net finance income back out:

> **Segment EBIT = segment result − segment finance income + segment finance costs.**  **Segment EBITDA = segment EBIT + segment depreciation/amortisation (D&A).**

This is the single most important adjustment in this report: the Real Estate "result" of AED 19,752m includes **AED 2,770m of finance income** (interest earned on its large cash and receivables). Leaving it in would double-count, because the cash that earns it is added back separately in the equity bridge (§4). Stripping it takes Real Estate to a clean ~45% operating (EBIT) margin — matching the segment-map caveat that the headline ~50% is "flattered by finance income."

| Segment | Revenue | EBIT (ex-finance) | EBITDA (ex-finance) | EBIT Margin | % of Segment EBIT | Source |
|---|---:|---:|---:|---:|---:|---|
| **Real Estate** (off-plan developer) | 39,550.4 | 17,846.9 | 18,140.1 | 45.1% | **72.5%** | FY2025 AR (IFRS), Note 3, p.187–188 |
| **Leasing, Retail & Related** (Emaar Malls) | 7,681.3 | 5,415.7 | 6,397.8 | 70.5% | **22.0%** | Note 3, p.187–188 |
| **Hospitality** (hotels) | 2,325.6 | 893.7 | 1,182.0 | 38.4% | **3.6%** | Note 3, p.187–188 |
| **Others** (property mgmt + financial-services associates) | 0.0¹ | 446.6 | 518.0 | n/m | **1.8%** | Note 3, p.187–188 |
| **Sum of reportable segments** | **49,557.3** | **24,602.9** | **26,237.8** | | **100.0%** | derived |
| *− Unallocated corporate SG&A (the corporate drag)* | | *(1,314.0)* | *(1,314.0)* | | *separate* | Note 3, p.187 (AED 1,313,953k) |

**"% of Segment EBIT" denominator** = the AED 24,602.9m sum of the four segments' operating EBIT, so the shares sum to exactly 100%. The **unallocated corporate SG&A of AED 1,314m sits *outside* the segments** and is shown as a separate line — it is not netted into any segment and cannot produce a >100% artefact. It is a real cost and is capitalised-and-subtracted in the bridge (§4), never dropped (Reconciliation Gate 3).

¹ Others carries no external segment revenue (its income sits in other operating income); it is 1.8% of segment profit and 2.4% of segment assets — immaterial, not a hiding place.

**Reconciliation to the consolidated read.** Sum-of-segment EBITDA 26,237.8 − corporate SG&A 1,314.0 = **24,923.8**, versus CIQ standardized group EBITDA of **24,132** [earnings/01]. The AED **~792m gap** is the group's share of associate/joint-venture results and other income that is embedded in the segment "results" but stripped from CIQ standardized EBITDA. Because that JV/associate income is *already captured inside the segment metrics*, I do **not** separately add the equity-method investment book value (AED 7,528.7m [`01`]) in the bridge — that would double-count (§4). Revenue foots exactly to the audited AED 49,557.3m [Note 4].

**Dominant segment / cyclicality flag (critical to every multiple below).** Real Estate carries 72.5% of segment EBIT, but this is a **Dubai property-cycle peak, not a run-rate**: 2025 was Dubai's strongest year on record, consensus long-term earnings growth is **−14.8%** (the market itself prices a roll-over), development gross margin is guided down from 63% (FY23) → 55% (FY25) → "low 50s," and the base rate is Dubai boom-bust (2009; 2015–2019) [business-model/10_external-dependency §3; earnings/03_margin-drivers §Cycle-Position; `ciq_facts` consensus_view]. The FY2025 net-profit figure is further flattered by a one-off tax relief, but that sits below EBIT — using pre-tax EV/EBITDA insulates this SOTP from the tax noise.

---

## 2. Segment Multiples & Comparables

Every multiple is EV/EBITDA on FY2025 segment operating EBITDA (ex-finance-income), each anchored to a **named** comparable. Peer multiples are the pool CIQ comp set (as-of 2026-06-28) where a listed comparable exists; the hotel comp is web-sourced and labelled unverified. Multiples are deliberately set *below* the direct comp where the segment is cyclical, single-city, or peak-earning.

| Segment | Metric Used | Multiple Applied (base) | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| **Real Estate** | EV/EBITDA (FY25, ex-finance) | **5.0x** | **Aldar Properties (ADX:ALDAR)** — the largest *listed* UAE developer; the only regional peer with audited, comparable economics | 8.3x EV/EBITDA LTM | CIQ Comps → Trading Multiples, 2026-06-28 |
| **Leasing / Retail (malls)** | EV/EBITDA (FY25) | **12.0x** | **Arabian Centres / Cenomi Centers (SASE:4321)** — listed Saudi mall owner-operator (recurring rent), the closest listed mall-landlord comp | 18.9x EV/EBITDA LTM | CIQ Comps → Trading Multiples, 2026-06-28 |
| **Hospitality** | EV/EBITDA (FY25) | **9.0x** | **Host Hotels & Resorts (NASDAQ:HST)** and asset-heavy hotel owners — no hotel peer exists in the pool comp set | ~10–13x EV/EBITDA | Web, 2026 — **unverified, directional** |
| **Others** | EV/EBITDA (FY25) | **5.0x** | Diversified property-services / financial-services holdings — conservative catch-all (cross-check: book net assets ~AED 3.9bn) | n/a (blended) | Note 3 (assets/liabilities); judgment |

**Why each multiple fits (and why the discount):**

- **Real Estate at 5.0x** — Aldar is the clean listed anchor at 8.3x. Emaar's developer arm out-earns Aldar by a wide margin (Emaar ~45% EBIT margin vs Aldar ~27% [CIQ Operating Statistics]) and carries net cash, which argues *up*. But three factors argue *down* by ~40%: (i) near-total single-city Dubai off-plan concentration (93% UAE revenue), (ii) peak-cycle earnings that consensus expects to fall ~15%, and (iii) the government-controller overhang (§4). 5.0x is a modest premium to the market's 4.0x whole-company multiple, reflecting the developer's superior margins/backlog without underwriting peer parity on peak earnings.
- **Leasing/Retail at 12.0x** — Arabian Centres/Cenomi (18.9x) is the direct listed mall comp. A 12x multiple is a ~36% discount to it and equates to an **~8.3% capitalisation rate** (the yield a buyer demands on rental profit; EBITDA ≈ net operating income here). For a prime Dubai retail portfolio anchored by The Dubai Mall, an 8%+ cap rate is conservative — a trophy-asset cap rate of ~6.7% would justify ~15x. Malls are the highest-quality, most stable segment (~70% EBIT margin, recurring rent) and are **wholly owned** (see §4).
- **Hospitality at 9.0x** — no pool hotel comp; global asset-heavy hotel owners trade ~10–13x [Web, unverified]. 9x reflects single-market Dubai tourism cyclicality and smaller scale. Immaterial to the total (~5% of value; ±2x barely moves the per-share figure).
- **Others at 5.0x** — a grab-bag of property-management fees and minority financial-services associate stakes; 5x its result ≈ its book net assets (~AED 3.9bn). Immaterial (~2%).

---

## 3. Segment Valuation

Base-case multiples (§2). AED millions.

| Segment | Metric Value (EBITDA) | Multiple | Segment EV | % of Gross EV |
|---|---:|---:|---:|---:|
| Real Estate | 18,140.1 | 5.0x | 90,700.3 | 50.2% |
| Leasing / Retail (malls) | 6,397.8 | 12.0x | 76,773.4 | 42.5% |
| Hospitality | 1,182.0 | 9.0x | 10,638.0 | 5.9% |
| Others | 518.0 | 5.0x | 2,589.9 | 1.4% |
| **Gross enterprise value (sum)** | | | **180,701.7** | 100.0% |

The malls (42.5% of gross EV) punch far above their 22% profit weight because a recurring-rent annuity earns a mid-teens multiple while a cyclical developer earns a low one. That gap is the whole point of running SOTP.

---

## 4. Equity Bridge

Base case. AED millions except per-share. Share count, net cash and minority are `01`'s canonical figures, used verbatim (Reconciliation Gate 1).

| Step | Value | Note |
|---|---:|---|
| Gross enterprise value | 180,701.7 | §3 |
| − Capitalised unallocated corporate SG&A (1,314.0 × 5.0x) | (6,570.0) | corporate drag capitalised at the developer multiple; **not dropped** (Gate 3) |
| − Net debt *(broad basis = **net cash** of 24,969.2, so this ADDS)* | **+24,969.2** | `01` canonical broad net cash; single line, added once, correct sign |
| − Minority / non-controlling interest (book) | (13,808.3) | `01`; concentrated in Emaar Development (the developer arm) — see below |
| + Equity-method investments | 0.0 | income already inside segment results (~AED 792m, §1); adding book (7,528.7) would double-count |
| − Preferred equity | 0.0 | none |
| **= Equity value (pre-discount)** | **185,292.6** | = AED **20.96**/share |
| − Conglomerate / holdco + state-owner discount (**20%**) | (37,058.6) | reason below |
| **= Equity value (post-discount)** | **148,234.1** | |
| ÷ Diluted shares | 8,838.789849 | `01` (basic = diluted; no options/converts) |
| **= SOTP value per share (base)** | **AED 16.77** | |
| vs current price | **AED 12.20** | `01`, pool-verified 2026-06-28 |
| **Margin of safety (base)** = (16.77 − 12.20) / 16.77 | **+27%** | discount of price to base fair value |

**Net-cash sign discipline.** The bridge subtracts net debt. Emaar is **net cash** on the canonical broad basis (AED 24,969m), so the line is a single positive add-back; there is **no** separate "+ net cash" line and no double-count. The broad basis nets in AED 22.5bn of unrestricted bank term deposits; `01`'s cash-quality test already excluded RERA-trapped escrow (AED 43,338m) and immaterial mark-to-market securities. On the **strict** §15 basis, net cash is only AED 2,115m — using strict instead of broad lowers the base by ~AED 2.58/share (to ~AED 14.2). Broad is `01`'s canonical figure and is used here; strict is carried as the conservative floor in the low case.

**Conglomerate / holdco discount of 20% — applied, with reason.** Two structural reasons, not a reflex haircut:
1. **RF-OWN-004 (§24 Filter 6, mandatory value-trap flag).** The **Government of Dubai (Dubai Holding group) controls 29.73%**; every "independent" director is a government official; and an IAS 24 election leaves the largest related-party channel (land/utilities/construction from the state ecosystem) unquantified to minorities [management-governance/99 synthesis; FY2025 AR Annex I p.153 / Note 33]. A controller pursuing a city-building agenda has **no incentive to break the company up** to release the malls' value. Persistent cheapness under such an owner is a value trap, not a margin of safety, and must be treated as such (Valuation MODULE_RULES; CLAUDE.md §24).
2. **Structure.** A cyclical developer and an annuity landlord priced as one entity; the masked value only crystallises via a spin/breakup that will not happen.

A 20% discount is mid-range for a government-controlled multi-segment entity; it brings the base to AED 16.77, essentially in line with the consensus analyst target of AED 17.07 [`ciq_facts` consensus_view] — an independent cross-check that the discounted base is not fanciful.

**Minority-interest note (direction of error).** The AED 13,808m minority is ~99% **Emaar Development PJSC** (the build-to-sell developer), plus a small Emaar Misr (Egypt) slice [FY2025 AR, material-NCI note]. **Emaar Malls was taken private in 2021 and is wholly owned — its SOTP value is fully attributable to Emaar Properties shareholders, not shared.** Because the minority sits in the Real Estate arm, subtracting *book* minority is about right at the base (5x) multiple but **understates** the true economic minority at higher developer multiples — so the bull case below is flattered and the true bull is lower than shown.

### Dispersion (multiple- and cycle-driven — shown separately, not false precision)

Same bridge, varying the two swing assumptions (developer multiple/cycle and mall multiple) and the cash basis; 20% discount applied throughout.

| Case | Real Estate | Malls | Hosp. | Cash basis | SOTP / share | vs price 12.20 |
|---|---|---|---|---|---:|---:|
| **Low (bear)** | EBITDA −20% (normalised) × 4.5x | 10.0x | 7.0x | strict (2,115) | **AED 11.04** | −10% |
| **Base** | 18,140 × 5.0x | 12.0x | 9.0x | broad (24,969) | **AED 16.77** | +37% |
| **High (bull)** | 18,140 × 8.3x (Aldar parity) | 15.0x | 11.0x | broad (24,969) | **AED 23.79**† | +95% |

†Bull overstates because book minority understates the true economic minority in the developer arm at 8.3x. The honest read is the **base ~AED 16.8, with a wide AED 11–24 band** — the width is itself the finding: the value hangs almost entirely on the developer multiple (the cyclical piece) and the mall multiple.

---

## 5. SOTP Read

**The parts are worth more than the whole (~AED 17 base vs AED 12.20 price), but the gap is a masked annuity, not a free lunch — and a government owner makes the discount partly warranted.** Break the value in two: on a conservative 12x mall multiple (a 36% discount to the Cenomi comp), the **wholly-owned Emaar Malls annuity alone is worth ~AED 76.8bn of enterprise value — 79% of Emaar's *entire* current EV of AED 96.7bn**, from just 22% of profit. Carve the malls, hotels and Others out of the current EV at their own multiples and the market is left implying the crown-jewel Dubai off-plan developer — 72% of group profit — at roughly **0.4x its own EBITDA, i.e. almost nothing**. That is the segment being masked: a high-quality recurring-rent landlord buried inside a company the market prices as one 4x cyclical developer.

**Which segment carries the value:** Real Estate is the largest single block by absolute EV (~50% at base), but it is the cyclical, peak-earning, minority-shared, lowest-multiple piece — so it *drives* the value while the **malls *hold* the quality**: the malls plus net cash (76.8 + 25.0 = ~AED 102bn) approximate the entire AED 107.8bn market cap, meaning the market assigns almost nothing, net, to the developer and hotels after the annuity and the cash.

**The value-trap caveat is doctrine here, not a hedge (RF-OWN-004).** The 27% base margin of safety and the malls-plus-cash floor look like protection, but the low multiple is at least partly *deserved*: developer earnings sit at a Dubai-cycle peak that consensus expects to fall ~15%, and the Government-of-Dubai controller (29.73%) has no incentive to unlock the masked mall value or distribute it to minorities. On a hard-but-defensible bear (developer normalised down, low multiples, strict cash), SOTP falls to ~AED 11 — below today's price. So this is a genuine masked annuity *and* a structural value trap at the same time; the parts justify no verdict better than "modestly undervalued," and the gap should be underwritten only by an investor who is paid to wait through the cycle under an owner who may never close it.
