# Peer Dimension Matrix — nVent Electric plc (NVT)

**Verdict: Empty matrix — zero eligible peers. Every dimension and the dispersion read are *Not assessable*.**

**Evidence binding.** This agent read only the bound frozen extraction generation `6db32848…d1e6`. No live `data/NVT/` path was opened, and no sibling peer pool (`data/HUBB/`, `data/ETN/`, `data/LR/`, `data/ABBN/`) was inspected or cited. Every `data/NVT/…` reference below is a citation label, not a path that was read.

**I re-verified `01`'s stop condition rather than inheriting it.** Reading the bound `manifest.json` directly: `totals` = **15 sources, 2 workbooks, 20 tabs, 33 extracts written, 0 failures**; every source row is `status: ok`; **no row carries `external: true`**, and the generation contains **no `external/` directory** (`raw/NVT/external` does not exist). A grep of the whole bound generation for `Hubbell|Legrand|Rittal|Eaton|ABB Ltd|Hitachi Energy|Schneider Electric|Vertiv` returns hits in exactly **one** source document — the Capital IQ Competitors screen — plus its mirror inside `corpus.txt`. That file is a tier-5 vendor export of business descriptions and LTM revenue lines ("ABB Ltd provides electrification, motion, and automation solutions … LTM Revenue $35,752.00m, LTM Date Jun-30-2026" [`data/NVT/nVent Electric plc NYSE NVT Competitors.rtf` — CIQ Competitors export, retrieved 2026-09-07, vendor export]); it contains **no management statement of any kind** from any peer. The only two earnings-call transcripts in the pool are **nVent's own** Q1 FY2026 (2026-05-01) and Q2 FY2026 (2026-07-31) calls.

**Which branch of my own rules this is.** "Fewer than two eligible peers" is two different cases, and this is the first one: **zero** eligible peers, not one. `01` returned **Insufficient — no usable competitor call in the pool** [`01_peer-claim-extraction.md`, verdict line], so the matrix below is emitted **empty**: no peer column is created, no cell is filled, and every dimension is marked *Not assessable*. No peer, column, or cell is invented.

**The trap I am explicitly not walking into.** `business-model/08_competitive-map.md` quotes real peer figures — Hubbell Q2 2026 net sales $1,711.8m up 15.3%, Legrand H1 2026 sales €5,400.3m up 13.1% (+9.8% organic), Eaton Electrical Americas Q2 2026 operating margin 27.5% and rolling orders up 41%. Each is labelled **there** as an unverified web copy of a peer *results release*, and **none of those documents is inside the bound `<DATA_PATH>`**. Under this module's Auditable-corpus rule they are not this run's evidence; they are releases, not calls, so they carry no management commentary; and lifting them into the grid would manufacture a benchmark the pool cannot support [`00_competitive-intel-triage.md`, §1; `01_peer-claim-extraction.md`, "What is deliberately NOT in this table"]. They are named here as the audit trail for their exclusion, never as a back door.

---

## 1. The Matrix (peer × dimension)

**There are no peer columns, because there is no eligible peer.** The six competitors named upstream are listed in the header row solely to show that each was tested and rejected, with the reason on the column. Not one of them contributed a single cell.

| Dimension | Rittal GmbH & Co. KG (private — **no call exists**) | Hubbell Inc. (NYSE:HUBB — **no transcript in pool**) | Legrand SA (ENXTPA:LR — **no transcript in pool**) | Eaton Corp. plc (NYSE:ETN — **no transcript in pool**) | ABB Ltd (SWX:ABBN — **no transcript in pool**) | Hitachi Energy AG (private sub — **no call exists**) |
|---|---|---|---|---|---|---|
| Demand | — no call | — no call in pool | — no call in pool | — no call in pool | — no call in pool | — no call |
| Pricing / ASP | — no call | — no call in pool | — no call in pool | — no call in pool | — no call in pool | — no call |
| Volume / units | — no call | — no call in pool | — no call in pool | — no call in pool | — no call in pool | — no call |
| Input costs | — no call | — no call in pool | — no call in pool | — no call in pool | — no call in pool | — no call |
| Margin trajectory | — no call | — no call in pool | — no call in pool | — no call in pool | — no call in pool | — no call |
| Channel / inventory | — no call | — no call in pool | — no call in pool | — no call in pool | — no call in pool | — no call |
| Capacity / capex | — no call | — no call in pool | — no call in pool | — no call in pool | — no call in pool | — no call |
| Market-share claim | — no call | — no call in pool | — no call in pool | — no call in pool | — no call in pool | — no call |
| Guidance direction | — no call | — no call in pool | — no call in pool | — no call in pool | — no call in pool | — no call |
| Capital return | — no call | — no call in pool | — no call in pool | — no call in pool | — no call in pool | — no call |
| **Biggest risk named** | — no call | — no call in pool | — no call in pool | — no call in pool | — no call in pool | — no call |

**Read the em-dashes correctly — they are not the ordinary "did not address" cell.** An empty cell in a normal matrix means a peer held a call and did not raise the topic. Here **no peer call exists to address anything**, so no cell can carry a window flag (`does not align to {common window}`) or a scope flag (`scope: {geo/segment/tier}`) either: a flag qualifies a figure, and there is no figure. There is also no common calendar window to align to, because alignment (G1) needs at least one peer statement anchored to a window.

**Two of these six columns can never be filled by any future intake.** Rittal (Friedhelm Loh Group) and Hitachi Energy AG are **permanent coverage gaps** — private, non-reporting entities that will never file a call or a standalone margin [`data/NVT/nVent Electric plc NYSE NVT Competitors.rtf` — CIQ Competitors export; `08_competitive-map.md`, Competitor A and §2e]. The other four are absent *from this pool*: their calls exist in the world but not in this run's audit corpus, and a document outside the bound `<DATA_PATH>` is not evidence for this run.

### Every `01` claim accounted for (self-check trace)

`01`'s claim table has eleven dimension rows, and every one of them reads **"No peer call in pool — not extractable"** for all six peers [`01_peer-claim-extraction.md`, "The fixed benchmark dimensions"]. Each of those eleven rows appears above, carried at that same status. Nothing extracted upstream was dropped at this layer, because nothing was extracted upstream: the count of peer claims available to align is **zero**, and the count of claims in this matrix is **zero**. The two match.

`01` also recorded one competitor-referencing utterance, which stays out of the grid and is stripped here for the same reason it was stripped there — **it is an analyst's framing on the subject's own call, about unnamed third parties** (G5, twice over):

| Speaker | Firm | Call | The assertion | Why it stays out of the matrix |
|---|---|---|---|---|
| Nigel Edward Coe | Wolfe Research, LLC | **nVent's own** Q2 FY2026 call, 2026-07-31, Q&A | "I'm just kind of amazed that you're not seeing any capacity headwinds or supply chain bottlenecks unlike a lot of your competitors and peers in data centers" [Q2 FY26 transcript, Q&A] | Not a management statement, and not a claim by any peer's management about that peer's own business. Putting it in a "Capacity / capex" cell would invent a peer claim out of an analyst's aside. CEO Beth Wozniak's reply spoke only to nVent's own Blaine 1 ramp and its own supply base; she did not adopt or confirm the competitor framing [Q2 FY26 transcript, 2026-07-31, Q&A] |

---

## 2. Consensus & Dispersion (per dimension)

**No cohort exists.** Consensus and dispersion are computed **within** a matched window/scope cohort, and a cohort needs peers in it. Here the count of peers in every possible cohort is **zero** — below even the one-peer case, which would at least produce a single-peer matrix with dispersion marked *Not assessable*. So no dimension can return a consensus line, a "Mixed — no consensus" split, a named outlier, or a "No material outlier" finding: each of those is a statement *about* evidence, and there is none.

- **Demand:** *Not assessable — zero peers in any window/scope cohort.* No consensus and no outlier can be stated.
- **Pricing / promo:** *Not assessable — zero peers.*
- **Volume / units:** *Not assessable — zero peers.*
- **Input costs:** *Not assessable — zero peers.* This is a costly blank in particular: nVent guides group tariff cost at roughly **$100 million for FY2026, raised from $80 million** [Q2 FY26 transcript, prepared remarks], and there is no peer vantage to test whether that is an nVent-specific sourcing problem or a shared industry cost.
- **Margin:** *Not assessable — zero peers.* Also costly: Electrical Connections' segment margin fell **2.6 points** to 25.9% of sales in H1 FY26 from 28.5% in H1 FY25 [Q2 FY26 10-Q, MD&A, p.30], and no peer commentary exists to say whether that is company-specific or market-wide.
- **Channel / inventory:** *Not assessable — zero peers.*
- **Capacity / capex:** *Not assessable — zero peers.*
- **Market-share claim:** *Not assessable — zero peers.*
- **Guidance:** *Not assessable — zero peers.*
- **Capital return:** *Not assessable — zero peers.*
- **Biggest risk named:** *Not assessable — zero peers.* **Nothing is being dropped at this layer.** This row exists so that a peer's load-bearing *disconfirming* signal reaches `03`'s read-through and the module's killer-risk / rejection tests (CLAUDE.md §8). The honest statement to carry forward is that **no peer-named risk exists in this corpus at all** — so the §8 disconfirmation register receives an explicit blank from this module, not a silence. The subject's own risk disclosures are the `earnings` and `business-model` modules' evidence, not a substitute peer risk, and must not be re-labelled as one.

**Why "zero peers" is a different answer from "the peers agreed".** A matrix with no dispersion because peers said the same thing is a finding. A matrix with no dispersion because nobody spoke is a **coverage gap**. This is the second. Reporting it as quiet agreement would be a fabricated benchmark (CLAUDE.md §11 — an honest gap beats a fabricated benchmark).

---

## 3. Alignment & Scope Notes

**Window mismatches (G1) — none to report, and that is not good news.** No cell is window-mismatched because no cell has a window. For the record of what a future run must handle: nVent's next filing is the **standalone three months ended 30-Sep-2026**, presented alongside a cumulative nine-month column, expected 2026-10-30 (a vendor date, not the company's) [`CIQ Estimates→Consensus`, header — tier-5 vendor export; `00_competitive-intel-triage.md`, §0]. Hubbell, Eaton and ABB would file **standalone quarters** — directly alignable. Legrand files a **cumulative half-year** [`00_competitive-intel-triage.md`, §1], so its figures would need the §27 stub arithmetic before they could sit in the same cohort as a standalone quarter; a Legrand H1 cell and a Hubbell June-quarter cell are **different cohorts**, and two H1 cells must never be allowed to outvote a directly comparable quarter cell.

**Scope mismatches (G3) — none to report, for the same reason.** For a future run, the scope tags that would matter against nVent's own exposure: Systems Protection (enclosures, liquid and air cooling, switchgear, power distribution) vs Electrical Connections (cable management, connections, fastening); Americas vs EMEA vs Asia-Pacific; and the data-centre vertical, which cuts across both segments and is not a reportable line [`business-model/03_segment-map.md`, §1–§2]. Two of the six named rivals also fail the scale test as whole-company comparables even if their calls arrived — Eaton at $30,026.00m LTM revenue (6.2x nVent) and ABB at $35,752.00m (7.4x), both at Jun-30-2026 [`data/NVT/nVent Electric plc NYSE NVT Competitors.rtf` — CIQ Competitors export, vendor export]; Eaton would be usable only at the Electrical Americas segment level, tagged as such.

**Coverage-of-exposure (from `00`): reporting, read-through-eligible peers span 0% of nVent.** The uncovered share is the whole company, stated against the subject's own filed weights:

| Subject exposure | Weight | Reporting-peer vantage in this pool |
|---|---:|---|
| **Systems Protection** | **72.5%** of revenue, 70.0% of reportable segment income, H1 FY26 [Q2 FY26 10-Q, Note 13, p.20] | **None.** Its closest product-for-product rival, Rittal, is private and will never file a call |
| **Electrical Connections** | **27.5%** of revenue, 30.0% of segment income, H1 FY26 [Q2 FY26 10-Q, Note 13, p.20] | **None** |
| **Americas** | **85.0%** of net sales ($2,307.2m of $2,713.3m), H1 FY26 [Q2 FY26 10-Q, Note 2, p.8] | **None** |
| **EMEA** | **11.2%** ($305.0m) [Q2 FY26 10-Q, Note 2, p.8] | **None** — and Rittal is strongest here, so this is the most permanently unrepresentable exposure |
| **Asia-Pacific** | **3.7%** ($101.1m) [Q2 FY26 10-Q, Note 2, p.8] | **None** |
| **Data centres** (a vertical, not a segment) | ~**37%** of FY2026 group revenue — *derived from a transcript figure and a guidance range; inference, not a disclosed number* [`business-model/03_segment-map.md`, §2] | **None.** Legrand (26% of 2025 sales in data centres) and Eaton Electrical Americas are the natural cross-checks; neither has a call here |

**Three limits a future intake would still face, so the gap is not read as merely fixable.**
1. **Two of six rivals are permanently uncoverable.** Even a perfect transcript intake leaves Systems Protection — 72.5% of revenue — without its single closest comparable, because Rittal is private [`00_competitive-intel-triage.md`, §4].
2. **Timing.** Today is 2026-09-07; the target window (1-Jul to 30-Sep-2026) has not ended, so no peer call covering it can exist anywhere. The most recent peer call obtainable today would cover April–June 2026 and read into nVent's **already-filed** Q2 FY26 — context, never a current-window read. The genuine opportunity opens when Hubbell, Eaton and Legrand report their September-quarter periods in late October / early November 2026, at or just before nVent's expected 30-Oct-2026 release — a narrow calendar spread, so the timing edge is thin even at best.
3. **The peer set rests entirely on a tier-5 vendor export.** nVent names no competitor anywhere in its own filings; the FY24 10-K Competition section is generic [FY24 10-K, Item 1 — Competition, p.2; `08_competitive-map.md`, preamble]. The export's own stated scope is "Recently disclosed competitors only (within the last two years)" and it still carries divested Thermal Management rivals under "current subsidiaries" — a staleness flag on the export itself [`data/NVT/nVent Electric plc NYSE NVT Competitors.rtf` — CIQ Competitors export].

**Downstream instruction.** `03_readthrough-to-subject` and `04_narrative-triangulation` receive **zero rows** from this matrix and must return *Not assessable*; neither may substitute the out-of-corpus, web-sourced peer release figures from `08_competitive-map.md` for peer call claims. `99` reports the coverage gap as the module's finding, with net read-through weight **none**.
