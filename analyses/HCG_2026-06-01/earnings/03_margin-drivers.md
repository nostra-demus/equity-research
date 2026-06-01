# Margin Drivers — HCG

**Company:** HealthCare Global Enterprises Limited (NSE: HCG, BSE: 539787) — pan-India oncology-focused hospital chain.
**Reporting currency:** INR million (₹ Mn), consolidated. FY ends 31 March (FY26 = year ended 31 Mar 2026).
**Basis note:** All figures post-Ind AS 116 (leases capitalised). Two EBITDA constructs are kept separate throughout (per upstream `01_historical-financials`): **Reported EBITDA** (audited statutory operating result, pre other-income) and **Adjusted EBITDA** (company-defined = Reported EBITDA + ESOP cost + one-time costs).
**Cost-stack reconciliation:** FY24/FY25 cost lines are audited (FY24-25 Annual Report, Statement of P&L p.313 and Notes 26–30). FY26 cost lines are taken from the board-approved audited results deck dated 19 May 2026 (P&L p.19/20); the FY26 statutory statement is not in the pool. The deck splits **Medical Consultancy Charges** out as its own line; the audited statement lumps that charge inside Note 30 "Other expenses." Both views are reconciled in Section 2.

> **Upstream dependency:** `01_historical-financials.md` was present and is the margin baseline used here. `00_…` triage not re-read; not required for this agent.
> **Cross-module:** Business-model `03_segment-map.md` and `06_value-chain.md` were present and used for segment decomposition and pass-through context. `04_unit-economics.md` was also used for the centre-maturity (operating-leverage) read.
> **Transcript note:** No standalone transcript file sits in the data pool. Management margin/pricing commentary is sourced second-hand from the business-model `06_value-chain.md` and `04_unit-economics.md`, which quote the May 20 2026 (Q4/FY26) and Feb 9 2026 (Q3/FY26) earnings calls. Where a claim rests on that chain it is cited as `[via BM 06_value-chain / 04_unit-economics, quoting <call>]` and treated as transcript-tier (below filings). Direct transcript verification was not possible.

---

## 1. Segment Decomposition Status

**Single-segment business — consolidated read.** HCG reports **one** operating segment under Ind AS 108, "Medical and Healthcare Services" (cancer care). On the audited revenue-by-type split, ~93% of FY25 revenue is income from medical (hospital) services [FY24-25 Annual Report, Note 22 (Consolidated)], and the business-model module confirms oncology ≈ 97.6% of revenue and ≈ 98.5% of Adjusted EBITDA after stripping the divesting fertility line [BM 03_segment-map, §2]. This clears the >85%-from-one-segment test, so margin drivers are analysed at the **consolidated level**.

**There is no audited segment-level P&L** — the filing gives only revenue by type and revenue/non-current assets by India vs Outside India; profit is disclosed only at group level [FY24-25 Annual Report, Note 36 (Consolidated); BM 03_segment-map, §3]. The economically meaningful margin split is therefore **not a product segment but centre maturity** (mature vs ramping vs emerging cohorts), which HCG discloses only in its investor deck and on a pre-Ind AS, "excluding fertility" basis — i.e., management figures, not audited segment accounting. That cohort split is treated below (Section 5, "operating leverage" driver, and Section 6) as the closest available proxy for a segment margin decomposition, flagged as deck-tier. Per-product / per-modality margins are **not disclosed** and are not guessed.

---

## 2. Cost Stack

Consolidated. Each line is shown as a % of total revenue (operations + government grant). FY26 = deck P&L (19 May 2026, p.19/20); FY25 = audited (FY24-25 AR, p.313 and Notes 26–30). "Direction" = direction of the cost as a share of revenue (rising share = margin headwind). Reconciliation: the deck's **Cost of Goods Sold** = audited "Purchases of medical/non-medical items" + "Changes in inventories" (FY25: 5,902.16 − 96.17 = 5,805.99 ≈ deck 5,806.0 ✓). The deck's **Other Expenses** = audited Note 30 "Other expenses" (₹9,014.92 Mn FY25) **minus** Medical Consultancy Charges (₹4,816.73 Mn FY25), which the deck reports on its own line (FY25: 9,014.92 − 4,816.73 = 4,198.19 ≈ deck 4,173.2, small lab/recovery reclass).

| Cost Line | FY26 ₹ Mn (% of rev) | FY25 ₹ Mn (% of rev) | Δ bps (share) | Direction | Evidence | Margin Risk |
|---|---:|---:|---:|---|---|---|
| Cost of Goods Sold (drugs + consumables, net of inventory) | 6,923.0 (27.20%) | 5,806.0 (26.12%) | **+108** | Rising share — **Headwind** | [Q4&FY26 deck, p.19]; FY25 = AR p.313 Notes 26 + "Purchases" | High — single biggest margin leak; see Section 8 |
| Employee Cost (salaries, PF, ESOP, welfare) | 3,771.6 (14.82%) | 3,469.4 (15.61%) | **−79** | Falling share — **Tailwind** | [Q4&FY26 deck, p.19]; FY25 = AR p.351 Note 27 (₹3,534.75 Mn) | Mid — operating leverage; reverses if hiring outruns revenue |
| Medical Consultancy Charges (visiting-oncologist fee-for-service) | 5,490.7 (21.57%) | 4,816.7 (21.67%) | **−10** | Roughly flat share — **Neutral** | [Q4&FY26 deck, p.19]; FY25 = AR p.351 Note 30 (₹4,816.73 Mn) | High — largest single cost line; rises ~with volume, not contractually passed through |
| Other Expenses (power, rent, R&M, marketing, lab, bad-debt allowance, etc.) | 4,557.5 (17.91%) | 4,173.2 (18.77%) | **−87** | Falling share — **Tailwind** | [Q4&FY26 deck, p.19]; FY25 = AR p.351 Note 30 less consultancy | Mid — operating leverage; specific sub-lines (power, rent) inflating |
| — of which Power, fuel & water | n/d for FY26 | 439.66 (1.98%) | — | Rising in absolute (+11.7% YoY FY24→FY25) | AR p.351 Note 30 | Low |
| — of which Rent (short-term/variable leases, ex-Ind AS 116) | n/d for FY26 | 269.37 (1.21%) | — | Rising in absolute (+23.3% YoY FY24→FY25) | AR p.351 Note 30 | Low |
| — of which Loss allowance on trade receivables | n/d for FY26 | 106.97 (0.48%) | — | Falling (FY24 225.61) | AR p.351 Note 30 | Low |
| Depreciation & Amortisation | 2,441.7 (9.59%) | 2,113.4 (9.51%) | **+8** | Rising share — mild **Headwind** | [Q4&FY26 deck, p.19]; FY25 = AR p.350 Note 29 (₹2,113.44 Mn) | Mid — capex/acquisition step-up; structural, see below |
| Finance Cost (term-loan + lease interest) | 1,765.7 (6.94%) | 1,545.6 (6.95%) | **−2** | Flat share, falling sharply ahead | [Q4&FY26 deck, p.19]; FY25 = AR p.350 Note 28 (₹1,545.61 Mn) | High at PAT (not at EBITDA); rights-issue deleveraging is a forward tailwind |

Notes on the cost stack:
- **R&D:** Not a disclosed line and not material to a hospital operator; HCG's nearest analogue is the Triesta diagnostics/genomics lab, whose costs sit inside lab charges (₹213.16 Mn FY25, Note 30) and consumables. **Treated as "Not disclosed / immaterial"** — no R&D row.
- **Finance cost** is shown for completeness but sits **below EBIT**, so it does not move operating margins — it is the dominant driver of the gap between EBIT and PAT (Section 3) and is covered as a PAT-level item.
- The FY26 deck does not re-disclose the Note 30 sub-lines (power, rent, R&M). Those FY24→FY25 sub-line directions are the most recent audited evidence and are carried forward as directional, not as FY26 levels.

---

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

Consolidated. Gross margin = (Revenue − COGS) / Revenue. Reported EBITDA margin per upstream `01_historical-financials` (ties to company-disclosed +88 bps). EBIT here uses the **deck definition** (EBIT = Reported EBITDA − D&A + Other income), which differs from the audited operating-EBIT-pre-other-income used in `01_historical-financials` Section 1 — see the reconciliation note below the table.

| Margin Level | FY26 | FY25 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 72.80% | 73.88% | **−108** | Drugs/consumables (COGS) rose faster than realisation; case-mix and DPCO-capped pharmacy limit pass-through | [Q4&FY26 deck, p.19]; AR p.313/Note 26; BM 06_value-chain §2 |
| Reported EBITDA margin | 18.30% | 17.42% | **+88** | Operating leverage on employee cost (−79 bps) and other expenses (−87 bps) on a near-flat asset base, plus lower ESOP/one-time add-backs (~20 bps); more than offsets the gross-margin drag | [Q4&FY26 deck, p.20]; `01_historical-financials` §1 |
| Adjusted EBITDA margin | 18.51% | 17.83% | **+68** | Same operational leverage, ex-ESOP/one-time; this is the clean operating-margin signal | [Q4&FY26 deck, p.19] |
| EBIT margin (deck basis) | 9.69% | 9.48% | **+21** | EBITDA gain partly eaten by +8 bps higher D&A share (capex/acquisition step-up) | [Q4&FY26 deck, p.19] |

**Reconciliation — two EBIT definitions:** `01_historical-financials` Section 1 reports FY26 EBIT 2,466 / 9.7% and FY25 EBIT 1,759 / 7.9% on an *operating, pre-other-income* basis, an apparent +180 bps jump. The deck's EBIT line (2,466.1 FY26; 2,107.5 FY25) **includes other income** of 249.9 (FY26) / 348.1 (FY25). The FY26 numerator is identical because FY26 EBITDA−D&A+other-income happens to equal the pre-other-income figure used upstream; the FY25 figures differ by the treatment of ₹348 Mn other income. On a like-for-like *pre-other-income* basis the EBIT-margin gain is larger (≈ +180 bps) than the deck-basis +21 bps, because FY25 carried more other income. The **clean operating signal is the Adjusted EBITDA margin (+68 bps)**; the EBIT line is sensitive to (a) the rising D&A share and (b) a falling other-income contribution, so it is the least clean of the three for trend-reading. This divergence is flagged, not averaged away.

**Pass-through lag (input costs → price):** HCG does **not** show clean contractual pass-through. The business-model value-chain finds cost of consumption rose to 25.72% of revenue in FY25 from 24.64% in FY24 (a ~108 bps drag at the consumables line), i.e., consumable inflation outran realisation on a like-for-like basis [BM 06_value-chain §2, quoting FY24-25 AR p.169]. Two structural brakes: (1) scheduled essential cancer drugs fall under India's DPCO 2013 price caps, so the regulated pharmacy portion cannot be freely re-priced; (2) management frames realisation growth as ~5% "medical inflation" plus mix, **not** an input-indexed escalator — when bridging ~15% revenue growth it split it ~10% volume / ~5% ARPP, with ARPP gains coming from replacing low-margin work with higher-margin work over time [BM 06_value-chain §2, quoting Q3/FY26 call Feb 9 2026 and Q4/FY26 call May 20 2026]. **Stated lag:** there is no fixed pass-through window; price re-rating happens annually-ish through tariff and mix, not within-quarter against a consumables move. Treat input-cost pass-through as **slow and partial (annual mix/tariff cycle), not contractual** — a consumables-cost spike hits gross margin first and is recovered, if at all, over multiple quarters via mix, never automatically.

---

## 4. Margin Walk — Which Margin Level Matters Most?

**Track this business at the EBITDA margin (Reported, with Adjusted as the clean cross-check), not at gross margin or EBIT.** Reasoning: (1) HCG is a fixed-cost, asset-heavy *operator* whose economics turn on absorbing the cost of beds, LINACs, clinicians and (post-Ind AS) rent across rising throughput — that operating-leverage story shows up at EBITDA, not at the gross line. (2) Gross margin is structurally high (~73–75%) and moves mainly with consumables mix; on its own it overstates profitability because it sits above the two largest real costs — employee cost and medical consultancy charges (together ~36% of revenue). (3) EBIT and PAT are distorted by two non-operating, capital-structure items — a rising D&A share from the recent capex/acquisition build-out and a finance-cost burden — plus FY26's two exceptionals (₹319 Mn goodwill impairment, ₹127 Mn labour-code charge), which drove reported PAT to owners down to ₹138 Mn even as EBITDA rose 20% [`01_historical-financials` §6; Q4&FY26 deck p.19]. **The EBITDA margin is where the operating drivers are legible; D&A and finance cost are best handled as a separate, structural EBIT→PAT bridge rather than as operating-margin drivers.** The cohort-level EBITDA margin (mature 26% / ramping 18% / emerging 5%) is the most useful internal lens [BM 04_unit-economics §2].

---

## 5. Margin Driver Table (consolidated)

Magnitude = impact on the **primary metric (Reported/Adjusted EBITDA margin)** from a reasonable move. High >100 bps; Mid 30–100 bps; Low <30 bps.

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Operating leverage / centre maturity** | Fixed cost (clinicians, beds, LINACs, rent) spread over rising throughput; the FY26 +88 bps EBITDA gain came almost entirely from employee (−79 bps) and other-expense (−87 bps) leverage on a near-flat 25-centre, ~2,605-bed base. Cohort EBITDA margins step 5%→18%→26% as centres mature. | **Tailwind** | **High** | [Q4&FY26 deck p.4, p.19]; BM 04_unit-economics §2; cohort table BM 03_segment-map §1(C) |
| **Drugs & consumables cost (COGS)** | Rose to 27.2% of revenue (FY26) from 26.1% (FY25), 108 bps gross-margin drag; consumable inflation + case-mix toward drug-heavy medical oncology (38% of revenue) outruns realisation; DPCO caps the regulated pharmacy slice. | **Headwind** | **High** | [Q4&FY26 deck p.19]; AR Note 26; BM 06_value-chain §2; modality mix BM 03_segment-map §4 |
| **Mix — payor (government scheme share)** | Government schemes ≈ 33% of revenue and are price-taker work; scheme repricing compresses ARPP (Odisha transition cut one cluster's ARPP −3% YoY in Q3FY26; Andhra Pradesh scheme disruption softened Q3FY26 margin). A rising government share dilutes margin. | **Headwind** | **Mid** | BM 06_value-chain §3 (quoting Q3/FY26 call); `01_historical-financials` §5; payor mix BM 03_segment-map §4 |
| **Mix — case/acuity (high-margin surgical & radiation vs low-margin)** | Management is actively paring low-margin cases and shifting toward higher-acuity surgical/radiation work to lift ARPP ~3–5%; this is the deliberate margin lever offsetting COGS drag. | **Tailwind** | **Mid** | BM 06_value-chain §3 (quoting Q4/FY26 call: low-to-high-margin transition to "normalize over the next couple of quarters") |
| **Medical consultancy charges (clinician economics)** | ~21.6% of revenue and roughly flat as a share (−10 bps FY26); fee-for-service, rises with volume and new-clinician additions. If high-volume oncologists negotiate a larger share, this line de-levers directly. | **Neutral** (now); **Headwind** if clinician terms shift | **High** (if it moves) | [Q4&FY26 deck p.19]; BM 06_value-chain §1, §5 (Risk factor (e), "highly dependent on key clinicians") |
| **Utilisation / ramp of the ₹50–100 Mn cohort** | West cluster sits at 50% utilisation vs South 68%; the 14 ramping centres (50% of revenue, 9% ROCE, 18% centre EBITDA) climbing toward the 26%-margin bucket is the swing factor. A 20% utilisation move flows almost directly to contribution because the cost base is largely fixed. | **Tailwind** (if ramp continues) | **High** | BM 04_unit-economics §4; utilisation BM 03_segment-map §1(B) |
| **D&A step-up (capex/acquisition build-out)** | D&A rose to ₹2,442 Mn (9.59% of revenue, +8 bps) on Nagpur/Vizag/North Bangalore and ~₹2,885 Mn FY26 capex; sits below EBITDA so it does not move the primary metric, but caps EBIT/PAT. | **Headwind** (at EBIT/PAT only) | **Low** at EBITDA; **Mid** at EBIT | [Q4&FY26 deck p.19, p.15]; AR Note 29; `01_historical-financials` §6 |
| **Power, fuel & rent inflation** | Power/water +11.7% and rent +23.3% YoY (FY24→FY25) in absolute terms, inside Other expenses; growing faster than the line overall but still <2% of revenue each. | **Headwind** (minor) | **Low** | AR p.351 Note 30 |
| **One-offs (exceptionals, ESOP)** | FY26 carried ₹319 Mn goodwill impairment (fertility) + ₹127 Mn labour-code provision below EBITDA; ESOP add-back fell to ₹14.4 Mn (FY25 ₹65.4 Mn), which lifts the *Reported* EBITDA margin ~20 bps above the Adjusted gain. | **Headwind** at PAT; small **Tailwind** to Reported EBITDA margin via lower ESOP | **Mid** at PAT; **Low** at EBITDA | [Q4&FY26 deck p.19/20]; `01_historical-financials` §4 |
| **FX (Kenya)** | International (Kenya) is ~2.9% of revenue; costs and revenue both KES-denominated within that unit, so FX is a translation effect on a small base, not a cost-vs-revenue mismatch. | **Unknown / immaterial** | **Low** | BM 03_segment-map §1(A); BM 06_value-chain §5 |
| **Milann divestment (mix clean-up)** | Fertility ran at ~₹69 Mn Adjusted EBITDA (~1.5% of group) and took a ₹319 Mn goodwill impairment; on close (expected Q1 FY27) the group becomes ~100% oncology. Removing a low-margin, impaired line is marginally accretive to group margin and removes a PAT drag. | **Tailwind** (small, structural) | **Low** | BM 03_segment-map §3; `01_historical-financials` §6 |

---

## 6. Margin Drivers By Segment

**Not applicable in the product-segment sense — single-segment business (Section 1).** There is no audited segment-level P&L, so a product/segment margin table cannot be built from disclosure and is not guessed. The economically meaningful internal split is **centre maturity**, disclosed only in the investor deck (pre-Ind AS, excl. fertility — deck-tier, not audited). For completeness, the cohort margin structure that drives the consolidated number:

### Cohort: Mature centres (>₹100 Mn/month) — 44% of revenue (deck-tier)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Saturation / capacity ceiling | 26% centre EBITDA margin, 27% ROCE; little incremental leverage left — these run near full | Neutral (already mature) | Mid | BM 03_segment-map §1(C); BM 04_unit-economics §2 |

### Cohort: Ramping centres (₹50–100 Mn/month) — 50% of revenue (deck-tier)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Utilisation climb toward maturity | 18% centre EBITDA margin, 9% ROCE; migration into the 26% bucket is the largest available group-margin lever; West cluster at 50% utilisation is the biggest headroom | Tailwind | High | BM 04_unit-economics §3–§4; utilisation BM 03_segment-map §1(B) |

### Cohort: Emerging centres (<₹50 Mn/month) — 6% of revenue (deck-tier)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Cash burn / sub-scale fixed-cost drag | 5% centre EBITDA margin, **−22% ROCE** (value-destroying); each new greenfield centre sits here for years before contributing | Headwind (now) → Tailwind (on ramp) | Mid (6% of revenue caps the drag) | BM 03_segment-map §1(C); BM 04_unit-economics §3 |

Read: the consolidated EBITDA-margin trajectory is essentially a weighted race between the 50%-of-revenue ramping cohort migrating up (tailwind) and new greenfield additions entering the emerging cohort (headwind). FY26's +88 bps says the up-migration won this year, on a flat centre count [Q4&FY26 deck p.4; BM 04_unit-economics §3].

---

## 7. Margin Bridge — FY26 vs FY25 (Reported EBITDA margin, +88 bps)

Decomposed from the cost-stack share changes (Section 2), which are arithmetic from disclosed P&L lines, not estimates. Sign convention: a falling cost share is a positive (margin-accretive) contributor. The four operating cost lines sum to a **−68 bps cost-ratio change = +68 bps to the operating (Adjusted EBITDA) margin**, which ties exactly to the company-disclosed Adjusted EBITDA margin gain of **+68 bps** [Q4&FY26 deck p.19]. The additional **+20 bps** to the *Reported* EBITDA margin (+88 bps total) is the lower ESOP/one-time add-back in FY26 vs FY25.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Volume / operating leverage — Employee cost | **+79** | Employee 14.82% of rev (FY26) vs 15.61% (FY25) [deck p.19; AR Note 27] |
| Volume / operating leverage — Other expenses | **+87** | Other expenses 17.91% (FY26) vs 18.77% (FY25) [deck p.19; AR Note 30] |
| Mix (case/payor) — Medical consultancy charges | **+10** | Consultancy 21.57% (FY26) vs 21.67% (FY25) [deck p.19; AR Note 30] |
| Input costs — Drugs & consumables (COGS) | **−108** | COGS 27.20% (FY26) vs 26.12% (FY25) [deck p.19; AR Note 26] |
| **Subtotal — operating (= Adjusted EBITDA margin Δ)** | **+68** | Ties to disclosed Adjusted EBITDA +68 bps [deck p.19] |
| One-offs — lower ESOP + one-time add-backs | **+20** | ESOP 14.4 (FY26) vs 65.4 (FY25); one-time 39.0 vs 25.0 [deck p.19/20] |
| **Total — Reported EBITDA margin change** | **+88** | Ties to disclosed Reported EBITDA +88 bps [deck p.20; `01_historical-financials` §1] |

What this bridge **cannot** split (missing disclosure): the COGS −108 bps drag cannot be decomposed into pure consumable price inflation vs modality/case-mix vs payor-mix, because no per-modality or per-payor gross-margin line is disclosed [AR Notes 22/26/30; deck]. Similarly, the operating-leverage gains cannot be split into pure volume absorption vs cost discipline. The bridge is therefore exact at the cost-line level but the *cause* behind the COGS line is partly inferred from modality mix (medical oncology 38% of revenue is drug-heavy) and management's pass-through commentary — labelled as inference where used.

---

## 8. The Single Biggest Margin Driver

**Drugs and consumables cost (COGS) — currently a Headwind.** It is the one line that has consistently moved *against* HCG: COGS rose to 27.2% of FY26 revenue from 26.1% (FY25) and ~24.6% (FY24), a cumulative ~250+ bps gross-margin erosion over two years, and it is the largest single swing factor in the bridge (−108 bps in FY26 alone) [Q4&FY26 deck p.19; AR Note 26; BM 06_value-chain §2]. It is also the driver HCG controls *least*: scheduled cancer drugs are DPCO price-capped, pass-through is slow and mix-dependent rather than contractual, and the revenue mix is tilting toward drug-heavy medical oncology (38% of revenue). If consumable inflation or a further shift toward chemotherapy-heavy case-mix accelerates, gross margin compresses faster than the operating-leverage tailwind can offset — and unlike employee/other-expense leverage (which is largely a one-time benefit as centres mature and then flattens at the 26% cohort ceiling), the COGS headwind is recurring and structural. The current direction is **adverse and persistent**; the only offsets are the deliberate case-mix upgrade (paring low-margin work) and continued ramp-cohort operating leverage, both of which are bounded. *Inference, not from filings: the COGS share is the line most likely to determine whether FY27 EBITDA margin holds its +88 bps gain or gives part of it back.*

