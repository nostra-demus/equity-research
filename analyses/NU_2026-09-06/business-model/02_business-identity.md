# Business Identity — NU

**Regime (from triage `00`):** US SEC foreign private issuer — annual filing is Form 20-F, not a 10-K. Reporting standard IFRS as issued by the IASB. Reporting currency US dollars; the operating subsidiaries' own working currencies are Brazilian real, Mexican peso and Colombian peso. Fiscal year ends 31 December. Tradable line referenced throughout: **NYSE: NU, Class A ordinary shares, USD** (a separate Brazilian BDR Level I line trades on B3 with Banco Bradesco as depositary — a different instrument). [FY25 Form 20-F, cover page; `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf` (Bradesco BDR notice)]

---

## 1. What The Company Actually Does

Nu Holdings is a bank with no branches. It runs a mobile app through which ordinary people in Brazil, Mexico and Colombia get a credit card, a deposit account, a personal or payroll loan, a place to park savings, a simple investment account and some insurance sold on behalf of third parties — and it books most of those products on its own balance sheet [FY25 Form 20-F, Item 4.B "Business Overview — Welcome to Nu"]. The customers are retail consumers, mostly mass-market, plus small businesses: at 31 December 2025 it had 131 million customers, of whom 113 million were in Brazil, about 62% of the country's adult population [FY25 Form 20-F, Item 4.A "2025" and Item 4.B]; by the second quarter of 2026 the count was 139 million, including almost 118 million in Brazil, more than 5 million in Colombia and 16 million in Mexico as of end-July [Q2 FY26 transcript, 13 Aug 2026, CEO prepared remarks]. What the customer actually pays for is credit — a card limit or a loan — and the price is interest plus fees; the free app, the free transfers and the deposit account are the way the company gets the customer, not the way it gets paid. Its own numbers say so: of US$15,774.8 million of total revenue in FY2025, US$13,434.7 million was interest income and gains on financial instruments and US$2,340.1 million was fee and commission income [FY25 Form 20-F, "Statement of Income Data", p.155]. The claimed advantage over the incumbent banks is cost, not price: the company says it started in Brazil because banking fees there were among the highest in the world, and that a bank built on technology "with no branches and no legacy to defend" can serve the same people at a fraction of the cost [FY25 Form 20-F, Item 4.A "Our Nu Journey"; Q2 FY26 transcript, CEO prepared remarks]. In August 2026 Mexican regulators approved its banking licence, which lets it take payroll direct deposits there and raises deposit insurance cover [Q2 FY26 transcript, CEO prepared remarks]; the company also describes an early-stage US entry it intends to cap at about 100 basis points of its efficiency ratio [Q2 FY26 transcript, Q&A]. Marketing language stripped: the filing calls Nu "a technology company that is revolutionizing a broad range of services" [FY25 Form 20-F, Item 4.B "Overview"] — the audited income statement shows a consumer lender that earns 85% of revenue as interest, so that is how it is treated here.

---

## 2. How The Company Makes Money

**The company's own identity (management framing, and it reconciles to the drivers below):**

`Revenue = average monthly active customers × monthly revenue per active customer (ARPAC) × months`

Q2'26 inputs: 139 million customers, activity rate 83.5%, ARPAC US$17, giving US$5.9 billion of "gross revenue" on management's own managerial framework [Q2 FY26 investor deck, 13 Aug 2026, slide 6; Q2 FY26 transcript, CEO prepared remarks]. **Note the basis:** that US$5.9bn is a managerial, non-IFRS measure. The audited-standard interim statement for the same quarter reports IFRS total revenue of US$5,513.2 million [Q2 FY26 Interim Report (14 Aug 2026), consolidated statement of profit or loss, three months ended 30/06/2026]. Filings beat decks — the IFRS figure is the one used below.

**Broken into the three lines that actually generate it:**

| Line | Formula | Latest evidence |
|---|---|---|
| **Credit (lending)** | `Interest income = interest-earning credit portfolio × lending yield` | Interest income and gains net of losses US$13,434.7m in FY2025, of which credit-card interest US$4,597.8m and loan interest US$4,784.3m [FY25 Form 20-F, "components of our total revenue", p.175]. Total credit portfolio US$39.4bn at Q2'26, +37% year on year on an FX-neutral basis [Q2 FY26 deck, slide 13] |
| **Cards & fees** | `Fee income = card purchase volume × take rate + late fees + insurance commission` | Fee and commission income US$2,340.1m in FY2025 — credit and prepaid card income US$1,720.3m (up 24.6% on purchase-volume growth of 17%), late fees US$385.0m, insurance commission US$35.5m [FY25 Form 20-F, p.175] |
| **Float (deposits)** | `Float income = customer deposits × (rate earned on the money − rate paid to the depositor)` | Deposits US$45.3bn at Q2'26 (Brazil 36.4, Mexico 5.7, Colombia 3.3), +18% year on year FX-neutral; cost of deposits 88% of the local interbank rate [Q2 FY26 deck, slide 14] |

**Then the costs that turn revenue into profit:**

`Profit ≈ Revenue − funding cost − credit losses − transactional cost − operating expenses − tax`

FY2025: interest and other financial expenses US$4,578.7m, expected credit loss US$4,204.9m, transactional expenses US$366.2m, total operating expenses US$2,752.9m, income taxes US$996.7m — leaving net income of US$2,871.7m [FY25 Form 20-F, "Statement of Income Data", p.155].

**What drives each part.** Volume is driven by two things multiplied together: how many customers there are, and how much credit and how many products each one takes — the company's stated plan in Brazil is now mostly the second, since it already serves most of the mass-market segment and is the primary account for roughly 60% of it [Q2 FY26 transcript, CEO prepared remarks]. Price is set by the lending yield on the credit book and by the card take rate, both of which move with local central-bank policy rates (Brazil's CDI, Mexico's TIIE, Colombia's IBR) and with product mix — a shift toward secured payroll loans lowers the yield, a shift toward revolving card balances raises it. Margin is driven by three levers the company reports directly: the gap between the lending yield and what it pays depositors (net interest margin, or NIM — the spread it earns on the money it lends out — 22.9% annualised in Q2'26), credit losses (which cut that to a risk-adjusted NIM of 12.4%), and fixed-cost leverage on a base that barely grows with customers (efficiency ratio — operating costs as a share of net revenue — 19.5% in Q2'26 against 50% in Q2'22) [Q2 FY26 deck, slides 15 and 6; Q2 FY26 transcript, CFO prepared remarks].

---

## 3. Business Type Classification

Digital-only consumer bank in Latin America — an unsecured, credit-card-led lender funded by low-cost retail deposits, monetised by selling more products to an already-acquired customer base.

---

## 3a. Sector Overlay & Required-KPI Checklist

Matched overlay row: **Bank / lender** (`frameworks/SECTOR_OVERLAYS.md`). The generic volume/price/mix read does not govern here; the metrics below do.

| Required KPI (bank/lender) | Present / Absent | Value and source |
|---|---|---|
| NIM | **Present** | 22.9% annualised Q2'26; risk-adjusted NIM (after credit losses) 12.4% [Q2 FY26 deck, slide 15] |
| Loan growth | **Present** | Total credit portfolio US$39.4bn at Q2'26, +37% YoY FX-neutral; mix credit card 66% / unsecured 26% / secured 8% [Q2 FY26 deck, slide 13] |
| Deposit growth | **Present** | US$45.3bn at Q2'26, +18% YoY FX-neutral [Q2 FY26 deck, slide 14]. Filing basis: total deposits US$41,925.1m at 31 Dec 2025 [CIQ Financials→Industry Specific, annual to FY2025 — vendor export] |
| CASA / funding mix | **Present, in local-equivalent form** | "CASA" is not a Brazilian disclosure term. The equivalent read: non-time (on-demand/savings) deposits were 98.9% of total deposits at FY2025, time deposits 1.1% [CIQ Financials→Industry Specific, FY2025 — vendor export]; cost of deposits 88% of the local interbank rate, and net credit portfolio is 57% of available funding [Q2 FY26 deck, slides 14 and 27] |
| NPL (gross / net equivalent) | **Present** | 15–90 days past due 4.8% (−16bp QoQ); 90+ days past due 6.9% (+35bp QoQ) at Q2'26 [Q2 FY26 deck, slide 17; Q2 FY26 transcript, CFO prepared remarks]. Filing basis: non-performing / impaired loans US$2,658.0m at FY2025 [CIQ Financials→Industry Specific — vendor export] |
| Credit cost (provisions / loans) | **Present** | Expected credit loss US$4,204.9m in FY2025 [FY25 Form 20-F, p.155]; US$1,482.2m in Q2'26 and US$3,200.2m for the six months to 30 Jun 2026 [Q2 FY26 Interim Report (14 Aug 2026), consolidated statement of profit or loss] |
| PCR / coverage | **Present** | Total allowance = 244% of the 90+ NPL stock at Q2'26; allowance rose from US$6.1bn to US$6.6bn in the quarter; allowance build = 113% of new 15+ day delinquency formation [Q2 FY26 transcript, CFO prepared remarks; Q2 FY26 deck, slide 19] |
| CET1 / CAR | **Present** | Brazilian prudential conglomerate at 31 Dec 2025: CET1 13.0% (14.7% in 2024), Tier 1 14.4%, CAR 16.6% (18.1% in 2024), against minimum capital required of US$3,269.9m on RWA of US$31,141.6m. Nu Mexico Financiera capital ratio 15.4% (minimum 10.5%); Nu Colombia 16.9% [FY25 Form 20-F, Consolidated Financial Statements, capital-management note] |
| ROA | **Present, vendor-sourced only** | 4.96% for FY2025 (0.049627) [CIQ Financials→Ratios, annual to FY2025 — vendor export]. The 20-F does not present an ROA ratio; this is a tier-5 read, not a filing figure |
| ROE | **Present** | 33% in Q2'26, described by the CFO as a record [Q2 FY26 transcript, CFO prepared remarks]. FY2025 on the vendor basis: 31.6% [CIQ Financials→Ratios — vendor export] |
| Cost-to-income | **Present, on a company-defined basis** | Efficiency ratio 19.5% in Q2'26 (20% guided for the full year), against 50% in Q2'22. **Definition matters:** the company defines it as total operating expenses ÷ (net interest income + fee income net of transactional cost and revenue-based taxes) — not the conventional opex ÷ total income, so it is not directly comparable to an incumbent bank's cost-to-income [Q2 FY26 deck, slides 6 and 22 footnotes; Q2 FY26 transcript, CFO prepared remarks] |

**Data gaps to carry to the synthesis:** none of the overlay's required KPIs is absent. Two qualifications travel with the set instead of a gap. First, ROA exists only as a vendor-computed ratio, not as a filed number — it is tier 5, not tier 1. Second, the headline operating metrics (ARPAC, cost to serve, efficiency ratio, NIM, risk-adjusted NIM, "gross revenue") come from the company's own managerial, non-IFRS framework introduced in Q4 2025 and are stated FX-neutral; the audited IFRS statements report different figures for the same quarter (managerial gross revenue US$5.9bn vs IFRS total revenue US$5,513.2m in Q2'26). Any downstream comparison must state which basis it is on [Q2 FY26 transcript, IR opening remarks; Q2 FY26 Interim Report (14 Aug 2026)].

**Sector red flags the overlay tells downstream agents to test** (flagged here, not adjudicated here — `red-flags-sweep` and `business-quality` own them): rising NPAs with falling coverage; rapid unseasoned loan growth; NIM propped up by a riskier mix; a restructured book; related-party lending. Two of these have live evidence already visible and must be tested, not assumed away: the credit book grew 37% year on year FX-neutral, so a large part of it is unseasoned [Q2 FY26 deck, slide 13]; and the CFO attributes 24bp of the early-delinquency bridge to "intentional risk expansions" — deliberate lending to cohorts with higher expected losses — which is a mix decision that raises both yield and loss [Q2 FY26 transcript, CFO prepared remarks].

**Valuation norm the overlay imposes:** dividend-discount or residual-income on cost of equity, and price-to-book read against ROE — **not** an enterprise-value or FCFF method. This is confirmed by the pool itself: the CIQ income statement uses a bank template with no EBITDA row, so `ltm_ebitda_m`, `net_debt_ebitda_x`, `interest_coverage_x` and `ev_ebitda_current_x` are all `unknown` in `ciq_facts.json`. EV/EBITDA is not available for this name and must not be manufactured. Likewise `ltm_ocf_m` of −US$10,304.8m is a lending balance sheet growing, not cash burn [`GENERATION_ROOT/ciq_facts.json` — CIQ vendor sidecar].

---

## 4. What Drives Variance

The single largest swing factor is **credit cost**, because it sits between a 22.9% NIM and a 12.4% risk-adjusted NIM — a bad-debt cycle removes nearly half the margin without touching revenue [Q2 FY26 deck, slide 15]. **Currency translation** is the second: the company reports in US dollars but earns in reais, pesos and Colombian pesos, and the gap is large enough to change the story — IFRS total revenue rose 50.3% year on year in Q2'26 as reported (US$5,513.2m vs US$3,668.5m) while management's FX-neutral growth on its managerial gross-revenue measure was 39%, a difference that mixes currency translation with the definitional gap between the two measures and cannot be cleanly split from the disclosure available [Q2 FY26 Interim Report (14 Aug 2026); Q2 FY26 transcript, CFO prepared remarks — *inference on the direction of the FX effect, not from filings*]. Third is **local policy rates**: Brazil's CDI, Mexico's TIIE and Colombia's IBR set both what the lending book yields and what deposits cost, and deposits are already priced at 88% of the interbank rate, so a rate cut compresses the funding advantage faster than it compresses the lending yield [Q2 FY26 deck, slide 14]. Fourth is **product mix within the credit book** — card 66%, unsecured 26%, secured 8% at Q2'26 — because shifting toward secured payroll loans lowers yield and losses together, while the "intentional risk expansions" management describes do the reverse [Q2 FY26 deck, slide 13; Q2 FY26 transcript, CFO prepared remarks]. Operating cost is the least volatile driver: the efficiency ratio fell 30 percentage points over four years and management guides to about 20% for the full year, so opex is a slow variable rather than a source of quarter-to-quarter surprise [Q2 FY26 deck, slide 6; Q2 FY26 transcript, CFO prepared remarks].
