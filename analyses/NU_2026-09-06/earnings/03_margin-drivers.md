# Margin Drivers — NU

**Reporting basis.** Nu Holdings Ltd. (NYSE:NU, Class A ordinary shares, USD) reports under **IFRS Accounting Standards**, in **US dollars**, fiscal year ending **31 December**. US foreign private issuer: the audited annual filing is a **Form 20-F**, the quarterly disclosure an **unaudited interim condensed consolidated financial statement** — no 10-K, no 10-Q, and their absence is not a data gap (CLAUDE.md §27). All figures are **reported IFRS** unless a cell says otherwise. Figures from the interim filings are in US$ thousands; figures from the 20-F Item 5 tables are in US$ millions; each is labelled.

**Sector overlay applied: Bank / lender — margin analysis uses net interest margin (NIM), risk-adjusted NIM, credit-cost rate and the efficiency (cost-to-income) ratio, not a COGS / freight / labour cost stack.** Matched from `analyses/NU_2026-09-06/business-model/02_business-identity.md` §3a, which itself matched the **Bank / lender** row of `frameworks/SECTOR_OVERLAYS.md`. The audited IFRS gross-margin ladder is retained *alongside* the bank grammar, because for this issuer the filed income statement puts funding cost, transactional cost and expected credit loss **above** gross profit — so IFRS gross margin is already a credit-and-funding-adjusted margin, and it is the auditable anchor for the non-IFRS managerial metrics.

**Prior in-house memo.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is verdict-bearing. Its verdict is stripped (CLAUDE.md §24) and **no number in this report comes from it**.

**Transcript status.** Verbatim S&P Global transcripts are present for 19 consecutive calls through Q2 2026. No sell-side proxy is used and no proxy cap applies.

---

## 1. Segment Decomposition Status

**Single reportable segment — margin cannot be decomposed by segment, and this is a disclosure fact, not a gap.**

Nu reports **one** operating and reportable segment: *"The CODM considers the whole Group as a single operating and reportable segment"* [FY2025 Form 20-F (filed Apr-08-2026), Note 34 (Segment information)]. The same wording appears in the latest interim statements [Q2'26 interim condensed consolidated financial statements (filed Aug-14-2026), Note 34]. Banking is 100% of FY2025 revenue, confirmed by the deterministic sidecar (`ciq_facts.json` `segments_revenue` = "Banking 6,991 (100%) of Total 6,991", status `present`). That clears the >85% single-segment test in `MODULE_RULES.md`, so this report works at **consolidated level**.

Business-model `03_segment-map.md` is available and was read. Three limits it imposes on this module, carried with their qualifiers:

1. **No profit split by geography.** Note 34(b) gives revenue by country (Brazil 90.9%, Mexico 7.2%, Other 1.8% for H1'26) and non-current assets, but **profit share is "Not disclosed" for every country** [FY2025 Form 20-F, Note 34(b); Q2'26 interim statements, Note 34(b)]. There is no country-level cost stack, so there is no country-level margin. I do not guess one.
2. **The geographic base is not total revenue.** Note 34(b)'s revenue base excludes treasury income — US$2,147.9m of US$10,481.2m in H1'26, or **20.5%** of what the group actually earns [Q2'26 interim statements, Notes 6(a) and 34(b)]. Any margin read built on the geographic split would be built on four-fifths of the revenue.
3. **Product lines are an income disaggregation, not a P&L.** Note 6 splits income seven ways (loan interest 40.0% of the Note-34 base in H1'26, card interest 40.3%, interchange 12.3%, late fees 3.1%, other) but attaches no cost to any of them [Q2'26 interim statements, Note 6(b)].

**Consequence:** Section 6 (per-segment driver tables) is not populated with numbers. What I can attribute by product is the company's own managerial gross-profit split — credit 41%, fees 25%, float 34% of Q2'26 gross profit [Q2 2026 earnings-call transcript, Aug-13-2026, prepared remarks] — and that is a **non-IFRS managerial** split on the deck's "gross profit" definition, which does not tie to the IFRS gross profit of US$2,346.5m (deck US$2,441m; gap US$94.5m; the gap is not stable across quarters). The two must not be substituted for one another.

---

## 2. Cost Stack

The generic template rows (raw materials, freight, energy) do not exist for this issuer and are replaced by the matched sector grammar. Two tables: **2a** is the bank KPI grammar the overlay requires; **2b** is the audited IFRS cost stack the KPIs must reconcile to.

### 2a. Bank / lender cost and margin grammar — the primary read

All ratios are the company's own **non-IFRS managerial, annualised, FX-neutral-growth** measures unless marked. They are disclosed quarterly in the earnings deck.

| Bank cost / margin line | Q2'26 | Q1'26 | Q2'25 | Direction | Evidence | Margin risk |
|---|---:|---:|---:|---|---|---|
| **NIM** (interest margin before credit losses) | **22.9%** | 21.1% | 18.8% | Widening — +180bp QoQ, +410bp YoY | [Q2'26 Earnings Presentation, Aug-13-2026, slide 15]; +180bp QoQ confirmed [Q2 2026 transcript, prepared remarks] | Widening is driven by an unsecured-weighted mix, so it carries loss with it |
| **Cost of credit rate** (annualised cost of credit ÷ interest-earning base) | **10.5%** | 11.6% | 8.9% | Improved QoQ, **worse YoY (+160bp)** | Derived as NIM − risk-adjusted NIM from [Q2'26 Earnings Presentation, slide 15]. Basis: the deck's own interest-earning balance-sheet denominator | The single largest swing line in the whole P&L |
| **Risk-adjusted NIM** (interest margin after credit losses) | **12.42%** | 9.48% | 9.9% | +294bp QoQ, +252bp YoY — a record in the disclosed six-quarter series | [Q2'26 Earnings Presentation, slide 16 (QoQ walk); slide 15] | Management calls it sustainable but expressly refused to call 12% a floor |
| **Cost of deposits** (% of local interbank rate) | **88%** | 88% | 91% | Flat QoQ, −3pp YoY | [Q2'26 Earnings Presentation, slide 14]; *"essentially unchanged from last quarter and 3 percentage points lower than a year ago"* [Q2 2026 transcript, prepared remarks] | Near-mechanical pass-through of the policy rate: the *ratio* is managed, the *level* is not |
| **Efficiency ratio** (operating cost ÷ net revenues; lower is better) | **19.5%** | 17.6% | 21.3% | Worse QoQ, better YoY | [Q2'26 Earnings Presentation, slide 22 — opex US$806m ÷ net revenues US$4,132m] | Management's own FY26 guide of ~20% implies H2 must be **worse** than Q2'26 |
| **Cost to serve** (monthly, per active customer) | +14% YoY FX-neutral | — | — | Rising, but slower than revenue per customer (ARPAC +22% YoY FX-neutral) | [Q2'26 Earnings Presentation, slide 28] | The 8-point gap is the operating-leverage claim, and it is disclosed, not asserted |
| **Loan-to-deposit ratio** — **two different figures, both disclosed, do not blend** | **35%** (loans ÷ total deposits, CFO) / **58%** (average; net credit portfolio ÷ funding, deck) | 54% (deck basis) | — | Rising on both bases | 35%: [Q2 2026 transcript, prepared remarks]. 58%: [Q2'26 Earnings Presentation, slide 16, defined at slide 27 as net credit portfolio ÷ (total deposits less compulsory deposits + financial bills)] | Rising LDR is what converts idle float into credit income — it is the mechanism behind the NIM step-up |
| **Capital adequacy (Brazil prudential conglomerate)** | 15.7% CAR at Jun-30-2026 | — | — | Down from 16.6% at FY2025 | [Q2'26 interim statements, Note 33(a)] | Capital, not funding, is the eventual brake on the growth that is driving margin |

### 2b. Audited IFRS cost stack — what the filing actually reports

The filed income statement is: Total revenue → **cost of financial and transactional services provided** (funding cost + transactional expenses + expected credit loss) → **Gross profit** → operating expenses → **Income before income taxes (EBT)**. There is no EBITDA line and none is manufactured (`ciq_facts.json` `ltm_ebitda_m` = `unknown`, "Income Statement sheet has no 'EBITDA' row"). Interest expense sits **above** gross profit for this issuer — it is a cost of revenue, not a financing item below the line.

Percentages are my arithmetic on the filing's own figures, expressed as a share of **total revenue** for the same period.

| Cost line | Q2'26 (US$k) | % of revenue | Q2'25 % | FY2025 % | FY2024 % | Direction | Evidence | Margin risk |
|---|---:|---:|---:|---:|---:|---|---|---|
| Interest and other financial expenses (funding cost) | 1,556,650 | **28.23%** | 28.08% | 29.03% | 24.61% | Roughly flat YoY at quarter level; **up 442bp across FY2025** | [Q2'26 interim statements, statements of income and Note 6(c)]; [FY2025 Form 20-F, Item 5, p.176] | High — the biggest single cost line, and set by the Brazilian policy rate |
| — of which interest on deposits | 1,187,521 | 21.54% | 25.08% | 24.58% | 20.34% | Falling as a share of revenue at quarter level | [Q2'26 interim statements, Note 6(c)]; FY figures [FY2025 Form 20-F, Item 5, p.176] | Volume-led: deposits +45.3% in FY2025 to US$41.9bn |
| Transactional expenses | 127,816 | **2.32%** | 2.13% | 2.32% | 2.26% | Creeping up | [Q2'26 interim statements, Note 6(d)] | Low — but rewards expense doubled in FY2025 (+101.8%) |
| Expected credit loss (credit cost) | 1,482,213 | **26.88%** | 27.59% | 26.66% | 27.52% | Improved YoY at Q2; **Q1'26 spiked to 34.58%** | [Q2'26 interim statements, Note 7]; [Q1'26 interim statements (filed May-14-2026), statements of income] | **Highest** — the line that decides the margin |
| **Total cost of financial and transactional services** | **3,166,679** | **57.44%** | 57.80% | 58.00% | 54.39% | | [Q2'26 interim statements, statements of income] | |
| **= Gross profit / gross margin** | **2,346,529** | **42.56%** | 42.20% | 42.00% | 45.61% | | | |
| Customer support and operations | 226,246 | 4.10% | 4.40% | 4.13% | 5.25% | Improving | [Q2'26 interim statements, Note 8] | Low |
| General and administrative | 599,790 | 10.88% | 9.30% | 9.01% | 10.91% | **Worsened 158bp YoY** | [Q2'26 interim statements, Note 8] | Mid — see the "Others" line below |
| — of which share-based compensation | 134,418 | 2.44% | 2.74% | n/d | n/d | Improving 30bp YoY | [Q2'26 interim statements, Note 8] | Low; a real recurring cost paid in shares |
| — of which depreciation and amortisation | 42,370 | 0.77% | 0.63% | n/d | n/d | **Worsening 14bp YoY** (D&A +83.7% YoY vs revenue +50.3%) | [Q2'26 interim statements, Note 8] | Low today; the trailing edge of the FY2025 intangibles capex |
| — of which "Others", incl. tax on intercompany invoices | 136,893 | 2.48% | 0.60% | n/d | n/d | **Worsened 188bp YoY** — from US$22.0m to US$136.9m | [Q2'26 interim statements, Note 8, footnote (i): *"Includes tax expenses arising from intercompany invoices"*] | Mid — this single line is most of the G&A deterioration and is a by-product of the corporate restructuring that also cut the tax rate |
| Marketing | 103,429 | 1.88% | 1.84% | 1.92% | 2.14% | Flat | [Q2'26 interim statements, Note 8] | Low |
| Other expenses (incl. taxes on financial income US$151,511k) | 201,042 | 3.65% | 3.06% | 3.22% | 3.53% | Worsening 59bp YoY | [Q2'26 interim statements, Note 8] | Low–Mid |
| Other income | (24,954) | (0.45%) | (0.40%) | (0.82%) | (0.49%) | | [Q2'26 interim statements, Note 8] | |
| **Total operating expenses, net** | **1,105,553** | **20.05%** | 18.20% | 17.45% | 21.34% | **Worsened 185bp YoY at quarter level** | [Q2'26 interim statements, statements of income] | High at the EBT line; **zero effect on risk-adjusted NIM**, which sits above opex |
| Interest expense | — | — | — | — | — | Not a separate line below gross profit | For a lender it is inside "interest and other financial expenses" above | — |
| Raw materials / freight / energy / R&D | **Not applicable** | | | | | | A bank has no COGS, no freight and no disclosed R&D line | — |

**Reconciliation to the FY2025 20-F Item 5 table (US$ millions):** funding cost 4,578.7 / transactional 366.2 / ECL 4,204.9 = total 9,149.8 against revenue 15,774.8 → gross profit 6,625.0, gross margin 42.0%. The filing states the same margin change in words: *"Our gross margin … decreased, reaching 42.0% for the year ended December 31, 2025, compared to 45.6%"* [FY2025 Form 20-F, Item 5, p.177].

---

## 3. The Margin Ladder — Bank Version

The generic gross → EBITDA → EBIT walk is replaced, because NU discloses no EBITDA and its interest expense is a cost of revenue. The ladder below is the sector's: **NIM → credit cost → risk-adjusted NIM → operating cost → pre-tax profit → tax → net**. IFRS lines are audited; the NIM lines are the company's managerial measures.

| Margin level | Latest (Q2'26) | Prior year (Q2'25) | Change (bps) | Main reason | Evidence |
|---|---:|---:|---:|---|---|
| NIM (managerial) | 22.9% | 18.8% | **+410** | Mix shifted further to unsecured lending; rising loan-to-deposit ratio converts float into credit income | [Q2'26 Earnings Presentation, slide 15]; [Q2 2026 transcript, prepared remarks] |
| less cost of credit | (10.5%) | (8.9%) | **−160** (worse) | Portfolio grew 37% YoY FX-neutral; IFRS 9 books the loss at origination; deliberate risk expansions | Derived from slide 15; [Q2 2026 transcript, prepared remarks] |
| **Risk-adjusted NIM (managerial)** | **12.42%** | 9.9% | **+252** | Credit income outran the credit cost it created | [Q2'26 Earnings Presentation, slides 15–16] |
| **IFRS gross margin** (audited anchor) | **42.56%** | 42.20% | **+36** | Credit cost ratio fell 71bp; funding cost ratio and transactional cost together gave back 34bp | [Q2'26 interim statements, statements of income] |
| less operating expenses, net | (20.05%) | (18.20%) | **−185** (worse) | Real estate and marketing shifted from Q1 into Q2; international expansion; a US$115m YoY rise in G&A "Others" (intercompany-invoice tax) | [Q2'26 interim statements, Note 8]; [Q2 2026 transcript, prepared remarks] |
| **EBT margin (pre-tax, audited)** | **22.42%** | 23.97% | **−155** | Operating cost growth beat the gross-margin gain | [Q2'26 interim statements, statements of income] |
| Effective tax rate | 14.17% | 27.56% | **−1,339** (better) | Corporate-structure change; IFRS effective tax rate | [Q2'26 interim statements, statements of income, Note 30] |
| **Net margin (audited)** | **19.23%** | 17.36% | **+187** | **Entirely the tax line** — see §7 | [Q2'26 interim statements, statements of income] |

**Pass-through and its lag — stated explicitly, because funding cost is material.** Business-model `06_value-chain.md` and `10_external-dependency.md` both find the liability side repricing near-mechanically: deposits are contractually priced at a percentage of the local interbank rate (Brazil CDI, Mexico TIIE, Colombia IBR), currently **88%** [Q2'26 Earnings Presentation, slide 14]. So a policy-rate move reaches the funding cost **within roughly one quarter**, with no negotiation. Three things sit against a clean read of that:

- **The ratio is a management lever even though the level is not.** Cost of deposits fell from 91% of the interbank rate (Q2'25) to 88% (Q2'26) *while* the Brazilian Selic sat at a decade high — the spread was managed against the external rate, not passively tracked [Q2'26 Earnings Presentation, slide 14; `10_external-dependency.md`].
- **The asset side reprices fast but is capped by statute.** The book is short-duration, so lending yields follow within a quarter or two. But **Law 14,690/2023 caps the total amount that may be charged on revolving and instalment credit-card balances** [FY2025 Form 20-F, Item 4 — regulatory environment], and the INSS payroll-loan rate is capped with **Selic itself as the benchmark index** [FY2025 Form 20-F, Item 4, payroll-loans section]. On the largest revenue product the price lever is legally bounded, so cost cannot always be passed through by raising price.
- **The realised offset is measurable, and it is not zero.** In FY2025 the funding-cost ratio rose 442bp of revenue while gross margin fell only 361bp — the other cost lines absorbed 81bp, or roughly **18%** of the funding shock, before any management response is credited. Do not model a zero-mitigation stress as a base case (CLAUDE.md §9).

---

## 4. Which Margin Level Matters Most?

**Risk-adjusted NIM is the primary margin metric for this company, and IFRS gross margin is its audited anchor. Neither currently explains the bottom line, which is being set by tax — and that must be said in the same breath.**

Why risk-adjusted NIM: NU is a credit-led lender whose revenue and its two largest costs move together. Growing the loan book raises interest income, raises funding cost, and — because IFRS 9 recognises the expected loss at origination — raises the credit charge *before* the interest income arrives [Q2 2026 transcript, prepared remarks: *"we recognize expected credit losses at origination. So growth increases the allowance before the associated interest income is earned"*]. A revenue-growth number, a NIM number, or a credit-cost number read alone will each mislead. Risk-adjusted NIM nets all three against the same interest-earning base, and it is the only forward-looking margin number management will anchor to (*"we see it as being in the same region as where we are today"* — from 12.42% [Q2 2026 transcript, Q&A]). It is also the metric whose disclosed QoQ walk reconciles to the basis point (§7).

Two limits on it, stated rather than buried. First, it is **non-IFRS and managerial** — introduced in the current form in Q4 2025, quoted FX-neutral, and not audited; that is why IFRS gross margin (42.56% in Q2'26) is carried alongside as the auditable anchor. Second, risk-adjusted NIM sits **above operating cost and above tax**, so it is blind to the two things currently moving reported profit most: an operating-cost ratio that worsened 185bp year on year, and an effective tax rate that fell 1,339bp. A reader tracking only risk-adjusted NIM would have seen a record quarter and missed that **pre-tax margin actually fell 155bp year on year**.

---

## 5. Margin Driver Table (consolidated)

Magnitude is measured against the **primary metric, risk-adjusted NIM**, except where the row is marked "(EBT)" — those drivers sit below risk-adjusted NIM and are sized against **EBT margin** instead. High >100bp, Mid 30–100bp, Low <30bp.

| Driver | Impact on margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Credit cost (expected credit loss)** | The dominant swing line. Moved risk-adjusted NIM **−263bp in Q1'26 and +115bp in Q2'26**. Sits between a 22.9% NIM and a 12.42% risk-adjusted NIM — a bad-debt cycle removes nearly half the margin without touching revenue | **Tailwind now, structurally the biggest headwind risk** — improving QoQ but 160bp worse YoY on the rate | **High** | [Q2'26 Earnings Presentation, slides 15–16]; [Q2'26 interim statements, Note 7] |
| **Loan mix — unsecured vs secured** | Card 66% / unsecured personal 26% / secured 8% of the credit book. Shifting to unsecured lifts NIM and lifts loss together; management calls it *"a mix weighted further towards unsecured lending and the deliberate risk expansions we made"* | **Tailwind on margin, Headwind on losses** | **High** — credit income contributed +178bp of risk-adjusted NIM in Q2'26 | [Q2'26 Earnings Presentation, slide 13]; [Q2 2026 transcript, prepared remarks] |
| **Funding cost (deposit interest, tied to policy rate)** | Largest single cost line at 28.23% of Q2'26 revenue. Across FY2025 it cost **442bp of revenue** and was the main reason gross margin fell 361bp. Currently near-neutral: cost of funding moved −5bp of risk-adjusted NIM in Q2'26 | **Neutral now** (cost of deposits flat at 88% of interbank QoQ); **Headwind if the policy rate rises again** | **High** | [FY2025 Form 20-F, Item 5, p.176]; [Q2'26 Earnings Presentation, slides 14, 16] |
| **Loan-to-deposit ratio / float conversion** | Deploying idle deposits into loans raises NIM without new funding. LDR rose from 50% (Q4'25) to 58% (Q2'26) on the deck's average basis. Float income itself was −70bp then +5bp | **Tailwind** | **Mid** on float income directly; the LDR effect is embedded in the credit-income line | [Q2'26 Earnings Presentation, slide 16]; [Q2 2026 transcript, prepared remarks] |
| **Desenrola — government debt-renegotiation programme** | **One-time policy tailwind, NOT run-rate.** Reduced Q2'26 cost of credit by *"about 5%"*; management attributes about one-third of the risk-adjusted-NIM beat versus plan to it, and says *"more than 4/5"* has already been recognised | **Tailwind, reversing** | **Mid** — ~52bp of risk-adjusted NIM by the derivation in §7a | [Q2 2026 transcript, Q&A — CFO Rob Livingston] |
| **Operating cost / efficiency ratio (EBT)** | Cost 20.05% of revenue in Q2'26 vs 18.20% a year earlier. **Zero effect on risk-adjusted NIM** — it sits below it | **Headwind** — management's own FY26 ~20% guide requires H2 cost ratios ~150–195bp worse than Q2'26's 19.5% | **High (EBT)** — 185bp of EBT margin YoY | [Q2'26 interim statements, statements of income]; [Q2'26 Earnings Presentation, slide 22]; guidance arithmetic from `04_guidance-consensus.md` §2 |
| **Effective tax rate (EBT→net)** | 14.17% in Q2'26 vs 27.56% a year earlier. Below every margin level, and currently the sole reason the bottom line expanded | **Tailwind** | **High (net margin)** — **+300bp**, i.e. 100% of the net-margin expansion | [Q2'26 interim statements, statements of income and Note 30]; guide of 15–20% [Q1 2026 transcript, May-14-2026, prepared remarks] |
| **US expansion + return-to-office + AI infrastructure spend (EBT)** | Management caps the drag at *"less than 100 basis points on our consolidated efficiency ratio"* in each of 2026 and 2027, inside the ~20% envelope. Q1'26 "core" efficiency ratio (excluding these) was 16.6% against 17.6% reported — a **100bp** measured gap | **Headwind, bounded and self-declared** | **Mid–High (EBT)** | [Q1 2026 transcript, May-14-2026, prepared remarks] |
| **Transactional expenses (rewards, network fees)** | 2.32% of Q2'26 revenue, up 19bp YoY. Rewards expense doubled in FY2025 (+101.8%) | **Headwind** | **Low** | [Q2'26 interim statements, Note 6(d)]; [FY2025 Form 20-F, Item 5, p.176] |
| **G&A "Others" — intercompany-invoice tax (EBT)** | Rose from US$22.0m (Q2'25) to US$136.9m (Q2'26), **188bp of revenue** — most of the 158bp G&A deterioration. It is the operating-cost by-product of the same corporate restructuring that cut the effective tax rate | **Headwind (EBT), partly offsetting the tax tailwind** | **High (EBT)** | [Q2'26 interim statements, Note 8 and footnote (i)] |
| **Depreciation and amortisation step-up (EBT)** | D&A +83.7% YoY against revenue +50.3%, so D&A/revenue rose 14bp to 0.77%. The trailing edge of FY2025 intangibles capex of US$333.6m | **Headwind** | **Low** | [Q2'26 interim statements, Note 8]; [FY2025 Form 20-F, statements of cash flows] |
| **Share-based compensation (EBT)** | 2.44% of Q2'26 revenue vs 2.74% a year earlier | **Tailwind** | **Low** | [Q2'26 interim statements, Note 8] |
| **Statutory price caps** | Law 14,690/2023 caps total charges on revolving and instalment card balances; the INSS payroll-loan rate is capped with Selic as its index. Removes the price lever on the largest revenue product | **Structural constraint, not a quarterly mover** | **Unknown** — no disclosed elasticity | [FY2025 Form 20-F, Item 4 — regulatory environment; payroll-loans section] |
| **FX translation (BRL/USD)** | Large on *levels*, near-neutral on *margin ratios* — the same rate translates numerator and denominator. Reported USD revenue grew 50.3% YoY in Q2'26 against 39% FX-neutral on the managerial gross-revenue measure; but the underlying margin moves hold FX-neutral too (NII +9% FXN, cost of credit −9% FXN) | **Neutral on margin; High on reported levels** | **Low** on margin. *The residual effect — country-mix differences in local rates — is not separately disclosed; inference, not from filings* | [Q2'26 Earnings Presentation, slide 15 and FX-neutral methodology note]; `10_external-dependency.md` §5 |

---

## 6. Margin Drivers By Segment

**Not populated — segment-level P&L is not disclosed.** One reportable segment (Banking, 100% of revenue); Note 34(b) gives revenue and non-current assets by country with **profit share "Not disclosed"** for every country, and its revenue base excludes 20.5% of H1'26 income [Q2'26 interim statements, Note 34(b) and Note 6(a)]. I do not construct a country margin.

Three country-level facts that bear on margin direction, none of which is a margin number:

- **Mexico — deliberate deposit shrinkage to cut funding cost.** Deposits fell again to US$5.7bn, *"reflecting our ongoing deposit optimization strategy. This continues to improve our cost of funding while maintaining ample liquidity"* [Q2 2026 transcript, prepared remarks]. Mexico became a full multiple bank on Aug-6-2026 [Q2'26 interim statements, Note 35 (Subsequent events)]. Directionally a funding-cost tailwind; unquantified at group level.
- **Brazil is the margin.** 90.9% of geographically-attributed H1'26 revenue [Q2'26 interim statements, Note 34(b)]. Group margin is effectively Brazilian margin, so the Brazilian policy rate and Brazilian credit cycle are group drivers, not country drivers.
- **The United States is a cost, capped by management at <100bp of the efficiency ratio per year** [Q1 2026 transcript, prepared remarks]. Nubank N.A. holds conditional OCC approval and is not yet operating [FY2025 Form 20-F, Note 35(a)]. It contributes cost with no offsetting revenue line yet.

---

## 7. Margin Bridge — Latest Period

Two bridges. **7A** is the company's own risk-adjusted NIM walk (the primary metric, quarter on quarter). **7B** is my own bridge on the audited IFRS statements, year on year, walking all the way to net margin — this is the one that adjudicates the divergence upstream `01` flagged. The generic template rows (volume / price / input costs / mix / FX / one-offs) are replaced by the bank grammar; the mapping is stated in each table.

### 7A. Risk-adjusted NIM — Q1'26 → Q2'26 (company-disclosed walk)

| Component | Margin impact (bps) | Maps to generic template row | Evidence |
|---|---:|---|---|
| Float income | **+5** | Mix (asset mix — idle cash into loans) | [Q2'26 Earnings Presentation, slide 16] |
| Credit income | **+178** | Volume / operating leverage | [Q2'26 Earnings Presentation, slide 16]; *"driven by our strong loan growth in cards and unsecured lending in Q1"* [Q2 2026 transcript, prepared remarks] |
| Cost of credit | **+115** | Input costs (credit is a lender's input cost) | [Q2'26 Earnings Presentation, slide 16] |
| — of which Desenrola (one-off policy) | ~+52 (subset of the +115; **not additive**) | One-offs | Derived in §7a from *"about 5%"* on cost of credit [Q2 2026 transcript, Q&A] |
| Cost of funding | **−5** | Input costs (funding) | [Q2'26 Earnings Presentation, slide 16] |
| FX | **Not separately disclosed** — the deck states FX-neutral growth alongside (NII +9% FXN, cost of credit −9% FXN), same signs as reported, so FX does not flip any component | FX | [Q2'26 Earnings Presentation, slide 15] |
| Other | **+1** (rounding in the disclosed walk) | Other | Residual, quantified below |
| **Total** | **+294** (9.48% → 12.42%) | | [Q2'26 Earnings Presentation, slide 16] |

### 7B. IFRS net margin — Q2'26 vs Q2'25 (my bridge on the audited statements)

Every pre-tax component is expressed **after tax at the prior-year retention rate (72.4438%)**, so the components sum to the change in *net* margin rather than pre-tax margin. That conversion is stated because the alternative — mixing pre-tax and post-tax components in one column — is exactly the basis mix §15 forbids.

| Component | Margin impact (bps of net margin) | Maps to generic template row | Evidence |
|---|---:|---|---|
| Funding cost ratio (28.234% vs 28.077% of revenue) | **−11.4** | Input costs | [Q2'26 interim statements, statements of income] |
| Transactional expense ratio (2.318% vs 2.135%) | **−13.3** | Input costs | [Q2'26 interim statements, Note 6(d)] |
| Credit cost ratio (26.884% vs 27.592%) | **+51.3** | Input costs / mix | [Q2'26 interim statements, Note 7] |
| *(subtotal: IFRS gross margin +36.7bp pre-tax)* | *(+26.6 post-tax)* | | |
| Operating expenses, net (20.053% vs 18.198%) | **−134.4** | Volume / operating leverage — negative this quarter | [Q2'26 interim statements, Note 8] |
| Share of loss in associates | **−4.1** | Other | [Q2'26 interim statements, statements of income] |
| *(subtotal: EBT margin −154.6bp pre-tax)* | *(−112.0 post-tax)* | | |
| **Effective tax rate (14.173% vs 27.562%)** | **+300.2** | One-offs / structural | [Q2'26 interim statements, statements of income, Note 30] |
| Non-controlling interests | **−1.2** | Other | [Q2'26 interim statements, statements of income] |
| FX | **0 by construction on the ratio** — every line in this table is a share of the same USD-translated revenue | FX | [Q2'26 interim statements] |
| Other / rounding residual | **0.0** | Other | Computed below |
| **Total margin change (net margin, 17.359% → 19.231%)** | **+187.1** | | [Q2'26 interim statements, statements of income] |

---

## 7a. Bridge Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

Every component in 7A is **asserted from disclosure** — the company publishes the walk and its own basis-point figures; no sensitivity was applied by me. The two derived figures in this module are shown in full below.

**Derivation 1 — the Desenrola one-off, converted into risk-adjusted-NIM basis points.**

```
Desenrola: 5% × Q2'26 cost of credit US$1,691m  [Q2'26 Earnings Presentation slide 15;
           "about 5%" from Q2 2026 transcript, Q&A, CFO]
  = US$84.6m in the quarter → US$338.2m annualised
  Denominator basis, derived from the deck's own two published ratios and NOT imported
  from anywhere else: annualised NII 3,687 × 4 = 14,748; NIM 22.9% ⇒ interest-earning
  base = 14,748 / 0.229 = US$64,402m. Cross-check on the SAME base: annualised cost of
  credit 1,691 × 4 = 6,764 / 64,402 = 10.50%, and 22.9% − 10.5% = 12.4% = the published
  risk-adjusted NIM. The base reconciles exactly, so it is the deck's own denominator.
  = 338.2 / 64,402 = 52.5bps of the 115bps cost-of-credit component
  = 52.5 / 294 = 18% of the total 294bp QoQ expansion
  → basis matches (deck numerator, deck denominator, same quarter, consolidated)
```

That result is **consistent with**, not contradicted by, management's own characterisation: the CFO called Desenrola *"a minority of the impact"* of the 115bp cost-of-credit component — 52.5 of 115 is 46%, a minority [Q2 2026 transcript, Q&A]. It is also consistent with his separate statement that *"about 1/3 of that benefit relative to what we were expecting is coming from Desenrola"*, which is measured against plan, a different denominator, and must not be compared with the 18% figure above.

**Derivation 2 — the tax component of 7B.**

```
Tax rate effect: EBT margin 22.4245% × (retention 0.858269 − 0.724377)
                 [Q2'26 interim statements, statements of income — actual filed
                  tax and pre-tax figures for both quarters, not an assumed rate]
  = 22.4245% × 13.3892pp = +300.2bps of the +187.1bps observed net-margin change
  → basis matches (same statement, same two periods, consolidated, IFRS)
```

Note what this does NOT do: it does not apply management's guided 15–20% tax range, and it does not apply the Street's implied ~30% rate. Both are forecasts about a period that has not been filed. This bridge uses only rates that were actually paid.

**Reconciliation, 7A.** Components +5 +178 +115 −5 = **+293bps**. Stated total = **+294bps** (9.48% → 12.42%). **Explained 293bps, residual 1bps, total 294bps.** The 1bp residual is rounding in the disclosed walk, not an unexplained driver.

**Reconciliation, 7B.** Components −11.4 −13.3 +51.3 −134.4 −4.1 +300.2 −1.2 = **+187.1bps**. Stated total = **+187.1bps** (17.359% → 19.231%). **Explained 187bps, residual 0bps, total 187bps.**

**What the reconciliation licenses, and what it forbids.** Both bridges reconcile to within a rounding basis point, so Section 8 may name a single biggest driver. But it must name the *right* one: in 7B, the tax component alone (+300.2bps) is **160% of the entire observed change**, while every operating component together is **−112.0bps**. Any claim that Q2'26's net-margin expansion was operating-led is refuted by this arithmetic. Equally, 7A shows the operating story is real — but it lives **above** operating cost and tax, and it is one quarter old after a quarter that went the other way (−101bp in Q1'26).

```
RF-EARN-002: margin bridge reconciled — explained 187bps, residual 0bps, total 187bps
```

---

## 8. The Single Biggest Margin Driver

**Credit cost — the expected-credit-loss charge — is the driver that would compress margins most if it moved against the company, and its current direction is favourable but not run-rate.**

The size of the lever is disclosed, not inferred: it sits between a 22.9% NIM and a 12.42% risk-adjusted NIM, so on the company's own numbers roughly **46% of the interest margin is consumed by credit losses** before a single operating dollar is spent [Q2'26 Earnings Presentation, slide 15]. In the last two quarters it moved risk-adjusted NIM by **−263bp and then +115bp** — a 378bp round trip in six months, larger than every other component in the walk combined [Q2'26 Earnings Presentation, slide 16]. At the audited line the same swing is visible: expected credit loss was **34.58% of revenue in Q1'26 and 26.88% in Q2'26** [Q1'26 and Q2'26 interim statements].

Current direction is **improving, with three qualifications that must travel with it**. First, the Q2'26 improvement is partly a one-off: Desenrola cut cost of credit by about 5%, roughly 52bp of risk-adjusted NIM by the arithmetic in §7a, and **more than four-fifths of it has already been taken** [Q2 2026 transcript, Q&A]. Second, on a year-over-year basis the credit-cost *rate* is 160bp **worse**, not better (10.5% vs 8.9%) — the QoQ improvement is a recovery from a bad Q1, not a new low. Third, the delinquency series that feeds the charge is drifting: 90-plus-day non-performing loans rose 35bp to 6.9% in the quarter, and the CFO himself said that over two years *"the general trend is upwards, and that's being driven by the mix"* — a mix decision, not a season [Q2 2026 transcript, Q&A].

**Two other things must be said in the same breath, because a single-driver answer would otherwise mislead.** (a) Credit cost is the biggest driver of the metric management runs the company on, but it was **not** what compressed margin in FY2025. There, credit cost as a share of revenue actually **fell 86bp** and the funding-cost ratio rose **442bp** — FY2025's 361bp gross-margin compression was a rate shock, not a credit event [FY2025 Form 20-F, Item 5, p.176]. Anyone carrying "credit cost is the problem" back to FY2025 has the wrong cost line. (b) Credit cost is not what is currently moving the reported bottom line at all. **100% of Q2'26's net-margin expansion is the tax rate** (§7b), and pre-tax margin actually fell 155bp year on year. The margin driver that decides the print in the next two quarters is credit cost; the driver that decided the last one was tax.

**Cycle position (Cycle-Position Rule).** The latest reported quarter is at or very near the **top of this company's own margin history**, and is **not a normalised run-rate**. Evidence: risk-adjusted NIM of 12.42% is the highest in the six-quarter disclosed series and is called *"a record"*; return on equity of 33% is called a record; net income of US$1.1bn is a first [Q2'26 Earnings Presentation, slides 15–16; Q2 2026 transcript, prepared remarks]. It also carries a one-time policy tailwind (Desenrola, ~52bp of risk-adjusted NIM, four-fifths already booked) and a tax rate of 14.17% that is below management's own guided 15–20% floor. Against a **decade-high Brazilian policy rate** — Selic at 15.00% at the date of the annual filing, from 10.50% in May-2024 and 13.75% in Aug-2022 [FY2025 Form 20-F, Item 3 — risk factors, Brazilian macroeconomic conditions] — the funding-cost side is nearer a cyclical peak than a trough, which is a headwind now and a tailwind if rates fall.

**Young-entity caveat, per the rule.** NU's standalone disclosed margin history spans roughly one interest-rate cycle: the risk-adjusted NIM series in the deck runs only six quarters, and the company was loss-making as recently as FY2022. So "peak" here means peak of its own short record, inferred from the Brazilian consumer-credit and policy-rate cycle rather than from a full company cycle. **Reconciliation to business-model `10_external-dependency.md`:** that output scores external dependency 57/100 (inverted; higher = worse), classifies NU "Partly externally driven", and names credit cost as the single largest swing factor. I agree, and refine it in one place — its framing implies credit is the historic margin mover, whereas the FY2025 cost-line evidence above shows funding cost, not credit, caused the last full-year compression. That is a refinement, not a disagreement, and it is flagged rather than averaged.

**Testing the contradiction upstream `04` handed me, on the cost lines I own.** Consensus FQ3'26 implies an EBIT margin of 24.78% against 22.51% delivered in Q2'26 — **+227bp in one quarter** — while management's own FY26 efficiency-ratio guide of ~20% implies H2 cost ratios roughly **150–195bp worse** than Q2'26's 19.5% [`04_guidance-consensus.md` §3, arithmetic reproduced there]. Converting the efficiency-ratio move onto my basis: net revenues were US$4,132m against IFRS total revenue of US$5,513.2m in Q2'26, a ratio of **74.9%**, so 150–195bp on the efficiency ratio is roughly **112–146bp** on operating cost as a share of total revenue [Q2'26 Earnings Presentation, slide 22; Q2'26 interim statements]. For pre-tax margin to rise 227bp while operating cost worsens by that much, **IFRS gross margin must reach roughly 45.9%–46.3%** (42.56% + 339 to 373bp). NU has printed a gross margin at that level exactly once in the data I hold — the FY2024 full year, 45.61% — and never in a quarter in the filed series. That is a demanding requirement, not an easy one. Two honest caveats: the consensus EBIT line rests on 4 of 6 estimates and the revenue line on 4 of 8, so it is thin; and the conversion ratio of 74.9% is measured on Q2'26's own mix and would shift if the revenue mix moves. Conclusion on the cost lines I own: **the operating bar for Q3'26 is demanding, and the way it gets cleared is credit cost falling again, not operating cost.**

---

## 9. Investment Spend — Both Signs

**Trigger check first.** Physical capex is **not** currently running above its own history: H1'26 capex was US$100.5m against US$152.9m in H1'25, down 34% [Q2'26 interim statements, statements of cash flows]. FY2025 was the spike year — US$340.8m against US$175.0m in FY2024, +95%, almost entirely intangibles (US$333.6m) [FY2025 Form 20-F, statements of cash flows]. The spend that IS running well above its own history is (a) **operating expense**, +20% QoQ in Q2'26, and (b) the **expected-credit-loss charge and allowance build**, which for a lender is the economic equivalent of a capacity investment: it is paid before the revenue it creates arrives. Both signs are scored below.

| Reading | What it would show | Evidence here |
|---|---|---|
| **Spend as a future COST** | D&A step-up, the recognition lag, the cost line it lands in, and what it does to margin as it arrives | **D&A:** US$42.4m in Q2'26, +83.7% YoY against revenue +50.3%, so D&A/revenue rose 14bp to 0.77% — the trailing edge of FY2025's US$333.6m intangibles spend, landing in customer support and G&A [Q2'26 interim statements, Note 8; FY2025 Form 20-F, statements of cash flows]. **Operating cost:** opex US$806m in Q2'26, +20% QoQ, on *"real estate and marketing expenses shifted from the first quarter into the second, alongside our continued investments in international expansion"*; efficiency ratio worsened from 17.6% to 19.5% and management said flatly that *"the 17.6% reported in Q1 was not a run rate"*, roughly two-thirds of it timing [Q2 2026 transcript, prepared remarks]. **US entry:** a self-declared cap of *"less than 100 basis points on our consolidated efficiency ratio"* in each of 2026 and 2027, with a measured 100bp gap already visible in Q1'26 between the 17.6% reported and the 16.6% "core" excluding return-to-office, international expansion and AI infrastructure [Q1 2026 transcript, prepared remarks]. **Credit charge:** expected credit loss of US$1,482.2m in Q2'26 and US$3,200.2m in H1'26 — 26.9% and 30.5% of revenue [Q2'26 interim statements, Note 7] |
| **Spend as a DEMAND signal** | Backlog / bookings / contracted revenue, management's own supply-vs-demand language, whether capacity is sold before it is built | **The allowance build IS the booking.** Under IFRS 9 the loss is recognised at origination: *"we recognize expected credit losses at origination. So growth increases the allowance before the associated interest income is earned"* [Q2 2026 transcript, prepared remarks]. The allowance rose from US$6.1bn to US$6.6bn in Q2'26 and **the largest driver by far was portfolio growth, US$342m**, with intentional risk expansions a further US$170m and *"all other movements … immaterial"* [Q2 2026 transcript, prepared remarks]. So the charge is dominated by loans already written, not by loans going bad. **The lag is measured, not assumed.** Q2'26's +178bp credit-income contribution *"was driven by our strong loan growth in cards and unsecured lending in Q1"* — booking in one quarter, revenue in the next [Q2 2026 transcript, prepared remarks]. **The funding is already raised.** Deposits US$45.3bn, +18% YoY FX-neutral, against a loan-to-deposit ratio of 35% on the CFO's basis / 58% average on the deck's basis — the deposit base is well ahead of the loan book, so lending capacity is funded before it is used [Q2'26 Earnings Presentation, slides 14, 16; Q2 2026 transcript, prepared remarks]. **The book itself:** total credit portfolio US$39.4bn, +37% YoY FX-neutral [Q2'26 Earnings Presentation, slide 13]. **Management's own constraint language is demand-side, not supply-side:** *"we have 7% market share of that profit pool. So we're still a small player in that big market, and we get to cherry pick our customers"* [Q2 2026 transcript, Q&A — David Vélez], and the US entry is framed explicitly as *"a call option"* with additional investment *"contingent on clear evidence of product market fit"* [Q1 2026 transcript, prepared remarks] |

**Current read: the evidence favours the DEMAND reading for the credit charge, and the COST reading for operating expense — they are different spends and must not be scored as one.**

On the credit charge the demand sign is the better-evidenced one, and it has already been tested once: Q1'26 booked a US$1,718.0m charge (34.58% of revenue) and printed the year's worst margins (gross margin 37.54%, risk-adjusted NIM 9.48%); the very next quarter delivered a record risk-adjusted NIM of 12.42% and gross margin of 42.56%, with management attributing the credit-income step-up to the loans written in Q1 [Q1'26 and Q2'26 interim statements; Q2 2026 transcript, prepared remarks]. Reading Q1'26's provision only as a cost would have called a deterioration one quarter before a record. Management's own allowance bridge quantifies which sign dominates: **US$342m of the US$500m build was portfolio growth, US$170m deliberate risk expansion, everything else immaterial** — growth and choice, not decay.

On operating expense the cost sign dominates, on management's own words: 17.6% *"should not be extrapolated"*, the FY26 guide is ~20%, and H2 therefore has to run about 150–195bp worse than Q2'26. That is a stated headwind, not an ambiguity.

**The ONE observable that would flip the credit read from demand to cost:** the allowance build ceasing to be explained by portfolio growth. Concretely — in the Q3'26 disclosure (expected Nov-12-2026), if the allowance bridge shows **portfolio growth contributing materially less than the ~68% share it carried in Q2'26 (US$342m of ~US$500m)**, with the balance coming from stage migration or reserve strengthening rather than new lending, AND the 15-to-90-day delinquency ratio fails to improve once the disclosed seasonal effect (−37bp in Q2'26) is subtracted, then the charge is paying for losses rather than for growth, and the demand reading is dead. A second, cleaner tell on the same print: whether credit income steps up again with the one-quarter lag the company itself describes. If Q2'26's lending growth does not convert into Q3'26 credit income, the mechanism has broken.

---

## 10. Citations

All documents live in the frozen extract generation and are cited logically as `data/NU/`.

- **FY2025 Form 20-F (filed Apr-08-2026)** — Item 5 Operating and Financial Review: consolidated income statement FY2023–FY2025 (p.156); cost of financial and transactional services provided, component table and narrative (pp.175–177); operating-expense table (p.177). Item 4 — regulatory environment (Law 14,690/2023 revolving and instalment card charge cap; INSS payroll-loan cap indexed to Selic; payroll-loan market description). Item 3 — Brazilian macroeconomic risk factors (Selic path: 13.75% Aug-2022 → 10.50% May-2024 → 15.00% Jun-2025, and 15.00% at the date of the annual report). Notes 6, 34, 35(a). Consolidated statements of cash flows (capex).
- **Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026)** — statements of income, three and six-month periods ended Jun-30-2026 and 2025; Note 6(c) interest and other financial expenses; Note 6(d) transactional expenses; Note 7 expected credit loss; Note 8 operating (expenses) income incl. footnote (i); Note 33(a) prudential conglomerate capital; Note 34 segment information and 34(b) geography; Note 35 subsequent events; statements of cash flows.
- **Q1'26 unaudited interim condensed consolidated financial statements (filed May-14-2026)** — statements of income, three months ended Mar-31-2026 and 2025.
- **Q2'26 Earnings Presentation, Aug-13-2026** — slide 13 (credit portfolio and product mix), slide 14 (deposits and cost of deposits as % of interbank rate), slide 15 (NII, cost of credit, NIM, risk-adjusted NIM), slide 16 (risk-adjusted NIM QoQ walk and average LDR), slide 22 (net revenues, opex, efficiency ratio), slide 27 (LDR / funding definitions), slide 28 (ARPAC and cost to serve).
- **Q2 2026 earnings-call transcript, Aug-13-2026** (S&P Global, verbatim) — prepared remarks (deposits and cost of funding; NIM and cost of credit; risk-adjusted NIM bridge; early-delinquency bridge; allowance bridge; gross-profit composition; operating leverage and efficiency ratio) and Q&A (Desenrola sizing and timing; risk-adjusted NIM sustainability; NPL mix vs seasonality; US opex cap).
- **Q1 2026 earnings-call transcript, May-14-2026** (S&P Global, verbatim) — prepared remarks (efficiency ratio 17.6% reported / 16.6% core, one-third structural and two-thirds timing; FY26 ~20% guide; US opex headwind "less than 100 basis points" in each of 2026 and 2027; IFRS effective tax rate 15–20% for the remainder of 2026) and Q&A.
- **`ciq_facts.json`** (deterministic sidecar for this extract generation) — `ltm_ebitda_m` unknown; `segments_revenue` "Banking 6,991 (100%) of Total 6,991", status `present`.
- **Cross-module** — `analyses/NU_2026-09-06/business-model/02_business-identity.md` §3a (matched sector overlay and KPI checklist), `03_segment-map.md` (single reportable segment, geography and product disaggregation, Note-34 base exclusions), `06_value-chain.md` (pricing power), `10_external-dependency.md` (cyclicality, mitigation evidence, single biggest lever). **Upstream earnings** — `00_earnings-data-triage.md`, `01_historical-financials.md`, `04_guidance-consensus.md`.
- **Framework** — `frameworks/SECTOR_OVERLAYS.md`, Bank / lender row.

**Not used as a source for any number:** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` (verdict-bearing prior in-house memo, verdict stripped per CLAUDE.md §24).
