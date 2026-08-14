# Coverage & Covenants — ORCL

Reporting currency: USD. Reporting standard: US GAAP. Fiscal year ended May-31-2026 ("FY2026"). All figures are FY2026 unless stated, sourced from Oracle's audited FY2026 Form 10-K (filed 2026-06-22) and Capital IQ Financials_Annual.xls, cross-checked against `01_capital-structure-and-leverage.md` and `earnings/01_historical-financials.md`. No `ciq_facts.json` sidecar exists for this run (checked in `_pool_extracts/`) — all figures below are this agent's own sourced read, computed and shown via an executed Python snippet (below each ratio's source note).

## 1. Coverage Ratios

Gross interest expense (FY2026) = **$4,599mn** [FY26 10-K, MD&A "Interest Expense"; CIQ Financials_Annual.xls Income Statement, "Interest Expense" row, FY26 column — up 29% y/y "primarily due to higher average borrowings from the issuances of $43.0 billion of senior notes in fiscal 2026"]. Interest income = $780mn, giving net interest expense = **$3,819mn** [CIQ Financials_Annual.xls Income Statement, "Interest and Invest. Income" / "Net Interest Exp." rows, FY26 column]. The revolver's own covenant is written on **net** interest expense ("Consolidated Net Interest Expense" — see Section 2), so both gross and net bases are shown throughout.

EBITDA basis: **$30,494mn, reported/GAAP-derived** (CIQ operating income $22,385mn + D&A $8,109mn) — the same canonical figure `01_capital-structure-and-leverage.md` Section 7 designates. Oracle discloses no company-defined non-GAAP EBITDA; an inferred adjusted figure (~$37,035mn, non-GAAP operating income $28,926mn + D&A) is shown as a memo only and labeled **Inference, not from filings** [`01_capital-structure-and-leverage.md` §5; `earnings/01_historical-financials.md` §4]. Per `earnings/06_earnings-quality.md`, this EBITDA is genuinely **cash-backed**: CFO/EBITDA was 104.9% reported (≈89.6% normalised, excluding a one-off customer-prepayment surge) in FY2026 and has exceeded 85% in every year since FY2023 — so the coverage ratios below are not being inflated by non-cash EBITDA.

Calculation run (Python, all figures USD mn):
```
EBITDA_reported=30494; EBIT_ciq=22385; EBIT_gaap=20606
gross_interest=4599; interest_income=780; net_interest=3819; capex=55663
EBITDA/gross interest = 30494/4599 = 6.63x
EBITDA/net interest   = 30494/3819 = 7.98x
EBIT(CIQ)/gross interest  = 22385/4599 = 4.87x
EBIT(GAAP)/gross interest = 20606/4599 = 4.48x
(EBITDA-capex)/gross interest = (30494-55663)/4599 = -5.47x
Fixed charges = gross_interest(4599) + sched. debt amort. next-12mo (5731) + lease cash paid (2548 op + 452 fin = 3000) = 13330
Fixed-charge coverage = (30494-55663)/13330 = -1.89x
```

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest (gross) | 6.63x | 30,494 / 4,599; [FY26 10-K, MD&A; CIQ Income Statement] |
| EBITDA / interest (net) | 7.98x | 30,494 / 3,819 — matches the covenant's own basis (Section 2) |
| EBIT / interest (CIQ EBIT convention, gross) | 4.87x | 22,385 / 4,599; CIQ EBIT excludes $1,779mn restructuring — see `01`'s note |
| EBIT / interest (GAAP operating income, gross) | 4.48x | 20,606 / 4,599; [FY26 10-K income statement] |
| (EBITDA − capex) / interest (gross) | **−5.47x** | (30,494 − 55,663) / 4,599 |
| Fixed-charge coverage: (EBITDA − capex) / (interest + next-12mo scheduled debt amortization $5,731mn + lease cash paid $3,000mn) | **−1.89x** | (30,494 − 55,663) / 13,330 |

**The headline finding is the last two rows, not the first two.** On EBITDA alone, interest is covered 6.6–8.0x — a wide multiple. But FY2026 capital expenditure ($55,663mn, +162% y/y, funding the AI-infrastructure data-center build-out) exceeds EBITDA by $25,169mn, so once capex is netted, coverage of interest and debt-like fixed charges is **negative on every basis computed**. Oracle is not generating enough operating profit to fund both its capex program and its interest bill — the FY2026 gap is being bridged by $42.7bn of new senior-note issuance and $5.0bn of preferred-stock proceeds [`01_capital-structure-and-leverage.md` §6], not by internally generated cash. This is consistent with FY2026 free cash flow of −$23,686mn reported (−$28,328mn normalised, excluding a customer-prepayment cash inflow) [`earnings/06_earnings-quality.md` §1].

## 2. Covenant Inventory

Only **one** maintenance financial covenant is disclosed anywhere in the FY26 10-K's debt note: the Revolving Credit Agreement's minimum interest-coverage test. No maximum-leverage covenant, no minimum-liquidity/net-worth covenant, and no other maintenance test is disclosed for any of Oracle's debt instruments (senior notes, commercial paper, term loan, or revolver) [FY26 10-K, Note on Debt — Revolving Credit Agreement, Term Loan Credit Agreements, Senior Notes]. This absence is itself informative, not a data gap to be filled with an assumed threshold: large unsecured investment-grade-style bond issuers typically carry negative covenants (liens, sale-leaseback limits) rather than maintenance financial covenants, and that pattern holds here. The partial-data "typical market covenant" assumption is therefore **not invoked** for a max-leverage test — none is contractually present per the disclosed terms — but see the labeled sensitivity note at the end of Section 3.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage | **Not present** — no such covenant disclosed for any Oracle debt instrument | n/a | n/a — not a contractual test | [FY26 10-K, Note on Debt, full instrument-by-instrument review] |
| Min interest coverage (Revolving Credit Agreement) | Consolidated EBITDA / Consolidated Net Interest Expense **≥ 3.0x**, tested at each fiscal quarter-end | 7.98x (net-interest basis, using reported EBITDA $30,494mn / net interest $3,819mn as a proxy for the credit agreement's defined terms — see quality note below); 6.63x on a conservative gross-interest basis | **+166.2%** (net-interest basis) / **+121.0%** (gross-interest, conservative alt.) | [FY26 10-K, Note on Debt — Revolving Credit Agreement: "ratio of 'Consolidated EBITDA' to 'Consolidated Net Interest Expense'... shall not be less than 3.0 to 1.0 at the end of any fiscal quarter"] |
| Min liquidity / net worth | Not disclosed | n/a | n/a | [FY26 10-K, Note on Debt] |
| Springing covenant trigger | **None** — the 3.0x coverage test is NOT springing; it applies continuously "at the end of any fiscal quarter during the period that the Revolving Credit Agreement is effective" | Active (always-on, not conditional on utilization) | n/a | [FY26 10-K, Note on Debt — Revolving Credit Agreement] |
| Equity cure rights | Not disclosed in the data pool | n/a | n/a | — |
| Other — Term Loan Credit Agreement 2 | Oracle states it "was in compliance with all debt-related covenants at May 31, 2026," which by its wording covers the Term Loan Credit Agreement 2 alongside the revolver, but the Term Loan's own covenant terms (if any beyond scheduled amortization) are **not itemized separately** in the filing text extracted | Unknown | Not assessable | [FY26 10-K, Note on Debt, p. covering both facilities] |

### Covenant EBITDA Definition & Quality (required — headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | The credit agreement defines "Consolidated EBITDA" and "Consolidated Net Interest Expense" as defined terms in the Revolving Credit Agreement itself; the 10-K states the covenant threshold but does **not** reproduce the definitions' addback schedule (the credit agreement exhibit is not in this data pool) | [FY26 10-K, Note on Debt] |
| Addbacks permitted (types) | **Not disclosed** in the pool | — |
| Addback caps / limits | **Not disclosed** in the pool | — |
| Is covenant EBITDA materially above reported EBITDA? | **Unknown — cannot be determined from available data.** This report uses reported EBITDA ($30,494mn) as a conservative proxy for "Consolidated EBITDA." Credit-agreement EBITDA definitions typically permit further addbacks (e.g., non-cash items, one-off restructuring beyond what's already excluded, pro forma synergies) that reported EBITDA may not fully capture — so the true covenant-defined ratio is more likely to be **higher** than the 6.63x–7.98x computed here, meaning the computed headroom is probably a **floor**, not a ceiling, on the company's true contractual headroom. This is the conservative-default reading (CLAUDE.md §4): use the disclosed, unadjusted figure rather than assume favorable addbacks not evidenced in the filing. | Inference, not from filings |

Per the module's hard rule, because headroom here is computed using an assumed/undisclosed EBITDA definition rather than the credit agreement's own defined term, **covenant-headroom confidence is capped** (MODULE_RULES.md, "Covenant headroom relies on assumed covenant-EBITDA addbacks → Covenant headroom max 60") even though the raw computed number (+121% to +166%) looks wide.

## 3. Headroom & Breach Proximity

Calculation run (Python):
```
threshold=3.0
EBITDA floor to breach (net-interest basis)  = 3.0 * 3,819 = 11,457mn -> decline of (30,494-11,457)/30,494 = 62.4%
EBITDA floor to breach (gross-interest basis) = 3.0 * 4,599 = 13,797mn -> decline of (30,494-13,797)/30,494 = 54.8%
Net interest could rise to 30,494/3.0 = 10,165mn (+6,346mn, +166%) before breach, EBITDA held flat
Implied incremental debt at an assumed 5.5% blended rate (labeled, mid-point of Oracle's disclosed 1.65%-6.90% senior-note range and its ~4.35% CP rate) = 6,346/0.055 ≈ $115,376mn — Inference, not from filings
```

| Metric | Value |
|---|---:|
| Tightest covenant | Min interest coverage (Revolving Credit Agreement), Consolidated EBITDA / Consolidated Net Interest Expense ≥ 3.0x — the ONLY maintenance covenant disclosed, so it is tightest by default |
| Headroom on tightest covenant (%) | +166.2% (net-interest basis, literal covenant definition) / +121.0% (gross-interest, conservative alt.) — both wide, but of **unknown definitional quality** (Section 2) |
| EBITDA decline that would breach it (approx.) | **−62.4%** (net-interest basis) to **−54.8%** (gross-interest basis) — EBITDA would need to fall from $30,494mn to roughly $11,457mn–$13,797mn, holding interest expense flat |
| Debt increase that would breach it (approx.) | Net interest expense would need to rise from $3,819mn to $10,165mn (+$6,346mn, +166%), holding EBITDA flat. At an assumed ~5.5% blended rate (labeled assumption, not from filings), that implies roughly **$115bn of incremental debt** — more than Oracle's entire current gross debt stack ($167,432mn all-in) — so this covenant is very unlikely to be tripped by debt growth alone; an EBITDA decline is the far more plausible breach path |

**A useful sensitivity, not a contractual test:** no max-leverage covenant exists in Oracle's disclosed debt terms (Section 2), but if one existed at a typical leveraged-borrower level of 4.0x–4.5x net debt/EBITDA (a labeled illustrative benchmark, not a covenant Oracle actually has), Oracle's own **net debt/EBITDA of 4.46x** (strict basis, reported EBITDA) [`01_capital-structure-and-leverage.md` §5] would already sit at or above that range. The absence of a leverage covenant — not distance from one — is what currently shields Oracle from a leverage-based default as it funds a debt-heavy capex program; this is flagged for `06_downside-stress-test`, not scored here.

## 4. Coverage / Covenant Read

Earnings comfortably cover interest on an EBITDA basis (6.63x gross / 7.98x net interest) and cash quality is not the problem — CFO/EBITDA of ~90–105% confirms the EBITDA is cash-backed, not accounting fiction (`earnings/06_earnings-quality.md`). But that comfort disappears the moment capex is netted: (EBITDA − capex)/interest is **−5.47x** and full fixed-charge coverage is **−1.89x**, because FY2026 capex ($55,663mn) exceeds EBITDA ($30,494mn) by $25,169mn — the AI-infrastructure build is being funded by new debt ($42.7bn of senior notes plus $5.0bn of preferred issued in FY2026), not by operating cash flow. Only one maintenance covenant is disclosed — a 3.0x minimum EBITDA/net-interest-expense test on the revolver — and Oracle sits at 7.98x, a computed headroom of +166.2% that would need a 62.4% EBITDA decline or a roughly $115bn debt-funded increase in interest expense to breach; but that headroom is calculated using reported EBITDA as a proxy for the credit agreement's own undisclosed "Consolidated EBITDA" definition, so its true quality is unverified and its confidence is capped per this module's addback-illusion rule. No maximum-leverage covenant exists to check the debt-funded capex ramp — the coverage test only bites if EBITDA collapses or interest expense balloons, neither of which is imminent, but that also means Oracle's growing leverage (net debt/EBITDA 4.46x, up from 3.83x two years ago) is not contractually constrained by any of its own disclosed debt terms.
