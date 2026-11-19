# Business Identity — TTWO

**Filing regime:** US SEC domestic filer (Form 10-K / 10-Q / 8-K). **Reporting standard:** US GAAP. **Currency:** USD, in millions unless stated. **Fiscal year ends March 31** — "FY2026" means the year ended March 31, 2026; FY2027 is in progress and ends March 31, 2027. Interim filings are standalone quarters (10-Q basis). [`FY26 10-K, cover page`; `FY26 10-K, Report of Independent Registered Public Accounting Firm`; `analyses/TTWO_2026-11-19/business-model/00_data-triage.md, §2A`]

---

## 1. What The Company Actually Does

Take-Two makes video games and sells them to people who play them on game consoles, phones, and PCs. It writes the software itself in its own studios — 9,998 of its 12,909 full-time staff at March 31, 2026 worked in development studios — and publishes under three house labels: Rockstar Games (Grand Theft Auto, Red Dead Redemption), 2K (NBA 2K, WWE 2K, Borderlands, Civilization), and Zynga (free mobile games such as Toon Blast, Match Factory!, Color Block Jam, Zynga Poker) [`FY26 10-K, Item 1 — General / Our Businesses`]. Most of what it earns is not the first sale of a game: $5,196.6m, or 78.1% of FY26 net revenue, came from "recurrent consumer spending" — virtual currency, add-on content, in-game purchases, and in-game advertising bought by players after they already own or have downloaded the game — against $1,459.8m (21.9%) from full-game sales and other [`FY26 10-K, Item 7 — Net revenue by content`]. The people who play are worldwide: 40.8% of FY26 net revenue was earned outside the United States [`FY26 10-K, Item 1A — international risk`], and 97.0% of it arrived through digital channels rather than physical discs [`FY26 10-K, Item 7`]. But the companies that actually pay Take-Two are a handful of digital storefronts and console owners: its five largest customers were 80.6% of FY26 net revenue, with Apple, Sony, Google, and Microsoft each above 10.0% on their own [`FY26 10-K, Item 1 — Sales`]. What the player is paying for is entertainment time — a specific, branded fictional world they want to be in, and then small ongoing purchases to keep doing more of it; what the platform is paying for is content that makes its hardware or app store worth owning. The whole thing leans on a small number of brands: Grand Theft Auto products alone were 12.4% of FY26 net revenue and the five best-selling franchises together were 54.3% [`FY26 10-K, Item 1A — dependence on key products`], and the sixth Grand Theft Auto title released on **November 19, 2026** — today — inside FY2027 [`Q2 FY27 10-Q, Item 2 (MD&A)`; `Q2 FY27 earnings release, Nov 9 2026, release schedule`].

---

## 2. How The Company Makes Money

One reportable segment ("Sale of Software Titles", 100% of FY26 revenue per `CIQ Financials_Annual → Segments, FY ended Mar-31-2026 — vendor export`), but four economically different revenue lines sit inside it. Detailed splits belong to `segment-map`; the formulas are:

| Label | Formula |
|---|---|
| **Premium console / PC game sales** ("full game and other") | `Revenue = units sold-in × net price per unit − platform royalty` |
| **Live-service spend on owned games** (console/PC RCS: virtual currency, add-on content, GTA+ membership) | `Revenue = engaged players × spend per engaged player per period` |
| **Free-to-play mobile** (Zynga: in-app purchases) | `Revenue = installed players × paying share × spend per paying player − platform fee` |
| **In-game advertising** (mainly mobile) | `Revenue = ad impressions served × price per thousand impressions` |

Two accounting points attach to these. First, the company's own headline operating number is **Net Bookings**, defined as "the net amount of products and services sold digitally or sold-in physically during the period" — i.e. cash-era sales before GAAP deferral — while GAAP revenue spreads part of each sale over an estimated service period of "five to fifteen months" [`Q2 FY27 earnings release, Nov 9 2026, footnote *`; `FY26 10-K, Item 7 — revenue recognition`]. Second, the platform cut is a real cost, not a netting: platform fees and royalties to Sony, Microsoft, Apple, and Google sit in cost of revenue [`FY26 10-K, Item 7 — Online Content and Digital Distribution`; `FY26 10-K, Item 1 — Arrangements with Platform Manufacturers`].

**What drives volume:** the release slate and how long each title keeps players engaged. FY26 net revenue rose $1,022.8m (+18.2%) on higher NBA 2K (+$416.9m), Borderlands (+$210.3m, Borderlands 4 released September 2025), Color Block Jam (+$206.6m), Toon Blast (+$121.9m), and Grand Theft Auto (+$115.1m) — five titles explain the year [`FY26 10-K, Item 7`]. On mobile, volume is partly *bought*: player-acquisition spending sits inside selling and marketing of $1,770.8m (26.6% of FY26 net revenue), and the company states its effectiveness or cost "may change, affecting our operating results" [`FY26 10-K, Item 7 — Player acquisition costs / Operating Expenses`].

**What drives price:** new-release pricing on premium titles, the pricing of virtual currency and add-on content, and advertising rates. The company also actively cuts price after launch — it describes "reducing the wholesale prices of our products… typically three to nine months after a product's initial launch" [`FY26 10-K, Item 1 — Marketing`].

**What drives margin:** mix above all. Mobile revenue "generally generates a lower gross margin percentage than our Console or PC revenue" because of the Apple/Google platform fee [`FY26 10-K, Item 7`], and mobile was 50.1% of FY26 net revenue [`FY26 10-K, Item 7 — Net revenue by platform`]. Licensed sports IP costs real money — licences were $463.5m (7.0% of FY26 net revenue) and internal royalties $417.4m (6.3%) [`FY26 10-K, Item 7 — Cost of revenue`]. FY26 gross margin was 57.2% vs 54.3% in FY25, which the filing attributes to lower intangible amortisation (prior-year impairments) and lower product costs, partly offset by higher amortisation of capitalised software [`FY26 10-K, Item 7`]. Note the gap between gross margin and the bottom line: FY26 still produced an operating loss of $(104.2)m and a net loss of $(298.2)m on $6,656.4m of revenue, because development amortisation, marketing, and R&D absorb the gross profit [`FY26 10-K, Item 7`].

---

## 3. Business Type Classification

Hit-driven owner-operator of entertainment intellectual property: a premium console/PC franchise publisher bolted onto a free-to-play mobile microtransaction business, selling almost entirely through four platform gatekeepers.

---

## 3a. Sector Overlay & Required-KPI Checklist

**No sector overlay for hit-driven owner-operator of entertainment intellectual property (premium console/PC franchise publisher + free-to-play mobile) — generic read.** No row in `frameworks/SECTOR_OVERLAYS.md` matches: it is not SaaS/subscription (recurrent consumer spending is per-item microtransaction and in-game advertising, not a contracted recurring fee, so there is no RPO/cRPO/ARR grammar), not retail, not telecom, not a financial. The engine's default volume / price / mix decomposition applies, and the overlay's **Generic operating company** row is the governing KPI set. Because mobile free-to-play is 50.1% of FY26 net revenue [`FY26 10-K, Item 7`], I also mark the industry's own de-facto KPI grammar present/absent — a mobile games business read without engagement metrics is incomplete, and that gap is recorded below rather than skipped.

**Generic-default required KPIs:**

| Required KPI (generic row) | Present in pool? | Evidence / gap |
|---|---|---|
| Volume | **Partial** | No per-title, per-period unit volumes. Only lifetime franchise sold-in counts: Grand Theft Auto series >465m units, GTA V >225m, Red Dead Redemption 2 >80m, Zynga portfolio >10bn downloads [`FY26 10-K, Item 1`]. Period volume must be inferred from revenue, not read. |
| Price / mix | **Present** | Content, platform, distribution-channel and geographic mix disclosed annually and quarterly [`FY26 10-K, Item 7`; `Q2 FY27 earnings release, pp.11–12`]. Price points per title: absent. |
| Utilization | **n/a** | No physical capacity. Closest analogue is studio headcount: 9,998 development staff [`FY26 10-K, Item 1`]. |
| Order book / backlog | **Partial** | Deferred revenue $1,017.1m current + $25.0m non-current at Sep 30, 2026 [`Q2 FY27 earnings release, Nov 9 2026, consolidated balance sheet`]. GTA VI pre-orders are described only as "tracking far in excess of our initial expectations" — **not quantified** [`Q2 FY27 transcript, Nov 9 2026, prepared remarks (Zelnick)`]. |
| Segment mix | **Not applicable as disclosed** | One reportable segment, 100% "Sale of Software Titles" [`CIQ Financials_Annual → Segments, FY Mar-31-2026 — vendor export`]. There is no segment mix to read; label/franchise profitability is not disclosed separately. |
| Working-capital cycle | **Present** | `CIQ Financials_Annual → Ratios` and `→ Cash Flow`, annual through Mar-31-2026 — vendor export. |

**Industry de-facto KPIs (the metrics this business type actually lives on):**

| KPI | Present? | Evidence / gap |
|---|---|---|
| Net Bookings (company's own headline operational metric) | **Present** | Q2 FY27 $1,601.3m, −18% YoY; FY27 outlook $8,000–8,200m [`Q2 FY27 earnings release, Nov 9 2026, p.1 and FY27 guidance table`] |
| Recurrent consumer spending ($ and growth) | **Present** | FY26 $5,196.6m / 78.1% of net revenue [`FY26 10-K, Item 7`]; Q2 FY27 RCS −9%, 81% of Net Bookings vs guidance of −5% [`Q2 FY27 investor deck, slide 4`] |
| Release slate / forward pipeline | **Present** | Title-by-title schedule with platforms and dates [`Q2 FY27 earnings release, Nov 9 2026, release schedule`] |
| Franchise concentration | **Present** | GTA products 12.4% of FY26 net revenue; top-5 franchises 54.3% [`FY26 10-K, Item 1A`] |
| **Engagement: MAU / DAU, paying-user count, ARPDAU, retention** | **ABSENT — data gap** | Zero occurrences of "daily active", "monthly active", "DAU" or "MAU" in the FY26 10-K, the Q2 FY27 earnings release, or the Q2 FY27 transcript. For a business where mobile is 50.1% of FY26 net revenue [`FY26 10-K, Item 7`], the volume half of `players × spend per player` cannot be read from the pool at all. **Carry to synthesis as a cap on any mobile unit-economics or durability claim.** |
| **Player acquisition cost (per install / payback)** | **ABSENT — qualitative only** | Described as a driver inside selling and marketing but never quantified [`FY26 10-K, Item 7 — Player acquisition costs`]. The mobile customer-acquisition payback is therefore not assessable from this pool. |
| Units and price per unit by title per period | **Absent** | See volume row above. |

**Sector-specific red flags the downstream agents should apply:**
1. **Release-date slippage on the one title the year depends on.** The FY25 10-K (filed May 2025) stated "Rockstar plans to release Grand Theft Auto VI on May 26, 2026"; the FY26 10-K (filed May 2026) states November 19, 2026 — a roughly six-month slip inside twelve months of filings, and the FY25 10-K's business section records an earlier expectation of "Fall of Calendar" 2025 [`FY25 10-K, Item 7 and Item 1`; `FY26 10-K, Item 7`]. Date risk here is proven, not hypothetical.
2. **Platform gatekeeper dependence with short contractual tails.** The Sony and both Microsoft publisher agreements expire **March 31, 2027** with automatic one-year renewals, and "Sony may terminate the agreement for any or no reason upon 30 days' notice"; Apple and Google "generally have the discretion to set the amounts of their platform fees and change their platforms' terms of service… at their sole discretion" [`FY26 10-K, Item 1 — Arrangements with Platform Manufacturers / Item 7`].
3. **Hit dependence and the post-launch decay curve** — 12.4% of FY26 revenue from one franchise, 54.3% from five [`FY26 10-K, Item 1A`], with post-launch wholesale price cuts typically three to nine months after launch [`FY26 10-K, Item 1 — Marketing`].
4. **Net Bookings vs GAAP revenue drift.** Net Bookings is a company-defined, non-GAAP operational metric; the gap to GAAP revenue runs through deferred revenue (a $147.3m deferred-revenue outflow in the six months of FY27 against a $156.2m inflow a year earlier) [`Q2 FY27 earnings release, Nov 9 2026, cash-flow statement`]. Reported FY27 GAAP revenue and Net Bookings will not move together, and the engine must say which basis it is using.
5. **Stock-based compensation is material and partly tied to the RCS metric** — FY26 SBC of $95.3m in selling and marketing, $149.0m in G&A, $88.9m in R&D, plus $(27.9)m in cost of revenue [`FY26 10-K, Item 7 — Operating Expenses footnote (1)`], with an award class whose vesting is a function of "Recurrent Consumer Spending… calculated on a basis consistent with how the Company calculates recurrent consumer spending for its management reporting" [`FY26 10-K, Exhibit — form of Restricted Stock Unit agreement`]. A company-defined metric that also pays management is a metric to verify, not accept.

**Valuation norm for this type (for the downstream valuation agents, not a valuation claim here):** FCFF DCF on GAAP free cash flow with development spend treated as the real capital cycle, plus EV/EBITDA and P/E — but **only across a full release cycle, never on a single launch or inter-launch year**, because the cycle is the whole point of the business. The pool's own numbers show why: `CIQ Financials → Multiples` reports TEV/LTM EBITDA of 52.2x on an LTM EBITDA of $724.9m to Sep-30-2026 [`ciq_facts.json: ev_ebitda_current_x, ltm_ebitda_m`], i.e. a trough-earnings denominator the day before the largest launch in the company's history. A single-year multiple on this business type is a cycle artefact.

---

## 4. What Drives Variance

Release timing dominates everything else. Revenue and margin swing on *when* a small number of titles ship, not on steady volume or price: five franchises explained the entire $1,022.8m FY26 increase, and Q2 FY27 Net Bookings fell 18% to $1,601.3m with recurrent spending down 9% simply because the company sat between launches [`FY26 10-K, Item 7`; `Q2 FY27 earnings release, Nov 9 2026, p.1`]. The second driver is **mix**, in two directions: console/PC versus mobile (mobile carries the Apple/Google platform fee and so a lower gross margin), and full-game versus recurrent spending — the FY27 outlook deck itself shows recurrent spending falling to 65% of Net Bookings from 78% in FY26 as GTA VI full-game sales land [`Q2 FY27 investor deck, slides 4–5`; `FY26 10-K, Item 7`]. Third, the gap between cash-era Net Bookings and GAAP revenue moves results on its own through the five-to-fifteen-month deferral, so a strong launch quarter can report a weak GAAP quarter [`FY26 10-K, Item 7`; `Q2 FY27 earnings release, footnote *`]. Currency is a minor driver by comparison — FX added $9.9m to FY26 net revenue and $45.4m to gross profit [`FY26 10-K, Item 7`] — and there is no commodity input to speak of; the real input cost is developer time, which shows up as capitalised software amortisation and the $1,074.6m FY26 R&D line rather than as a purchased material [`FY26 10-K, Item 7`].
