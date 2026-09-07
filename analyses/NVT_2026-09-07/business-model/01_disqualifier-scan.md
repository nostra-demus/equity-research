# Disqualifier Scan — NVT

**Regime.** nVent Electric plc is a US SEC domestic filer (NYSE: NVT, Commission file 001-38265), incorporated in Ireland with head office in London, reporting under US GAAP in USD, fiscal year ending 31 December [FY24 10-K, cover page]. So the US form names in this scan are the correct local documents: Form 10-K, Form 10-Q, Form 11-K. All 15 pool sources are in English; no translation issue arises, and no language-based gap is recorded (CLAUDE.md §27).

**Evidence binding.** Read only through the frozen generation `6db3284…d1e6`. `data/NVT/` below is a citation label.

**One real data limit, named up front.** The pool's only *company* annual filing is the FY2024 Form 10-K (year ended 2024-12-31, filed 2025-02-18). The FY2025 Form 10-K is absent [00_data-triage.md §3]. So the pool carries an audit opinion covering FY2022, FY2023 and FY2024, but **not** the FY2025 opinion. That is an absence, not an adverse fact: a disqualifier triggers only on a hard, named, sourced fact, so the residual uncertainty is recorded in row 1 and row 5 rather than converted into a Y.

---

## 1. Disqualifier Check

| # | Disqualifier | Triggered (Y/N) | Evidence |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | **N** | Deloitte & Touche LLP issued an **unqualified** opinion on the consolidated financial statements "for each of the three years in the period ended December 31, 2024" — i.e. FY2022, FY2023, FY2024 — and a separate unqualified opinion on internal control over financial reporting as of 2024-12-31 [FY24 10-K, Report of Independent Registered Public Accounting Firm, dated 2025-02-18]. No going-concern paragraph and no substantial-doubt language anywhere in the corpus (zero hits for "going concern" / "substantial doubt" across all 33 extracts). One Critical Audit Matter exists — valuation of the Trachte acquired customer-relationship intangible of $206.6m — but a CAM is a disclosure of audit difficulty, not a qualification; the report says so explicitly ("does not alter in any way our opinion") [FY24 10-K, Critical Audit Matter]. FY2025 opinion not in pool (see note above); the most recent filing states disclosure controls were **effective** and no change to internal control over financial reporting occurred [Q2 FY26 10-Q, Item 4 Controls and Procedures, quarter ended 2026-06-30]. No qualification or going-concern fact is disclosed anywhere in the pool. |
| 2 | >50% promoter / insider shares pledged | **N** | Ratio = pledged insider shares ÷ insiders' own holding = **0% vs the >50% threshold**. nVent has no promoter block; it is a widely held NYSE company with one class of stock, 165,022,146 shares outstanding at 2024-12-31 and $12.6bn of that held by non-affiliates at 2024-06-28 [FY24 10-K, cover page]. Pledging is **contractually prohibited**: "Company personnel and their Family Members are prohibited from holding Company Securities in a margin account or otherwise pledging Company Securities as collateral for a loan" [FY24 10-K, Exhibit 19 — nVent Electric plc Insider Trading Policy]. No pledge or encumbrance disclosure exists in the pool. Caveat, stated plainly: no proxy (DEF 14A) and no Capital IQ ownership export are in the pool [ciq_facts.json: `insider_net_activity`, `top_institutional_holders` both `status: missing`], so the insider holding is not separately quantified — but the prohibition is a filed company policy, and its breach would itself be a disclosable event. |
| 3 | Related-party transactions >25% of revenue or expenses | **N** | Tested each side against its own base per the formula. **Related-party sales ÷ FY2024 revenue = 0% of $3,006.1m** and **related-party purchases ÷ total expenses = 0%** — both against the >25% threshold. The audited financial statements carry **no related-party transactions note** (ASC 850 would require one for any material flow), and the only explicit mention states there are "no material sublease arrangements with third parties or lease transactions with related parties" [FY24 10-K, Note on Leases]. Zero related-party hits in the Q1 FY26 and Q2 FY26 10-Qs. `relationships.json` is empty (`nodes: []`, `edges: []`, `relationship_rows: 0`), so no vendor graph contradicts this. Caveat: Item 13 (Certain Relationships and Related Transactions) is incorporated by reference to the 2025 proxy, which is not in the pool [FY24 10-K, Item 13] — so proxy-level *person*-transaction detail is unread; but a transaction anywhere near 25% of revenue would have to appear in the audited notes, and none does. |
| 4 | Auditor changed twice in last 3 years without disclosed reason | **N** | Zero changes for the company. "We have served as the Company's auditor since 2017" [FY24 10-K, Report of Independent Registered Public Accounting Firm, 2025-02-18]. Deloitte & Touche LLP (PCAOB ID 34) is named as principal accountant and put to the AGM for ratification [FY24 10-K, Item 14]. Separately, and NOT a company auditor change: the *nVent Management Company Retirement Savings and Investment Plan* switched plan auditor — Crowe LLP states "We have served as the Plan's auditor since 2026", with Deloitte & Touche LLP signing the prior-year plan statements [FY25 Form 11-K, Reports of Independent Registered Public Accounting Firm, signed 2026-06-23]. That is one change, at a benefit plan, not at the issuer, and both plan opinions are unqualified. |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | **N** | Ratio = \|restatement\| ÷ revenue = **0% of $3,006.1m** (leading with the revenue test per the formula); \|restatement\| ÷ \|net income\| = **0% of $331.8m** — both against the >5% threshold. The 10-K cover-page checkbox "whether the financial statements … reflect the correction of an error to previously issued financial statements" is **unticked (☐)**, as is the clawback-recovery checkbox [FY24 10-K, cover page]. Read-across trap named so nobody else trips on it: the Capital IQ Cash Flow and Income Statement tabs label the FY2021 and FY2022 columns "Restated" [CIQ Financials → Cash Flow, column headers]. That is a vendor label for the **recast of prior periods into discontinued operations** after the Thermal Management sale (agreement 2024-07-31, completed 2025-01-30), not an error correction [FY24 10-K, Item 7 MD&A and Note 6]. Do not read it as a restatement. FY2025 10-K absent, so a FY2025-dated correction cannot be positively excluded from the pool; no evidence of one exists in the Q1 or Q2 FY26 10-Qs, which report no change to internal control over financial reporting [Q2 FY26 10-Q, Item 4(b)]. |
| 6 | Active regulatory enforcement action on financial reporting | **N** | No SEC investigation, subpoena, Wells notice, consent order, DOJ matter or civil penalty appears anywhere in the corpus (zero hits on each term). Item 3 discloses only ordinary-course matters: "commercial disputes, product liability, asbestos, environmental, safety and health, patent infringement and employment matters", with management stating a material impact is unlikely [FY24 10-K, Item 3 Legal Proceedings]. Environmental PRP exposure is disclosed with site-by-site reserves — an operating/environmental matter, not a financial-reporting enforcement action. The latest filing says "There have been no material developments with respect to the legal proceedings previously disclosed" [Q2 FY26 10-Q, Part II Item 1 Legal Proceedings]. No integrity/fraud finding against the controller or senior management appears in the pool (CLAUDE.md §24 filter 1 — no trip, and no soft adverse signal found either; see §2). |
| 7 | >40% of revenue from single customer with no long-term contract | **N** | Ratio = largest single customer ÷ total revenue = **under 10% vs the >40% threshold**. The filing states it directly: "No customer accounted for more than 10% of net sales in 2024, 2023 or 2022" [FY24 10-K, Note on Revenue / Segment disclosure]. Corroborated on the receivables side: "No customer receivable balances exceeded 10% of total net receivable balances" [FY24 10-K, Significant Accounting Policies — Trade receivables and concentration of credit risk]. FY2025 has no equivalent filing in the pool; nothing in the Q1/Q2 FY26 10-Qs, the two FY26 transcripts or the June 2026 William Blair deck names a customer at any concentration level. |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | **N** | **0 of the last 4 years negative** vs the 3-of-4 threshold. Total cash from operations (USD m): FY2022 **+394.6**, FY2023 **+528.1**, FY2024 **+643.1** [FY24 10-K, Consolidated Statements of Cash Flows — continuing ops 273.3 / 422.2 / 501.0 plus discontinued ops 121.3 / 105.9 / 142.1]; FY2025 **+465.2** [CIQ Financials → Cash Flow 'Cash from Ops.', FY2025 column — vendor export, tier 5, because the FY2025 10-K is not in the pool]. The FY2022–FY2024 vendor figures match the filing exactly, which supports the vendor read for FY2025. Still positive since: six months to 2026-06-30 operating cash flow from continuing operations **+278.7** vs +154.9 a year earlier [Q2 FY26 10-Q, Condensed Consolidated Statements of Cash Flows]; LTM to 2026-06-30 **+690.6** [ciq_facts.json `ltm_ocf_m`, CIQ Financials → Cash Flow]. The growth-stage exclusion is not needed and is not invoked. |

---

## 2. Triggered Disqualifiers — Detail

No disqualifier triggered.

Two things are worth recording so they are not mistaken for triggers later, and one soft signal is recorded as absent:

- **The "Restated" column labels in the Capital IQ workbook are not a restatement.** They mark the recast of FY2021 and FY2022 into continuing/discontinued operations after the Thermal Management divestiture [CIQ Financials → Cash Flow and Income Statement column headers; FY24 10-K, Item 7 and Note 6]. The company's own 10-K cover page reports no correction of an error. Row 5 stays N.
- **The Form 11-K plan-auditor change is not an issuer auditor change.** Crowe LLP replaced Deloitte & Touche LLP as auditor of the retirement savings plan from 2026 [FY25 Form 11-K, signed 2026-06-23]. The issuer's auditor has been Deloitte since 2017 [FY24 10-K, auditor report]. Row 4 stays N.
- **No soft or unverified adverse integrity signal was found** in the pool to route to the management-governance module. Nothing in the filings, the two FY26 transcripts, the decks, or the vendor exports raises an allegation against the controller or senior management. There is a genuine governance *coverage* gap — no proxy (DEF 14A) and no ownership export — which means executive pay design, board composition, the say-on-pay outcome, and insider trading activity are unread in this run. That is a data gap for the management-governance and capital-allocation agents to mark "Not proven from available data", not an adverse finding and not a lock.

---

## 3. Verdict-Lock Signal

- **Any disqualifier triggered:** **N**
- **If Y, names:** n/a — none triggered
- **Action:** No verdict-lock. The synthesizer is free to score this business on its merits; nothing in this scan overrides other scores.

None — fewer than 2 near-misses (no `RF-DISQ-001` emitted).

---

## 4. Near-Miss Signals

Computed from the same ratios used in Section 1 — no second calculation. No Section 1 row was triggered, so all five quantitative rows are eligible for this test.

| # | Disqualifier | Computed ratio | Near-miss band | In band? (Y/N) |
|---|---|---:|---|---|
| 2 | Pledged shares ÷ insiders' own holding | 0% (pledging prohibited by filed policy) | ≥40% – ≤50% | N |
| 3 | Related-party sales ÷ revenue; RP purchases ÷ total expenses | 0% and 0% | ≥20% – ≤25% | N |
| 5 | \|Restatement\| ÷ revenue (lead test); ÷ \|net income\| | 0% and 0% | ≥4% – ≤5% | N |
| 7 | Largest customer ÷ total revenue | <10% | ≥32% – ≤40% | N |
| 8 | Negative OCF years (of last 4) | 0 | exactly 2 | N |

- **Near-misses in band:** **0** of 5
- **Compounding signal:** None — fewer than 2 near-misses
