# Sum-of-the-Parts — NIVABUPA

**Company:** Niva Bupa Health Insurance Company Limited (NSEI:NIVABUPA)
**Reporting standard:** India GAAP (IRDAI insurance template); IFRS internally. Figures in INR Millions unless noted. 1 crore = 10 million.
**Fiscal year end:** 31 March. FY26 = April 2025 – March 2026.
**Business type:** Financial issuer — IRDAI-regulated standalone health insurer (SAHI). Per MODULE_RULES Business-Type Map, valuation is equity-direct (P/E, P/Tangible Book, excess-return on equity). EV-based multiples are informational only. The equity bridge presented below is therefore informational; the sanity-check multiple is applied on an equity basis, consistent with the Financial issuer method map.

---

## Effectively Single-Segment — SOTP Collapses to the Consolidated Read

Niva Bupa operates as a **single-reportable-segment** business from FY25 onward. The Capital IQ Financials.xls Segments tab consolidates all FY25 and FY26 revenue and profit into one "Health Insurance" bucket; no sub-segment EBIT split is published. The segment-map upstream (business-model/03_segment-map.md) confirms: "Profit shares are Not disclosed at segment level. The company does not publish a statutory segment profit note under Ind AS 108 because it operates as a single-line insurer (health only) for IRDAI reporting purposes." [Capital IQ Financials.xls → Segments tab, FY25–FY26; Q4 FY26 Earnings Call transcript, May 8, 2026]

The partial-data rule in the system prompt applies: a breakup analysis cannot be forced on a business where >85% of EBIT (in this case, 100%) sits in one segment. SOTP collapses to the consolidated read. A spurious two-line breakup (Retail vs Group) would require segment-level EBIT that does not exist in any filing or transcript.

What follows is the required **dominant-segment multiple sanity check** in place of a full SOTP table. The equity bridge and per-share read are produced as required; any corporate / unallocable drag is addressed explicitly below.

---

## 1. Segment Inventory

All figures in INR Millions. Currency: INR. Reporting standard: India GAAP (IRDAI insurance template) as sourced via Capital IQ vendor export.

| Segment | Revenue (FY26) | EBIT (FY26) | EBIT Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Health Insurance (single reportable segment) | ₹84,435M | ₹5,015M | 5.9% | 100% | Capital IQ Financials.xls → Income Statement tab, FY26; Segments tab, FY26 |
| Unallocated corporate costs | — | — | — | — | Not separately disclosed; IRDAI single-segment filer — all costs (including HO overhead) are netted into the single "Health Insurance" segment by definition |
| **Total reportable EBIT** | **₹84,435M** | **₹5,015M** | **5.9%** | **100%** | |

**Corporate cost note (Gate 3):** Because the company files as a single-segment entity under Ind AS 108 and IRDAI regulations, there is no separately disclosed unallocated corporate line. Management does not publish a head-office overhead bucket distinct from segment results. The consolidated EBIT of ₹5,015M already nets all operating costs — including HO, technology, and distribution — into the single health-insurance segment. No corporate drag is dropped by assertion; none exists as a separate published bucket. The sanity-check below applies the multiple to this fully-loaded consolidated EBIT (and independently to PAT, which is also a post-all-costs figure), so the corporate drag is captured in the metric, not excluded. [Capital IQ Financials.xls → Segments tab, FY25–FY26; business-model/03_segment-map.md]

**PAT (Ind AS / IGAAP, FY26):** ₹3,661M (₹366 crores), per Capital IQ Income Statement tab. EPS (basic, used as proxy for diluted): ₹1.98. [Capital IQ Financials.xls → Key Stats tab, FY26]

---

## 2. Segment Multiples & Comparables (Sanity Check Only — Collapsed SOTP)

Because SOTP collapses to a single-segment read, the relevant exercise is: what does the dominant segment (health insurance, i.e. the whole business) warrant as a standalone multiple, benchmarked against the closest pure-play listed comparable?

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Health Insurance (consolidated) | LTM P/E on FY26 PAT | 42.4× observed (current price / FY26 EPS) | Star Health and Allied Insurance Company Ltd (NSEI:STARHEALTH) — the only other listed standalone health insurer in India | ~55–56× LTM P/E (Jun 18 2026) | Web: ValueResearch / ICICIDirect, Jun 18 2026 (indicative, unverified) |
| Health Insurance (consolidated) | NTM P/E on FY27E EPS | 75.2× observed (consensus NTM) | Star Health (NSEI:STARHEALTH) | ~33–36× forward P/E (analyst consensus range cited by multiple sources) | Web: InvestYWise / UniVest FY27 estimates, Jun 2026 (indicative, unverified) |
| Health Insurance (consolidated) | P/Tangible Book | 4.40× observed | Star Health (NSEI:STARHEALTH) | ~3.3–4.0× (web, across Jun 2026 dates) | Web: ValueResearch / ICICIDirect, Jun 2026 (indicative, unverified) |

**Why Star Health is the right comparable:** Star Health is the only other IRDAI-licensed standalone health insurer (SAHI) listed on Indian exchanges. Like Niva Bupa, it writes exclusively health, personal accident, and travel insurance; it operates under the same IRDAI regulatory framework (expenses-of-management cap, solvency requirements); and it is the closest available pure-play for a segment-multiple check. Multi-line peers (ICICI Lombard, New India Assurance) and life peers (HDFC Life, SBI Life, LIC) operate under different product mixes, regulatory regimes, and business economics, making them less precise comparables for this sanity check, though they form the broader peer set used in agent 03. [business-model/08_competitive-map.md; Capital IQ Comps export, as-of 2026-06-04]

**Multiple comparisons (web-sourced, unverified):**
- **LTM P/E:** Niva Bupa at 42.4× vs Star Health at ~55–56×. Niva Bupa trades at a discount of roughly 24–25% to Star Health on trailing earnings. This is directionally consistent with Star Health being 2.2× larger by GWP, already underwriting-profitable (combined ratio 98.8% vs Niva Bupa's 101.4%), and carrying a higher ROE (13.1% normalized FY26 vs Niva Bupa's 10.7%). The discount looks explicable, not anomalous.
- **NTM P/E:** Niva Bupa at 75.2× vs Star Health at ~33–36× forward is the reverse — Niva Bupa looks more expensive on forward earnings. This reflects the consensus expectation that Niva Bupa's EPS will jump sharply between FY26 (₹1.98 reported) and FY27E (₹1.117 per Capital IQ consensus mean — note: this is lower than reported FY26 EPS because the consensus FY27E uses normalized/adjusted methodology; the FY28E consensus mean is ₹2.365). The NTM P/E is partly a timing artefact of the 1/N accounting pattern and should be used with care. [Capital IQ EstimatesReport.xls → Consensus and Multiples tabs; 00_valuation-data-triage.md]
- **P/Tangible Book:** Niva Bupa at 4.40× vs Star Health at ~3.3–4.0× — broadly in line, with Niva Bupa trading at a modest premium, which reflects its faster growth profile (GWP +27.4% FY26 vs Star Health +16%) and higher retail market share momentum (+100 bps per year).

---

## 3. Segment Valuation (Sanity Check — Collapsed SOTP)

No multi-row segment valuation table is produced because there is only one segment. The sanity check applies the dominant-segment comparable multiple range to produce an implied equity value per share.

**Method:** For a Financial issuer (insurer), valuation is equity-direct. The relevant sanity-check multiples are P/E (on both LTM and NTM earnings) and P/Tangible Book.

**LTM P/E sanity check:**
- Star Health LTM P/E (web, indicative): ~55–56×
- Niva Bupa FY26 PAT: ₹3,661M = ₹366 crores; FY26 EPS: ₹1.98
- Implied equity value at Star Health's comparable 55× LTM P/E: ₹1.98 × 55 = **₹108.9/share**
- Implied equity value at a 25% discount to Star Health (reflecting Niva Bupa's lower profitability and scale): ₹1.98 × 41× = **₹81.2/share** (close to current price of ₹84.03)
- The current LTM P/E of 42.4× sits roughly 23% below Star Health's 55× — directionally consistent with the scale and profitability gap.

**P/Tangible Book sanity check:**
- Tangible book value/share (per 01): ₹19.11
- Niva Bupa current P/TBV: 4.40× (price ₹84.03 / TBV/share ₹19.11)
- Star Health P/TBV (web, indicative): ~3.3–4.0×
- At Star Health's upper P/TBV of 4.0×: implied price = ₹19.11 × 4.0 = **₹76.4/share**
- At a 10% premium to Star Health's upper P/TBV (warranted by Niva Bupa's higher growth rate): ₹19.11 × 4.4 = **₹84.1/share** — essentially the current price.

| Sanity-Check Method | Metric Used | Multiple Range | Implied Value/Share (INR) |
|---|---:|---|---:|
| LTM P/E at Star Health comparable (55×) | FY26 EPS ₹1.98 | 55× | ₹108.9 |
| LTM P/E at 25% discount to peer (41×) | FY26 EPS ₹1.98 | 41× | ₹81.2 |
| P/Tangible Book at Star Health upper (4.0×) | TBV/share ₹19.11 | 4.0× | ₹76.4 |
| P/Tangible Book at 4.4× (10% premium to peer) | TBV/share ₹19.11 | 4.4× | ₹84.1 |
| **Current price (pool-verified)** | | | **₹84.03** |

The range spanned by these four reference points is ₹76–₹109/share, with the current price sitting at the lower end of the peer-based range on LTM earnings (consistent with a deserved discount for lower profitability) and essentially at fair value on P/TBV at a slight premium to the peer.

---

## 4. Equity Bridge

Because SOTP collapses and the business type is **Financial issuer (insurer)**, the equity bridge is informational only — it is not used as the primary valuation anchor (per MODULE_RULES Business-Type Map). The equity bridge below is provided for completeness and the per-share sanity-check read, using `01` anchors verbatim.

For a Financial issuer, "gross enterprise value" in the traditional SOTP sense is not applicable. The figures below show the equity value directly, consistent with equity-direct valuation for an insurer.

| Step | Value (INR M) | Notes |
|---|---:|---|
| Equity market value (market cap) | ₹155,267M | 1,847.757M shares × ₹84.03; Capital IQ Key Stats tab |
| Subordinated NCDs | ₹2,540.4M | 10.70% Sub NCDs, Nov 2031 + Mar 2032 maturities; Capital IQ Capital Structure Details tab, FY26 |
| Lease liabilities (Ind AS 116) | ₹1,000.3M | Capital IQ Capital Structure Details tab, FY26 |
| Total debt | ₹3,540.7M | |
| − Operating cash | (₹1,586.6M) | Balance sheet operating cash; insurer investment portfolio (₹96,072.9M) is NOT netted — it is the underwriting business asset, not surplus cash |
| **Net debt (strict basis, per 01)** | **₹1,954.1M** | Capital IQ Capital Structure Summary tab, FY26 |
| Minority / preferred | Nil | Capital IQ Key Stats; no minority or preferred in issue |
| − Capitalized unallocated corporate costs | — | None to subtract: single-segment filer; no separate corporate overhead bucket is disclosed; all costs are netted into the single reported EBIT |
| − Conglomerate / holdco discount | None applied | Single-segment operating insurer; no holding-company structure, no cross-subsidies between segments, no look-through discount warranted |
| **= Equity value (implied)** | **₹155,267M (₹15,527 crores)** | = Market cap; the equity bridge for an insurer does not reduce the equity value to a per-share SOTP number — it is already an equity value |
| ÷ Diluted shares (proxy; basic used as proxy per 01) | 1,847.757M | Capital IQ Key Stats tab; dilution schedule absent — basic used as proxy |
| **= Current price / implied SOTP value per share** | **₹84.03** | The SOTP collapses to the consolidated equity read; the sanity-check multiple range is ₹76–₹109/share (see Section 3) |
| vs current price | ₹84.03 | Pool-verified; Capital IQ Key Stats tab (~Jun 2026; staleness ~1 month) |

**Net-cash sign discipline:** Net debt is positive (₹1,954.1M) — the company is not net cash. The insurer's investment portfolio (₹96,072.9M) is the underwriting business asset and is not netted per 01's treatment. No double-count risk.

**Conglomerate discount:** None applied. Niva Bupa is a pure-play standalone health insurer with a single reportable segment — there is no conglomerate structure, no cross-subsidies, no look-through adjustment, and no holding-company premium that needs to be discounted.

---

## 5. SOTP Read

SOTP collapses to the consolidated read because Niva Bupa is a single-segment standalone health insurer — 100% of its revenue and EBIT sits in one "Health Insurance" bucket with no sub-segment profit disclosure anywhere in the filing or available data.

At ₹84.03, the market is paying 42.4× trailing earnings (FY26 EPS ₹1.98) and 4.40× tangible book. Against the closest listed pure-play peer, Star Health, Niva Bupa trades at roughly a 24% discount on trailing P/E (~55–56× for Star Health) — a discount that is largely explicable by the profitability gap: Star Health's combined ratio reached 98.8% (underwriting-profitable) in FY26 while Niva Bupa's was 101.4% (still underwriting-unprofitable), and Star Health's ROE of 13.1% normalized exceeds Niva Bupa's 10.7%. On P/TBV, the two trade at broadly comparable levels (Niva Bupa 4.40× vs Star Health ~3.3–4.0×), with Niva Bupa's modest premium reflecting its higher GWP growth (27.4% vs 16%) and rising retail market share (10.1% in FY26, up from 9.1% in FY24).

The breakup insight is structurally absent here: there is no segment hidden behind a consolidated multiple that could be unlocked. The entire value is the health insurance underwriting franchise itself, and the market is pricing it on the path to underwriting profitability — the key value-creation question is whether Niva Bupa can close the combined-ratio gap to Star Health, not whether there are hidden segments to separate.

---

*Partial data: single-segment — SOTP collapsed to consolidated read. No sub-segment EBIT disclosed anywhere in filings or transcripts; Capital IQ Segments tab FY25–FY26 shows one "Health Insurance" bucket. Full SOTP not possible and not forced. Dominant-segment multiple sanity check produced in its place.*
