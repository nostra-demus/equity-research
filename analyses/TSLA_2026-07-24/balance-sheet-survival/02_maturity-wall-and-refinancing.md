# Maturity Wall & Refinancing — TSLA

**Reporting currency:** US Dollar (USD), figures in millions unless stated otherwise. **Basis:** Note 8 (Debt) of the Form 10-Q for the quarter ended June 30, 2026 (filed Jul-23-2026), interest-bearing debt + finance leases only (narrow/GAAP basis, matching `01_capital-structure-and-leverage.md`'s $9,342M total gross debt on that basis; the operating-lease-inclusive "broad" $16,080M figure is `01`'s canonical net-debt basis but operating leases carry no debt-note maturity schedule and are excluded from this wall, consistent with US GAAP keeping them off the debt line). All dollar amounts below are **net carrying value** (current + long-term), which reconciles exactly to `01`'s $9,342M total ($1,418M current + $7,924M long-term) [Q2 FY26 10-Q, Note 8].

---

## 1. Maturity Schedule

Tesla's debt note does **not** publish a year-by-year (Year 1 / 2 / 3 / 4 / 5 / Thereafter) maturity table — only a current-vs-long-term split on the balance sheet, plus an instrument-level contractual maturity date or date-range for each facility. This section first reproduces the GAAP balance-sheet split (the literal "within 12 months / thereafter" anchor), then a second table translates the instrument-level contractual dates into a truer time-based view, because the two views diverge sharply for one instrument (flagged below).

### 1a. GAAP balance-sheet classification (current vs long-term)

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (GAAP current, i.e. by Jun-30-2027) | $1,418M | 15.2% | Automotive Asset-Backed Notes $1,240M; Energy Asset-Backed Notes $90M; Cash Equity Debt $10M; Finance leases $78M | [Q2 FY26 10-Q, Note 8] |
| Year 2 | Not separately disclosed | n/a | No by-year breakdown published beyond current/long-term | [Q2 FY26 10-Q, Note 8] |
| Year 3 | Not separately disclosed | n/a | " | " |
| Year 4 | Not separately disclosed | n/a | " | " |
| Year 5 | Not separately disclosed | n/a | " | " |
| Thereafter (GAAP long-term, undifferentiated by year) | $7,924M | 84.8% | China Working Capital Facility $5,888M (see flag below); Automotive Asset-Backed Notes (LT portion) $1,121M, contractual range Jun-2027–Jun-2035; Energy Asset-Backed Notes (LT portion) $610M, contractual range Jun-2050–May-2052; Cash Equity Debt (LT portion) $100M, Jul-2034; Solar Bonds/Other $2M, Mar-2030–Jan-2031; Finance leases (LT portion) $203M, no single date disclosed | [Q2 FY26 10-Q, Note 8] |
| **Total** | **$9,342M** | **100%** | — | [Q2 FY26 10-Q, Note 8 + Consolidated Balance Sheets] |

Ties out exactly to `01_capital-structure-and-leverage.md`'s narrow gross-debt figure ($9,342M = $1,418M current + $7,924M long-term). No reconciling item.

### 1b. Reclassification flag — the GAAP split materially understates the true near-term wall

The **China Working Capital Facility** ($5,888M net carrying value, fully drawn, 63.0% of total gross debt) carries a **contractual maturity of September 2026 – March 2027** — 2 to 9 months from the Jun-30-2026 balance-sheet date — yet is booked entirely as **long-term** ($0 current / $5,888M long-term). Note 8's own footnote explains why: *"As we have the intent and ability to refinance the loan on a long-term basis, we classify it as Debt and finance leases, net of current portion in the consolidated balance sheets"* [Q2 FY26 10-Q, Note 8, footnote (2)]. This is a standard, permitted US GAAP presentation (ASC 470-10-45) when management has intent and ability to refinance — but it is a **classification judgment, not evidence that a refinancing is secured**. No binding replacement-financing agreement is disclosed anywhere in the pool; only the general "intent and ability" assertion exists.

### 1c. Contractual-maturity view (before the ASC 470-10-45 reclassification)

| Window (contractual, from Jun-30-2026) | Amount | % of Total Debt | Driver |
|---|---:|---:|---|
| ≤ 12 months (by Jun-2027) | **$7,306M** | **78.2%** | GAAP-current $1,418M **+ China Working Capital Facility $5,888M** (contractual maturity Sep-2026–Mar-2027, reclassified long-term per §1b) |
| 13–24 months | Indeterminate — no incremental amount separately disclosed | n/a | The Automotive Asset-Backed Notes' contractual range (Jun-2027–Jun-2035) begins inside this window, but the $1,121M long-term tranche is not itemized by year |
| Beyond 24 months, through 2035 | Up to $1,223M ($1,121M Automotive ABS LT + $100M Cash Equity Debt LT (Jul-2034) + $2M Solar Bonds (Mar-2030–Jan-2031)) | up to 13.1% | Timing within the Automotive ABS range not disclosed |
| 2050–2052 | $610M | 6.5% | Energy Asset-Backed Notes (LT portion) |
| **Total** | **$9,342M** | **100%** | |

---

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) | ~3.7 years — computed from instrument-level contractual dates, using the midpoint of each date range, amount-weighted by net carrying value; **excludes** $281M of finance leases (no single maturity date disclosed) and the undrawn RCF. *Inference, not from filings* (the midpoint-of-range method is an estimation, not a company-disclosed WAM). Memo: excluding the China facility, the remaining $3,173M of debt has an estimated WAM of ~9.5 years (pulled long by the 2050–2052 Energy ABS tail) — the ~3.7-year headline figure is almost entirely a function of the China facility's near-term contractual date. |
| % due within 12 months | **78.2%** on a contractual basis ($7,306M / $9,342M — see §1c); **15.2%** on the GAAP balance-sheet "current" classification ($1,418M / $9,342M — see §1a). The 63-point gap is the China Working Capital Facility reclassification (§1b). |
| % due within 24 months | ≥ 78.2% (same floor as the 12-month figure); the true figure is higher but not quantifiable — the Automotive Asset-Backed Notes' Jun-2027–Jun-2035 range enters this window with no by-year split disclosed. **Confidence: moderate** — instrument-level data exists, but the multi-tranche ABS split within its range is not itemized. |
| % due within 36 months | ≥ 78.2% (same floor and limitation as above) |
| Largest single maturity year (and amount) | The **Sep-2026 – Mar-2027 window: $5,888M (63.0% of total gross debt)** — entirely the China Working Capital Facility. No other single year or window exceeds low single digits of total debt. |

---

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | 37.0% ($3,454M / $9,342M): Solar Bonds $2M (5.45%–5.75%); Automotive Asset-Backed Notes $2,361M (2.82%–5.82%); Energy Asset-Backed Notes $700M (5.08%–6.35%); Cash Equity Debt $110M (5.25%); Finance leases $281M (~4.70%) | [Q2 FY26 10-Q, Note 8] |
| Floating-rate share | 63.0% ($5,888M / $9,342M): China Working Capital Facility, 2.01%–2.11% referencing an unspecified "New Benchmark," CNY-denominated. Memo: the RCF Credit Agreement ($5,000M committed) is also floating (SOFR-based) but $0 drawn — a contingent floating exposure only if drawn, not counted in the % above | [Q2 FY26 10-Q, Note 8] |
| Weighted-average coupon — all debt (rate-midpoint basis) | ~3.02% | Computed: amount-weighted average of each instrument's stated rate-range midpoint. Pulled down heavily by the China facility's 2.06% midpoint on 63% of the stack. |
| Weighted-average coupon — USD fixed-rate instruments only (ex-China facility) | ~4.67% | Computed, same method, on the $3,454M fixed-rate USD subset |
| Current market refi rate — USD, ~5yr tenor, BBB-unsecured proxy | ~5.3%–5.4% (5-Year US Treasury yield 4.41% as of 2026-07-22, + ICE BofA BBB US Corporate Index option-adjusted spread of ~0.94%–0.97%, Jul-2026) | Web: FRED, 5-Year Treasury Constant Maturity Rate, 2026-07-22 (indicative, unverified); Web: FRED, ICE BofA BBB US Corporate Index OAS, Jul-2026 (indicative, unverified) |
| Current market refi rate — China, 1-year benchmark proxy | 1-Year Loan Prime Rate (LPR) 3.00%, unchanged for a 14th straight month as of Jul-2026 | Web: PBOC 1-Year Loan Prime Rate, reported Jul-20-2026 (indicative, unverified) |
| Estimated refi cost step-up — USD fixed debt vs. BBB-unsecured proxy | ~+68 bps (4.67% → ~5.35%) | Computed. Caveat: most of this USD fixed debt (Automotive/Energy Asset-Backed Notes) is **secured**, asset-backed paper, which typically prices tighter than an unsecured BBB corporate-bond proxy — this may overstate the true step-up for those instruments specifically. |
| Estimated refi cost step-up — China Working Capital Facility vs. 1yr LPR | ~+94 bps (2.06% → 3.00%) | Computed. Caveat: the facility's actual pricing basis ("New Benchmark") and bank spread are not itemized beyond the stated 2.01%–2.11% range, so the true renewal rate is not precisely derivable from this pool — the LPR comparison is a directional proxy only. |

Tesla does not disclose interest-rate hedges or swaps; the 10-Q states Tesla "do[es] not typically hedge foreign currency risk" and no interest-rate hedge is disclosed in the debt note or market-risk section [`00_solvency-data-triage.md`, §3]. The 63.0% floating share (all China facility) is therefore unhedged exposure as disclosed.

---

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities (≥$7,306M contractual floor) | Amount | Evidence |
|---|---:|---|
| Cash on hand | $15,219M (Jun-30-2026) | [Q2 FY26 10-Q, Consolidated Balance Sheets] |
| Forecast FCF (recent run-rate, labeled) | $5,762M TTM (ended Jun-30-2026); labeled run-rate, not a forecast — and volatile quarter to quarter: Q2-2026 alone was **negative** $(1,092)M, driven by a capex ramp (Q2-2026 capex $5,789M, +142% QoQ) | [`earnings/01_historical-financials.md`, §2 and §3] |
| Revolver availability | $5,000M committed, undrawn (RCF Credit Agreement, matures Jan-2028, general-corporate-purpose, unsecured). Not confirmed in this pool as specifically earmarked or eligible to repay/refinance the China facility — Note 8 footnote (1) references "restrictions on draw-down or use for general corporate purposes" tied to the FY2025 10-K's own debt note, which is not itself in this data pool, so any facility-specific restriction cannot be confirmed either way | [Q2 FY26 10-Q, Note 8] |
| Asset-sale proceeds | Not disclosed / not announced | — |
| New debt issuance | Not committed or announced for this specific facility. Note 8's footnote (2) states Tesla has "the intent and ability to refinance the loan on a long-term basis" — this is an accounting assertion supporting the balance-sheet classification, **not** a disclosed signed refinancing agreement or committed replacement facility. The China facility's own history is directionally supportive of continued market access: it grew from $2,740M drawn (Dec-31-2024) to $4,288M (Dec-31-2025) to fully drawn $5,888M (Jun-30-2026), i.e., Tesla has successfully expanded and re-drawn this facility repeatedly over the past 18 months [`01_capital-structure-and-leverage.md`, §6; Q2 FY26 10-Q, Note 8] | [Q2 FY26 10-Q, Note 8, footnote (2)] |

**Is the near-term wall covered, and by what?** In dollar terms, yes with a wide margin: cash ($15,219M) plus the committed undrawn RCF ($5,000M) total $20,219M against the $7,306M contractual 12-month wall — roughly 2.8x coverage — even before counting the $5,762M of TTM FCF. But the wall's single largest component, the $5,888M China Working Capital Facility, is a China-market instrument: refinancing it depends on continued access to Chinese working-capital bank credit (or PBOC-benchmark-linked facilities), not on the US capital markets that the RCF and cash sit in, and converting US-based cash/RCF proceeds into CNY to substitute for it would involve FX conversion that is not confirmed as a pre-arranged contingency plan in this pool. The facility is non-recourse to Tesla, Inc.'s general assets [`01_capital-structure-and-leverage.md`, §1, §6A], so a failure to roll it would primarily strain the China subsidiary's working capital rather than trigger a parent-level default — and no cross-default or change-of-control provision tying the two together is disclosed in the data pool. S&P rates Tesla's issuer credit BBB/Stable, but that rating action is dated Oct-06-2022 (~45 months old as of this report) and is the only rating agency represented in the pool — a thin, stale signal on current market access [`00_solvency-data-triage.md`, §2]. Of the 63.0% floating-rate exposure (all the China facility), a further benchmark increase would reprice the entire $5,888M balance, though the rate is low in absolute terms (2.01%–2.11%) so the dollar sensitivity per 100bps is roughly $59M/year.

**Verdict: refinanceable in most markets.** Parent-level liquidity comfortably covers the contractual wall in dollar terms, and the China facility's own draw-up history shows repeated, successful re-access to that specific credit line — but no binding refinancing agreement is disclosed, the facility's renewal depends on a market (Chinese bank credit) distinct from where Tesla's cash cushion sits, and the credit-rating support for that read is thin and stale. This falls short of "self-funded / low refi risk" because the stated basis for the long-term classification is an unevidenced management assertion, not a locked-in facility.

---

## 5. Refinancing Read

The maturity wall Tesla's balance sheet shows (15.2% due within 12 months) is not the real one: on a contractual basis, **78.2% of Tesla's $9,342M gross debt ($7,306M) is due within 12 months of Jun-30-2026**, almost entirely because the $5,888M China Working Capital Facility — 63% of total debt, fully drawn — contractually matures Sep-2026–Mar-2027 but is booked long-term purely on management's stated "intent and ability to refinance," with no disclosed binding agreement behind it. The estimated refinancing cost step-up is modest where it can be measured — roughly +68bps on the USD fixed-rate ABS/lease debt (weighted coupon ~4.67% vs. an indicative ~5.35% BBB-unsecured 5-year benchmark) and roughly +94bps on the China facility (2.06% vs. the 3.00% 1-year LPR) — so cost is not the central risk here; concentration and disclosure quality are. The single biggest refinancing risk is that nearly two-thirds of Tesla's total debt sits in one China-market working-capital line with no committed replacement financing on file, rather than a laddered, diversified maturity profile. On the explicit "market closure" test (no new unsecured issuance for 12 months): Tesla survives — cash ($15,219M) plus the committed, undrawn RCF ($5,000M) together cover the $7,306M contractual 12-month wall roughly 2.8x over, assuming the RCF can in fact be drawn for this purpose (not fully confirmed — general-corporate-purpose language exists, but instrument-specific restrictions referenced in the FY2025 10-K's debt note are not in this pool, so this is a labeled assumption, not a certainty).

---

**Partial-data note:** an instrument-level maturity schedule is disclosed (Note 8, per-instrument dates/ranges), so the §1a/§2 12-month and largest-maturity-window figures are high confidence. What is **not** disclosed is a true year-by-year (Year 2 / 3 / 4 / 5) breakdown for the multi-tranche Automotive and Energy Asset-Backed Notes, whose contractual dates are given only as ranges (Jun-2027–Jun-2035 and Jun-2050–May-2052 respectively). The 24-month and 36-month figures in §2 are therefore stated as floors ("≥78.2%"), not exact percentages, and carry moderate (not high) confidence.
