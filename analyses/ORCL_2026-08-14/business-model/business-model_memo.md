# Business Model Module Memo — ORCL

**Verdict: Cyclical business — worth deeper work only with a strong timing edge** — the old software business still locks customers in, but the new cloud-infrastructure business now driving all the growth earns a return on capital of 8.2% against an estimated 11.2% cost of capital, funded by debt up 54% to $167.4 billion.

Memo date: 2026-08-14. Source: `99_business-model-synthesis.md` (this module's adjudicated synthesis).

---

## 1. Scores at a Glance

All scores are out of 100. Higher is better unless marked **inverted**.

| Score | Value | Source |
|---|---|---|
| Business clarity | 72 | `02_business-identity.md` §2; `03_segment-map.md` §1, §3 |
| Business quality | 43 | `07_business-quality.md` |
| Moat | 65 | `09_moat.md` (verdict "Narrow" and "eroding") |
| External dependency risk — **inverted, higher is worse** | 72 | `10_external-dependency.md` ("Mostly externally driven") |
| Capital allocation & governance | 42 | `11_capital-allocation-governance.md` |
| Data quality | 85 | `00_data-triage.md` (verdict "Sufficient") |
| **Overall usefulness** | **48** | module synthesis §1 |

**Score caps applied (all confirmed binding as rules, none actually reduced a number):**

- **Filter 5 — fast-changing industry (tripped).** `07_business-quality.md` scored the rate-of-change / disruption row 33/100 (threshold ≤40). This caps Business quality at 65. Non-binding, because the actual score of 43 is already lower. Tag: **RF-BQ-005**.
- **Capital-structure transaction cap (tripped).** Total debt rose 54% year on year, from $108.95 billion (FY25) to $167.43 billion (FY26), above the >50% threshold. This caps Capital allocation & governance at 50/100. Non-binding, because the actual score of 42 is already lower.
- **Band-anchor cap of 47** on Business quality — also non-binding at the actual score of 43. The synthesis is explicit that 43 is genuinely low, not pushed down by a cap.

**§24 Avoid-Big-Risks filters:**

- **Filter 5 (fast-changing industries): TRIPPED** — the AI-infrastructure buildout that now drives essentially all incremental revenue and capital spending is flagged as a sector/technology-cycle bet, not a durable compounder.
- **Filter 1 (crooks / integrity): no lock.** An unverified, unresolved securities class action (filed 3-Feb-2026, Delaware) alleging misleading statements about the OCI growth outlook is a soft signal, routed to the management-governance module to cap conviction there. It is not proven fraud and places no cap on this module's scores.
- **Filter 4 (serial acquirers): not triggered.** Acquisition-pattern severity scored 30/100, well under the 70 threshold — two spaced-out deals (NetSuite FY17, Cerner FY23), zero cash acquisitions FY24–FY26, no goodwill impairment.
- **Automatic disqualifiers: none.** All 8 tests read N, and 0 of 5 near-miss disqualifiers were in band [`01_disqualifier-scan.md`]. The verdict is not locked by a disqualifier.

---

## 2. What This Module Found

Oracle sells databases and business software, and rents out cloud computing capacity — increasingly the raw GPU capacity used to train AI models. One segment, Cloud and Software, is in substance the whole company: 86.9% of FY2026 revenue and 90.7% of segment profit [`03_segment-map.md` §2]. Inside it, cloud infrastructure (OCI, +77% in FY26, +93% in Q4) has become the only growth engine that matters.

The clearest positive is switching-cost lock-in — customers stay because moving is painful and expensive. Software-support revenue held flat at $19,804 million (+1%) even as new-license revenue fell 9% [`09_moat.md` §2]. That is the signature of customers who are not expanding the product but will not leave it. The forward order book (RPO, the revenue already contracted but not yet delivered) grew 363% to $638 billion, and reported global GPU utilisation — how much of the installed capacity is actually in use — was 97.5% [`02_business-identity.md` §2; `06_value-chain.md` §3].

The clearest negative is that the new business has not yet proven it earns more than its money costs. Return on capital (ROIC — the profit earned on each $100 invested) fell every year for four years, 12.35% in FY22 to 8.22% in FY26, against an estimated ~11.2% cost of capital (what raising that money costs; inference, not from filings) [`09_moat.md` §3, §5]. Capital spending ran at 70–83% of revenue (basis-dependent) and levered free cash flow — cash left after spending and interest — swung to −36.4% of revenue [`07_business-quality.md` §1]. Total debt rose 54% to $167.4 billion, S&P cut the credit rating to BBB- on 9-Jul-2026, and the FY26 dividend ($5.8 billion paid) is now funded by debt and preferred-stock issuance rather than by free cash flow, which turned to −$24.5 billion as capex ($55.7bn) outran operating cash flow ($32.0bn) [`11_capital-allocation-governance.md` §1–§2].

The single biggest risk is customer and cycle concentration: a roughly 20% pullback in AI-infrastructure demand from Oracle's small set of named counterparties (AMD, Meta, NVIDIA, OpenAI, TikTok, xAI) would leave Oracle holding data-centre leases, power commitments, and debt sized to demand that no longer exists — Oracle's own risk factor about "multi-year commitments for excess data center space...without receiving corresponding revenue" [`10_external-dependency.md` §5].

The counter-evidence, stated fairly: management claims a "30% to 40% margin profile" on new OCI contracts and "high-20s" steady-state project ROIC. If true, that reverses the whole read. But those figures appear nowhere in the audited 10-K and cannot be checked, because Oracle states "we do not track our assets for each business" [FY26 10-K, Note 13; `04_unit-economics.md` §3].

---

## 3. The Specialists, Briefly

- **data-triage** — Sufficient: 1.7-month-old 10-K plus a full quarterly-equivalent set inside 6 months; 11 CIQ workbooks reconciled with zero extraction failures.
- **disqualifier-scan** — No disqualifier triggered; 0 of 5 near-misses in band. The pending securities class action is a soft integrity signal, not a lock.
- **business-identity** — Software/database incumbent pivoting into capital-heavy AI cloud infrastructure. RPO jumped $138bn → $638bn (+363%).
- **segment-map** — Cloud and Software is the company (86.9% of revenue, 90.7% of segment profit); OCI (+77%) is overtaking support ($19.8bn, +1%) while segment margin compresses 64.1% → 58.9%.
- **unit-economics** — Value creation unclear from audited evidence; blended segment margin has fallen three straight years (64.1% → 62.8% → 58.9%).
- **customer-geography** — Both concentration flags triggered: the U.S. alone is 59.1% of FY26 revenue and rising, with no long-term contract securing it as a bloc. The reported ~$300bn OpenAI/Stargate contract would be ~47% of the $638bn RPO if still outstanding (inference, not itemised in the filing).
- **value-chain** — Mixed control: weak bargaining power upstream on GPUs and power; Oracle "accept[s] less favorable terms with suppliers to minimize supply constraints" [FY26 10-K, Item 1].
- **business-quality** — Aggregate 43/100. Capital intensity scored 12/100: capex at 70–83% of revenue and levered free-cash-flow margin swinging from +19.7% (FY24) to −36.4% (FY26).
- **competitive-map** — ~3% of global cloud-infrastructure spend vs AWS 28%, Azure 21%, Google Cloud 14%; SAP's cloud/backlog growth (27%) outpaces Oracle's cloud-applications growth (11%).
- **moat** — Narrow, eroding: own-computed ROIC ~8.5–10.5% sits at or below the estimated ~11.2% cost of capital, down four years running.
- **external-dependency** — Mostly externally driven; risk 72/100 (inverted). A 20% AI-demand pullback would strand debt-funded capacity.
- **capital-allocation-governance** — Concerns; 42/100. Debt +54% to $167.4bn, S&P cut to BBB-, dividend funded by debt/preferred proceeds.
- **red-flags-sweep** — Most severe new flag: disclosed FY26 cybersecurity incidents, past tense, open-ended "no material impact to date" (severity 45).

**Disagreements:** the synthesis found no material unreconciled disagreements. The two figures that could look inconsistent were already reconciled upstream: capex is quoted on two clearly labelled bases (GAAP capex $55,663M FY26 vs management's narrower "net cash outlay" $48B FY26, guided ~$70B FY27) — both shown, not netted; and the moat report's own ROIC (8.5% ending-capital, 10.5% average-capital) versus the CIQ headline 8.22% differs only because the vendor uses an undisclosed capital-base definition.

**Other red flags propagated at severity ≥40:** debt trajectory (65), dividend funded by debt (60), capex at 6x+ depreciation (55), cybersecurity incidents (45), net share count reversing into dilution (45), off-balance-sheet purchase obligations of $13.3bn plus a further $19bn committed post-year-end (45), a $20bn at-the-market equity programme authorised Feb-2026 and unused at year-end on top of $5.0bn mandatory convertible preferred (40), working-capital stress with days payable outstanding nearly tripling 42.9 → 127.6 days alongside 21.3% receivables growth (40), and CEO and CFO both changing in the same fiscal year as the largest leverage increase in company history (40).

---

## 4. What Would Change This Read

**Toward higher quality:**

- Audited (not management-claimed) evidence that OCI project-level returns clear their cost of capital as FY26/FY27 capacity ramps to full contractual revenue.
- A capex/revenue ratio that stops rising faster than RPO converts into recognised, cash-generating revenue.
- Disclosure of a segment-level or OCI-specific capital-spend and asset base — the single missing item that would let anyone verify the "high-20s" steady-state ROIC claim rather than relying on the declining blended segment margin.

**Toward lower quality:**

- A further credit-rating downgrade below investment grade (already BBB-, one notch above).
- A pullback from any of the small number of named AI-infrastructure counterparties.
- Evidence that the disclosed FY26 cybersecurity incidents were more material than currently characterised.

---

## 5. Bottom Line

- **Verdict: Cyclical business — worth deeper work only with a strong timing edge.** Overall usefulness 48/100. Deeper work is justified only with an evidenced view on the AI-infrastructure demand cycle over the next 24 months, not as a default durable-compounder thesis.
- **Best reason it could be better than it looks:** the switching-cost moat is real and filing-evidenced (support revenue flat at $19,804mn while licences fell 9%), and the $638bn order book with 97.5% GPU utilisation suggests delivered capacity is not idle. If management's 30–40% contract margin and "high-20s" steady-state ROIC prove out, the return-below-cost-of-capital read reverses.
- **Best reason it could be worse than it looks:** return on capital has fallen four straight years to 8.2%, below an estimated ~11.2% cost of capital, while debt rose 54% to $167.4bn, S&P cut to BBB-, and the dividend is now paid with borrowed money.
- **What evidence is missing:** any segment-level or OCI-specific capex and asset base. Oracle says plainly "we do not track our assets for each business" [FY26 10-K, Note 13], so project-level returns cannot be independently checked.
- **One thing to watch next:** whether the named AI-infrastructure customers hold their commitments — a ~20% pullback strands debt-funded capacity against $167.4bn of debt and a further ~$40bn/year borrowing plan.

---

## 6. Plain-English Glossary

- **Segment** — a slice of the company the accounts report separately. Oracle's "Cloud and Software" segment is 86.9% of revenue.
- **Switching costs** — the money and disruption a customer would face to move to a rival; high switching costs keep customers paying even when they stop buying more.
- **RPO (Remaining Performance Obligations)** — the forward order book: revenue already under contract but not yet delivered. Oracle's is $638 billion.
- **Return on capital (ROIC)** — the profit earned on each $100 invested in the business. Oracle's is 8.22% (FY26).
- **Cost of capital** — what the money used in the business costs to raise. Estimated at ~11.2% here (inference, not from filings). Earning less than this destroys value.
- **Capex (capital expenditure)** — spending on long-lived assets like data centres. Oracle's GAAP capex was $55,663mn in FY26.
- **Free cash flow (levered)** — cash left over after operating costs, capital spending and interest. Oracle's turned to −$24.5 billion in FY26.
- **Operating cash flow** — cash the day-to-day business generates: $32.0 billion in FY26.
- **Segment margin** — profit as a share of that segment's revenue; here it is a cost-allocation construct that excludes R&D, G&A, stock-based pay and amortisation (36.6% of segment margin is unallocated), not a clean GAAP operating margin.
- **EBIT margin** — operating profit as a share of revenue. Oracle's last-twelve-months figure is 33.2%, against Microsoft's 46.8%.
- **BBB-** — the lowest credit rating still classed as investment grade; one further cut takes Oracle below it.
- **Preferred stock / mandatory convertible preferred** — a share class paid ahead of ordinary shareholders that later converts into ordinary shares, diluting existing holders. Oracle has $5.0bn outstanding.
- **At-the-market equity programme** — pre-approved permission to sell new shares into the market over time; Oracle authorised $20bn in Feb-2026 and had not used it at year-end.
- **Dilution** — existing shareholders owning a smaller slice because new shares were issued.
- **Days payable outstanding** — how long the company takes to pay its suppliers. Oracle's nearly tripled, from 42.9 to 127.6 days.
- **Off-balance-sheet purchase obligations** — binding commitments to buy goods or services that do not appear as debt on the balance sheet: $13.3bn, plus $19bn committed after year-end.
- **Inverted score** — a score where a higher number means a worse outcome (external dependency risk, 72/100).
