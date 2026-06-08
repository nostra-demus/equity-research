# Revenue Drivers — CRM

*Salesforce, Inc. (NYSE: CRM). US/SEC filer, US GAAP, reporting in USD (millions unless stated). Fiscal year ends January 31 — "FY26" = 12 months ended Jan-31-2026; "Q1 FY27" = quarter ended Apr-30-2026. As-of date: 2026-06-08.*

*Upstream read: `01_historical-financials.md` (revenue baseline and quarterly trend) and `04_guidance-consensus.md` (guidance, consensus, revision breadth) are present and used. Cross-module read: business-model `03_segment-map.md` does **not** exist in this run (only `00_data-triage.md` and `02_business-identity.md` are present), so the segment decomposition below is built from this module's own read of the FY26 10-K segment note and the two transcripts. `02_business-identity.md` was read and its revenue formula reused.*

---

## 1. Segment Decomposition Status

**Single-segment business (one reportable segment = 100% of revenue) — consolidated analysis, with the 10-K's product-offering and geography splits used as the working decomposition.**

- Salesforce reports **one** operating/reportable segment — "Multiple Enterprise Cloud Computing Market" — carrying 100% of revenue ($41,525M in FY26) [Capital IQ Segments tab (annual), `Salesforce-Inc-NYSE-CRM-Financials_annual__Segments.txt`; FY26 10-K, Note "Segment Information"]. There is **no product-cloud P&L** (no operating profit, margin, or cost by product or geography is disclosed below the consolidated level) — so a margin-by-segment build is not possible and is not attempted here.
- Two finer revenue cuts **are** disclosed and are used as the decomposition:
  - **Revenue by service offering** (six product lines, revenue only) [FY26 10-K, Item 7, "Subscription and Support Revenues by Service Offering"] — Section 5.
  - **Revenue by geography** (Americas / Europe / Asia Pacific, revenue only) [FY26 10-K, Item 7, "Revenues by Geography"] — Section 3 / Section 5.
- Business-model module note (per MODULE_RULES.md): *"Business-model segment-map not available — segment decomposition based on this module's own read."*

---

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Subscription | Customers × ARPU / price |

Salesforce is a recurring-subscription enterprise-software vendor; ~95% of FY26 revenue is subscription & support, ~5% is professional services [FY26 10-K, Item 7, "Sources of Revenues" — "Subscription and support revenues accounted for approximately 95 percent... for fiscal 2026"].

**Company-specific revenue formula (one line):**

`Revenue ≈ (number of paying subscriptions × price per subscription × contract term, recognized evenly over the term) + professional-services fees` — where growth comes almost entirely from **volume** (new customers + existing customers adding seats and products / AI usage), recognized ratably from a contracted backlog (RPO), not from list-price increases [FY26 10-K, Item 7 — "primarily caused by volume-driven increases from new business... Pricing was not a significant driver"; `02_business-identity.md`, §2].

Because revenue is recognized evenly over multi-year contracts (typically 12–36 months), **the reported revenue line lags demand**. The faster-moving demand signal is **current remaining performance obligation (cRPO)** — contracted subscription revenue due to be recognized in the next ~12 months — plus unearned (deferred) revenue and bookings [FY26 10-K, Item 7, "Remaining Performance Obligation"]. cRPO is therefore the leading driver to watch, ahead of recognized revenue.

---

## 3. Market / Share / Price / Mix Split

This separates how much of the move is the market growing, versus Salesforce's own execution, price, mix, currency, and deals.

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand (enterprise software / AI spend) | Mixed — AI/data demand strong, core seat-growth softer; macro IT-spend caution noted | FY26 revenue +10% nominal / +9% constant currency, "driven by Agentforce, Data 360, Slack" [Q4 FY26 transcript, CFO remarks]; 10-K flags IT-spend sensitivity to macro and "delayed... customer purchasing decisions" [FY26 10-K, Item 1A risk factors] | 80 |
| Company market share / execution | Improving in AI-adjacent products, flat-to-soft in legacy clouds | cRPO +13% constant currency at both Q4 FY26 and Q1 FY27 [Q4 FY26 & Q1 FY27 transcripts]; share gains shown via Agentforce ARR >$1B (Q1 FY27) and "AI and data ARR" $3.4B [Q1 FY27 transcript] | 75 |
| Price / realization | Roughly flat — not a driver | "Pricing was not a significant driver of the increase in revenues" [FY26 10-K, Item 7]; consumption / Flex-Credit pricing on Agentforce is new but small (≈50% of Q4 Agentforce bookings were Flex Credits) [Q4 FY26 transcript] | 35 |
| Product / customer / geography mix | Shifting toward AI/data/platform & existing-customer expansion; away from Marketing/Commerce/Tableau | Platform/Slack/Other +23% vs Marketing/Commerce +3% (FY26) [FY26 10-K, Item 7 offering table]; "50% of Agentforce and Data 360 bookings were from existing customers expanding" [Q1 FY27 transcript] | 70 |
| FX translation | Small positive (tailwind) lately; reverses if USD strengthens | "Total revenues... positively impacted by approximately one percent in foreign currency" FY26 vs FY25 [FY26 10-K, Item 7]; nominal-minus-constant-currency gap ~+1pp at Q4 FY26 and Q1 FY27 [transcripts] | 45 |
| M&A / divestitures | Positive and rising — Informatica added a new revenue layer | Informatica (closed Nov-2025) added ~$399M of revenue in FY26 (~1.1pp of growth) [FY26 10-K, Item 7]; Informatica Cloud ARR ~$1.1B at Q4 FY26 [Q4 FY26 transcript]; "revenue growth accelerating since the acquisition" [Q1 FY27 transcript] | 65 |

**Plain-English read of this split:** FY26 growth of ~10% nominal is **mostly organic volume** — more seats and more products sold, led by AI/data — with about **1 point from currency** and about **1 point from the Informatica acquisition** [FY26 10-K, Item 7]. It is **not** a price story. The most important swing factor inside "organic" is the **mix shift**: a fast-growing AI/data/platform pocket (Agentforce, Data 360, Slack) is being **partly offset** by weakness in Marketing, Commerce, and Tableau [Q1 FY27 transcript, CFO guidance remarks]. Growth driven by Informatica or by FX must **not** be read as organic demand; both are called out separately here.

---

## 4. Revenue Driver Table (consolidated)

Magnitude = how much total revenue moves if this driver moves a reasonable amount. High >5% of revenue; Mid 2–5%; Low <2%.

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| cRPO (contracted revenue due in next ~12 months) — **the key forward gauge** | $35.1B at Jan-31-2026 (+16% nominal / +13% cc); $33.6B at Apr-30-2026 (+14% nominal / +13% cc) | Growing, but cc growth flat at ~13% for two straight quarters (no acceleration) | High | [FY26 10-K, Item 7 — $35.1B / +16%]; [Q1 FY27 transcript — "$33.6 billion, up ~14% nominal and 13% in constant currency"]; [Q4 FY26 transcript — "$35.1 billion, up 16%... 13% in constant currency"] |
| Total RPO (all future contracted revenue, incl. beyond 12 months) | $72.4B at Jan-31-2026, +14% YoY (vs $63.4B prior) | Growing; includes Informatica backlog | High | [FY26 10-K, Item 7 — "$72.4 billion, an increase of 14 percent"; selected-metrics table $72.4B vs $63.4B]; ~$X Informatica RPO included [FY26 10-K, Note — "remaining performance obligation related to Informatica"] |
| Subscription volume — new customers + existing-customer expansion ("land and expand") | Subscription & support revenue $39,388M, +10% YoY; ~50–60% of Agentforce/Data 360 bookings from existing customers | Growing ~10%; expansion is the larger engine | High | [FY26 10-K, Item 7 — "$39,388M... +10%... volume-driven... new customers, upgrades and additional subscriptions"]; [Q1 FY27 transcript — "50% of Agentforce and Data 360 bookings were from existing customers"] |
| Agentforce + Data 360 + Informatica ("AI and data") ARR — the growth pocket | $2.9B at Jan-31-2026 → $3.4B at Apr-30-2026; Agentforce alone ~$0.8B (Q4, +169% YoY) → >$1.0B (Q1 FY27) | Accelerating off a small base; still ~7–8% of revenue run-rate | Mid (today) → High (if it scales) | [Q4 FY26 transcript — "$2.9 billion... Informatica Cloud ARR of $1.1 billion and Agentforce ARR of approximately $800 million... up 169%"]; [Q1 FY27 transcript — "$3.4 billion in AI and data ARR"; "Agentforce... ARR now greater than $1 billion"] |
| Attrition / retention (renewal floor) | Trailing-12-month attrition ~8% at Jan-31-2026 (ex-Slack self-service & current-year acquisitions) → ~92% of contract value retained | Stable ("in line with recent trends") | High (a few points of attrition = billions of revenue) | [FY26 10-K, Item 7 — "attrition rate... was approximately eight percent"]; [Q4 FY26 transcript — "revenue attrition ended the year at approximately 8%, in line with recent trends"] |
| Product mix — strong vs weak clouds | Platform/Slack/Other +23%; Service +8%; Sales +8%; Integration/Analytics +8%; Marketing & Commerce +3% (FY26) | Diverging — AI/platform up, Marketing/Commerce/Tableau soft | Mid | [FY26 10-K, Item 7, "Subscription and Support Revenues by Service Offering"]; [Q1 FY27 transcript — "ongoing weakness in Marketing and Commerce and increased softness in Tableau bookings and renewals"] |
| M&A contribution (Informatica, Regrello) | Informatica ~$399M of FY26 revenue; closed Nov-2025 | Rising into FY27 (first full-year contribution) | Mid | [FY26 10-K, Item 7 — "Informatica... contributed approximately $399 million... in fiscal 2026"]; [Q4 FY26 transcript — Informatica Cloud ARR ~$1.1B] |
| FX translation | ~+1pp tailwind to FY26 revenue; ~+1pp to recent quarters | Tailwind now; reverses if USD strengthens | Low–Mid | [FY26 10-K, Item 7 — "positively impacted by approximately one percent"]; [Q1 FY27 transcript — +13% nominal vs +12% cc] |
| Professional services & other (the volatile, low-margin line) | $2,137M, −4% YoY in FY26 | Declining ("less demand for larger... transformation engagements... may continue") | Low | [FY26 10-K, Item 7 — "$2,137M... (4)%... less demand for larger, multi-year transformation engagements"] |
| Term-software-license timing (point-in-time revenue) | ~6% of subscription revenue; sits inside Integration & Analytics offering | Lumpy quarter-to-quarter; Informatica adds on-prem licence revenue | Low (full-year) / Mid (single quarter) | [FY26 10-K, Item 7 — "term software licenses... approximately six percent"; "greater volatility in revenues period to period"]; [Q1 FY27 transcript / `04_guidance-consensus.md` §6 — Q1 revenue beat partly "Informatica on-prem"] |

Note on the RPO row: the 10-K states a specific Informatica-related RPO figure exists in the notes ("...billion of remaining performance obligation related to Informatica"); the exact dollar amount was not cleanly captured in the pool extract at the line level, so it is left as "included" rather than guessed (no source = no number).

---

## 5. Revenue Drivers By Product Offering and Geography

Salesforce has only one reportable **segment**, so a per-segment P&L table does not exist. Below are the two disclosed **revenue** decompositions (no margin by line is disclosed). In Q3 FY26 Salesforce renamed its offerings to reference "Agentforce"; the 10-K states "There were no changes in the allocation of revenue between these service offerings as a result of this change" [FY26 10-K, Item 7, footnote (1)] — so FY25 and FY26 are comparable. ("Agentforce Sales" ≈ legacy Sales Cloud; "Agentforce Service" ≈ legacy Service Cloud; "Agentforce 360 Platform, Slack and Other" ≈ Platform + Slack + Data; "Agentforce Integration and Agentforce Analytics" ≈ MuleSoft/Informatica + Tableau.)

### Product offering: subscription & support revenue by line (≈95% of total revenue)

| Offering (FY26 name) | FY26 Revenue | % of Subscription | FY25 Revenue | Growth | Direction | Magnitude | Evidence |
|---|---:|---:|---:|---:|---|---|---|
| Agentforce 360 Platform, Slack and Other | $8,882M | 22% | $7,247M | **+23%** | Improving (fastest line; carries Data, Slack, +$388M Informatica) | High | [FY26 10-K, Item 7 offering table; footnote (2) — incl. $388M Informatica] |
| Agentforce Service (≈ Service Cloud) | $9,818M | 25% | $9,054M | +8% | Stable | High | [FY26 10-K, Item 7 offering table] |
| Agentforce Sales (≈ Sales Cloud) | $9,028M | 23% | $8,322M | +8% | Stable | High | [FY26 10-K, Item 7 offering table] |
| Agentforce Integration and Agentforce Analytics (≈ MuleSoft/Informatica + Tableau) | $6,232M | 16% | $5,775M | +8% | Stable overall, but Tableau soft; lumpy on term licences | Mid | [FY26 10-K, Item 7 offering table; "greater volatility... term software licenses"]; [Q1 FY27 transcript — "softness in Tableau"] |
| Agentforce Marketing and Agentforce Commerce | $5,428M | 14% | $5,281M | **+3%** | Deteriorating (slowest line) | Mid | [FY26 10-K, Item 7 offering table]; [Q1 FY27 transcript — "ongoing weakness in Marketing and Commerce"] |
| **Total subscription & support** | **$39,388M** | **100%** | **$35,679M** | **+10%** | Growing ~10% | High | [FY26 10-K, Item 7] |

Read: the **fast line is Platform/Slack/Other (+23%)**, which is where Data 360, Slack, and the new AI/Informatica revenue sit; the **slow line is Marketing & Commerce (+3%)**, which management has flagged as a continuing drag into FY27. The two biggest lines (Sales and Service, ~48% of subscription revenue combined) grow with the overall business at ~+8%.

### Geography: total revenue by region

| Region | FY26 Revenue | % of Total | FY25 Revenue | Growth | Direction | Magnitude | Evidence |
|---|---:|---:|---:|---:|---|---|---|
| Americas | $27,193M | 65% | $25,143M | +8% | Stable; largest base (US alone ~$25.3B) | High | [FY26 10-K, Item 7 geography table; Segments tab — US $25,289M] |
| Europe | $10,017M | 25% | $8,891M | +13% | Improving (fastest region; FX-aided) | High | [FY26 10-K, Item 7 geography table] |
| Asia Pacific | $4,315M | 10% | $3,861M | +12% | Improving | Mid | [FY26 10-K, Item 7 geography table] |
| **Total** | **$41,525M** | **100%** | **$37,895M** | **+10%** | Growing ~10% | High | [FY26 10-K, Item 7] |

Read: **international (Europe +13%, APAC +12%) grew faster than the Americas (+8%)** in FY26, helped by ~1pp of FX [FY26 10-K, Item 7]. Because ~35% of revenue is non-Americas, a swing in the US dollar is a Low-to-Mid swing factor on reported revenue (Section 3, FX row).

---

## 6. Revenue Growth Decomposition

Most recent full-year growth (FY25 → FY26). The company reports total revenue **+10% nominal / +9% constant currency** [Q4 FY26 transcript]; the upstream's exact arithmetic on the reported dollars is **+9.6% nominal** ($37,895M → $41,525M) [`01_historical-financials.md`, §1]. The decomposition below uses the company's stated rounded figures and the 10-K's stated FX and M&A dollars; where a component is inferred from those disclosed numbers it is labeled.

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Organic subscription volume (new + expansion seats/products) | ~+7.9 | Residual: constant-currency total +9.0pp [Q4 FY26 transcript] minus M&A +1.1pp; "volume-driven... pricing was not a significant driver" [FY26 10-K, Item 7]. *Inference from disclosed cc growth and M&A dollars — labeled.* |
| Price / realization | ~0.0 | "Pricing was not a significant driver of the increase in revenues" [FY26 10-K, Item 7] |
| Mix (within organic; net of weak Marketing/Commerce/Tableau vs strong Platform/AI) | (already inside the +7.9 organic line) | Platform/Slack/Other +23% vs Marketing/Commerce +3% [FY26 10-K, Item 7 offering table] — mix is a reallocation within organic volume, not a separable pp here |
| Professional services drag | ~−0.2 | Professional services −$79M (−4%) on a $37,895M base [FY26 10-K, Item 7] |
| FX (currency translation) | ~+1.0 | "Total revenues... positively impacted by approximately one percent" [FY26 10-K, Item 7]; +10% nominal vs +9% cc [Q4 FY26 transcript] |
| Acquisitions (Informatica + Regrello) | ~+1.1 | Informatica "contributed approximately $399 million" on a $37,895M base [FY26 10-K, Item 7] |
| **Total revenue growth** | **~+10.0 (nominal)** | [FY26 10-K, Item 7 — "Total revenues... $41,525... 10%"]; upstream exact = +9.6% [`01_historical-financials.md`, §1] |

Reconciliation / what's missing:
- The components tie to ~+10% nominal: +7.9 organic + (−0.2 services) + 1.0 FX + 1.1 M&A ≈ **+9.8 to +10.0pp** (rounding). The small gap versus the upstream's exact +9.6% is FX/M&A rounding in the disclosure (the 10-K rounds FX to "approximately one percent" and growth to "10%"); flagged, not smoothed.
- **A clean volume-vs-price split is not separately disclosed** (Salesforce gives no units/seats/ARPU). The split above leans on management's explicit statement that price was not a driver, so "organic" is treated as essentially all volume. This is the best the disclosure allows; it is labeled as inference where residual math is used.
- **Per-quarter (QoQ) decomposition is not built**: the Capital IQ quarterly feed stops at Q2 FY26 and the transcripts lead with cc growth, not a quarterly bridge, so a QoQ volume/price/FX/M&A split is **Not available** at line-item precision [per MODULE_RULES.md partial-data rule; `01_historical-financials.md`, §3 data-gap flag]. The forward quarterly signal that **is** available is the cRPO growth guide (Q2 FY27 ~13% cc) [Q1 FY27 transcript].

---

## 7. The Single Biggest Revenue Driver

**The single biggest revenue driver is subscription volume — net new bookings from existing-customer expansion plus new customers — captured ahead of recognized revenue by current remaining performance obligation (cRPO).** A 10–20% move in cRPO would move next-twelve-month revenue by roughly the same order, because cRPO is the contracted backlog that converts to revenue within ~12 months and subscription is ~95% of the business [FY26 10-K, Item 7, "Remaining Performance Obligation"; "Sources of Revenues"]. **Its current direction is up but not accelerating:** cRPO grew ~13% in constant currency at **both** Q4 FY26 ($35.1B) and Q1 FY27 ($33.6B), and management guides Q2 FY27 cRPO to ~13% cc again — three readings pinned at ~13% [Q4 FY26 & Q1 FY27 transcripts]. Inside that number, the **mix is the live question**: the AI/data pocket (Agentforce + Data 360 + Informatica ARR, $2.9B → $3.4B in one quarter, Agentforce alone past $1B) is the accelerator, while Marketing, Commerce, and Tableau are the brake [Q1 FY27 transcript]. The disconfirming signal worth watching, already visible: on the May call an analyst pressed that cRPO has come in "spot in line with guidance" for two straight quarters with **no upside**, so the second-half FY27 organic-revenue reacceleration management is asking the Street to underwrite is **not yet confirmed by the bookings data** [`04_guidance-consensus.md`, §6–§7; Q1 FY27 transcript]. If cRPO constant-currency growth breaks above ~13–14%, revenue re-accelerates; if it slips toward ~10%, the FY27 revenue guide ($45.9–46.2B) is at risk — and the swing comes from whether Agentforce/Data 360 expansion outruns the Marketing/Commerce/Tableau drag, **not** from price [FY26 10-K, Item 7 — "pricing was not a significant driver"].
