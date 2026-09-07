# Competitive-Intel Data Triage — NVT (nVent Electric plc)

**Evidence binding.** This run read only the bound frozen extraction generation `6db32848…d1e6`. The complete frozen quartet (`NOSTRA_FROZEN_EVIDENCE_ROOT` / `NOSTRA_FROZEN_POOL_DATA_PATH` / `NOSTRA_FROZEN_POOL_OUT_DIR` / `NOSTRA_FROZEN_POOL_GENERATION`) was present and verified before any pool read, so no extractor was run, no live `data/NVT/` was opened, and no sibling peer pool was inspected. `data/NVT/…` below is a citation label, never a path that was read.

**What the pool contains.** The bound generation's `manifest.json` lists **15 sources** (2 Capital IQ workbooks covering 20 tabs), **33 extracts written, 0 failures** — every source `status: ok`. **Not one row carries `external: true`, and there is no `external/` directory in the bound snapshot at all.** All 15 sources are nVent's own documents: the FY2024 10-K, the Q1 and Q2 FY2026 10-Qs, a Form 11-K (benefit plan), the Q1 and Q2 FY2026 earnings-call transcripts, the Q1 FY26 and William Blair decks, the Maverick Power press release, four Capital IQ screen exports (Competitors, Products, Strategic Alliances) and the two CIQ workbooks (Financials, Estimates) [bound `manifest.json`, generation `6db32848…d1e6`].

**There is no competitor earnings-call transcript in this pool, and no broker paraphrase of one.** Because no extraction failed, this is a genuine intake gap, not a bad-extraction error (CLAUDE.md §20, §27) — the operator's Capital IQ "Competitor Transcripts" export for nVent's peer set was never dropped into nVent's own pool.

---

## 0. Subject's Next Filing (the read-through target)

*"nVent files next: **Q3 FY2026 — the standalone three months ended 30-Sep-2026**, presented in the 10-Q alongside a cumulative nine-month column, covering the calendar window **~1-Jul-2026 to 30-Sep-2026**, with the results release expected **30-Oct-2026**."*

- **Basis — standalone, and this matters (CLAUDE.md §27).** nVent is a **US SEC domestic filer despite Irish incorporation**: US GAAP, USD in millions, fiscal year ending 31 December, Form 10-K / 10-Q [FY24 10-K, cover page; Q2 FY26 10-Q, cover page]. A US quarterly period contains **no already-reported stub**, so the headline beat/miss is judged on the standalone three-month column and no cumulative-vs-standalone restatement is required — the vendor's estimate is already on the shape the company will print [`earnings/04_guidance-consensus.md`, §1A; `earnings/00_earnings-data-triage.md`].
- **The bar, on that basis:** revenue **$1,427.27m**, adjusted (normalized) EPS **$1.3899**, GAAP EPS **$1.24636**, EBITDA **$329.29m** [`CIQ Estimates→Consensus`, FQ3 2026 column — tier-5 vendor export]. For the cumulative nine-month column the bar is `$2,713.3m + $1,427.27m = $4,140.6m` revenue [`earnings/04_guidance-consensus.md`, §1A].
- **The expected filing date is the vendor's, not the company's.** "FQ3 2026 Earnings Release Date: Oct-30-2026" [`CIQ Estimates→Consensus`, header — vendor export]. nVent has not confirmed it.

**The date that kills the timing edge.** Today is **2026-09-07**. The target window does not even *end* until 30-Sep-2026. No company anywhere — peer or subject — can have reported the July–September 2026 quarter yet. So the module's highest-value output, the calendar-lead read-through into nVent's next print, is **structurally unavailable at this run date**, independently of the empty pool. The most recent peer call that could exist today would cover April–June 2026, which reads into nVent's **already-reported** Q2 FY26 (filed 31-Jul-2026), not into the next filing.

---

## 1. Peer Transcript Inventory & Reporting Calendar

| Peer | Ticker / venue | Std / currency / FY-end | Language | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap | Source (path) |
|---|---|---|---|---|---|---|---|---|---|
| — **none** — | — | — | — | — | — | — | — | — | **No document in `data/NVT/external/**` is a peer earnings-call transcript; the directory does not exist in the bound snapshot** |

**Zero rows is the finding.** No peer transcript, verbatim or paraphrased, is present. Nothing in this table was omitted for language, for jurisdiction, or for an extraction failure — all 15 sources extracted cleanly and all 15 are nVent's own.

### Competitors named upstream, and why each carries no row

The peer set is **anchored by `business-model/08_competitive-map.md`** — it is not self-selected, so that cap does not bind. That file draws its names from the pool's Capital IQ **Competitors** export, a tier-5 vendor export whose own stated scope is *"Recently disclosed competitors only (within the last two years)"* [`data/NVT/nVent Electric plc NYSE NVT Competitors.rtf` — CIQ Competitors export, retrieved 2026-09-07]. Note the upstream caveat carried forward: **nVent names no competitor anywhere in its own filings** — the FY24 10-K Competition section is entirely generic [`08_competitive-map.md`, preamble; FY24 10-K, Item 1 — Competition, p.2].

| Competitor | Listing / venue | Standard / currency / FY-end | Why no row above |
|---|---|---|---|
| **Rittal GmbH & Co. KG** (Friedhelm Loh Group, Germany) | **None — private** | German private group; no public income statement | **Permanent coverage gap.** A private company will never file a call. Per the Timing Rule this is a coverage gap, **not** a "not-yet reported" state. Closest product-for-product rival to Systems Protection's enclosure-and-cooling core, at ~$1,756.3m LTM revenue [CIQ Competitors export — vendor export] |
| **Hubbell Incorporated** | NYSE:HUBB | US GAAP / USD / FY ends 31-Dec | **No transcript in the pool.** Would be the strongest available peer (LTM revenue $6,223.6m at Jun-30-2026, ~1.29x nVent; predominantly US, like nVent's 85.0% Americas) [CIQ Competitors export — vendor export]. Its Q2 2026 call (Jul-2026) would read only into nVent's already-reported quarter |
| **Legrand SA** | Euronext Paris, ENXTPA:LR | IFRS / EUR / FY ends 31-Dec | **No transcript in the pool.** Closest business *shape* to post-2025 nVent; data centres were 26% of its 2025 sales. Reports on a **half-year** basis (H1 2026 released 2026-07-29) — so even if present it would be a basis mismatch against nVent's standalone quarter (G1) [`08_competitive-map.md`, Competitor C] |
| **Eaton Corporation plc** | NYSE:ETN | US GAAP / USD / FY ends 31-Dec | **No transcript in the pool.** The most directly matched *segment* rival (Electrical Americas) but 6.2x nVent's revenue at $30,026m LTM — fails the ~5x scale test as a whole-company comparable [CIQ Competitors export — vendor export] |
| **ABB Ltd** | SWX:ABBN | IFRS / USD reporting / FY ends 31-Dec | **No transcript in the pool.** $35,752m LTM revenue = 7.4x nVent — fails the ~5x scale test [CIQ Competitors export — vendor export] |
| **Hitachi Energy AG** | **None — private subsidiary of Hitachi Ltd** | No standalone margin disclosed | **Permanent coverage gap** at the entity level; grid and transformer products [CIQ Competitors export — vendor export] |

**One trap to name explicitly.** `08_competitive-map.md` quotes Hubbell's, Legrand's and Eaton's own results releases — but every one of those is labelled there as an *unverified web copy*, and **none of them is in `<DATA_PATH>`**. Under this module's Auditable-corpus rule a peer quote or number must trace to a document inside the bound snapshot. Those web-sourced peer figures are usable by `business-model` under its own rules; they are **not** this module's evidence, they are not peer *calls*, and they must not be used downstream to manufacture a read-through that the pool cannot support.

---

## 2. Coverage of the Subject's Exposure

**Reporting, read-through-eligible peers cover 0% of nVent — none exists in this pool.** Stated against `business-model/03_segment-map.md` and `05_customer-geography.md` weights, so the size of the blind spot is explicit rather than implied:

| Subject exposure | Weight | Reporting-peer vantage in this pool |
|---|---:|---|
| **Systems Protection** (enclosures, liquid/air cooling, switchgear, power distribution) | **72.5%** of revenue, 70.0% of reportable segment income, H1 FY26 [Q2 FY26 10-Q, Note 13, p.20] | **None.** Its closest product-for-product rival, Rittal, is **private and will never file a call** |
| **Electrical Connections** (cable management, connections, fastening) | **27.5%** of revenue, 30.0% of segment income, H1 FY26 [Q2 FY26 10-Q, Note 13, p.20] | **None** |
| **Americas** | **85.0%** of net sales ($2,307.2m of $2,713.3m), H1 FY26 [Q2 FY26 10-Q, Note 2, p.8] | **None** |
| **EMEA** | **11.2%** ($305.0m) [Q2 FY26 10-Q, Note 2, p.8] | **None** — and this is where Rittal is strongest, so it is the exposure most permanently unrepresentable |
| **Asia-Pacific** | **3.7%** ($101.1m) [Q2 FY26 10-Q, Note 2, p.8] | **None** |
| **The actual driver: data centres** (a *vertical*, not a segment) | ~**37%** of FY2026 group revenue — *derived from a transcript figure and a guidance range, inference, not a disclosed number* [`03_segment-map.md`, §2] | **None.** Legrand (26% of 2025 sales in data centres) and Eaton Electrical Americas are the natural cross-checks and neither has a call here |

**The uncovered majority is the whole company.** The read-through for **100%** of nVent's revenue is **Not assessable** on this pool. Two of the six named rivals (Rittal, Hitachi Energy) are private, so even a complete transcript intake would leave the enclosure-and-cooling core — 72.5% of revenue — without its single closest comparable.

---

## 3. Usability Check

| Requirement | Available? (Y/N) | Detail |
|---|---|---|
| ≥1 usable competitor call (verbatim transcript OR permitted broker paraphrase, G5) | **N** | Zero. No `external/` directory exists in the bound snapshot; no manifest row carries `external: true`; all 15 sources are nVent's own [bound `manifest.json`] |
| ≥2 distinct peer companies with verbatim transcripts (dispersion possible) | **N** | Zero distinct peer companies. The only two transcripts in the pool are nVent's own Q1 and Q2 FY2026 calls |
| ≥1 peer reported the comparable window (read-through possible) | **N** | Doubly so: no peer call is present, **and** the target window (1-Jul to 30-Sep-2026) has not yet ended as of the 2026-09-07 run date, so no peer call covering it can exist anywhere yet |
| Peer set anchored by competitive-map | **Y** | `business-model/08_competitive-map.md` names Rittal, Hubbell, Legrand (profiled) plus ABB, Eaton, Hitachi Energy (scale reference). **Not self-selected — that cap does not bind** |
| Subject's next-filing basis known | **Y** | Q3 FY2026, **standalone** three months ended 30-Sep-2026, alongside a cumulative nine-month column; release expected 30-Oct-2026 (vendor date) [`earnings/04_guidance-consensus.md`, §1A] |
| Subject segment-map available (for scope-matching) | **Y** | `business-model/03_segment-map.md` and `05_customer-geography.md` both present, with segment and geographic weights |

---

## 4. Caps That Will Bind

| Trigger | Applies? (Y/N) | Cap |
|---|---|---|
| No usable call at all — no verbatim transcript AND no permitted broker paraphrase (G5) | **Y** | **Insufficient — read-through and triangulation Not assessable.** (A broker-paraphrase-only pool would be Partial, not this row; there is no paraphrase here either) |
| Only one peer transcript | N (moot) | Not reached — there are zero, not one |
| No peer reported the comparable window | **Y** | Current-window read-through **Not assessable**. Binds twice over: no peer call in the pool, and the 1-Jul–30-Sep-2026 window is still open at the run date |
| Dominant subject exposure uncovered by any peer | **Y** | Systems Protection (72.5% of revenue) and the Americas (85.0%) have **no** reporting-peer vantage; Rittal, its closest rival, is private. That exposure's read-through is **Not assessable** and the net weight is capped accordingly |
| Peer set self-selected (no competitive-map) | **N** | Does not bind — `08_competitive-map.md` is present and anchors the peer set |
| Broker-paraphrase only (no verbatim) | N (moot) | Not reached — there is no paraphrase either. Peer tone and emphasis are **Not assessable** for the stronger reason that no peer commentary of any kind is in the pool |

---

## 5. Sufficiency Verdict

- **Verdict:** **Insufficient**
- **Reason:** The bound snapshot contains **no competitor earnings-call transcript and no broker paraphrase of one** — all 15 sources extracted cleanly (0 failures) and all 15 are nVent's own documents — so there is no usable peer call from which to build a benchmark.
- **Coverage of subject:** **0%.** No reporting peer speaks to any part of nVent — not Systems Protection (72.5% of revenue), not Electrical Connections (27.5%), not the Americas (85.0% of H1 FY26 net sales), and not the data-centre vertical (~37% of FY2026 revenue, derived) that is actually driving the company.
- **Active caps:**
  - Read-through to the Q3 FY2026 print: **Not assessable** (no peer call; and the 1-Jul–30-Sep-2026 window is still open at the 2026-09-07 run date).
  - Cross-sectional dispersion: **Not assessable** (needs ≥2 distinct peers; there are zero).
  - Narrative triangulation of nVent's own Q2 FY26 claims against peers: **Not assessable** (no peer vantage to cross-examine against).
  - Peer tone, emphasis and candor: **Not assessable**.
  - Net read-through weight: **none** — no dimension carries any weight into the master synthesis.
  - The module does **not** abort. Downstream agents `01`–`04` produce "Not assessable" chapters and `99` reports the coverage gap as its finding (CLAUDE.md §11 — an honest gap beats a fabricated benchmark).
- **Critical gaps:**
  1. **The Capital IQ "Competitor Transcripts" export for nVent's peer set was never dropped into nVent's own pool.** This is the one operator action that would change the verdict. A loose inbox drop of a competitor call is content-routed to *that competitor's* pool, where this module cannot see it; to be usable it must be force-routed under `EXTERNAL-INBOX/<Provider>/NVT/…` or placed directly in `data/NVT/external/<provider>/` **before** the next generation is admitted.
  2. **Two of six named rivals are private and can never be covered** — Rittal (the closest product-for-product rival to the 72.5%-of-revenue Systems Protection segment) and Hitachi Energy. Even a perfect transcript intake leaves this hole.
  3. **Timing.** Even a complete peer intake made today would yield only April–June 2026 calls, which read into nVent's **already-filed** Q2 FY26 — context, never a current-window read. The genuine read-through opportunity opens when Hubbell, Eaton and Legrand report their September-quarter periods in late October / early November 2026, ahead of or alongside nVent's expected 30-Oct-2026 release. The calendar spread there is narrow, so the timing edge is thin even in the best case.
  4. **nVent names no competitor in any of its own filings**, so the peer set rests entirely on a tier-5 vendor export whose stated scope is "recently disclosed competitors only" and which still carries divested Thermal Management rivals under "current subsidiaries" — a staleness flag on the export itself.
  5. **Peer figures quoted in `08_competitive-map.md` come from unverified web copies of peer releases that are not in `<DATA_PATH>`.** They are not peer calls and, under the Auditable-corpus rule, must not be used downstream to construct a read-through this pool cannot support.
