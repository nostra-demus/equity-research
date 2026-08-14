# Business Model Module Memo — ORCL

**Verdict: Cyclical business — worth deeper work only with a strong timing edge** — the old software business still locks customers in, but the new AI-cloud business driving all the growth earns a return on capital of ~8.5–10.5% against an estimated ~11.2% cost of capital, funded by debt up 54% in one year.

Memo date: 2026-08-14. Source: `99_business-model-synthesis.md` (this module's adjudicated synthesis). Every number below already appears there.

---

## 1. Scores at a Glance

All scores are out of 100. Higher is better unless marked **inverted**.

| Score | Value | Source |
|---|---|---|
| Business clarity | 60 | module synthesis §1 |
| Business quality | 43 | `07_business-quality.md` (aggregate) |
| Moat | 65 | `09_moat.md` — strongest single moat source (switching costs); overall moat verdict is narrower: "Narrow moat, eroding" |
| External dependency risk — **inverted, higher is worse** | 72 | `10_external-dependency.md` ("mostly externally driven" band) |
| Capital allocation & governance | 42 | `11_capital-allocation-governance.md` |
| Data quality | 85 | `00_data-triage.md` ("Sufficient") |
| **Overall usefulness** | **55** | module synthesis §1 |

**Score caps applied.** Two caps were checked. Neither actually lowered a number, because the bottom-up scores were already below the ceiling:

- **Filter 5 cap — fast-changing industry.** `07_business-quality.md` scored the industry rate-of-change / disruption row at 33 (trigger is ≤40), capping Business quality at 65. Not binding: the reported 43 already sits below it, via a separate and more restrictive band-anchor cap of 47. Tag: **RF-BQ-005**.
- **Capital-structure transaction cap.** Total debt rose from $108.95bn (FY25) to $167.43bn (FY26) on the CIQ Capital Structure Summary basis — up 53.7%, above the >50% year-on-year trigger. This caps Capital allocation & governance at 50. Not binding: the module's own score of 42 is already lower, reflecting negative free cash flow (cash left after spending on the business), a debt-funded dividend, and the realized S&P downgrade. The synthesis calls the cap "confirmatory, not binding."

**§24 Avoid-Big-Risks filters:**

- **Filter 5 (fast-changing industries): TRIPPED.** The thesis is flagged as a sector / technology-cycle bet on AI-infrastructure demand — not a durable compounder — for the OCI part of the business now driving nearly all extra revenue and capital spending.
- **Filter 1 (crooks / integrity): no lock.** No proven fraud. Three unresolved soft signals cap conviction rather than lock the verdict: a Feb-2026 Delaware securities class action alleging misleading statements about Oracle Cloud Infrastructure (routed to management-governance); a Netherlands GDPR class action carrying an adverse, non-binding Dutch Advocate General opinion (severity 35); and disclosed FY2026 cybersecurity incidents with an open-ended "no material impact to date" qualifier (severity 45).
- **Filter 4 (serial acquirers): not tripped.** Acquisition-pattern severity 30, well below the ≥70 threshold — two spaced-out deals over a decade (NetSuite FY17, Cerner FY23), zero cash acquisitions in FY24–FY26, no goodwill write-down.
- **Automatic disqualifiers: none.** All 8 tests read N, with 0 of 5 near-misses in band [`01_disqualifier-scan.md`]. The verdict is not locked by a disqualifier.

---

## 2. What This Module Found

Oracle sells the databases and business software — and increasingly the AI cloud computing capacity — that other organizations run on. One segment, Cloud and Software, is 87% of FY2026 revenue and 90.7% of segment profit: in substance, the whole company [`03_segment-map.md` §2]. Inside it, cloud infrastructure (OCI) specifically, not the blended segment label, is what drives both growth and risk.

The single most important driver is the order book. Remaining Performance Obligations — contracted revenue not yet delivered — reached $638 billion, up 363% in a year, built mostly on a handful of named AI-infrastructure customers [`07_business-quality.md` §1]. That gives real, if concentrated, forward visibility.

The clearest strength underneath it is older and duller: the legacy database and ERP support annuity is genuinely sticky. Software-support revenue held flat (+1%, $19,804M) even as new-license sales fell 9% — customers locked into a subscription they are not expanding but cannot leave [`09_moat.md` §5].

The single most important risk is that spending on capacity has outrun the cash the business produces. GAAP capital spending rose 163% in one year to $55.7bn while free cash flow went to negative $23.7 billion in FY2026, on $32.0bn of operating cash flow [`07_business-quality.md`; `02_business-identity.md`]. Return on capital — the profit earned on each dollar invested — has sat at or below Oracle's own estimated ~11.2% cost of capital (what that money costs to raise) for four straight years, falling from 12.35% (FY22) to 8.22% (FY26) on the CIQ measure [`09_moat.md` §3–5].

The funding for that gap is debt. Total debt rose 54% in one year to $167.4bn on the broad, lease-inclusive CIQ basis (the 10-K's own narrower figure is $129.5bn), and S&P downgraded Oracle to BBB- on 9-Jul-2026 — one notch above non-investment grade. The $5.8bn dividend is now paid out of debt and preferred-stock proceeds, not free cash flow, and both the CEO and CFO changed in the same fiscal year as the largest leverage increase in company history [`11_capital-allocation-governance.md` §1–3].

The killer risk is concentration on top of that leverage: if even one or two of the small number of named AI counterparties (OpenAI's reported ~$300bn Stargate commitment, AMD, Meta, NVIDIA, TikTok, xAI) pulls back, Oracle is left holding data-center leases, power commitments, and $129.5bn+ of debt sized to demand that no longer exists — the scenario Oracle itself discloses as a risk factor [`10_external-dependency.md` §1, §5].

---

## 3. The Specialists, Briefly

| Specialist | One-line finding |
|---|---|
| data-triage | Sufficient — 10-K 1.7 months old plus a quarterly-equivalent set inside 6 months; no critical missing items. |
| disqualifier-scan | No disqualifier triggered, 0 of 5 near-misses in band; the Feb-2026 Delaware securities class action is unproven and routed as a soft signal. |
| business-identity | Software incumbent pivoting into capital-hungry AI cloud infrastructure; FY2026 free cash flow negative $23.7bn on $32.0bn operating cash flow against ~$48bn net capex. |
| segment-map | Cloud and Software is 86.9% of revenue, 90.7% of segment profit; segment "Margin" excludes R&D, G&A, stock comp and amortization (36.6% unallocated), and no segment assets or capex are disclosed. |
| unit-economics | Unclear from audited evidence — the only audited proxy, blended segment margin, is falling: 64.1% (FY24) → 62.8% (FY25) → 58.9% (FY26), while GAAP capex rose 163%. |
| customer-geography | Concentrated both ways: US 59.1% of revenue and rising; the reported ~$300bn OpenAI/Stargate contract would be ~47% of the FY26 order book if still outstanding — inference, not itemized in the filing. |
| value-chain | Price-taker upstream on GPUs and power ("accept less favorable terms with suppliers"); real leverage downstream, with 97.5% GPU utilization. |
| business-quality | Aggregate 43/100; capital intensity scored 12/100 — capex/revenue ~70–83%, levered free-cash-flow margin swung from +19.7% (FY24) to −36.4% (FY26). |
| competitive-map | ~3% of cloud-infrastructure spend vs AWS 28% / Azure 21% / Google Cloud 14%; SAP's cloud/backlog growth (27%) outpaces Oracle's cloud-applications growth (11%). |
| moat | Narrow moat, eroding — switching costs (65/100) are the one evidenced source; return on capital fell four straight years while the ~11.2% cost-of-capital estimate barely moved. |
| external-dependency | Mostly externally driven, risk score 72/100 (inverted); a 20% pullback by the largest named OCI customers would leave leases and debt sized to vanished demand. |
| capital-allocation-governance | Score 42/100 — debt +54% to $167.4bn, S&P downgrade to BBB-, dividend debt-funded, CEO and CFO both changed in one fiscal year. |
| red-flags-sweep | Four new flags: cybersecurity incidents (sev. 45), unused $20bn ATM equity program (sev. 40), adverse Dutch GDPR opinion (sev. 35), $2.7bn Ampere one-off gain in the FY26 earnings base (sev. 30). |

**Disagreements, resolved.** The most important is the total-debt figure: capital-allocation used $167.4bn (CIQ basis, which nets in lease liabilities) while the 10-K's own risk factor states $129.5bn of outstanding indebtedness. The synthesis ruled this is not a contradiction — both are correctly sourced to their own basis — and uses the 10-K's $129.5bn as the filing-sourced headline, citing $167.4bn separately as the broader, lease-inclusive number. The >50% debt-change cap trigger holds under either basis. A second, smaller split: capex is cited as $55.7bn (GAAP) by some specialists and ~$48bn ("net cash outlay," a management-defined figure) by others — both labelled, and a reader must not add them together.

---

## 4. What Would Change This Read

Toward **"worth deeper work"** on quality grounds:

- The blended Cloud and Software segment margin stabilizes or reverses its three-year decline (64.1% → 62.8% → 58.9%).
- Consolidated return on capital durably clears its estimated ~11.2% cost of capital as FY26/FY27 capacity ramps to what management calls "full contractual revenue levels."

Toward **"avoid"**:

- The $638bn order book fails to convert into recognized, cash-generating revenue on the schedule management has guided.
- A major named AI-infrastructure counterparty pulls back.
- A further ratings downgrade materially raises the cost of the ~$40bn a year of extra debt and equity management has said it plans to raise.

---

## 5. Bottom Line

- **Verdict:** cyclical business — worth deeper work only with a strong timing edge. No disqualifier triggered, so nothing blocks further work; but this is a sector / technology-cycle bet (Filter 5, RF-BQ-005), not a proven durable compounder.
- **Best reason it could be better than it looks:** a $638bn order book, up 363% year on year, plus share gains off a small base (~3% of global cloud-infrastructure spend) at 97.5% GPU utilization with no evidence of discounting to fill capacity.
- **Best reason it could be worse:** return on capital has fallen for four straight years to below its cost of capital, free cash flow is negative $23.7bn, debt is up 54%, and the S&P downgrade to BBB- has already happened — one notch above non-investment grade.
- **What is missing:** OCI-specific (or segment-level) capital spending and installed-capacity/asset figures. Oracle states plainly "we do not track our assets for each business" [FY26 10-K, Note 13, p.100], so management's unaudited "high-20s steady-state ROIC" claim cannot be checked against actual project cash returns. This is the module's single biggest data gap.
- **One thing to watch next:** whether the blended Cloud and Software segment margin stops falling — it is the only audited proxy available for whether the new capacity earns its keep.
- **Also do not drop:** severity ≥40 items carried forward — dilution reversing the share-count trend plus a $5.0bn mandatory convertible preferred and an unused $20bn ATM equity line (sev. 45 / 40), capex at 6x+ depreciation (sev. 55), $13.3bn of off-balance-sheet purchase obligations plus $19bn more committed after year-end (sev. 45), days-payable-outstanding nearly tripling from 42.9 to 127.6 days with 21.3% receivables growth (sev. 40), and the FY2026 cybersecurity incidents (sev. 45).

---

## 6. Plain-English Glossary

- **Free cash flow:** the cash left over after the company pays to run and expand the business.
- **Return on capital (ROIC):** the profit earned on each dollar invested in the business.
- **Cost of capital (WACC):** what the money the company uses costs to raise, from lenders and shareholders combined.
- **Capex (capital expenditure):** money spent on long-lived assets — here, mostly data centers and chips.
- **Remaining Performance Obligations (RPO):** revenue already under contract but not yet delivered — the order book.
- **Segment margin:** profit as a share of revenue for one business unit; Oracle's version leaves out R&D, general costs, stock pay and amortization, so it flatters the true figure.
- **Net debt basis:** which liabilities are counted as debt — the broad CIQ basis adds lease obligations, the 10-K's narrower basis does not.
- **BBB-:** the lowest credit-rating rung still considered investment grade; one notch below is non-investment grade ("junk"), where borrowing costs jump.
- **Switching costs:** the money, time and disruption a customer would face to move to a rival — what keeps Oracle's legacy database customers in place.
- **Dilution:** issuing new shares, which shrinks each existing shareholder's slice.
- **ATM equity program:** a standing facility to sell new shares into the market gradually; unused here, but an overhang.
- **Utilization:** the share of installed capacity actually in use.
