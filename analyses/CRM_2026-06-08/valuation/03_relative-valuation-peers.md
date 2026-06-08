# Relative Valuation — Peers — CRM

**Company:** Salesforce, Inc. (NYSE:CRM) · **Reporting standard:** US GAAP · **Currency:** USD (millions unless per-share) · **Fiscal year ends:** Jan 31 · **As-of:** 2026-06-08

**Anchor numbers (verbatim from `01_price-and-capital-structure.md`):** current price **$185.66** (Capital IQ comps "Day Close Price Latest", 2026-06-08); shares **819 M** (Apr-30-2026); market cap **~$152,056 M**; net debt **$30,711 M** (NOT net cash — flipped after the Informatica deal); enterprise value (EV) **~$182,767 M**. Per-share fair values below convert EV to equity by subtracting the same $30,711 M net debt and dividing by 819 M shares.

**One-line headline:** On trailing earnings multiples Salesforce screens at a 32–44% discount to the peer median, but that gap is an artifact of a peer set stuffed with loss-makers and hyper-growth names trading at 30–140x; on the forward (next-twelve-month) multiples the market actually uses, Salesforce sits roughly level with peers (+7% EV/EBITDA, −6% P/E) — so it is neither the bargain nor the premium name the trailing screen suggests, and the small forward discount is warranted by slower growth (11% vs 14% peer median) and higher leverage (3.1x vs 1.5x debt/EBITDA), partly offset by far higher margins (30% vs 18% EBITDA).

---

## 1. Peer Set

**Source of the set: the Capital IQ "Company Comparable Analysis" workbook in the data pool** (`Company Comparable Analysis Salesforce Inc .xls`, As-Of 2026-06-08), which carries a 10-company comp set selected by S&P Capital IQ's relevancy score. The dedicated `business-model/08_competitive-map.md` was **not available** in this run (the business-model module produced only `00_data-triage` and `02_business-identity`), so I did **not** hand-pick the peers — I use the vendor-curated set, which is a Tier-3/4 source (CLAUDE.md §4) and is the workbook the task names as the peer set. This is a vendor-selected set, not a self-selected one; I judge each member's fit below and treat the loss-makers / hyper-growth names as low-relevance for earnings-based multiples.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| SAP SE | XTRA:SAP | Closest true comp: global enterprise application suite (ERP, HCM, CRM/CX), subscription-led, similar ~31% EBITDA margin and high-single-digit growth | Capital IQ comp set; business-description tab |
| Oracle Corp. | NYSE:ORCL | Enterprise applications (Fusion ERP/HCM/SCM) + database + cloud infrastructure; overlapping back-office software buyer | Capital IQ comp set |
| ServiceNow | NYSE:NOW | Enterprise SaaS workflow platform sold to the same IT/line-of-business buyers; "platform + agents" positioning mirrors Agentforce | Capital IQ comp set |
| Workday | NasdaqGS:WDAY | Enterprise cloud applications (financials, HCM); direct-sales SaaS, same enterprise end-market | Capital IQ comp set |
| Adobe | NasdaqGS:ADBE | Subscription software (Digital Experience overlaps marketing/commerce); similar high-margin, mature-growth profile | Capital IQ comp set |
| Intuit | NasdaqGS:INTU | Subscription business/financial software + Mailchimp (marketing/CRM for SMB); high margin, similar growth | Capital IQ comp set |
| HubSpot | NYSE:HUBS | Direct CRM competitor, but mid-market/SMB focus, far smaller (~$3.3 bn revenue) and near-break-even on GAAP — low relevance for earnings multiples | Capital IQ comp set |
| Datadog | NasdaqGS:DDOG | Observability/security SaaS — adjacent, not CRM; ~30% growth but ~0% EBIT margin — earnings multiples are not meaningful (NM) | Capital IQ comp set |
| DocuSign | NasdaqGS:DOCU | E-signature / agreement SaaS — adjacent product, not a CRM suite; much smaller | Capital IQ comp set |
| RingCentral | NYSE:RNG | Cloud communications SaaS — adjacent, not CRM; small (~$2.5 bn revenue) and highly levered (1.49 debt/capital) | Capital IQ comp set |

**Relevance judgement (mine, for the warranted-gap read).** The set spans three tiers: (a) **best structural comps** — SAP, Oracle, ServiceNow, Workday (large enterprise application/platform SaaS); (b) **mature high-margin software** — Adobe, Intuit; (c) **low-relevance names for earnings multiples** — HubSpot, Datadog, DocuSign, RingCentral, which are sub-scale and/or near-break-even, so their trailing EV/EBITDA, EV/EBIT and P/E print at extreme levels (HUBS 73.5x EBITDA / 139x EBIT / 113x P/E; DDOG "NM") that drag the simple peer median upward. I therefore lean on the **forward** multiples and on the best-comp subset when judging whether Salesforce's gap is warranted.

**Private peers with no public multiples:** none material in this set — all 10 comps are listed with traded multiples. Salesforce does compete with private/embedded CRM (e.g. Microsoft Dynamics inside Microsoft, and private vendors); Microsoft is not in the Capital IQ set and a standalone Dynamics multiple is not separable, so it cannot be added as a clean comp. Flagged, not guessed.

---

## 2. Peer Multiples & Operating Stats

All figures from the Capital IQ "Company Comparable Analysis" workbook, **As-Of 2026-06-08** (data-pool vendor export — no web-sourced figures used; nothing carries the unverified label). "TEV" = total enterprise value; multiples are **LTM** (last twelve months, trailing) unless prefixed "NTM" (next twelve months, forward consensus). "NM" = not meaningful (negative or distorted denominator). Margins and growth from the workbook's Operating Statistics tab; ROIC and FCF yield are not carried for peers in this workbook (see note below the table).

Business-type method note (per `MODULE_RULES.md` Business-Type Method Map): Salesforce is an **operating** software company, so **EV-based multiples (TEV/Revenue, TEV/EBITDA, TEV/EBIT) and P/E** are the valid lenses. **P/Tangible Book is excluded** — Salesforce's tangible book is **negative** (−$38.71/share) from acquisition goodwill, so P/TangBV prints "NM" and is meaningless here; it is shown only to mark it unusable.

| Company | P/E (LTM) | TEV/EBITDA (LTM) | TEV/EBIT (LTM) | TEV/Rev (LTM) | NTM P/E | NTM TEV/EBITDA | Rev Growth (LTM) | EBITDA Margin (LTM) | EBIT Margin (LTM) | Net Debt/EBITDA¹ | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **CRM (Salesforce)** | **21.6** | **13.5** | **19.5** | **4.3** | **13.34** | **10.58** | **11.0%** | **30.1%** | **21.9%** | **2.38x** | 2026-06-08 |
| SAP SE | 25.9 | 15.7 | 17.3 | 5.0 | 21.48 | 14.01 | 6.2% | 31.1% | 29.0% | net cash | 2026-06-08 |
| Oracle | 38.3 | 24.9 | 36.1 | 11.6 | 28.28 | 16.71 | 14.9% | 42.8% | 32.2% | 4.5x (5.4 TD)² | 2026-06-08 |
| ServiceNow | 66.9 | 36.3 | 53.8 | 7.9 | 25.93 | 17.59 | 21.7% | 20.7% | 14.7% | net cash | 2026-06-08 |
| Workday | 44.9 | 20.2 | 30.3 | 3.6 | 13.00 | 9.79 | 13.3% | 15.3% | 11.7% | net cash | 2026-06-08 |
| Adobe | 14.7 | 10.6 | 11.2 | 4.1 | 10.44 | 8.07 | 11.0% | 38.9% | 36.9% | net cash | 2026-06-08 |
| Intuit | 18.1 | 12.4 | 14.1 | 3.9 | 11.08 | 8.05 | 15.1% | 30.6% | 27.5% | ~0 (1.1 TD)² | 2026-06-08 |
| HubSpot | 113.1 | 73.5 | 139.2 | 2.9 | 15.49 | 9.94 | 21.1% | 2.7% | 2.1% | net cash | 2026-06-08 |
| Datadog | NM | NM | NM | 21.7 | 95.04 | 69.24 | 29.5% | 0.9% | −0.6% | net cash | 2026-06-08 |
| DocuSign | 30.7 | 20.3 | 24.0 | 2.6 | 10.12 | 6.58 | 8.4% | 11.8% | 10.6% | net cash | 2026-06-08 |
| RingCentral | 45.3 | 11.4 | 28.7 | 1.9 | 8.47 | 6.80 | 4.9% | 15.5% | 6.7% | high (1.49 D/Cap) | 2026-06-08 |
| **Peer median (n=10)³** | **38.3** | **20.2** | **28.7** | **4.0** | **14.25** | **9.86** | **14.1%** | **18.1%** | **13.2%** | **net cash / ~1.5x TD** | 2026-06-08 |
| **Peer mean (n=10)³** | **44.2** | **25.0** | **39.4** | **6.5** | **23.93** | **16.68** | **14.6%** | **21.0%** | **17.1%** | — | 2026-06-08 |

¹ **Net Debt/EBITDA** for CRM is from `01` (2.38x; total debt/EBITDA 3.30x). For peers the workbook carries **LTM Net Debt** and **Total Debt/EBITDA**, not a clean Net Debt/EBITDA per name — most peers (SAP, ServiceNow, Workday, Adobe, HubSpot, Datadog, DocuSign) show **negative LTM net debt = net cash** `[Capital IQ Comparable Analysis, Financial Data, As-Of 2026-06-08]`. CRM is one of only two names (with Oracle and the small, levered RingCentral) carrying material net debt — a key warranted-gap input.
² Oracle and Intuit shown with Total Debt/EBITDA from the Operating-Statistics tab (5.4x, 1.1x); Oracle's net-debt/EBITDA ≈ 4.5x (net debt $123,033 M ÷ EBITDA $27,441 M). Intuit's net debt is ~nil ($120 M).
³ **Medians/means computed by me from the 10 peer rows** (not eyeballed), and they tie to Capital IQ's own Summary-Statistics rows: TEV/Rev 4.0, TEV/EBITDA 20.2, TEV/EBIT 28.7, P/E 38.3, NTM TEV/EBITDA 9.86, NTM P/E 14.25 `[Capital IQ Comparable Analysis, Trading Multiples / Operating Statistics, As-Of 2026-06-08]`. EBITDA-based multiples exclude Datadog ("NM"), so those medians/means are over n=9.

**ROIC and FCF yield — not carried for peers in this workbook (data gap, flagged).** The Capital IQ comp tabs do not provide per-peer return-on-capital or free-cash-flow yield. For **Salesforce only** (from the data pool):
- **ROIC (Capital IQ "Return on Capital", LTM to Apr-30-2026): 7.83%** `[Salesforce-Inc-NYSE-CRM-Financials_annual__Ratios, LTM column]` — the profit Salesforce earns on each $100 of capital invested. This is below a typical ~8–9% software cost of capital, dragged down by the goodwill from acquisitions sitting in the capital base.
- **FCF yield: ~9.6% on market cap** (LTM free cash flow $14,661 M ÷ market cap $152,056 M; FCF = cash from operations − capex, per `earnings/01`), or **~8.0% on EV** ($14,661 M ÷ $182,767 M). This is a genuine relative strength — Salesforce converts ~38% of revenue to free cash flow `[Ratios tab, Levered FCF margin 38.6% LTM]`, far above most peers in the set — but a like-for-like peer FCF-yield column is not in the pool, so I do not rank it against peers numerically. *Sourcing 10 peers' FCF yield from the web would add only unverified Tier-2 figures; I leave it as a flagged gap.*

---

## 3. Premium / Discount to Peer Median

Premium/(discount) = (CRM multiple − peer median) / peer median. A negative number means Salesforce is cheaper than the median peer on that metric. **Computed**, not estimated.

| Multiple | CRM | Peer Median | Premium / (Discount) | Read |
|---|---:|---:|---:|---|
| P/E (LTM, trailing) | 21.6 | 38.3 | **−43.6%** | Deep discount — but median inflated by NM/loss-maker names |
| TEV/EBITDA (LTM) | 13.5 | 20.2 | **−33.2%** | Deep discount — same distortion |
| TEV/EBIT (LTM) | 19.5 | 28.7 | **−32.1%** | Deep discount — same distortion |
| TEV/Revenue (LTM) | 4.3 | 4.0 | **+7.5%** | Slight premium |
| NTM TEV/Revenue (forward) | 3.88 | 3.66 | **+5.9%** | Slight premium |
| NTM TEV/EBITDA (forward) | 10.58 | 9.86 | **+7.2%** | Slight premium |
| NTM P/E (forward) | 13.34 | 14.25 | **−6.4%** | Small discount |

**The two halves of this table disagree, and the disagreement is the finding.** On **trailing earnings** multiples (P/E, EV/EBITDA, EV/EBIT) Salesforce looks 32–44% cheap; on **forward** multiples and on **revenue** it sits within ±8% of the peer median. The trailing discount is not a real mispricing signal — it is driven by the peer median being pulled up by names that are barely profitable on a trailing basis (HubSpot at 73x/139x/113x, Datadog "NM", ServiceNow 66.9x P/E, Workday 44.9x P/E), whose multiples reflect expected future growth, not current earnings. Strip to the forward (NTM) view, where consensus has normalized those names' earnings power, and the median collapses (P/E 38.3 → 14.25; EV/EBITDA 20.2 → 9.86) to right around where Salesforce already trades. **The honest read is the forward one: Salesforce is priced roughly in line with peers, at a slight premium on EV-based forward multiples and a slight discount on forward P/E.**

---

## 4. Is the Gap Warranted?

Use the forward multiples (the trailing "discount" is a peer-composition artifact, Section 3). On the forward lens Salesforce trades at a **small premium on EV/EBITDA (+7%) and EV/revenue (+6%)** and a **small discount on P/E (−6%)** versus the peer median. That near-parity is **warranted**, and the mix of reasons roughly cancels: in Salesforce's favor, its **EBITDA margin (30.1%) is ~12 points above the peer median (18.1%)** and its **EBIT margin (21.9%) ~9 points above (13.2%)** `[Capital IQ Operating Statistics, As-Of 2026-06-08; earnings/01]`, and its free-cash conversion (~38% FCF margin, ~9.6% FCF yield) is among the strongest in the set — quality that justifies trading at or above peers. Against it, **revenue growth (11.0% LTM) is below the peer median (14.1%)** and below the best comps Oracle (14.9%) and ServiceNow (21.7%), the FY27 guide is only ~10–11% `[earnings/04, FY27 revenue guide $45.9–46.2 bn]`, and Salesforce now carries **net debt of 2.38x EBITDA** (3.1x total debt/EBITDA) while **seven of ten peers hold net cash** `[01; Capital IQ Financial Data]` — slower growth and a freshly-levered balance sheet both argue for a discount, not a premium. **Conclusion: the small forward premium is broadly warranted (quality offsets slower growth and higher leverage) — Salesforce is fairly priced against peers, not a relative bargain.** The large trailing-multiple discount is **not** a warranted-upside signal; it is a composition effect and must not be read as "Salesforce is 30–40% too cheap."

One rejector-doctrine note (CLAUDE.md §24, Filter 3 — leverage): the swing from net cash to $30.7 bn net debt in ~12 months removes a balance-sheet cushion most of these peers still have. It does not trip a distress flag (net debt/EBITDA 2.4x, EBITDA/interest ~22x `[Ratios tab]`), but it is a real reason Salesforce should not command a premium to net-cash peers on the same growth.

---

## 5. Implied Value from Peer Multiples

Method: apply the **computed peer-median multiple** to Salesforce's own metric, then bridge EV → equity (− net debt $30,711 M) → per share (÷ 819 M). EPS-based rows give equity value directly. CRM metrics: LTM revenue $42,829 M, LTM EBITDA $12,895 M, LTM EBIT $9,366 M, LTM diluted EPS $8.61, NTM revenue $47,096 M, NTM EBITDA $17,279 M, NTM EPS $13.92 `[Capital IQ Financial Data / Implied Valuation, As-Of 2026-06-08; earnings/01]`.

**Quality adjustment applied.** The raw trailing EV/EBITDA, EV/EBIT and P/E medians are distorted upward by loss-makers (Section 1/3), so applying them unadjusted (e.g. 20.2x EBITDA → $280/share, 38.3x P/E → $330/share) would overstate fair value — those multiples embed other companies' growth, not Salesforce's. I therefore **anchor the implied range on the forward (NTM) multiples and the revenue multiple**, which are not distorted, and treat the trailing-multiple outputs as an unreliable high-end only. Within the credible (forward) set I apply a modest **downward tilt of ~0.95x to the EV/EBITDA and EV/revenue medians** (because Salesforce grows slower than the peer median and carries more leverage) and **no further haircut to forward P/E** (already slightly below median; quality supports parity).

| Multiple | Applied Peer Multiple | Implied EV (USD M) | Implied Equity (USD M) | Implied Price/Share | vs Current ($185.66) |
|---|---:|---:|---:|---:|---:|
| **Credible / forward-anchored band** | | | | | |
| NTM TEV/EBITDA (median, slight haircut) | 9.4x (0.95 × 9.86) | 162,425 | 131,714 | **~$161** | −13% |
| NTM TEV/EBITDA (median, as-is) | 9.86x | 170,461 | 139,750 | **~$171** | −8% |
| NTM TEV/Revenue (median, slight haircut) | 3.48x (0.95 × 3.66) | 163,894 | 133,183 | **~$163** | −12% |
| NTM TEV/Revenue (median, as-is) | 3.66x | 172,371 | 141,660 | **~$173** | −7% |
| LTM TEV/Revenue (median) | 4.0x | 171,316 | 140,605 | **~$172** | −7% |
| NTM P/E (median, as-is) | 14.25x | — (equity) | 162,403 | **~$198** | +7% |
| **Distorted / trailing — unreliable high end only** | | | | | |
| LTM TEV/EBITDA (median) | 20.2x | 260,479 | 229,768 | ~$281 | +51% |
| LTM TEV/EBIT (median) | 28.7x | 268,804 | 238,093 | ~$291 | +57% |
| LTM P/E (median) | 38.3x | — (equity) | 329,761 | ~$330 | +78% |

**Implied value range (peer-relative, quality-adjusted): roughly $160 – $200 per share**, centered near today's price. The low end (~$160) comes from the forward EV-based multiples with a small leverage/growth haircut; the high end (~$198–200) from the forward P/E median, which already sits slightly below the peer median and which Salesforce's superior margins support. I deliberately **exclude the $281–$330 trailing-multiple outputs from the fair-value range** — they rest on a peer median inflated by barely-profitable names and would be a composition artifact, not a defensible relative value (this is the cross-method gap the rules require be reconciled, not averaged: the trailing and forward methods diverge by far more than 40%, and the forward set is the credible one).

---

## 6. Relative Read

Salesforce only *looks* 30–44% cheap to peers on trailing P/E and EV/EBITDA, and that discount is a mirage — it comes from a Capital IQ comp set padded with loss-makers and hyper-growth names (HubSpot, Datadog, ServiceNow, Workday) whose trailing earnings multiples are 30–140x; on the forward multiples the market actually uses, Salesforce trades within ±8% of the peer median. That near-parity is warranted: its much higher margins (30% EBITDA vs 18% peer median) and strong ~9.6% free-cash-flow yield justify trading at or slightly above peers, but its slower growth (11% vs 14%) and its new net-debt position (2.4x EBITDA, against seven of ten peers in net cash) justify pulling that back to roughly level. Peer multiples imply a fair-value range of **~$160–$200 per share versus the current $185.66** — i.e. Salesforce is **fairly priced against its peers, not a relative bargain**, and the headline trailing "discount" should not be read as upside.

---

### Self-Check
- Peer set named with a reason per peer; source stated as the **Capital IQ comp workbook** (competitive-map unavailable — vendor-curated set, not self-selected). ✓
- Private/embedded peers (Microsoft Dynamics) flagged as non-separable, not guessed. ✓
- Every multiple sourced to the Capital IQ Comparable Analysis (As-Of 2026-06-08); no web figures used, so none carry the unverified label. ✓
- Peer median **computed** from the 10 rows and tied to Capital IQ's own summary stats. ✓
- Premium/discount shown as a **percentage** on each multiple. ✓
- Warranted-gap judgement cites margins, growth, FCF, **and** leverage (net debt vs peers' net cash) — does not assume parity. ✓
- Implied value is a **range** ($160–$200) with the quality adjustment (forward-anchored, ~0.95x EV-multiple haircut; trailing multiples excluded) shown and explained. ✓
- Trailing-vs-forward method divergence (>40%) reconciled explicitly, not averaged. ✓
- No banned phrases ("cheap"/"expensive"/"undervalued"/etc.) used without a paired number. ✓

**Out-of-scope note:** This report values Salesforce against peers and states an implied range only. Scenario probabilities, a probability-weighted target, risk/reward, and the final rating belong to the master synthesizer, not this module.
