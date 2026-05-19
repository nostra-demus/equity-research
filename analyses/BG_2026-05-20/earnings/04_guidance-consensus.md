# Guidance & Consensus — BG

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ Estimates (Consensus, Guidance, Revisions, Surprise, Trends, Recent Changes exports) |
| Data as of date | May 9, 2026 (file timestamps); post Q1 2026 print of Apr 29, 2026 |
| Fiscal year basis | Calendar (FY ends Dec-31-2026) |
| Analyst count | 10 (FY26 EPS Normalized: 6 estimates "in consensus" / 8 total per Revisions). Target price: 9 analysts. Recommendation: Outperform (1.56), 5 Buy / 3 Outperform / 1 Hold |
| Currency | USD (reported) |
| Calendarization issue? | N — single fiscal calendar; no cross-currency reconciliation needed |

Source: `data/BG/Consensus.xlsx`, header rows 6–17; `data/BG/Revisions.xlsx`, row 18.

## 2. Management Guidance

All guidance is for FY 2026 (the only formally guided period). Issued at Q1 2026 call on April 29, 2026. Source: Q1 2026 earnings call transcript, prepared remarks (`data/BG/q1_call.txt`, lines 103–219); reconfirmed in `data/BG/Guidance.xlsx` rows 14–157.

| Metric | Period | Guidance | Type | Midpoint | Source |
|---|---|---|---|---:|---|
| Adjusted EPS | FY 2026 | $9.00 – $9.50 | Range | $9.25 | Q1 2026 transcript, prepared remarks (Greg Heckman), lines 104–106 |
| Net interest expense | FY 2026 | $(620) – $(660) million | Range | $(640)M | Q1 2026 transcript, prepared remarks (John Neppl), lines 215–217 |
| Effective tax rate | FY 2026 | 22% – 26% | Range | 24% | Q1 2026 transcript, line 214 |
| Capital expenditure | FY 2026 | $1.5 – $1.7 billion | Range | $1.6B | Q1 2026 transcript, lines 217–218 |
| D&A | FY 2026 | ~$975 million | Point (approximate) | $975M | Q1 2026 transcript, lines 218–219 |
| EPS phasing | FY 2026 | 40% H1 / 60% H2; Q3/Q4 split ~45/55 | Qualitative | n/a | Q1 2026 transcript, Q&A (John Neppl), lines 342–346 |
| Segment direction (vs prior) | FY 2026 | Soybean + soft seed processing/refining: higher. Tropical oils + specialty: lower. Grain merch & milling: lower. Corp & other: in line. | Qualitative | n/a | Q1 2026 transcript, lines 210–213 |

Prior FY 2026 EPS guidance was $7.50 – $8.00 issued at Q4 2025 call (Feb 4, 2026; transcript not in data pool but referenced in Q1 transcript line 105). Q1 2026 print raised guidance by **$1.50 at the midpoint**.

FY 2026 revenue is **not formally guided**. The company guided FY 2025 EPS at $7.30 – $7.60 on Nov 5, 2025; actual was $7.57 (1.5% above midpoint).

## 3. Guidance vs Consensus Table

| Metric | Period | Mgmt Guidance | Mgmt Midpoint | Street Consensus (mean) | Gap (Consensus − Midpoint) | Gap Direction |
|---|---|---|---:|---:|---:|---|
| Adjusted EPS (Normalized) | FY 2026 | $9.00 – $9.50 | $9.25 | $9.43 | +$0.18 (+1.9%) | Street above guidance midpoint |
| Net interest expense | FY 2026 | $(620) – $(660)M | $(640)M | $(672.5)M | $(32.5)M (5.1% higher cost) | Street more conservative than guidance |
| Effective tax rate | FY 2026 | 22% – 26% | 24% | 23.6% | (40 bps) | Street slightly below midpoint |
| Capex | FY 2026 | $(1,500) – $(1,700)M | $(1,600)M | $(1,528)M | $72M (4.5% lower) | Street below guidance midpoint |
| D&A | FY 2026 | ~$975M | $975M | $920.8M | $(54.2)M (5.6% lower) | Street below management |
| Revenue | FY 2026 | Not guided | n/a | $91,485M | n/a | n/a |
| EBITDA | FY 2026 | Not guided | n/a | $3,997M | n/a | n/a |

Source: Mgmt — Q1 2026 transcript lines 204–219. Consensus — `data/BG/Consensus.xlsx` rows 42, 106, 114, 131, 195, 212, 249.

The Adjusted EPS consensus of $9.43 sits **above the top end** of the $9.00–$9.50 guidance range by $0.18 over the midpoint — but is just $(0.07) below the high end. Sell-side has effectively priced the **upper bound** of the guide.

## 4. Estimate Revision Momentum Table

EPS Normalized estimates (mean), from `data/BG/Trends.xlsx` rows 17–24:

| Estimate | 12M Ago | 6M Ago | 3M Ago | 1M Ago | Current | Direction |
|---|---:|---:|---:|---:|---:|---|
| EPS Normalized FQ2 2026 | $1.95 | $1.89 | $1.61 | $1.69 | $1.93 | Rising (sharp upturn last month) |
| EPS Normalized FQ3 2026 | $2.10 | $2.32 | $2.47 | $2.61 | $2.53 | Rising broadly; minor pullback in last month |
| EPS Normalized FQ4 2026 | $2.54 | $2.93 | $3.13 | $3.18 | $3.15 | Rising broadly; flat last month |
| **EPS Normalized FY 2026** | **$8.71** | **$8.79** | **$8.13** | **$8.23** | **$9.43** | **Sharply rising (+$1.20 in 1M, +$1.30 vs 3M)** |
| EPS Normalized FY 2027 | $9.01 | $10.00 | $9.94 | $10.26 | $10.89 | Rising |
| EPS (GAAP) FY 2026 | $9.09 | n/a | $14.08 | $13.18 | $8.70 (12M Trends row 43); Capital IQ R53 shows $8.70 | Mixed — large GAAP-Adj gap from Viterra integration charges |

Revenue (mean), from `data/BG/Trends.xlsx` rows 81–87:

| Estimate | 12M Ago | 3M Ago | 1M Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue FQ2 2026 ($M) | 15,979 | 22,953 | 23,232 | 22,757 | Step-up at Viterra close; flat-to-down last month |
| Revenue FY 2026 ($M) | 53,121 | 90,787 | 91,379 | 91,485 | Stable around $91.5B after Viterra-driven step-up |
| Revenue FY 2027 ($M) | 17,776–annualized | 22,958 (Q1) | 23,019 (Q1) | 23,019 (Q1) | Stable |

EBITDA (mean), from `data/BG/Trends.xlsx` rows 92–98:

| Estimate | 12M Ago | 3M Ago | 1M Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| EBITDA FQ2 2026 ($M) | 604 | 809 | 823 | 896 | Rising |
| EBITDA FY 2026 ($M) | 2,295 | 3,664 | 3,649 | 3,997 | Rising — +$348M (+9.5%) in last month alone |
| EBITDA FY 2027 ($M) | 648 (Q1) | 932 (Q1) | 972 (Q1) | 1,038 (Q1) | Rising |

The single most important number on this page: **Street FY26 Adj EPS moved from $8.23 to $9.43 over the last month — a $1.20 (14.6%) upward revision in 30 days following the Apr 29 print and guide raise.**

## 5. Revision Breadth

Source: `data/BG/Revisions.xlsx` rows 17–32 (EPS Normalized), 126–142 (Revenue), 144–160 (EBITDA), 162–178 (EBIT).

| Metric | Period | Window | Up Revisions | Down Revisions | Net Breadth | Total Analysts |
|---|---|---|---:|---:|---:|---:|
| EPS Normalized | FY 2026 | Last 1 month | 6 | 0 | +6 (100% up) | 10 |
| EPS Normalized | FQ2 2026 | Last 1 month | 6 | 0 | +6 (100% up) | 8 |
| EPS Normalized | FQ3 2026 | Last 1 month | 2 | 4 | (2) (33% up) | 8 |
| EPS Normalized | FQ4 2026 | Last 1 month | 2 | 4 | (2) (33% up) | 8 |
| EPS Normalized | FY 2027 | Last 1 month | 4 | 1 | +3 (80% up) | 10 |
| Revenue | FY 2026 | Last 1 month | 1 | 4 | (3) (20% up) | 7 |
| Revenue | FY 2026 | Last 3 months | 2 | 3 | (1) (40% up) | 6 |
| EBITDA | FY 2026 | Last 1 month | 5 | 0 | +5 (100% up) | 8 |
| EBITDA | FY 2027 | Last 1 month | 5 | 0 | +5 (100% up) | 8 |
| EBIT | FY 2026 | Last 1 month | 4 | 0 | +4 (100% up) | 6 |
| Interest expense | FY 2026 | Last 1 month | 1 | 3 | (2) — higher cost | 4 |

The breadth picture: **EPS, EBITDA, and EBIT for FY26 are seeing 100% upward breadth in the last month**, but FY26 revenue and the back half of the year (Q3/Q4 2026) are split or net-down. Translation: analysts believe in stronger margins and the H1 strength, but are skeptical that H2 holds up.

## 6. Historical Beat / Miss Pattern

Source: `data/BG/Surprise.xlsx` rows 126–203, quarterly data cols 98–106.

| Period | Reported | EPS Normalized Beat/Miss | EPS Beat magnitude | Revenue Beat/Miss | EBITDA Beat/Miss | Notes |
|---|---|---|---:|---|---|---|
| Q1 2024 | Apr 24, 2024 | Beat | +20.2% ($3.04 vs $2.53) | Miss (3.9%) | Beat (14.4%) | |
| Q2 2024 | Jul 31, 2024 | Miss | (5.5%) ($1.73 vs $1.83) | Miss (6.3%) | Miss (3.3%) | |
| Q3 2024 | Oct 30, 2024 | Beat | +6.5% ($2.29 vs $2.15) | Miss (2.2%) | Beat (1.8%) | |
| Q4 2024 | Feb 5, 2025 | Miss | (5.3%) ($2.13 vs $2.25) | Miss (1.2%) | Miss (6.8%) | |
| Q1 2025 | May 7, 2025 | Beat | +38.2% ($1.81 vs $1.31) | Miss (11.2%) | Beat (11.2%) | |
| Q2 2025 | Jul 30, 2025 | Beat | +21.3% ($1.31 vs $1.08) | Beat (2.8%) | Beat (3.1%) | |
| Q3 2025 | Nov 5, 2025 | Beat | +15.2% ($2.27 vs $1.97) | Miss (4.5%) | Beat (18.8%) | First post-Viterra-close quarter (rev miss vs much higher base) |
| Q4 2025 | Feb 4, 2026 | Beat | +9.3% ($1.99 vs $1.82) | Beat (6.5%) | Beat (0.2%) | |
| **Q1 2026** | **Apr 29, 2026** | **Beat** | **+110.3% ($1.83 vs $0.874)** | **Miss (6.4%)** | **Beat (33.5%)** | **Massive EPS beat on Soy & Soft Seed processing; raised FY guide** |

**Track record (last 9 quarters):** EPS Normalized beat in **7 of 9 quarters** (78% hit rate). Average beat among beats: +31% (skewed by Q1 2026's +110%). Revenue missed in **7 of 9 quarters**. EBITDA beat in **7 of 9**. Pattern: margin-driven beats with revenue softness — typical for an ag merchandiser where take-rate / spread matters more than topline.

FY-level: FY 2025 EPS Normalized beat by 3.1% ($7.57 vs $7.34 estimate). FY 2024 missed by (1.7%). FY 2023 beat by 6.9%.

## 7. Bar Assessment

**Bar is fair, with bias toward high near-term and low full-year.**

Three reasons. **First**, the FY26 Adjusted EPS consensus of $9.43 sits +$0.18 above the $9.25 guidance midpoint and only $(0.07) below the $9.50 top end — sell-side has essentially priced the upper bound of the just-raised range, after analysts revised FY26 EPS by +$1.20 (+14.6%) in the past month with 100% upward breadth (6 of 6) on EPS Normalized FY26 (`data/BG/Revisions.xlsx` row 20). The bar to beat the full-year is now meaningfully higher than it was 30 days ago. **Second**, the bar for Q2 2026 looks easier: Q2 2026 EPS Normalized has been revised up 100% (6/6 analysts up) to $1.93 (`Trends.xlsx` row 17), but management implicitly guided ~$1.87 per share for Q2 — derived from the 40/60 H1/H2 split applied to the $9.25 midpoint ($3.70 H1 less Q1's $1.83 = $1.87 for Q2). Consensus is essentially right on management's implied number, with a slight lean above. **Third**, the bar for H2 2026 (Q3 + Q4 combined ~$5.55 needed at midpoint) looks high because Q3 and Q4 EPS revisions over the last month were net-DOWN (2 up vs 4 down for each), revenue revisions for FY26 are net-down (1 up vs 4 down), and management cited "significant uncertainty" in H2 (transcript line 208), inverted forward crush curves, and trade/El Niño/tariff risks (lines 461–475).

Net: the just-raised guide creates a high-low setup — H1 looks beatable on momentum and a 109% Q1 beat magnitude, but the full-year now requires the H2 to deliver against rising estimates into structurally uncertain crush curves. Beat history (7-of-9 quarters EPS-positive) tilts the near-term odds positive.
