# Revenue Drivers — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Regime:** US SEC (10-K / 10-Q / 8-K Ex. 99.1) · **Standard:** US GAAP · **Currency:** USD, millions · **Fiscal year:** ends 31 March (FY2026 = year ended 2026-03-31; FY2027 in progress) [1][3].

**Evidence binding.** Frozen supervisor-verified read mode. Every manifest / corpus / CIQ-facts / extract read resolved inside the single bound generation `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d/`. The live logical path `data/TTWO/` was not read; it is a citation label only. `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is a wrong-company pool contaminant and is cited nowhere below.

**Upstream inputs used.** `00_earnings-data-triage.md`, `01_historical-financials.md` (revenue baseline), `04_guidance-consensus.md` (guidance and the bar). Cross-module: business-model `03_segment-map.md` and `10_external-dependency.md` — both present, so no "business-model module not available" disclaimer applies.

**Two basis traps carried forward — they govern every number below.**

1. **GAAP net revenue ≠ Net Bookings.** Take-Two reports a statutory line (total net revenue) and a company-defined operational metric (Net Bookings = "the net amount of products and services sold digitally or sold-in physically during the period … includes licensing fees, merchandise, in-game advertising, and publisher incentives") [3, MD&A — Net Bookings]. Q2 FY27: Net Bookings **$1,601.3m** vs GAAP net revenue **$1,497.0m** [3; 5]. The gap is the net build in deferred revenue. **The vendor consensus "Revenue" field is on the Net Bookings basis, not GAAP** [12]. FY27 guidance is issued on BOTH bases at once (GAAP net revenue $7,980–8,180m; Net Bookings $8,000–8,200m) [5]. Every figure below names its basis. Nothing mixes them.
2. **The vendor's gross-profit series is not the filing's.** Capital IQ reclassifies asset writedowns out of cost of revenue, so vendor and filing margins are not interchangeable [11]. This report therefore takes **all revenue and all revenue-attribution figures from the filings themselves**, never from the vendor workbooks. The vendor export is used nowhere in Sections 3–6.

All percentage-point (pp) arithmetic below was executed, not estimated; the snippet and its printed output are in Section 8.

---

## 1. Segment Decomposition Status

**Single-segment business (>85% from one segment) — consolidated analysis.**

Take-Two discloses **one operating and reportable segment**, "sale of software titles", equal to 100% of revenue: $6,656.4m of $6,656.4m in FY2026 [1, Note 21 (Segment Reporting and Geographic Information), p.102]. The chief operating decision maker (the CEO) "manages our operations on a consolidated basis" and the segment measure of profit **is** consolidated net income (loss) [1, Note 21]. The same wording repeats in the latest interim filing [3, Note 14]. This is a disclosure fact, not a data gap, so the `MODULE_RULES.md` "no segment P&L for a multi-segment business" clarity cap (max 70) does **not** trigger — consistent with triage `00` §5.

This agrees with business-model `03_segment-map.md`, which reaches the same read from the same note. No divergence to flag.

**What that means in practice, stated plainly.** There is no segment-level profit, margin, or capital figure anywhere in the pool. What the company *does* publish is **four different ways of cutting the same single segment's revenue** — by content type, by platform, by distribution channel, and by geography — each with **no profit attached** [1, MD&A p.44; 3, MD&A p.24]. Section 5 therefore repeats the driver work on those disclosed axes rather than on invented sub-segments. The one structure that implies a real economic split — **two unnamed goodwill reporting units**, one of which absorbed $5,887.3m of accumulated impairment — is disclosed without revenue, profit, or identity, so it cannot be used as a segment [1, Critical Accounting Policies — Goodwill; 1, Note 9, p.83].

---

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Subscription / live-service | Customers × ARPU |
| Manufacturer / producer | Volume × realized price |
| Retail | Store count × sales per store |
| **Hit-driven publisher with a live-service tail (the applicable one)** | **(Full-game units × price) + (engaged players × in-game spend per player) + licensing / in-game advertising** |

**The company-specific formula, in one line (two layers, because the GAAP line is one step removed from the economics):**

> **Net Bookings** = (full-game units sold-in × price per unit, per title in the release slate) + (engaged players × recurrent in-game spend per player, per live title) + licensing fees + in-game advertising + publisher incentives — **and GAAP total net revenue = Net Bookings − the net build in deferred revenue**, because a large part of each quarter's billings is recognised over the expected service period rather than on sale [3, MD&A — Net Bookings; 3, Note 4 — Deferred Revenue, p.501-ff].

Three consequences that drive everything below:

- **There is no disclosed unit or price input at all.** The filings disclose neither units sold per title, nor average selling price, nor players, nor spend per player, nor attach / tie ratios. Management was asked directly for the GTA VI tie ratio embedded in guidance and declined: "I understand that clarity on the question would benefit your models. It really doesn't do anything for us, so we don't spend a lot of time on it" [4, Q&A (Crum / Zelnick)]. **Any volume × price split of this company's revenue would be invention, not analysis.** What the filings disclose instead is the **dollar change by title**, which is what Section 6 uses.
- **The second layer is where the timing lives.** The deferral wedge was $104.3m in Q2 FY27 against $186.7m a year earlier, so the GAAP line fell less than bookings (−15.6% vs −18.3%) [3; 5]. That is a recognition effect, not demand. Section 6.3 bridges it separately so it is never double-counted against the GAAP decomposition.
- **Deferred revenue is the only backlog-like disclosure.** At 2026-09-30 the deferred revenue balance was $1,042.1m (from $1,189.6m at 2026-03-31), and total revenue allocated to unsatisfied performance obligations was **$1,492.5m, of which about $1,117.9m is expected to be recognised over the next 12 months** [3, Note 4, p.511–513]. This is a real forward-revenue anchor — about 14% of the FY27 guided GAAP revenue midpoint of $8,080m — and it is the closest thing to an order book this business has.

---

## 3. Market / Share / Price / Mix Split

Importance /100 — higher = more important to the revenue line. **Not** an inverted score.

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| **Own release slate / title performance** *(row added — the first-order driver here, and none of the six template buckets captures it)* | **Deteriorating in realised periods, guided to inflect sharply up in Q3 FY27.** Q2 FY27 GAAP revenue −$276.8m (−15.6%), of which $237.6m is four named titles lapping prior-year launches. Q3 FY27 Net Bookings guided $3,350–3,500m against $1,757.1m a year earlier | `Q2 FY27 10-Q, MD&A p.25` (title-level deltas); `TTWO 2Q27 Earnings Release, "Fiscal Third Quarter Ending December 31, 2026"`; `Q2 2027 Earnings Call transcript, 2026-11-09, prepared remarks (Goldstein)` ("compared to $1.76 billion in the prior year") | **90** |
| **End-market demand** (discretionary consumer spending + third-party console installed base) | **Mixed, and the two sources disagree — named per §3.** The filing says reduced consumer spending "**has** and may in the future continue to result in reduced demand"; management says the opposite about today. Console was 41.4% of H1 FY27 revenue and rides an installed base Sony and Microsoft build and price. Guidance assumes "continued growth in the installed base of PlayStation 5 and Xbox Series X\|S" | `FY26 10-K, Item 1A (Declines in consumer spending)`; `Q2 FY27 10-Q, MD&A (Hardware Platforms, 41.4%)`; `TTWO 2Q27 Earnings Release, "Key assumptions and dependencies"`; `Q1 2027 Earnings Call transcript, 2026-08-07, Q&A (Zelnick: "we don't feel like the consumer is pulling back at all")` | **55** |
| **Company market share** | **Unknown — not disclosed.** No market-share figure, industry-size figure, or share series exists anywhere in the pool. What exists is concentration *inside* Take-Two: Grand Theft Auto products were 12.4% of FY26 net revenue and 12.6% of H1 FY27 net revenue; the five best-selling franchises were 54.3% of FY26 net revenue | `FY26 10-K, Item 1A, p.10` (12.4%, 54.3%); `Q2 FY27 10-Q, MD&A (Product Release Schedule)` (12.6%) | **30** (important in principle, unmeasurable from this pool) |
| **Price / realization** | **Unknown — not disclosed, and management declined to quantify it.** No ASP, no price per title, no ARPU, no spend-per-player series. The only pricing-adjacent disclosure is directional and about someone else's price: analysts raised rising *console hardware* prices; management answered that new SKU information "will always come from our labels" | `Q2 2027 Earnings Call transcript, 2026-11-09, Q&A (Schoell / Zelnick; Crum / Zelnick)` | **20** (would be high if disclosed; it is not) |
| **Product / customer / geography mix** | **Shifting materially, and dated.** Content mix: RCS was 80.8% of Q2 FY27 GAAP revenue vs 71.9% a year earlier; FY27 guidance implies RCS falling to **65% of Net Bookings** from 78% in FY26 (RCS flat in dollars while total bookings grow ~20.5%). Platform mix: on GAAP revenue mobile is largest (48.8%) but **on Net Bookings console is largest (46%) ahead of mobile (45%)** — the deferral wedge sits disproportionately in console/full-game. Geography mix barely moves (US 59% / International 41%) | `Q2 FY27 10-Q, MD&A p.24`; `TTWO 2Q27 Earnings Release, "Net Revenue and Net Bookings by Content, Platform Mix, Distribution Channel, and Geographic Region"`; `Take-Two_Interactive_2Q FY27 deck, slides 5 and 8`; `Q2 2027 transcript, prepared remarks (Goldstein)` | **60** |
| **FX translation** | **Stable and small, with a published sensitivity.** Realised: FX **decreased** net revenue by $0.6m in Q2 FY27 and by $0.0m in the six months; it **increased** FY26 net revenue by $9.9m. Disclosed sensitivity: a 10.0% rise in the USD against all currencies cuts revenue by 4.0% | `Q2 FY27 10-Q, MD&A pp.25 and 28`; `FY26 10-K, MD&A p.44`; `FY26 10-K, Item 7A (Foreign Currency Exchange Rate Risk)` | **25** |
| **M&A / divestitures** | **Zero contribution in the reported periods — and this must not be confused with the FY23 acquisition effect.** No business combination contributed revenue in FY2026 or H1 FY27; the only acquisition-related item is a $2.4m management-basis *expense* adjustment in Q2 FY27, not revenue. The FY2023 revenue jump of +52.6% was the Zynga acquisition (closed 2022-05-23) and was **not** organic demand. Management states an intent to pursue further acquisitions; nothing is announced or sized | `01_historical-financials.md §6`; `FY26 10-K, Note (Debt)` (Zynga closed 2022-05-23); `TTWO 2Q27 Earnings Release, p.2` (business acquisition adjustment $2.4m); `Q2 2027 transcript, prepared remarks (Goldstein)` | **10** (today; it was the dominant bucket in FY2023) |

**What this table separates, and why it matters.** FY2026's +18.2% and FY2023's +52.6% are different animals: FY2023 was an **acquisition**, FY2026 was **own-title performance** (Section 6.2 shows five named franchises accounting for +19.0pp of the +18.2pp). Neither was price, and neither was measurable market-share gain. FX has never been more than ±0.2pp of annual growth in the periods disclosed. **On the evidence in this pool, Take-Two's revenue line is driven by its own release calendar and by continuing in-game spend on titles already shipped — not by market growth, not by pricing, and not by currency.**

---

### 3a. Sector-KPI check (`frameworks/SECTOR_OVERLAYS.md` / business-identity §3a)

The sector-appropriate KPIs for a hit-driven publisher with a live-service tail are: **bookings** (present), **deferred revenue / unsatisfied performance obligations** (present), **recurrent-spend share and growth** (present), **units per title** (absent from filings; two franchise-cumulative numbers exist only in the transcript), **players / MAU / DAU** (absent), **spend per player / ARPU** (absent), **attach or tie ratio to installed base** (absent and explicitly declined). Flagging rather than skipping: **three of the seven sector KPIs that would let an outsider model this company's revenue bottom-up are not disclosed anywhere in the pool.** That is the binding limitation on this module's revenue read, and it is the reason Section 6 is a title-level dollar decomposition rather than a volume × price build.

---

### 3b. Cycle Position (`MODULE_RULES.md` Cycle-Position Rule — hard rule)

This business has a demand cycle, but it is a **release/content cycle plus a third-party console hardware cycle**, not a commodity cycle. Business-model `10_external-dependency.md` classifies it "Partly externally driven" (risk score 52/100, inverted — higher = worse), scores the console hardware cycle **Mid**, and concludes the first-order driver of both FY27 quarters to date was "its own product." **This agent reaches the same read. No divergence to flag.**

**Where the latest reported period sits: at the TROUGH of the company's own release cycle — and it is emphatically not a run-rate.** Evidence, not assertion:

- Q2 FY27 GAAP net revenue of **$1,497.0m is the lowest of the last eight reported quarters** (range $1,359.8m–$1,773.8m, and the lowest since Q3 FY25) [`01_historical-financials.md §3`].
- Full game and other revenue fell to **19.2% of revenue from 28.1%** a year earlier — the new-release component is at its thinnest [3, MD&A p.24].
- The next quarter is guided to roughly **double**: Q3 FY27 GAAP revenue $3,270–3,420m against $1,699.0m in Q3 FY26; Net Bookings $3,350–3,500m against $1,757.1m [5; `01 §6`].

**Where the NEXT reported period will sit: at a launch peak that is explicitly not run-rate.** Grand Theft Auto VI launched **2026-11-19** — today, the run date [3, MD&A (Product Release Schedule); 10, p.13]. Three items must be labelled as one-time or non-run-rate, with the direction of the driver reflecting that they can reverse:

1. **The GTA VI launch itself** — a one-time full-game sell-in event. Management's own framing of what comes after is unquantified: it "expect[s] to set a new baseline for performance going forward" and explicitly refused FY28 guidance [4, Q&A (Creutz / Zelnick)]. **Non-run-rate; size of the recurring tail not proven from available data.**
2. **GTA VI: Ultimate Edition add-on content** — the company confirms this add-on content is allocated to recurrent consumer spending and "can be purchased separately", and it is the stated reason RCS for the GTA series is guided up [4, Q&A (Dessouky / Goldstein); 10, slides 8 and 10]. So part of the guided RCS "growth" is **launch-attached**, not steady-state engagement. **Non-run-rate.**
3. **The FY26 base itself contains a launch-year effect now reversing.** Color Block Jam released November 2024 and added $206.6m to FY26 revenue; in Q2 FY27 its net bookings "decreased double digits compared to its peak performance during last year's second quarter" and it cost $31.4m of GAAP revenue [1, MD&A p.44; 4, prepared remarks (Zelnick); 3, MD&A p.25]. **FY26's growth rate is therefore not a normalised base either.**

**Console hardware cycle: mid-cycle, no disclosed transition.** Guidance assumes "continued growth in the installed base of PlayStation 5 and Xbox Series X|S" [5, "Key assumptions and dependencies"]. The 10-K warns that demand for older-platform software "typically declines" when new hardware arrives and that results "may be more volatile and difficult to predict during console transitions", while noting backwards compatibility "could mitigate" it — with the hedge kept: "we cannot be certain how backwards compatibility will affect demand" [1, Item 1A]. No next-generation console announcement appears anywhere in the pool. Rising console hardware prices were raised by an analyst as a potential constraint on reach; management did not quantify any effect [4, Q&A (Schoell / Zelnick)].

**Stated plainly: neither the latest reported quarter nor the next guided quarter is a normalised run-rate.** Q2 FY27 is a pre-launch trough; Q3 FY27 is a launch spike. Downstream modules must not treat either as a baseline.

---

## 4. Revenue Driver Table (consolidated)

Magnitude is computed, not asserted: each row states what a **10% move in that driver** does to total revenue, measured on the latest reported quarter (Q2 FY27 GAAP net revenue $1,497.0m) or the six months to 2026-09-30, as labelled. High = >5%, Mid = 2–5%, Low = <2%.

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Release slate — new title launches** | GTA VI launched 2026-11-19. NBA 2K27 shipped in Q2 FY27; PGA TOUR 2K27 and WWE 2K27 slated for the rest of FY27. Q3 FY27 Net Bookings guided $3,350–3,500m vs $1,757.1m prior year (+90.6% to +99.2%) | **Improving (guided), after deteriorating in both reported FY27 quarters** | **High.** A 10% shortfall against the Q3 FY27 guided midpoint of $3,425m is $342.5m = **4.2% of the FY27 guided Net Bookings midpoint ($8,100m)**; a 20% shortfall is $685.0m = **8.5%** | `Q2 FY27 10-Q, MD&A (Product Release Schedule)`; `TTWO 2Q27 Earnings Release, Q3 FY27 outlook`; `Q2 2027 transcript, prepared remarks (Goldstein)` |
| **Recurrent consumer spending (RCS) — in-game spend on titles already shipped** | $1,210.2m = **80.8%** of Q2 FY27 GAAP net revenue (71.9% a year earlier); $1,302.1m = 81% of Q2 FY27 Net Bookings. Realised: RCS **−9% YoY against guidance of −5%**, which management attributed to NBA 2K. Guided: FY27 flat YoY (→ 65% of bookings); Q3 FY27 **+12% YoY** | **Deteriorating in the reported quarter; guided to inflect up in H2 FY27** | **High.** A 10% move in RCS = **8.1%** of Q2 FY27 total GAAP revenue | `Q2 FY27 10-Q, MD&A p.24`; `TTWO 2Q27 Earnings Release, content tables`; `Q2 2027 transcript, prepared remarks (Goldstein)`; `Take-Two_Interactive_2Q FY27 deck, slides 8 and 10` |
| **Deferred-revenue recognition wedge** (bookings → GAAP revenue) | Q2 FY27 wedge **$104.3m** (7.0% of GAAP revenue) vs **$186.7m** a year earlier. Deferred revenue balance $1,042.1m at 2026-09-30 vs $1,189.6m at 2026-03-31. Guided wedge: $80m in Q3 FY27; ~$20m for FY27 as a whole | **Narrowing** — which flattered reported GAAP revenue growth by **+4.65pp** in Q2 FY27 (see §6.3) | **High on a quarterly GAAP basis** (the $104.3m wedge is 7.0% of quarterly revenue); **Low annually** (guided $20m = 0.2% of the $8,080m GAAP midpoint) | `TTWO 2Q27 Earnings Release, p.1–2`; `Q2 FY27 10-Q, Note 4 (Deferred Revenue)`; `TTWO 2Q27 Earnings Release, "Outlook"` |
| **Unsatisfied performance obligations** (the nearest thing to a backlog) | $1,492.5m total at 2026-09-30, of which **~$1,117.9m expected to be recognised within 12 months** = ~14% of the FY27 guided GAAP revenue midpoint | **Direction not assessable** — no prior-period comparative for the $1,492.5m figure is given in the 10-Q | **Mid.** A 10% move in the 12-month recognisable portion = $111.8m = **1.4%** of the FY27 GAAP midpoint — Low on that test; scored Mid because it is a disclosed forward anchor rather than an estimate | `Q2 FY27 10-Q, Note 4, p.511–513` |
| **Mobile portfolio (Zynga mature titles + new mobile launches)** | $731.1m = 48.8% of Q2 FY27 GAAP revenue, **down $90.5m YoY**; $1,493.4m = 49.3% of H1 FY27. FY27 guidance assumes mobile **down**, lapping Color Block Jam and moderating mature Zynga titles | **Deteriorating** (guided down; realised down in both FY27 quarters) | **Mid at a 10% move** (4.9% of H1 FY27 revenue); **High at 20%** (9.9%) | `Q2 FY27 10-Q, MD&A p.24 and p.27`; `Take-Two_Interactive_2Q FY27 deck, slide 8` |
| **Console revenue / third-party installed base** | $615.4m = 41.1% of Q2 FY27 GAAP revenue, **down $104.6m YoY**; 41.4% of H1 FY27. On the **Net Bookings** basis console is the largest platform at $742.6m (46%) | **Deteriorating in the reported quarter; guidance assumes the installed base keeps growing** | **Mid.** A 10% move in console revenue = **4.1%** of H1 FY27 total revenue | `Q2 FY27 10-Q, MD&A pp.23–24`; `TTWO 2Q27 Earnings Release, platform tables`; `TTWO 2Q27 Earnings Release, "Key assumptions"` |
| **Platform gatekeepers — Apple, Google, Sony, Microsoft (distribution access and terms)** | Five largest customers = **80.6%** of FY26 net revenue, with **Apple, Sony, Google and Microsoft each above 10.0%**. Each "generally ha[s] the discretion to set the amounts of their platform fees and change their platforms' terms of service … at their sole discretion" | **Stable as observed — no change in terms is disclosed in any reported period** | **High tail, zero realised.** Fees themselves hit cost of revenue, not revenue; the revenue exposure is access. No pool document quantifies any realised revenue effect, so this is sized only by the 80.6% exposed base | `FY26 10-K, Item 1 (Business — Sales and Marketing), p.294-ff`; `Q2 FY27 10-Q, MD&A (Online Content and Digital Distribution)` |
| **Direct-to-consumer channel shift** | **Not sized anywhere.** Management: "We have not described the percentage of our business that comes direct to consumer mobile. It is significant, and it is growing" | **Improving, per management — unquantified** | **Unknown.** Cannot be sized from available data; do not treat as a known offset to platform fees | `Q2 2027 transcript, 2026-11-09, Q&A (Heaney / Zelnick)`; `Q2 FY27 10-Q, MD&A (Online Content and Digital Distribution)` |
| **In-game advertising** | Inside RCS; "improved sequentially as we successfully attract new partners and increase ad yields" — **no dollar figure disclosed** | **Improving, per management — unquantified** | **Low / Unknown.** No disclosed base to sensitise | `Q2 2027 transcript, prepared remarks (Zelnick)` |
| **FX translation** | Realised −$0.6m on Q2 FY27 revenue and −$0.0m on the six months; +$9.9m on FY26. 40.6% of Q2 FY27 revenue was non-US | **Stable** | **Mid at the disclosed sensitivity** (a 10% USD move = 4.0% of revenue); **Low as realised** (−0.04% in Q2 FY27) | `Q2 FY27 10-Q, MD&A pp.25 and 28`; `FY26 10-K, Item 7A`; `FY26 10-K, MD&A p.44` |
| **Geographic mix** | US $888.9m (59%) / International $608.1m (41%) of Q2 FY27 GAAP revenue, against 58% / 42% a year earlier — a 1pp shift | **Stable** | **Low.** The entire year-on-year mix shift is ~1pp of revenue | `TTWO 2Q27 Earnings Release, geographic tables`; `FY26 10-K, Note 21, p.102` |
| **Physical retail channel** | $38.2m = 2.6% of Q2 FY27 GAAP revenue, down from 4.5%; digital online 97.4% | **Shrinking** | **Low.** A 10% move = 0.3% of revenue | `Q2 FY27 10-Q, MD&A p.24`; `TTWO 2Q27 Earnings Release, channel tables` |
| **Regulation of in-game monetisation (loot boxes, virtual currency)** | Exposed base = the **80.8%** of Q2 FY27 revenue that is RCS. Items in force: Australia's Phase 2 Industry Codes, Brazil's rules, the EU network's interpretive principles. Items proposed/unresolved: UK review, EU Digital Fairness Act draft, Spanish and Portuguese bills | **Unknown — no realised impact disclosed in any period** | **High tail, zero realised.** No pool document quantifies any revenue effect on Take-Two | `FY26 10-K, Item 1A (loot boxes / virtual currencies)`; business-model `10_external-dependency.md §1 and §1A` |
| **M&A** | Zero revenue contribution in FY2026 and H1 FY27. Stated intent to pursue acquisitions; nothing announced or sized | **No change** | **Low** today (it was the dominant driver in FY2023: Zynga, +52.6% revenue) | `01_historical-financials.md §6`; `Q2 2027 transcript, prepared remarks (Goldstein)` |

**Drivers deliberately NOT listed, with the reason** (per `MODULE_RULES.md` — no filler rows): commodity price (no commodity input; 97.4% digital delivery); utilisation / installed capacity (no plant-capacity constraint — fixed-asset capex was $162.8m in FY26 on $6,656.4m of revenue); store count / distribution points (no owned retail); order backlog / book-to-bill in the industrial sense (the nearest disclosure is deferred revenue and unsatisfied performance obligations, which IS listed); loan book / AUM / GMV (not a financial or marketplace business). Contract renewals and retention are not listed separately because no renewal or retention metric is disclosed — player retention is discussed qualitatively on the call but never quantified [4, prepared remarks (Zelnick) on Borderlands 4 promotions "driving improved engagement and player retention"].

---

## 5. Revenue Drivers By Disclosed Revenue Cut

Not segments — the company has one segment (§1). These are the four axes on which revenue IS disaggregated. **No profit, margin, or capital figure exists for any of them**, and the only directional profit statement in the whole pool is that "our mobile net revenue generally generates a lower gross margin percentage than our Console or PC revenue" because platform fees run through cost of revenue — with the size of that gap **not disclosed** [3, MD&A p.23]. Margin attribution belongs to `03_margin-drivers`, not here.

### Cut: By content — Recurrent consumer spending (80.8% of Q2 FY27 GAAP net revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Engagement spend on mature mobile titles (Color Block Jam, Match Factory!) | The two named decliners cost **$31.4m and $21.9m** of Q2 FY27 revenue — $53.3m together, which is **81%** of the $65.7m RCS decline ($53.3m ÷ $65.7m); the remaining $12.4m of the RCS fall is unattributed in the filing | **Deteriorating** | **Mid** (a 10% move in the mobile RCS base ≈ 4.9% of total revenue, using mobile revenue as the proxy base) | `Q2 FY27 10-Q, MD&A p.25` |
| NBA 2K in-game content and seasons | The RCS miss (−9% vs guided −5%) was attributed to NBA 2K; the H1 FY27 RCS decline was "partially offset by higher net revenue from NBA 2K" of **+$94.0m** over six months. FY27 guidance: NBA 2K up high single digits | **Deteriorating in Q2, guided to accelerate in H2 FY27** | **High** (NBA 2K was the single largest contributor to FY26 growth at +$416.9m = +7.40pp) | `Q2 2027 transcript, prepared remarks (Goldstein)`; `Q2 FY27 10-Q, MD&A p.27`; `FY26 10-K, MD&A p.44`; `deck slide 8` |
| Grand Theft Auto Online / GTA+ engagement, and GTA VI: Ultimate Edition add-on content | GTA series revenue was **up** in Q2 FY27 (amount not quantified). Management: the series "grew a double-digit percentage for both recurrent consumer spending and average monthly members for GTA+"; GTA V has sold "nearly 235 million units worldwide" | **Improving** | **High** (GTA products were 12.4% of FY26 and 12.6% of H1 FY27 net revenue; a 10% move = ~1.3% of revenue on the *current* base, but the FY27 guided step-up is far larger — see §7) | `Q2 FY27 10-Q, MD&A p.25`; `Q2 2027 transcript, prepared remarks (Zelnick)` |
| In-game advertising | "Improved sequentially"; no dollar figure | **Improving, unquantified** | **Unknown** | `Q2 2027 transcript, prepared remarks (Zelnick)` |

### Cut: By content — Full game and other (19.2% of Q2 FY27 GAAP net revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Prior-year launch titles lapping (Borderlands 4, released Sep-2025; Mafia: The Old Country, released Aug-2025) | These two cost **$128.0m and $56.3m** of Q2 FY27 revenue — $184.3m against a full-game decline of $211.1m (**87%**) | **Deteriorating** (a lapping effect, by construction) | **High** — $184.3m = 10.4% of prior-year quarterly revenue | `Q2 FY27 10-Q, MD&A p.25` |
| New full-game launches in the slate (GTA VI, PGA TOUR 2K27, WWE 2K27) | GTA VI launched 2026-11-19; the other two are slated within FY27 | **Improving (guided)** | **High** — the entire FY27 guided bookings increase of ~$1,379m (8,100 midpoint vs 6,721.0 actual) sits in H2 | `Q2 FY27 10-Q, MD&A (Product Release Schedule)`; `FY26 10-K, MD&A p.44` (FY26 bookings $6,721.0m); `TTWO 2Q27 Earnings Release, "Outlook"` |

### Cut: By platform

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Mobile | $731.1m (48.8% of GAAP revenue), −$90.5m YoY; on Net Bookings $707.6m (45%) | **Deteriorating** (guided down for FY27) | **Mid** (10% move = 4.9% of H1 FY27 revenue) | `Q2 FY27 10-Q, MD&A p.24`; `TTWO 2Q27 Earnings Release, platform tables` |
| Console | $615.4m (41.1% of GAAP revenue), −$104.6m YoY; on Net Bookings $742.6m (**46% — the largest platform on the bookings basis**) | **Deteriorating in Q2; the GTA VI launch is console-only at release** | **Mid** (10% move = 4.1% of H1 FY27 revenue) | same; `Q2 2027 transcript, Q&A (Yang / Zelnick)` ("GTA VI is available on 2 consoles when it launches on November 19") |
| PC and other | $150.5m (10.1%), −$81.7m YoY — the steepest percentage fall of the three | **Deteriorating** | **Mid** (10% move = 1.0% of revenue → Low on that test; scored Mid because it fell 4.6pp of total revenue growth in one quarter) | `Q2 FY27 10-Q, MD&A p.24` |

### Cut: By distribution channel and by geography — immaterial as *drivers*

Digital online is 97.4% of Q2 FY27 GAAP revenue and physical retail 2.6%, so the channel cut carries almost no independent driver content — it mirrors the title mix. Geography moved 1pp (US 59% vs 58%). Both are recorded for completeness and are **not** material revenue drivers on this evidence [3, MD&A p.24; 5, geographic tables].

---

## 6. Revenue Growth Decomposition

### 6.1 Primary decomposition — Q2 FY27 GAAP total net revenue, year on year

Basis: **GAAP total net revenue**, three months ended 2026-09-30 vs three months ended 2025-09-30. Prior-year base = **$1,773.8m**. Observed change = **−$276.8m = −15.6%** [3, MD&A p.24–25].

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| **Volume / title performance** — Borderlands franchise (Borderlands 4 released Sep-2025) | **−7.22** | `Q2 FY27 10-Q, MD&A p.25` ("lower net revenue of $128.0 from our Borderlands franchise") |
| **Volume / title performance** — Mafia franchise (Mafia: The Old Country released Aug-2025) | **−3.17** | same ("$56.3 from our Mafia franchise") |
| **Volume / title performance** — Color Block Jam | **−1.77** | same ("$31.4 from Color Block Jam") |
| **Volume / title performance** — Match Factory! | **−1.23** | same ("$21.9 from Match Factory!") |
| **Price** | **Not separately disclosed — 0.00pp assignable** | No ASP, price-per-title, or ARPU disclosure exists in the pool; management declined to quantify tie ratios or SKU pricing [4, Q&A (Crum / Zelnick; Schoell / Zelnick)] |
| **Mix** | **Not separately disclosed as a revenue effect — 0.00pp assignable** | The company discloses mix only as a *margin* factor ("the overall product mix between mobile and other game sales may affect our gross margin percentage") [3, MD&A p.23]. The content / platform / channel / geography cuts are **identities that re-slice the same −$276.8m**, not additional components — they are shown separately in §6.2 and are not added here |
| **FX** | **−0.03** | `Q2 FY27 10-Q, MD&A p.25` ("Changes in foreign currency exchange rates decreased net revenue by $0.6") |
| **Acquisitions / divestitures** | **0.00** | No business combination contributed revenue in the period; the only acquisition item is a $2.4m management-basis *expense* adjustment [5, p.2] |
| **Other (net residual — includes the unquantified INCREASE in Grand Theft Auto series revenue, netted against unnamed declines)** | **−2.18** | Derived as the gap between the Total row and the named components. The filing states the decline "was partially offset by higher net revenue from our Grand Theft Auto series" and does **not** quantify it [3, MD&A p.25] |
| **Total revenue growth** | **−15.61** | `Q2 FY27 10-Q, MD&A p.24` (total net revenue $1,497.0 vs $1,773.8, −15.6%) |

### 6.2 Cross-checks — the four disclosed axis identities (each reconciles exactly, zero residual)

These are **identities, not additional drivers.** Each re-slices the same −$276.8m. They are shown because each sums exactly to the Total, which independently validates the base and the total used in §6.1.

| Axis | Components (pp of the $1,773.8m base) | Sum |
|---|---|---:|
| **By content** | RCS −$65.7m = **−3.70pp**; Full game and other −$211.1m = **−11.90pp** | **−15.61** ✓ |
| **By platform** | Mobile −$90.5m = **−5.10pp**; Console −$104.6m = **−5.90pp**; PC and other −$81.7m = **−4.61pp** | **−15.61** ✓ |
| **By channel** | Digital online −$234.3m = **−13.21pp**; Physical retail and other −$42.5m = **−2.40pp** | **−15.61** ✓ |
| **By geography** | United States −$147.2m = **−8.30pp**; International −$129.6m = **−7.31pp** | **−15.61** ✓ |

Sources: `Q2 FY27 10-Q, MD&A p.24–25` (content, platform, channel deltas); `TTWO 2Q27 Earnings Release, geographic tables` (US $888.9m vs $1,036.1m; International $608.1m vs $737.7m).

**Supplementary — six months ended 2026-09-30 (base $3,277.6m; observed −$246.7m = −7.5%).** Named: Borderlands −$111.5m (−3.40pp), Color Block Jam −$64.2m (−1.96pp), Mafia −$55.2m (−1.68pp), Match Factory! −$36.1m (−1.10pp), Toy Blast −$14.9m (−0.46pp), WWE 2K −$14.0m (−0.43pp), **partially offset by NBA 2K +$94.0m (+2.87pp)**; FX −$0.0m (0.00pp). Named components sum to **−6.16pp**; residual **−1.37pp**; total **−7.53pp** [3, MD&A p.27–28].

**Supplementary — FY2026 annual (base $5,633.6m; observed +$1,022.8m = +18.2%).** Named: NBA 2K +$416.9m (+7.40pp), Borderlands +$210.3m (+3.73pp), Color Block Jam +$206.6m (+3.67pp), Toon Blast +$121.9m (+2.16pp), Grand Theft Auto +$115.1m (+2.04pp); FX +$9.9m (+0.18pp). Named components sum to **+19.18pp**; residual **−1.03pp** (net unnamed declines, of which the filing names only the lapping of Sid Meier's Civilization VII, released Feb-2025, without a figure); total **+18.16pp** [1, MD&A p.44].

### 6.3 Bookings-to-GAAP basis bridge — kept SEPARATE so it is never double-counted

This is a **recognition** effect, not demand, and it does **not** enter §6.1 (whose components are already GAAP net revenue deltas). Adding it there would double-count.

| Item | Q2 FY27 | Q2 FY26 | Change |
|---|---:|---:|---:|
| Net Bookings | 1,601.3 | 1,960.5 | **−359.2 / −18.3%** |
| less: net build in deferred net revenue (the wedge) | 104.3 | 186.7 | −82.4 |
| **GAAP total net revenue** | **1,497.0** | **1,773.8** | **−276.8 / −15.6%** |

**What the narrowing wedge did:** holding the deferral build at the prior year's $186.7m, GAAP revenue would have been $1,601.3 − $186.7 = **$1,414.6m**, i.e. **−20.2%** year on year. Reported was −15.6%. So the smaller deferral build added **$82.4m ÷ $1,773.8m = +4.65pp** to reported GAAP revenue growth. **The GAAP line understated the fall in the underlying bookings by 2.7 percentage points (−15.6% vs −18.3%), and the reason is the wedge, not trading.** Sources: [5, p.1–2]; [3, MD&A — Net Bookings].

**No Net Bookings decomposition is possible.** The 10-Q attributes the −$359.2m bookings decline to "lower Net Bookings from our Borderlands franchise … NBA 2K; our Mafia franchise … Color Block Jam and Match Factory!", "partially offset by higher Net Bookings from our Grand Theft Auto series" — **with no dollar amount against any name** [3, MD&A — Net Bookings]. The named set also differs from the GAAP set (it adds NBA 2K). The GAAP-basis title deltas therefore **cannot** be carried onto the bookings basis; see §6a.

---

## 6a. Decomposition Attribution and Residual (`MODULE_RULES.md` "Driver Attribution" / §15)

Every pp figure in §6.1 is derived by one multiplication: **the filing's own stated dollar change for that component, divided by the prior-year-period GAAP total net revenue**. The ratio's basis is named on every line and is the same for every line.

```
Ratio basis for ALL lines below: denominator = prior-year-quarter GAAP TOTAL NET REVENUE
  = $1,773.8m (three months ended 2025-09-30) [Q2 FY27 10-Q, MD&A p.24]
Numerator basis: the MD&A's own stated year-on-year change in GAAP NET REVENUE for that
  component, same period pair [Q2 FY27 10-Q, MD&A p.25]
→ numerator basis and denominator basis MATCH (both GAAP net revenue, same period pair).

Borderlands franchise: -$128.0m ÷ $1,773.8m [Q2 FY27 10-Q, MD&A p.25, 2026-11-09]
  = -7.22pp of the -15.61pp observed growth
  → basis matches

Mafia franchise: -$56.3m ÷ $1,773.8m [Q2 FY27 10-Q, MD&A p.25, 2026-11-09]
  = -3.17pp of the -15.61pp observed growth
  → basis matches

Color Block Jam: -$31.4m ÷ $1,773.8m [Q2 FY27 10-Q, MD&A p.25, 2026-11-09]
  = -1.77pp of the -15.61pp observed growth
  → basis matches

Match Factory!: -$21.9m ÷ $1,773.8m [Q2 FY27 10-Q, MD&A p.25, 2026-11-09]
  = -1.23pp of the -15.61pp observed growth
  → basis matches

FX: -$0.6m ÷ $1,773.8m [Q2 FY27 10-Q, MD&A p.25, 2026-11-09]
  = -0.03pp of the -15.61pp observed growth
  → basis matches. NOTE: this is the filing's own REALISED FX effect on net revenue, NOT
    the Item 7A sensitivity (a 10% USD move = 4.0% of revenue). The sensitivity is a
    hypothetical bound measured against "all currencies" and is NOT applied here.

Price: Asserted from disclosure as NOT DISCLOSED — no ratio applied, 0.00pp assignable.
Mix: Asserted from disclosure as NOT DISCLOSED as a revenue effect — no ratio applied,
  0.00pp assignable. The content/platform/channel/geography cuts are identities on the
  same total (§6.2), not components, and are deliberately NOT added into §6.1.
Acquisitions / divestitures: Asserted from disclosure — no business combination revenue
  in the period; 0.00pp. No ratio applied.
Other (residual): derived as Total minus named components, NOT asserted:
  -$276.8m - (-$237.6m named titles) - (-$0.6m FX) = -$38.6m
  -$38.6m ÷ $1,773.8m = -2.18pp
  → includes the filing's unquantified INCREASE in Grand Theft Auto series revenue,
    netted against unnamed declines. Its sign is net negative, so the GTA increase is
    smaller than the unnamed declines it offsets.
```

**A basis the ratios were NOT measured on, and are therefore refused.** These deltas are measured on **GAAP net revenue**. They must not be applied to **Net Bookings**, because (a) the bookings decline is a different number (−$359.2m / −18.3% vs −$276.8m / −15.6%), (b) the filing's bookings attribution names a **different set of titles** (it adds NBA 2K), and (c) the Net Bookings attribution carries **no dollar amounts at all**. Carrying a GAAP-basis title delta onto the bookings basis — or onto the vendor consensus "Revenue" field, which is Net Bookings [12] — would be the exact basis switch §15 bans. **Refused.**

**Reconciliation to the Total row.** Named components (four titles + FX) = −7.22 − 3.17 − 1.77 − 1.23 − 0.03 = **−13.42pp**. Residual = **−2.18pp**. Sum = **−15.60pp**, against the stated Total of **−15.61pp** (the $0.01pp gap is rounding on six figures). **So: −13.4pp reconciled, −2.2pp residual, −15.6pp total.**

**How large is the residual, and what does it cap?** The residual is **14% of the observed change** (2.18 ÷ 15.61). The decomposition therefore explains **86%** of the quarter's revenue fall from named, filed sources — this bridge reconciles well, and Section 7 is not resting on a mostly-unexplained bridge. But the single largest named component, Borderlands, is **−7.22pp of −15.61pp = 46% of the observed fall** — **just under half**. Under the "adjective must match the number" rule that permits "the main driver" only where the printed arithmetic clears roughly half, Borderlands sits marginally **below** that threshold: it is the largest single named contributor, and it is **not** a majority of the move. The honest statement is that **the move was caused by a set of four prior-year launches lapping, which together account for −13.40pp (86%) of the fall; no single title accounts for half of it.**

The two supplementary bridges reconcile as follows: six months — explained −6.16pp, residual −1.37pp, total −7.53pp (residual = 18% of the move); FY2026 — explained +19.18pp, residual −1.03pp, total +18.16pp (residual = 6% of the move, and it runs *against* the named components).

```
RF-EARN-001: revenue decomposition reconciled — explained -13.4pp, residual -2.2pp, total -15.6pp
```

---

## 7. The Single Biggest Revenue Driver

**The single biggest revenue driver is the sell-through of Grand Theft Auto VI — units sold and the attached GTA VI: Ultimate Edition add-on content that the company allocates to recurrent consumer spending.** Its current direction is **unproven**: the title launched on **2026-11-19**, the run date, so **zero reported periods contain any of it.**

**Actual contribution evidence** — for every component discussed in this conclusion or in the realised attribution above:

- **Actual contribution evidence — Grand Theft Auto VI: unknown**; the title launched 2026-11-19 and appears in no reported period. There is no matched-period, matched-scope bridge to any company total because no period containing it has been reported. Management's only stated input is unverifiable and unquantified: preorders "tracking far in excess of our initial expectations" and "the level of preorders generated is extraordinary", with **no preorder count, no price, and no unit figure anywhere in the pool** [4, prepared remarks (Zelnick; Goldstein)]. Management explicitly declined to quantify the tie ratio or installed-base assumption embedded in guidance [4, Q&A (Crum / Zelnick)]. **Its actual contribution magnitude and importance are held unknown throughout this conclusion.**
- **Actual contribution evidence — Grand Theft Auto series (realised, Q2 FY27): unknown**; the filing states only that the decline "was partially offset by higher net revenue from our Grand Theft Auto series" and gives **no dollar amount** [3, MD&A p.25]. It sits inside the −2.18pp residual, whose net sign is negative. The nearest sized facts are scope-matched shares, not contributions: GTA products were **12.4%** of FY26 net revenue and **12.6%** of H1 FY27 net revenue [1, Item 1A p.10; 3, MD&A (Product Release Schedule)]. A share of revenue is not a contribution to growth, and is not treated as one here.
- **Actual contribution evidence — Borderlands franchise: disclosed**; −$128.0m of GAAP net revenue, three months ended 2026-09-30 vs 2025-09-30, from the company's own MD&A attribution, which also names the cause (Borderlands 4 released Sep-2025) [3, MD&A p.25]. Bridged to the same company total in §6a: −7.22pp of −15.61pp (46%).
- **Actual contribution evidence — Mafia franchise: disclosed**; −$56.3m, same period pair, same source and bridge (−3.17pp) [3, MD&A p.25].
- **Actual contribution evidence — Color Block Jam: disclosed**; −$31.4m, same period pair and bridge (−1.77pp) [3, MD&A p.25]. The company's qualification is retained: management attributed the fall to lapping "its peak performance during last year's second quarter", not to weak demand [4, prepared remarks (Zelnick)].
- **Actual contribution evidence — Match Factory!: disclosed**; −$21.9m, same period pair and bridge (−1.23pp) [3, MD&A p.25].
- **Actual contribution evidence — NBA 2K: disclosed for the six months, unknown for the quarter.** Six months ended 2026-09-30: **+$94.0m** of GAAP net revenue, stated by the company as a partial offset (+2.87pp of the −7.53pp six-month move) [3, MD&A p.27]. For the **quarter**, NBA 2K is named among mobile decliners with **no dollar amount** and is named by the CFO as the cause of the RCS miss (−9% vs guided −5%) — a source-attributed management explanation, retained as such and **not** converted into a quantified quarterly contribution [3, MD&A p.25; 4, prepared remarks (Goldstein)].
- **Actual contribution evidence — recurrent consumer spending (RCS): disclosed**; −$65.7m of GAAP net revenue for the quarter (−3.70pp), from the company's own content-axis table, which reconciles exactly with full game and other to the −$276.8m total [3, MD&A p.24–25]. Of that −$65.7m, $53.3m (81%) is attributed by name to Color Block Jam and Match Factory!; **$12.4m is unattributed in the filing**.
- **Actual contribution evidence — FX: disclosed**; −$0.6m for the quarter and −$0.0m for the six months, stated by the company as the effect of exchange-rate changes on net revenue [3, MD&A pp.25 and 28]. The Item 7A ±4.0%-per-10%-USD sensitivity is a **separate hypothetical bound** and is not used as a realised contribution.
- **Actual contribution evidence — the deferred-revenue recognition wedge: disclosed and derived.** Disclosed: Net Bookings $1,601.3m vs GAAP net revenue $1,497.0m, and $1,960.5m vs $1,773.8m a year earlier [5, p.1–2]. Derived (reproducible bridge, §6.3): the $82.4m smaller deferral build added **+4.65pp** to reported GAAP revenue growth. Assumption stated: the counterfactual holds the prior-year deferral build constant; uncertainty is that the wedge is itself an outcome of title and SKU mix, which the company does not decompose. This is a **recognition** effect, not demand, and it is deliberately excluded from §6.1.
- **Actual contribution evidence — direct-to-consumer channel, in-game advertising, and regulation of in-game monetisation: unknown** in all three cases. D2C: "We have not described the percentage of our business that comes direct to consumer mobile. It is significant, and it is growing" — no base, no bridge [4, Q&A (Heaney / Zelnick)]. Advertising: "improved sequentially" — no figure [4, prepared remarks (Zelnick)]. Regulation: no pool document quantifies any realised revenue effect on Take-Two [1, Item 1A]. None is converted into established group-growth importance.
- **Actual contribution evidence — the −2.18pp residual: unknown by construction.** It is derived (Total less named components) rather than disclosed, and the filing identifies only its direction-of-offset ("partially offset by higher net revenue from our Grand Theft Auto series"), not its composition.

**Separately labelled HYPOTHESIS — the forward sensitivity question, under explicit assumptions. This is not proof of realised historical contribution.**

*Question asked:* which driver, if it moved 10–20%, would move revenue most?
*Answer, as a hypothesis:* GTA VI sell-through, on the **Net Bookings** basis.
*Assumptions, stated:* (i) management's Q3 FY27 Net Bookings guidance of $3,350–3,500m (midpoint $3,425m) against $1,757.1m a year earlier is the embedded expectation [5; 4, prepared remarks (Goldstein)]; (ii) a shortfall or beat in GTA VI is **not offset elsewhere in the portfolio** — this is a **zero-mitigation bound, not a forecast** (§9), and the company itself warns "the individual components of the financial outlook may not foot to the totals" [5, "Key assumptions and dependencies"]; (iii) the arithmetic stays on the Net Bookings basis and is not carried onto GAAP revenue, where an $80m guided deferral wedge sits [5].
*Arithmetic:* a **10%** shortfall against the Q3 FY27 guided midpoint = $342.5m = **4.2%** of the FY27 guided Net Bookings midpoint of $8,100m. A **20%** shortfall = $685.0m = **8.5%**. For scale, the whole FY27 guided bookings increase is $8,100m − $6,721.0m = **$1,379.0m (+20.5%)**, and the Q3 guided increase alone is $3,425m − $1,757.1m = **$1,667.9m** — i.e. **more than the entire year's guided growth sits in the launch quarter**, which is why one title clears the High magnitude bar on its own.
*Uncertainty, stated:* the embedded GTA VI unit and price assumptions are undisclosed, so the "10–20% move" is a move against *guidance*, not against a known unit forecast. No preorder figure, unit figure, price, or attach rate exists in the pool. Both management's guidance and the Street's consensus were set **before any sell-through existed** [`04_guidance-consensus.md §7`].

**The one thing worth saying twice.** The realised evidence and the forward driver point in opposite directions, and both are true on their own period. Realised: the last two reported quarters were driven by four prior-year launches lapping (−13.40pp of a −15.61pp quarter, 86% explained, no single title reaching half). Forward: essentially the entire FY27 guided increase rests on one title that had not shipped in any reported period. **That is a release-calendar business at the trough of its own cycle immediately before its largest launch — not a demand trend, and not a run-rate in either direction** (§3b).

---

## 8. Computation Log (executed, not mental arithmetic)

```python
# Q2 FY27 GAAP net revenue decomposition. Base = prior-year quarter 1773.8 [3, MD&A p.24]
base=1773.8; tot=-276.8
named={'Borderlands':-128.0,'Mafia':-56.3,'ColorBlockJam':-31.4,'MatchFactory':-21.9}
fx=-0.6
resid = tot - sum(named.values()) - fx
# axis identities
content=[-65.7,-211.1]; platform=[-90.5,-104.6,-81.7]; channel=[-234.3,-42.5]
geo=[888.9-1036.1, 608.1-737.7]
# 6M FY27. Base 3277.6 ; total -246.7
# FY2026. Base 5633.6 ; total +1022.8
# wedge counterfactual
cf = (1601.3-186.7)/1773.8-1
```

```
Q2 FY27 pp: Borderlands -7.22  Mafia -3.17  ColorBlockJam -1.77  MatchFactory -1.23
            FX -0.03   Other/residual -2.18   TOTAL -15.61
            named+FX explained = -13.42 ; residual = -2.18 ; sum = -15.60 vs total -15.61 (rounding)
            residual share of move = 13.9%  ; largest named (Borderlands) share = 46.2%
Axis identities (pp, must equal -15.61):
  content  [-3.70, -11.90] sum -15.61 OK
  platform [-5.10, -5.90, -4.61] sum -15.61 OK
  channel  [-13.21, -2.40] sum -15.61 OK
  geography[-8.30, -7.31] sum -15.61 OK
6M FY27 pp: Bor -3.40 CBJ -1.96 Mafia -1.68 MF -1.10 ToyBlast -0.46 WWE -0.43 NBA2K +2.87
            FX 0.00 ; explained -6.16 ; residual -1.37 ; TOTAL -7.53 OK
FY2026 pp : NBA2K +7.40 Bor +3.73 CBJ +3.67 ToonBlast +2.16 GTA +2.04 FX +0.18
            explained +19.18 ; residual -1.03 ; TOTAL +18.16 OK
Wedge: Q2FY27 1601.3-1497.0 = 104.3 (7.0% of GAAP rev) ; Q2FY26 1960.5-1773.8 = 186.7 (10.5%)
       constant-wedge counterfactual GAAP growth = -20.25% vs reported -15.61%  -> +4.65pp effect
       82.4/1773.8 = 4.65pp OK
GTA VI sensitivity (Net Bookings basis): 10% of 3425 = 342.5 = 4.23% of 8100
                                         20% of 3425 = 685.0 = 8.46% of 8100
       FY27 guided increase 8100-6721.0 = 1379.0 (+20.5%) ; Q3 guided increase 3425-1757.1 = 1667.9
RCS attribution: 31.4+21.9 = 53.3 of 65.7 = 81.1% named ; 12.4 unattributed
Full-game attribution: 128.0+56.3 = 184.3 of 211.1 = 87.3% named
RCS share arithmetic check: 6721.0 x 0.78 = 5242.4 ; 5242.4/8100 = 64.7% ~ guided 65% OK
Deferred-revenue forward anchor: 1117.9/8080 = 13.8% of FY27 guided GAAP revenue midpoint
```

---

## 9. Citations

[1] FY2026 Form 10-K (fiscal year ended 2026-03-31) — Item 1 Business pp.1, 292–296 (five largest customers 80.6%; Apple, Sony, Google, Microsoft each >10.0%); Item 1A Risk Factors p.10 (GTA 12.4%; five best-selling franchises 54.3%), Item 1A (declines in consumer spending; console transitions; loot boxes / virtual currencies); MD&A pp.43–44 (consolidated statements of operations; Net Bookings $6,721.0m vs $5,648.0m, +19.0%; title-level revenue drivers; content / platform / channel cuts; FX +$9.9m); Item 7A (Interest Rate Risk; Foreign Currency Exchange Rate Risk); Critical Accounting Policies — Goodwill (two unnamed reporting units); Note 9 (Goodwill and Intangible Assets, Net) p.83; Note 21 (Segment Reporting and Geographic Information) p.102. `data/TTWO/10K_2025_26_0001628280-26-037434.pdf`
[2] FY2025 Form 10-K (fiscal year ended 2025-03-31) — prior-year comparatives. `data/TTWO/10K_2024_25_0001628280-25-026694.pdf`
[3] Q2 FY2027 Form 10-Q (quarter ended 2026-09-30) — MD&A "Trends and Factors Affecting our Business" pp.22–23 (Product Release Schedule; GTA 12.6% of six-month net revenue; GTA VI launch 2026-11-19; Hardware Platforms 41.4%; Online Content and Digital Distribution 97.9%; platform fees in cost of revenue and mobile's lower gross margin; Player acquisition costs); MD&A "Operating Metric — Net Bookings" p.23 (Net Bookings definition; $1,601.3m vs $1,960.5m, −18.3%; $2,987.2m vs $3,383.6m, −11.7%; title attribution without amounts); MD&A Results of Operations pp.24–25 (total net revenue $1,497.0m vs $1,773.8m; content / platform / channel cuts; title-level deltas Borderlands −$128.0m, Mafia −$56.3m, Color Block Jam −$31.4m, Match Factory! −$21.9m; RCS −$65.7m; full game −$211.1m; FX −$0.6m); MD&A pp.27–28 (six-month comparison; NBA 2K +$94.0m; FX −$0.0m); Note 4 (Revenue — Deferred Revenue $1,042.1m / $1,189.6m; unsatisfied performance obligations $1,492.5m, of which ~$1,117.9m within 12 months); Note 14 (Segment Reporting). `data/TTWO/10Q_2Q_0001628280-26-072254.pdf`
[4] Take-Two Interactive Software, Inc., **Q2 FY2027 Earnings Call, 2026-11-09** — S&P Capital IQ **verbatim transcript** (Presentation + Question and Answer), prepared remarks (Zelnick: Q2 net bookings $1.6bn below the $1.62–1.67bn range; preorders "tracking far in excess of our initial expectations"; GTA V "nearly 235 million units worldwide"; GTA series "grew a double-digit percentage for both recurrent consumer spending and average monthly members for GTA+"; NBA 2K27 "sold over 4 million units so far"; Borderlands franchise "surpassed 100 million units sold"; Toon Blast +4%, Words With Friends +6%; advertising "improved sequentially"; Color Block Jam down double digits vs its peak quarter); prepared remarks (Goldstein: RCS −9% vs guidance −5%, "driven by NBA 2K", 81% of net bookings; label mix 37% Rockstar / 34% Zynga / 29% 2K; Q3 net bookings vs "$1.76 billion in the prior year"; RCS +12% in Q3; FY27 RCS flat at 65% of net bookings); Q&A (Schoell / Zelnick on preorders, console prices, PC and streaming; Crum / Zelnick on tie ratios and installed base; Heaney / Zelnick on direct-to-consumer; Dessouky / Goldstein on GTA VI: Ultimate Edition add-on content allocated to RCS; Creutz / Zelnick on "set a new baseline for performance"; Yang / Zelnick on console-only launch). `data/TTWO/Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf`
[5] TTWO Q2 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-11-09 — p.1 (Net Bookings $1,601.3m, −18%); p.2 (management-reporting adjustment table incl. business acquisition $2.4m); "Outlook for Fiscal Year 2027" (GAAP net revenue $7,980–8,180m; Net Bookings $8,000–8,200m; capex ~$290m; CFO over $1,000m); "Fiscal Third Quarter Ending December 31, 2026" (Net Bookings $3,350–3,500m; GAAP net revenue $3,270–3,420m); "Key assumptions and dependencies"; "Net Revenue and Net Bookings by Content, Platform Mix, Distribution Channel, and Geographic Region" (Q2 FY27 and Q2 FY26, three- and six-month). `data/TTWO/TTWO 2Q27 Earnings Release FINAL.pdf`
[6] TTWO Q1 FY2027 earnings release (Form 8-K Exhibit 99.1), dated 2026-08-07 — prior FY27 guidance (GAAP net revenue $7,900–8,100m) and Q1 FY27 results. `data/TTWO/TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf`
[7] Take-Two Interactive Software, Inc., **Q1 FY2027 Earnings Call, 2026-08-07** — verbatim transcript; Q&A (Creutz / Zelnick: "it's really not what we're seeing… we don't feel like the consumer is pulling back at all"; direct-to-consumer margin comment). `data/TTWO/Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf`
[8] Upstream: `analyses/TTWO_2026-11-19/earnings/00_earnings-data-triage.md` — jurisdiction, reporting standard, currency, fiscal-year end, interim basis, the GAAP-revenue-vs-Net-Bookings basis warning, and the partial-data table (no caps bind).
[9] Upstream: `analyses/TTWO_2026-11-19/earnings/01_historical-financials.md` — revenue baseline (FY2022–FY2026 annual; eight-quarter trend; TTM), the FY2023 Zynga acquisition effect, the seasonality read, and the vendor-vs-filing gross-profit basis warning.
[10] Cross-module: `analyses/TTWO_2026-11-19/business-model/03_segment-map.md` (single-segment confirmation; the four disclosed revenue cuts; the two unnamed goodwill reporting units) and `.../10_external-dependency.md` (cyclicality classification "Partly externally driven", external dependency risk 52/100 **inverted — higher = worse**, console hardware cycle Mid, platform-gatekeeper concentration High, FX sensitivity, policy register). Deck references ("Take-Two_Interactive_2Q FY27 FINAL deck, slides 5, 8, 10, 13") are to `data/TTWO/Take-Two_Interactive_2Q FY27 FINAL.pdf`.
[11] Capital IQ `Financials_Quarterly` / `Financials_Annual` exports — **tier-5 vendor exports, named here only to record that they are NOT used for any revenue figure in this report**, because the vendor reclassifies asset writedowns out of cost of revenue and its revenue/gross-profit series is therefore not interchangeable with the filings' [9 §1, note 2]. `data/TTWO/Take Two Interactive Software Inc NasdaqGS TTWO Financials_Quarterly.xls`; `…Financials_Annual.xls`
[12] Upstream: `analyses/TTWO_2026-11-19/earnings/04_guidance-consensus.md` — the proof that the Capital IQ consensus "Revenue" field is on the **Net Bookings** basis (FQ2 2027 actual 1,601.30; FY2027 guidance low/high 8,000 / 8,200 matching the Net Bookings range, not the GAAP range), the FY27 and Q3 FY27 guidance tables, and the "bar is high" read with its stated limitation that guidance and consensus both predate any GTA VI sell-through.

**Not used:** `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` — a wrong-company pool contaminant (Alphabet Inc., not Take-Two). It is cited nowhere in this report. The DEF 14A export (2026-07-27) is an empty one-cell shell and carries no revenue content; it is a management-governance input, not an earnings one [8].
